import { expect, test } from "./fixtures";

const ticket = {
  subject: "Help me please",
  category: "bug",
  priority: "high",
  message: "Something is broken on the orders page.",
};

test.describe("support tickets", () => {
  test("start with three, newest first", async ({ admin }) => {
    const tickets = await (await admin.get("/api/support/tickets")).json();
    expect(tickets.map((item: { status: string }) => item.status)).toEqual([
      "open",
      "answered",
      "closed",
    ]);
    expect(tickets[0].id).toBe("tkt_8001");
  });

  test("a new one is open, numbered on and listed first", async ({ admin }) => {
    const response = await admin.post("/api/support/tickets", { data: ticket });
    expect(response.status()).toBe(201);
    const created = await response.json();
    expect(created).toMatchObject({ ...ticket, status: "open", id: "tkt_8004" });
    expect((await (await admin.get("/api/support/tickets")).json())[0].id).toBe("tkt_8004");
  });

  test("are validated", async ({ admin }) => {
    const bad = [
      { subject: "Hi" },
      { category: "x" },
      { priority: "urgent" },
      { message: "short" },
      { message: "x".repeat(1001) },
    ];
    for (const patch of bad) {
      expect(
        (await admin.post("/api/support/tickets", { data: { ...ticket, ...patch } })).status(),
        JSON.stringify(patch)
      ).toBe(400);
    }
  });

  test("can be closed once", async ({ admin }) => {
    const created = await (await admin.post("/api/support/tickets", { data: ticket })).json();
    const closed = await admin.post(`/api/support/tickets/${created.id}/close`);
    expect((await closed.json()).status).toBe("closed");
    expect((await admin.post(`/api/support/tickets/${created.id}/close`)).status()).toBe(409);
    expect((await admin.post("/api/support/tickets/tkt_1/close")).status()).toBe(404);
  });

  test("are open to every role", async ({ support }) => {
    expect((await support.post("/api/support/tickets", { data: ticket })).status()).toBe(201);
  });
});
