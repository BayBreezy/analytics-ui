const DAY = 86_400_000;

/** What the store is using, measured against a plan's limits. */
export function getUsage(plan: Plan): UsageItem[] {
  const store = getStore();
  const since = Date.now() - 30 * DAY;
  return [
    {
      key: "products",
      label: "Products",
      used: store.products.length,
      limit: plan.limits.products,
    },
    { key: "seats", label: "Team members", used: store.staff.length, limit: plan.limits.seats },
    {
      key: "orders",
      label: "Orders in the last 30 days",
      used: store.orders.filter((order) => new Date(order.createdAt).getTime() >= since).length,
      limit: plan.limits.orders,
    },
  ];
}

export function getOverview(): BillingOverview {
  const { subscription, paymentMethods } = getStore().billing;
  const plan = getPlan(subscription.planId);
  return { subscription, plan, usage: getUsage(plan), paymentMethods };
}

/** When a subscription that starts now next renews. */
export const renewalDate = (interval: BillingInterval) =>
  new Date(Date.now() + (interval === "yearly" ? 365 : 30) * DAY).toISOString();

const escapeHtml = (value: string | number) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!
  );

/** A printable invoice as a standalone HTML page. */
export function renderInvoice(invoice: Invoice, storeName: string) {
  const issued = new Date(invoice.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    invoice.amount
  );
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(invoice.number)}</title>
<style>
  body { font: 15px/1.5 system-ui, sans-serif; color: #111; max-width: 640px; margin: 40px auto; padding: 0 16px; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  .muted { color: #666; }
  table { width: 100%; border-collapse: collapse; margin-top: 32px; }
  th, td { text-align: left; padding: 12px 0; border-bottom: 1px solid #ddd; }
  th:last-child, td:last-child { text-align: right; }
  .total td { font-weight: 600; border-bottom: 0; }
  .status { display: inline-block; padding: 2px 10px; border: 1px solid #999; border-radius: 99px; font-size: 13px; text-transform: capitalize; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
  <h1>Invoice ${escapeHtml(invoice.number)}</h1>
  <p class="muted">${escapeHtml(storeName)} · Issued ${escapeHtml(issued)}</p>
  <p><span class="status">${escapeHtml(invoice.status)}</span></p>
  <table>
    <thead><tr><th>Description</th><th>Amount</th></tr></thead>
    <tbody>
      <tr><td>${escapeHtml(invoice.description)}</td><td>${escapeHtml(amount)}</td></tr>
      <tr class="total"><td>Total</td><td>${escapeHtml(amount)}</td></tr>
    </tbody>
  </table>
  <p class="muted" style="margin-top:32px">This is a demo invoice generated from sample data. It is not a real document.</p>
</body>
</html>`;
}
