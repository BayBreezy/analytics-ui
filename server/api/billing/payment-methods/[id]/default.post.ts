export default defineEventHandler(async (event): Promise<BillingOverview> => {
  requirePermission(event, "billing:manage");
  const id = getRouterParam(event, "id");
  await sleep(400);

  const { paymentMethods } = getStore().billing;
  if (!paymentMethods.some((method) => method.id === id)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `No payment method with id "${id}"`,
    });
  }
  for (const method of paymentMethods) method.isDefault = method.id === id;
  return getOverview();
});
