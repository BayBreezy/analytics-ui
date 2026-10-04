const WEEK = 7 * 86_400_000;

export default defineEventHandler(async (event): Promise<Invitation> => {
  requirePermission(event, "team:manage");
  const { email, role, message } = await validateBody(event, inviteSchema);
  await delay();
  const store = getStore();
  const address = email.toLowerCase();

  if (store.staff.some((member) => member.email.toLowerCase() === address)) {
    throw createError({
      statusCode: 409,
      statusMessage: "Conflict",
      message: `${email} is already on your team`,
    });
  }
  if (
    store.invitations.some(
      (invitation) =>
        invitation.email.toLowerCase() === address &&
        withInvitationStatus(invitation).status === "pending"
    )
  ) {
    throw createError({
      statusCode: 409,
      statusMessage: "Conflict",
      message: `There is already a pending invitation for ${email}`,
    });
  }

  const invitation: Invitation = {
    id: `inv_${nextInvitationNumber()}`,
    email,
    role,
    status: "pending",
    message,
    invitedBy: getSessionUser(event)?.name || "Demo User",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + WEEK).toISOString(),
  };
  store.invitations.unshift(invitation);
  setResponseStatus(event, 201);
  return invitation;
});
