export default defineEventHandler(async (event): Promise<AnalyticsStatistics> => {
  requirePermission(event, "analytics:read");
  await delay();
  const orders = salesOrders();

  return {
    categories: categoryStats(orders),
    statuses: statusStats(),
    topCustomers: topCustomers(orders),
    segments: customerSegments(orders),
    stock: stockHealth(),
    heatmap: buildHeatmap(),
  };
});
