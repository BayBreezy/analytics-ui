// Cancels an invitation. It stays in the list with the status "cancelled".
export default defineEventHandler(async (event): Promise<Invitation> => {
  requirePermission(event, "team:manage");
  const id = getRouterParam(event, "id")!;
  await delay();
  const invitation = findInvitation(id);
  if (withInvitationStatus(invitation).status === "accepted") {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "This invitation was already accepted",
    });
  }
  invitation.status = "cancelled";
  return invitation;
});
