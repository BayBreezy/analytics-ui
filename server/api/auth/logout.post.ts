export default defineEventHandler(async (): Promise<OkResponse> => {
  await sleep(200);
  return { ok: true, message: "Signed out" };
});
