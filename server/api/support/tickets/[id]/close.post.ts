export default defineEventHandler(async (event): Promise<Ticket> => {
  const id = getRouterParam(event, "id");
  await sleep(400);

  const ticket = getStore().tickets.find((entry) => entry.id === id);
  if (!ticket) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `No ticket with id "${id}"`,
    });
  }
  if (ticket.status === "closed") {
    throw createError({
      statusCode: 409,
      statusMessage: "Conflict",
      message: "This ticket is already closed.",
    });
  }
  ticket.status = "closed";
  return ticket;
});
