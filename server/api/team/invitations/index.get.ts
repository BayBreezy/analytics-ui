import { z } from "zod";

const querySchema = z.object({
  status: z.enum(["pending", "accepted", "cancelled", "expired"]).optional(),
});

export default defineEventHandler(async (event): Promise<Invitation[]> => {
  const { status } = validateQuery(event, querySchema);
  await delay();
  return getStore()
    .invitations.map(withInvitationStatus)
    .filter((invitation) => !status || invitation.status === status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
});
