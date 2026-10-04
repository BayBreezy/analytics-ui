// Accepts a partial body, so the edit form (every field) and quick changes like `{ status }` both work.
export default defineEventHandler(async (event): Promise<ResourceMap[ResourceName]> => {
  const name = getResourceParam(event);
  const permission = resourcePermission(name, "write");
  if (permission) requirePermission(event, permission);
  const id = getRouterParam(event, "id")!;
  const patch = await validateBody(event, resourceSchemas[name].partial());
  await delay();
  return updateResource(name, id, patch);
});
