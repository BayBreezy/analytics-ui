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
