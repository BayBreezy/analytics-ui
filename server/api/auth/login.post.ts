// Dummy auth: any well-formed credentials work. `demo@analytics.test` gets a stable demo admin. An
// email that belongs to a staff member signs in as that person, with their role, so you can try
// what each role can and can't do. Everyone else is a demo admin.
export default defineEventHandler(async (event): Promise<AuthResponse> => {
  const { email } = await validateBody(event, loginSchema);
  await sleep(600);

  const member =
    email === DEMO_EMAIL
      ? undefined
      : getStore().staff.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (member?.status === "inactive") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "This account has been deactivated. Ask an admin to turn it back on.",
    });
  }

  const user = member
    ? createFakeUser({
        id: member.id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        role: member.role,
      })
    : email === DEMO_EMAIL
      ? createFakeUser({ id: "demo-user", name: "Demo User", email })
      : createFakeUser({ email, name: nameFromEmail(email) });

  return { user, token: createToken() };
});
