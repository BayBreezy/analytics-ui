export default defineNuxtRouteMiddleware((to) => {
  // URLs that don't match a page (e.g. `/sw.js` requested by a browser or extension) fall through to
  // the 404 page. They must never become the "last visited" page or trigger a login redirect.
  if (to.matched.length === 0) return;

  const { isLoggedIn, can, lastVisited, getRedirectTarget } = useAuth();

  // Guest pages (login, register, forgot password): signed-in users go back to where they were.
  if (to.meta.auth === "guest") {
    if (isLoggedIn.value) return navigateTo(getRedirectTarget(), { replace: true });
    return;
  }

  // Signed-in users whose role doesn't allow the page go to the dashboard. The page isn't
  // remembered as their last visit.
  if (isLoggedIn.value && to.meta.permission && !can(to.meta.permission)) {
    // The layout shows the message. A short-lived cookie carries it, because a redirect during a
    // full page load is a new request and wouldn't keep any state.
    useCookie("access-denied", { maxAge: 30, sameSite: "lax" }).value = "1";
    return navigateTo(DASHBOARD_URL, { replace: true });
  }

  // Everything else is protected. Remember the destination either way so sign-in can return to it.
  lastVisited.value = to.fullPath;
  if (!isLoggedIn.value) return navigateTo("/login", { replace: true });
});
