// Demo only: pretends the invited person accepted, so the whole invite flow can be tried without email.
export default defineEventHandler(
  async (event): Promise<{ invitation: Invitation; member: StaffMember }> => {
    requirePermission(event, "team:manage");
    const id = getRouterParam(event, "id")!;
    await delay();
    const invitation = findInvitation(id);
    if (withInvitationStatus(invitation).status !== "pending") {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Only a pending invitation can be accepted",
      });
    }

    const member = createResource("staff", {
      name: nameFromEmail(invitation.email),
      email: invitation.email,
      phone: "555-0100",
      role: invitation.role,
      status: "active",
    });
    invitation.status = "accepted";
    return { invitation, member };
  }
);
