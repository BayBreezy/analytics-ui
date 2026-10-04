export default defineEventHandler(async (event): Promise<ResourceMap[ResourceName]> => {
  const name = getResourceParam(event);
  const permission = resourcePermission(name, "read");
  if (permission) requirePermission(event, permission);
  const id = getRouterParam(event, "id")!;
  await delay();
  return getResource(name, id) ?? notFound(name, id);
});
