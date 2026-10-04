// Every API route needs a session, except sign-in itself. Role checks are added per route with
// `requirePermission`. This is a demo: the session cookie isn't signed, so it is not real security.
export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname;
  // `/api/_nuxt_icon` and friends are Nuxt's own routes.
  if (!path.startsWith("/api/") || path.startsWith("/api/auth/") || path.startsWith("/api/_"))
    return;

  if (!getSessionUser(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Sign in to continue.",
    });
  }
});
