export default defineEventHandler(async (event): Promise<BillingOverview> => {
  requirePermission(event, "billing:manage");
  await delay();
  return getOverview();
});
