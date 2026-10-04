export default defineNuxtRouteMiddleware((to) => {
  // URLs that don't match a page (e.g. `/sw.js` requested by a browser or extension) fall through to
  // the 404 page. They must never become the "last visited" page or trigger a login redirect.
  if (to.matched.length === 0) return;

  const { isLoggedIn, lastVisited, getRedirectTarget } = useAuth();

  // Guest pages (login, register, forgot password): signed-in users go back to where they were.
  if (to.meta.auth === "guest") {
    if (isLoggedIn.value) return navigateTo(getRedirectTarget(), { replace: true });
    return;
  }

  // Everything else is protected. Remember the destination either way so sign-in can return to it.
  lastVisited.value = to.fullPath;
  if (!isLoggedIn.value) return navigateTo("/login", { replace: true });
});
