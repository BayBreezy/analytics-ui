export default defineEventHandler(async (event): Promise<AuthResponse> => {
  const { name, email } = await validateBody(event, registerSchema);
  await sleep(800);

  return { user: createFakeUser({ name, email }), token: createToken() };
});
