import type { H3Event } from "h3";

/** The signed-in user from the `auth-session` cookie, or undefined if there is none. */
export function getSessionUser(event: H3Event): AuthUser | undefined {
  try {
    const raw = getCookie(event, "auth-session") ?? "";
    return (JSON.parse(decodeURIComponent(raw)) as AuthResponse).user ?? undefined;
  } catch {
    return undefined;
  }
}

/** Throws a 401 without a session and a 403 if the user's role may not do this. */
export function requirePermission(event: H3Event, permission: Permission): AuthUser {
  const user = getSessionUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Sign in to continue.",
    });
  }
  if (!hasPermission(user.role, permission)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: `Your role (${user.role}) can't do this. Ask an admin for access.`,
    });
  }
  return user;
}
