export default defineEventHandler(async (event): Promise<Paginated<ResourceMap[ResourceName]>> => {
  const name = getResourceParam(event);
  const query = validateQuery(event, listQuerySchema);
  await delay();
  return listResource(name, query);
});
