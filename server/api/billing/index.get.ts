export default defineEventHandler(async (): Promise<BillingOverview> => {
  await delay();
  return getOverview();
});
