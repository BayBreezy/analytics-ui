export const PAGE_SIZES = [10, 25, 50];

/**
 * State for a resource list page. Page, page size, search, sort and filters live in the URL query,
 * so reloading or going back restores the same view. Changing any of them refetches the list.
 */
export function useResourceList<K extends ResourceName>(resource: K, filterKeys: string[] = []) {
  const route = useRoute();
  const router = useRouter();
  const text = (value: unknown) => (typeof value === "string" ? value : "");
  const preferences = usePreferences();

  const page = computed(() => Math.max(1, Number.parseInt(text(route.query.page)) || 1));
  const pageSize = computed(() => {
    const size = Number.parseInt(text(route.query.pageSize));
    return PAGE_SIZES.includes(size) ? size : preferences.pageSize.value;
  });
  const search = computed(() => text(route.query.search));
  const sort = computed(() => text(route.query.sort) || undefined);
  const order = computed<"asc" | "desc">(() =>
    text(route.query.order) === "asc" ? "asc" : "desc"
  );
  const filters = computed(() =>
    Object.fromEntries(filterKeys.map((key) => [key, text(route.query[key])]))
  );
  const hasFilters = computed(
    () => Boolean(search.value) || Object.values(filters.value).some(Boolean)
  );

  function updateQuery(patch: Record<string, string | number | undefined>, replace = false) {
    const query: Record<string, string> = { ...(route.query as Record<string, string>) };
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "") delete query[key];
      else query[key] = String(value);
    }
    return replace ? router.replace({ query }) : router.push({ query });
  }

  // The search box updates as you type; the URL and the request wait until you pause.
  const searchInput = ref(search.value);
  watchDebounced(
    searchInput,
    (value) => {
      if (value !== search.value) updateQuery({ search: value, page: undefined }, true);
    },
    { debounce: 300 }
  );
  watch(search, (value) => {
    if (value !== searchInput.value) searchInput.value = value;
  });

  const apiQuery = computed(() => ({
    page: page.value,
    pageSize: pageSize.value,
    ...(search.value && { search: search.value }),
    ...(sort.value && { sort: sort.value, order: order.value }),
    ...Object.fromEntries(Object.entries(filters.value).filter(([, value]) => value)),
  }));

  const { data, pending, error, refresh } = useFetch<Paginated<ResourceMap[K]>>(
    `/api/${resource}`,
    { key: `${resource}-list`, query: apiQuery, server: false }
  );

  return {
    data,
    pending,
    error,
    refresh,
    page,
    pageSize,
    apiQuery,
    sort,
    order,
    filters,
    hasFilters,
    searchInput,
    setPage: (value: number) => updateQuery({ page: value === 1 ? undefined : value }),
    setPageSize: (value: number) =>
      updateQuery({
        pageSize: value === preferences.pageSize.value ? undefined : value,
        page: undefined,
      }),
    setSort: (id?: string, direction?: "asc" | "desc") =>
      updateQuery({ sort: id, order: id ? direction : undefined, page: undefined }),
    setFilter: (key: string, value: string) => updateQuery({ [key]: value, page: undefined }),
    clearFilters: () =>
      updateQuery({
        search: undefined,
        page: undefined,
        ...Object.fromEntries(filterKeys.map((key) => [key, undefined])),
      }),
  };
}
