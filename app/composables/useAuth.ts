const DAY = 60 * 60 * 24;
const DEFAULT_REDIRECT = "/dashboard";

/**
 * Dummy client-side auth. The session lives in a cookie (so the route middleware can read it during
 * SSR) and is mirrored into `useState` so every component sees changes immediately.
 */
export const useAuth = () => {
  const cookieOptions = { sameSite: "lax" } as const;

  // Same cookie name, two lifetimes: "remember me" persists for 30 days, otherwise it is a browser-session cookie.
  const sessionCookie = useCookie<AuthResponse | null>("auth-session", cookieOptions);
  const persistentCookie = useCookie<AuthResponse | null>("auth-session", {
    ...cookieOptions,
    maxAge: 30 * DAY,
  });
  const lastVisited = useCookie<string | null>("last-visited", {
    ...cookieOptions,
    maxAge: 30 * DAY,
  });

  const session = useState<AuthResponse | null>("auth:session", () => sessionCookie.value ?? null);
  const user = computed(() => session.value?.user ?? null);
  const isLoggedIn = computed(() => Boolean(session.value?.user));

  /** Where to send a user after they sign in: the last page they visited, or the dashboard. */
  const router = useRouter();
  const getRedirectTarget = () => {
    const path = lastVisited.value;
    // Only same-origin, absolute paths that resolve to a real, non-guest page. This also discards
    // stale or tampered cookie values (e.g. `/sw.js?v0.0.5`).
    if (!path || !path.startsWith("/") || path.startsWith("//")) return DEFAULT_REDIRECT;
    const route = router.resolve(path);
    return route.matched.length > 0 && route.meta.auth !== "guest" ? path : DEFAULT_REDIRECT;
  };

  const setSession = (value: AuthResponse, remember: boolean) => {
    session.value = value;
    if (remember) persistentCookie.value = value;
    else sessionCookie.value = value;
  };

  const clearSession = () => {
    session.value = null;
    sessionCookie.value = null;
    persistentCookie.value = null;
  };

  const login = async (input: LoginInput) => {
    const response = await $fetch<AuthResponse>("/api/auth/login", { method: "POST", body: input });
    setSession(response, Boolean(input.remember));
    await navigateTo(getRedirectTarget(), { replace: true });
  };

  const register = async (input: RegisterInput) => {
    const response = await $fetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: input,
    });
    setSession(response, false);
    await navigateTo(getRedirectTarget(), { replace: true });
  };

  const forgotPassword = (input: ForgotPasswordInput) =>
    $fetch<OkResponse>("/api/auth/forgot-password", { method: "POST", body: input });

  const logout = async () => {
    // `lastVisited` is intentionally kept so the next sign-in returns the user to where they were.
    await $fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearSession();
    await navigateTo("/login", { replace: true });
  };

  return {
    user,
    isLoggedIn,
    lastVisited,
    getRedirectTarget,
    login,
    register,
    forgotPassword,
    logout,
  };
};
