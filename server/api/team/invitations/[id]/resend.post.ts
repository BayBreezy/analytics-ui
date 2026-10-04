// Sends the invitation again with a fresh seven days. Works for pending and expired invitations.
export default defineEventHandler(async (event): Promise<Invitation> => {
  const id = getRouterParam(event, "id")!;
  await delay();
  const invitation = findInvitation(id);
  const { status } = withInvitationStatus(invitation);
  if (status !== "pending" && status !== "expired") {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: `A ${status} invitation can't be resent`,
    });
  }
  invitation.status = "pending";
  invitation.createdAt = new Date().toISOString();
  invitation.expiresAt = new Date(Date.now() + 7 * 86_400_000).toISOString();
  return invitation;
});
