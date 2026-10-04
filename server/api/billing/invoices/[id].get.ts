// A printable invoice. `?download=1` makes the browser save it instead of showing it.
export default defineEventHandler((event) => {
  requirePermission(event, "billing:manage");
  const id = getRouterParam(event, "id");
  const invoice = getStore().billing.invoices.find((entry) => entry.id === id);
  if (!invoice) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `No invoice with id "${id}"`,
    });
  }

  setHeader(event, "content-type", "text/html; charset=utf-8");
  // The invoice is a standalone page, so it can't run scripts or load anything.
  setHeader(event, "content-security-policy", "default-src 'none'; style-src 'unsafe-inline'");
  if (getQuery(event).download) {
    setHeader(event, "content-disposition", `attachment; filename="${invoice.number}.html"`);
  }
  return renderInvoice(invoice, getStore().settings.storeName);
});
