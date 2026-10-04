// Always succeeds so the response can't be used to find out which emails have accounts.
export default defineEventHandler(async (event): Promise<OkResponse> => {
  await validateBody(event, forgotPasswordSchema);
  await sleep(700);

  return { ok: true, message: "If an account exists for that email, a reset link is on its way." };
});
