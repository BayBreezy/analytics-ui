<template>
  <UiDialog v-model:open="open">
    <UiDialogContent class="overflow-hidden rounded-xl! p-0 shadow-lg">
      <UiDialogHeader class="sr-only">
        <UiDialogTitle title="Command palette" />
        <UiDialogDescription description="Search for a page, a record or an action." />
      </UiDialogHeader>
      <!-- This is `UiCommand` built from Reka's listbox parts. `UiCommandItem` and `UiCommandGroup`
           filter by the text they show, which would hide the records that arrive from the server,
           and `UiCommand` doesn't let the first match be highlighted. The matching is done here. -->
      <ListboxRoot
        ref="listbox"
        highlight-on-hover
        class="flex size-full flex-col overflow-hidden rounded-xl bg-popover p-1 text-popover-foreground"
      >
        <div class="p-1 pb-0">
          <UiInputGroup
            class="h-8! rounded-lg! border-input/30 bg-input/30 shadow-none! *:data-[slot=input-group-addon]:pl-2!"
          >
            <ListboxFilter
              v-model="typed"
              auto-focus
              placeholder="Search pages, records and actions"
              aria-label="Search pages, records and actions"
              class="w-full text-sm outline-hidden"
            />
            <UiInputGroupAddon>
              <Icon name="lucide:search" class="size-4 shrink-0 opacity-50" />
            </UiInputGroupAddon>
          </UiInputGroup>
        </div>
        <ListboxContent
          class="no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none"
        >
          <div role="presentation">
            <p v-if="!hasAny" class="py-6 text-center text-sm">
              {{ pending ? "Searching…" : "No results found." }}
            </p>

            <template v-for="group in resultGroups" :key="group.key">
              <ListboxGroup v-if="group.hits.length" class="p-1">
                <ListboxGroupLabel class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {{ group.heading }}
                </ListboxGroupLabel>
                <ListboxItem
                  v-for="hit in group.hits"
                  :key="hit.id"
                  :value="hit.href"
                  :class="ITEM_CLASS"
                  @select="go(hit.href)"
                >
                  <Icon :name="group.icon" />
                  <span class="flex min-w-0 flex-1 flex-col">
                    <span class="truncate">{{ hit.title }}</span>
                    <span class="truncate text-xs text-muted-foreground">{{ hit.subtitle }}</span>
                  </span>
                </ListboxItem>
              </ListboxGroup>
            </template>

            <ListboxGroup v-if="shownPages.length" class="p-1">
              <ListboxGroupLabel class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Pages
              </ListboxGroupLabel>
              <ListboxItem
                v-for="page in shownPages"
                :key="page.url"
                :value="page.url"
                :class="ITEM_CLASS"
                @select="go(page.url)"
              >
                <Icon :name="page.icon ?? 'lucide:file-text'" />
                {{ page.title }}
              </ListboxItem>
            </ListboxGroup>

            <ListboxGroup v-if="shownActions.length" class="p-1">
              <ListboxGroupLabel class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Actions
              </ListboxGroupLabel>
              <ListboxItem
                v-for="action in shownActions"
                :key="action.id"
                :value="action.id"
                :class="ITEM_CLASS"
                @select="run(action)"
              >
                <Icon :name="action.icon" />
                {{ action.title }}
              </ListboxItem>
            </ListboxGroup>
          </div>
        </ListboxContent>
      </ListboxRoot>
    </UiDialogContent>
  </UiDialog>
</template>

<script lang="ts" setup>
  import {
    ListboxContent,
    ListboxFilter,
    ListboxGroup,
    ListboxGroupLabel,
    ListboxItem,
    ListboxRoot,
  } from "reka-ui";

  // The same look as `UiCommandItem`.
  const ITEM_CLASS =
    "group/command-item relative flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

  const open = useCommandPalette();
  const { can, logout } = useAuth();
  const colorMode = useColorMode();

  const pages = computed(() => getNavPages(can));

  interface Action {
    id: string;
    title: string;
    icon: string;
    keywords?: string;
    run: () => unknown;
  }
  const actions = computed<Action[]>(() => {
    const list: Action[] = [];
    for (const name of ["customers", "orders", "products"] as const) {
      const { singular, base, icon } = RESOURCES[name];
      const permission = resourcePermission(name, "write");
      if (permission && !can(permission)) continue;
      list.push({
        id: `new-${name}`,
        title: `New ${singular.toLowerCase()}`,
        icon: "lucide:plus",
        keywords: `create add ${icon}`,
        run: () => navigateTo(`${base}/create`),
      });
    }
    list.push({
      id: "theme",
      title: "Switch between light and dark mode",
      icon: "lucide:sun-moon",
      keywords: "theme appearance",
      run: () => {
        colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
      },
    });
    if (can("settings:manage")) {
      list.push({
        id: "reset",
        title: "Reset demo data…",
        icon: "lucide:rotate-ccw",
        keywords: "sample seed",
        run: () => navigateTo({ path: "/settings", query: { tab: "data" } }),
      });
    }
    list.push({ id: "logout", title: "Log out", icon: "lucide:log-out", run: () => logout() });
    return list;
  });

  // Pages and actions are matched here: every word typed has to appear in the title or keywords.
  const matches = (text: string) => {
    const words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    const haystack = text.toLowerCase();
    return words.every((word) => haystack.includes(word));
  };
  const shownPages = computed(() =>
    pages.value.filter((page) => matches(`${page.title} ${page.url}`))
  );
  const shownActions = computed(() =>
    actions.value.filter((action) => matches(`${action.title} ${action.keywords ?? ""}`))
  );

  // ---- Records
  const results = ref<SearchResults>();
  const pending = ref(false);
  let latest = 0;

  const hasAny = computed(
    () =>
      shownPages.value.length > 0 ||
      shownActions.value.length > 0 ||
      resultGroups.value.some((group) => group.hits.length > 0)
  );

  const resultGroups = computed(() => [
    {
      key: "customers",
      heading: "Customers",
      icon: RESOURCES.customers.icon,
      hits: results.value?.customers ?? [],
    },
    {
      key: "orders",
      heading: "Orders",
      icon: RESOURCES.orders.icon,
      hits: results.value?.orders ?? [],
    },
    {
      key: "products",
      heading: "Products",
      icon: RESOURCES.products.icon,
      hits: results.value?.products ?? [],
    },
    {
      key: "staff",
      heading: "Staff",
      icon: RESOURCES.staff.icon,
      hits: results.value?.staff ?? [],
    },
  ]);

  const typed = ref("");
  const search = computed(() => typed.value.trim());

  // The first match is highlighted, so Enter picks it.
  const listbox = ref<{ highlightFirstItem: () => void } | null>(null);
  watch([typed, () => results.value], async () => {
    await nextTick();
    listbox.value?.highlightFirstItem();
  });

  watchDebounced(
    search,
    async (query) => {
      const id = ++latest;
      if (query.length < 2) {
        results.value = undefined;
        pending.value = false;
        return;
      }
      pending.value = true;
      try {
        const found = await $fetch<SearchResults>("/api/search", { query: { q: query } });
        // A newer search was started while this one was running.
        if (id !== latest) return;
        results.value = found;
      } catch {
        if (id === latest) results.value = undefined;
      } finally {
        if (id === latest) pending.value = false;
      }
    },
    { debounce: 200 }
  );

  // Start fresh each time it opens.
  watch(open, (isOpen) => {
    if (isOpen) return;
    typed.value = "";
    results.value = undefined;
  });

  async function go(url: string) {
    open.value = false;
    await navigateTo(url);
  }

  async function run(action: Action) {
    open.value = false;
    await action.run();
  }
</script>
