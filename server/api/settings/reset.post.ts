// Puts every collection, the settings and the sessions back to the seed data.
export default defineEventHandler(async (): Promise<OkResponse> => {
  await sleep(700);
  resetStore();
  return { ok: true, message: "Demo data reset" };
});
