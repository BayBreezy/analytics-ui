// The profile lives in the session cookie, so this only validates the input and echoes the user back.
export default defineEventHandler(async (event): Promise<AuthUser> => {
  const input = await validateBody(event, profileSchema);
  await sleep(500);

  const current = getSessionUser(event);
  return { id: current?.id ?? "demo-user", role: current?.role ?? "admin", ...input };
});
