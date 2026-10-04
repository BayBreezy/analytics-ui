// Puts every collection, the settings and the sessions back to the seed data.
export default defineEventHandler(async (event): Promise<OkResponse> => {
  requirePermission(event, "settings:manage");
  await sleep(700);
  resetStore();
  return { ok: true, message: "Demo data reset" };
});
