// The plan keeps working until the end of the period that is already paid for.
export default defineEventHandler(async (): Promise<BillingOverview> => {
  await sleep(500);
  const { subscription } = getStore().billing;
  if (subscription.status === "canceling") {
    throw createError({
      statusCode: 409,
      statusMessage: "Conflict",
      message: "This plan is already set to cancel.",
    });
  }
  subscription.status = "canceling";
  return getOverview();
});
