export default defineEventHandler(async (event): Promise<Paginated<ResourceMap[ResourceName]>> => {
  const name = getResourceParam(event);
  const permission = resourcePermission(name, "read");
  if (permission) requirePermission(event, permission);
  const query = validateQuery(event, listQuerySchema);
  await delay();
  return listResource(name, query);
});
