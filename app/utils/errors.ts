/** Pulls a user-facing message out of a `$fetch` error (or anything else that gets thrown). */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  const err = error as { data?: { message?: string }; statusMessage?: string; message?: string };
  return err?.data?.message || err?.statusMessage || err?.message || fallback;
}
