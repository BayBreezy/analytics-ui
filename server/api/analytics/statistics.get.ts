export default defineEventHandler(async (): Promise<AnalyticsStatistics> => {
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
