import { expect, test } from "./fixtures";

test.describe("reminders", () => {
  test("start with five, one of them done", async ({ admin }) => {
    const reminders = await (await admin.get("/api/dashboard/reminders")).json();
    expect(reminders).toHaveLength(5);
    expect(reminders.filter((item: { done: boolean }) => item.done)).toHaveLength(1);
    expect(reminders[0].id).toBe("rem_3001");
  });

  test("need a session", async ({ anon }) => {
    expect((await anon.get("/api/dashboard/reminders")).status()).toBe(401);
  });

  test("a new one goes last, not done, without a time", async ({ admin }) => {
    const response = await admin.post("/api/dashboard/reminders", {
      data: { title: "Order more boxes" },
    });
    expect(response.status()).toBe(201);
    const created = await response.json();
    expect(created).toMatchObject({
      id: "rem_3006",
      title: "Order more boxes",
      done: false,
      time: "",
    });
    expect((await (await admin.get("/api/dashboard/reminders")).json()).at(-1).id).toBe(created.id);
  });

  test("need a title of 2 to 100 characters", async ({ admin }) => {
    const short = await admin.post("/api/dashboard/reminders", { data: { title: "x" } });
    expect(short.status()).toBe(400);
    expect((await short.json()).message).toContain("at least 2");
    expect(
      (await admin.post("/api/dashboard/reminders", { data: { title: "x".repeat(101) } })).status()
    ).toBe(400);
    expect((await admin.post("/api/dashboard/reminders", { data: {} })).status()).toBe(400);
  });

  test("can be ticked off with a partial update, or edited", async ({ admin }) => {
    const created = await (
      await admin.post("/api/dashboard/reminders", { data: { title: "Order more boxes" } })
    ).json();
    const ticked = await (
      await admin.put(`/api/dashboard/reminders/${created.id}`, { data: { done: true } })
    ).json();
    expect(ticked).toMatchObject({ done: true, title: "Order more boxes" });
    const edited = await (
      await admin.put(`/api/dashboard/reminders/${created.id}`, {
        data: { title: "Order more tape", time: "3:00 PM" },
      })
    ).json();
    expect(edited).toMatchObject({ title: "Order more tape", time: "3:00 PM", done: true });
    expect(
      (await admin.put("/api/dashboard/reminders/rem_9", { data: { done: true } })).status()
    ).toBe(404);
    expect(
      (
        await admin.put(`/api/dashboard/reminders/${created.id}`, { data: { done: "yes" } })
      ).status()
    ).toBe(400);
  });

  test("can be deleted once", async ({ admin }) => {
    const created = await (
      await admin.post("/api/dashboard/reminders", { data: { title: "Order more boxes" } })
    ).json();
    expect((await admin.delete(`/api/dashboard/reminders/${created.id}`)).status()).toBe(200);
    expect((await admin.delete(`/api/dashboard/reminders/${created.id}`)).status()).toBe(404);
    expect(await (await admin.get("/api/dashboard/reminders")).json()).toHaveLength(5);
  });

  test("are open to every role", async ({ support }) => {
    expect(
      (
        await support.post("/api/dashboard/reminders", { data: { title: "Call a supplier" } })
      ).status()
    ).toBe(201);
  });
});
