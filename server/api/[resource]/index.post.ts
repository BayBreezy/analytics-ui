export default defineEventHandler(async (event): Promise<ResourceMap[ResourceName]> => {
  const name = getResourceParam(event);
  const permission = resourcePermission(name, "write");
  if (permission) requirePermission(event, permission);
  const input = await validateBody(event, resourceSchemas[name]);
  await delay();
  setResponseStatus(event, 201);
  return createResource(name, input);
});
