import { expect, test } from "./fixtures";

const profile = {
  name: "Jane Roe",
  email: "jane@x.test",
  jobTitle: "Owner",
  phone: "555",
  bio: "hi",
  avatar: "https://example.com/a.svg",
};

test.describe("profile", () => {
  test("is validated and echoed back with the id and role of the session", async ({
    manager,
    team,
  }) => {
    const response = await manager.put("/api/account/profile", { data: profile });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ ...profile, role: "manager" });
    expect(body.id).toMatch(/^stf_/);
    expect(team.email("manager")).toBeTruthy();
  });

  test("falls back to the demo user without a readable session", async ({ admin }) => {
    const body = await (await admin.put("/api/account/profile", { data: profile })).json();
    expect(body).toMatchObject({ id: "demo-user", role: "admin" });
  });

  test("defaults the optional fields", async ({ admin }) => {
    const body = await (
      await admin.put("/api/account/profile", {
        data: { name: "Jane", email: "j@x.test", avatar: "https://e.com/a" },
      })
    ).json();
    expect(body).toMatchObject({ jobTitle: "", phone: "", bio: "" });
  });

  test("rejects bad input", async ({ admin }) => {
    for (const patch of [
      { name: "J" },
      { email: "nope" },
      { avatar: "nope" },
      { bio: "x".repeat(201) },
    ]) {
      expect(
        (await admin.put("/api/account/profile", { data: { ...profile, ...patch } })).status(),
        JSON.stringify(patch)
      ).toBe(400);
    }
    const short = await (
      await admin.put("/api/account/profile", { data: { ...profile, name: "J" } })
    ).json();
    expect(short.message).toContain("at least 2");
  });
});

test.describe("password", () => {
  const change = {
    currentPassword: "oldpass1",
    newPassword: "newpass12",
    confirmPassword: "newpass12",
  };

  test("accepts a valid change", async ({ admin }) => {
    const response = await admin.post("/api/account/password", { data: change });
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
  });

  test("rejects a mismatch, no number, no current password or reusing the current one", async ({
    admin,
  }) => {
    const bad = [
      { ...change, confirmPassword: "different1" },
      { ...change, newPassword: "nodigitshere", confirmPassword: "nodigitshere" },
      { ...change, currentPassword: "" },
      { currentPassword: "samepass1", newPassword: "samepass1", confirmPassword: "samepass1" },
    ];
    for (const data of bad)
      expect((await admin.post("/api/account/password", { data })).status()).toBe(400);
  });
});

test.describe("sessions", () => {
  test("lists four devices, one of them this one", async ({ admin }) => {
    const sessions = await (await admin.get("/api/account/sessions")).json();
    expect(sessions).toHaveLength(4);
    expect(sessions.filter((item: { current: boolean }) => item.current)).toHaveLength(1);
  });

  test("signs out another device, but not this one", async ({ admin }) => {
    const sessions = await (await admin.get("/api/account/sessions")).json();
    const current = sessions.find((item: { current: boolean }) => item.current);
    const other = sessions.find((item: { current: boolean }) => !item.current);
    const refused = await admin.delete(`/api/account/sessions/${current.id}`);
    expect(refused.status()).toBe(400);
    expect((await admin.delete("/api/account/sessions/ses_nope")).status()).toBe(404);
    const left = await (await admin.delete(`/api/account/sessions/${other.id}`)).json();
    expect(left).toHaveLength(3);
  });

  test("signs out every other device at once", async ({ admin }) => {
    const left = await (await admin.delete("/api/account/sessions/others")).json();
    expect(left).toHaveLength(1);
    expect(left[0].current).toBe(true);
  });
});
