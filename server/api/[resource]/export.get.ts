// Every record that matches the list's search, filters and sort, as a CSV file. A static segment, so
// it wins over `[id]`.
export default defineEventHandler(async (event) => {
  const name = getResourceParam(event);
  const permission = resourcePermission(name, "read");
  if (permission) requirePermission(event, permission);
  const query = validateQuery(event, exportQuerySchema);
  await delay();

  const { items } = listResource(name, { ...query, page: 1, pageSize: Number.MAX_SAFE_INTEGER });
  const csv = toCsv(CSV_COLUMNS[name] as CsvColumn<unknown>[], items);

  const date = new Date().toISOString().slice(0, 10);
  setHeader(event, "content-type", "text/csv; charset=utf-8");
  setHeader(event, "content-disposition", `attachment; filename="${name}-${date}.csv"`);
  setHeader(event, "x-content-type-options", "nosniff");
  return csv;
});
