// Newest first. `?status=paid|open|failed` filters the list.
export default defineEventHandler(async (event): Promise<Invoice[]> => {
  const { status } = validateQuery(event, invoiceQuerySchema);
  await delay();
  const invoices = getStore().billing.invoices;
  return status ? invoices.filter((invoice) => invoice.status === status) : invoices;
});
