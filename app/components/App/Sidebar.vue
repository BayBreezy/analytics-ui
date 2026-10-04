<template>
  <UiSidebar collapsible="icon" variant="inset">
    <UiSidebarHeader>
      <UiSidebarMenu>
        <UiSidebarMenuItem>
          <UiSidebarMenuButton size="lg" as-child>
            <NuxtLink :to="DASHBOARD_URL">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              >
                <Icon name="lucide:chart-column" class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">Analytics</span>
                <span class="truncate text-xs text-muted-foreground">Store admin</span>
              </div>
            </NuxtLink>
          </UiSidebarMenuButton>
        </UiSidebarMenuItem>
      </UiSidebarMenu>
    </UiSidebarHeader>

    <UiSidebarContent>
      <UiSidebarGroup v-for="group in mainNav" :key="group.label">
        <UiSidebarGroupLabel v-if="group.label" :label="group.label" />
        <UiSidebarGroupContent>
          <UiSidebarMenu>
            <template v-for="item in group.items" :key="item.url">
              <UiCollapsible
                v-if="item.children"
                v-slot="{ open }"
                as-child
                :default-open="isActive(route.path, item.url)"
              >
                <UiSidebarMenuItem>
                  <UiCollapsibleTrigger as-child>
                    <UiSidebarMenuButton
                      :tooltip="item.title"
                      :is-active="isActive(route.path, item.url)"
                    >
                      <Icon v-if="item.icon" :name="item.icon" />
                      <span>{{ item.title }}</span>
                      <Icon
                        name="lucide:chevron-right"
                        class="ml-auto transition-transform duration-200"
                        :class="open && 'rotate-90'"
                      />
                    </UiSidebarMenuButton>
                  </UiCollapsibleTrigger>
                  <UiCollapsibleContent>
                    <UiSidebarMenuSub>
                      <UiSidebarMenuSubItem v-for="child in visibleChildren(item)" :key="child.url">
                        <UiSidebarMenuSubButton
                          as-child
                          :is-active="isActive(route.path, child.url, true)"
                        >
                          <NuxtLink :to="child.url">
                            <span>{{ child.title }}</span>
                          </NuxtLink>
                        </UiSidebarMenuSubButton>
                      </UiSidebarMenuSubItem>
                    </UiSidebarMenuSub>
                  </UiCollapsibleContent>
                </UiSidebarMenuItem>
              </UiCollapsible>

              <UiSidebarMenuItem v-else>
                <UiSidebarMenuButton
                  as-child
                  :tooltip="item.title"
                  :is-active="isActive(route.path, item.url)"
                >
                  <NuxtLink :to="item.url">
                    <Icon v-if="item.icon" :name="item.icon" />
                    <span>{{ item.title }}</span>
                  </NuxtLink>
                </UiSidebarMenuButton>
              </UiSidebarMenuItem>
            </template>
          </UiSidebarMenu>
        </UiSidebarGroupContent>
      </UiSidebarGroup>

      <UiSidebarGroup class="mt-auto">
        <UiSidebarGroupContent>
          <UiSidebarMenu>
            <UiSidebarMenuItem v-for="item in secondaryNav" :key="item.url">
              <UiSidebarMenuButton
                as-child
                size="sm"
                :tooltip="item.title"
                :is-active="isActive(route.path, item.url)"
              >
                <NuxtLink :to="item.url">
                  <Icon v-if="item.icon" :name="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </UiSidebarMenuButton>
            </UiSidebarMenuItem>
          </UiSidebarMenu>
        </UiSidebarGroupContent>
      </UiSidebarGroup>
    </UiSidebarContent>

    <UiSidebarFooter>
      <UiSidebarMenu>
        <UiSidebarMenuItem>
          <UiDropdownMenu>
            <UiDropdownMenuTrigger as-child>
              <UiSidebarMenuButton
                size="lg"
                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UiAvatar
                  :src="user?.avatar"
                  :alt="user?.name"
                  :fallback="initials"
                  class="size-8 rounded-lg"
                />
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">{{ user?.name }}</span>
                  <span class="truncate text-xs text-muted-foreground">{{ user?.email }}</span>
                </div>
                <Icon name="lucide:chevrons-up-down" class="ml-auto size-4" />
              </UiSidebarMenuButton>
            </UiDropdownMenuTrigger>
            <UiDropdownMenuContent
              class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              :side="isMobile ? 'bottom' : 'right'"
              align="end"
              :side-offset="4"
            >
              <UiDropdownMenuLabel class="p-0 font-normal">
                <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UiAvatar
                    :src="user?.avatar"
                    :alt="user?.name"
                    :fallback="initials"
                    class="size-8 rounded-lg"
                  />
                  <div class="grid flex-1 leading-tight">
                    <span class="truncate font-semibold">{{ user?.name }}</span>
                    <span class="truncate text-xs text-muted-foreground">{{ user?.email }}</span>
                  </div>
                </div>
              </UiDropdownMenuLabel>
              <UiDropdownMenuSeparator />
              <UiDropdownMenuGroup>
                <UiDropdownMenuItem v-for="item in accountNav" :key="item.url" as-child>
                  <NuxtLink :to="item.url">
                    <Icon v-if="item.icon" :name="item.icon" />
                    {{ item.title }}
                  </NuxtLink>
                </UiDropdownMenuItem>
              </UiDropdownMenuGroup>
              <UiDropdownMenuSeparator />
              <UiDropdownMenuItem variant="destructive" @select="logout">
                <Icon name="lucide:log-out" />
                Log out
              </UiDropdownMenuItem>
            </UiDropdownMenuContent>
          </UiDropdownMenu>
        </UiSidebarMenuItem>
      </UiSidebarMenu>
    </UiSidebarFooter>

    <UiSidebarRail />
  </UiSidebar>
</template>

<script lang="ts" setup>
  const route = useRoute();
  const { user, logout } = useAuth();
  const { isMobile } = useSidebar();

  const initials = computed(() =>
    (user.value?.name ?? "")
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  );
</script>
