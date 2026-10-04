// Changes the plan or the billing period. A plan can't be chosen if the store already uses more
// than it allows.
export default defineEventHandler(async (event): Promise<BillingOverview> => {
  const { planId, interval } = await validateBody(event, subscriptionSchema);
  await sleep(600);

  const billing = getStore().billing;
  const { subscription } = billing;
  const plan = getPlan(planId);

  if (
    subscription.planId === planId &&
    subscription.interval === interval &&
    subscription.status === "active"
  ) {
    throw createError({
      statusCode: 409,
      statusMessage: "Conflict",
      message: `You are already on the ${plan.name} plan, billed ${interval}.`,
    });
  }

  const over = getUsage(plan).find((item) => item.used > item.limit);
  if (over) {
    throw createError({
      statusCode: 409,
      statusMessage: "Conflict",
      message: `${plan.name} allows ${formatCount(over.limit)} ${over.label.toLowerCase()}, and you have ${formatCount(over.used)}. Remove some first, or pick a bigger plan.`,
    });
  }

  const number = nextInvoiceNumber();
  billing.invoices.unshift({
    id: `bill_${number}`,
    number: `INV-${new Date().getFullYear()}-${number}`,
    description: `${plan.name} plan, ${interval}`,
    amount: plan.price[interval],
    status: "paid",
    issuedAt: new Date().toISOString(),
  });
  billing.subscription = { planId, interval, status: "active", renewsAt: renewalDate(interval) };

  return getOverview();
});

const formatCount = (value: number) => value.toLocaleString("en-US");
