// Dummy auth: any well-formed credentials work. `demo@analytics.test` gets a stable demo user.
export default defineEventHandler(async (event): Promise<AuthResponse> => {
  const { email } = await validateBody(event, loginSchema);
  await sleep(600);

  const user =
    email === DEMO_EMAIL
      ? createFakeUser({ id: "demo-user", name: "Demo User", email })
      : createFakeUser({ email, name: nameFromEmail(email) });

  return { user, token: createToken() };
});
