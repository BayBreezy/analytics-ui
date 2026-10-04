export default defineEventHandler(async (event): Promise<Ticket> => {
  const input = await validateBody(event, ticketSchema);
  await sleep(600);

  const ticket: Ticket = {
    id: `tkt_${nextTicketNumber()}`,
    ...input,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  getStore().tickets.unshift(ticket);
  setResponseStatus(event, 201);
  return ticket;
});
