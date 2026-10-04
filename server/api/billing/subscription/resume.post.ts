export default defineEventHandler(async (): Promise<BillingOverview> => {
  await sleep(500);
  const { subscription } = getStore().billing;
  if (subscription.status !== "canceling") {
    throw createError({
      statusCode: 409,
      statusMessage: "Conflict",
      message: "This plan isn't set to cancel.",
    });
  }
  subscription.status = "active";
  return getOverview();
});
