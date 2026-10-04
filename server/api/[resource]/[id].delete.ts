export default defineEventHandler(async (event): Promise<OkResponse> => {
  const name = getResourceParam(event);
  const id = getRouterParam(event, "id")!;
  await delay();
  deleteResource(name, id);
  return { ok: true, message: `${RESOURCES[name].singular} deleted` };
});
