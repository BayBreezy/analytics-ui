/**
 * A string kept in the URL query, e.g. `?range=30d`. Reading falls back to the default when the
 * param is missing or isn't one of the allowed values. Setting it to the default removes it.
 */
export function useQueryParam<T extends string>(key: string, fallback: T, allowed?: readonly T[]) {
  const route = useRoute();
  const router = useRouter();

  return computed<T>({
    get() {
      const value = route.query[key];
      if (typeof value !== "string") return fallback;
      return !allowed || (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
    },
    set(value) {
      const query = { ...route.query };
      if (value === fallback) delete query[key];
      else query[key] = value;
      router.replace({ query });
    },
  });
}
