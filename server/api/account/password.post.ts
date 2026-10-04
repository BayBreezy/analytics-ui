// There is no real password in this demo, so any valid change succeeds.
export default defineEventHandler(async (event): Promise<OkResponse> => {
  await validateBody(event, changePasswordSchema);
  await sleep(600);
  return { ok: true, message: "Password updated" };
});
