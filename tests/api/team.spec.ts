import { expect, test } from "./fixtures";

const invite = (email: string, role = "support") => ({ email, role, message: "Welcome" });

test.describe("invitations", () => {
  test("lists the seeded invitations, one of them expired", async ({ admin }) => {
    const all = await (await admin.get("/api/team/invitations")).json();
    expect(all).toHaveLength(6);
    expect(all.map((item: { status: string }) => item.status).sort()).toEqual([
      "accepted",
      "cancelled",
      "expired",
      "pending",
      "pending",
      "pending",
    ]);
    const pending = await (await admin.get("/api/team/invitations?status=pending")).json();
    expect(pending.every((item: { status: string }) => item.status === "pending")).toBe(true);
  });

  test("creates one that lasts 7 days, and remembers who sent it", async ({ admin }) => {
    const response = await admin.post("/api/team/invitations", {
      data: invite("new.hire@example.com"),
    });
    expect(response.status()).toBe(201);
    const created = await response.json();
    expect(created).toMatchObject({
      email: "new.hire@example.com",
      role: "support",
      status: "pending",
      invitedBy: "Demo User",
    });
    const days =
      (new Date(created.expiresAt).getTime() - new Date(created.createdAt).getTime()) / 86_400_000;
    expect(days).toBeCloseTo(7, 0);
  });

  test("won't invite someone already on the team or already invited", async ({ admin }) => {
    const member = (await (await admin.get("/api/staff?pageSize=1")).json()).items[0];
    expect(
      (
        await admin.post("/api/team/invitations", { data: invite(member.email.toUpperCase()) })
      ).status()
    ).toBe(409);
    expect(
      (await admin.post("/api/team/invitations", { data: invite("twice@example.com") })).status()
    ).toBe(201);
    const again = await admin.post("/api/team/invitations", { data: invite("TWICE@example.com") });
    expect(again.status()).toBe(409);
    expect((await again.json()).message).toContain("pending");
  });

  test("validates the email and role", async ({ admin }) => {
    expect((await admin.post("/api/team/invitations", { data: invite("nope") })).status()).toBe(
      400
    );
    expect(
      (await admin.post("/api/team/invitations", { data: invite("a@b.test", "owner") })).status()
    ).toBe(400);
  });

  test("can be resent with a fresh expiry, and cancelled", async ({ admin }) => {
    const expired = (await (await admin.get("/api/team/invitations")).json()).find(
      (item: { status: string }) => item.status === "expired"
    );
    const resent = await (await admin.post(`/api/team/invitations/${expired.id}/resend`)).json();
    expect(resent.status).toBe("pending");
    expect(new Date(resent.expiresAt).getTime()).toBeGreaterThan(Date.now());
    expect((await admin.delete(`/api/team/invitations/${expired.id}`)).status()).toBe(200);
    const after = (await (await admin.get("/api/team/invitations")).json()).find(
      (item: { id: string }) => item.id === expired.id
    );
    expect(after.status).toBe("cancelled");
    expect((await admin.post("/api/team/invitations/inv_0/resend")).status()).toBe(404);
  });

  test("accepting adds the person to the team with the invited role", async ({ admin }) => {
    const created = await (
      await admin.post("/api/team/invitations", { data: invite("jane.doe@example.com", "manager") })
    ).json();
    const accepted = await admin.post(`/api/team/invitations/${created.id}/accept`);
    expect(accepted.status()).toBe(200);
    const { invitation, member } = await accepted.json();
    expect(invitation.status).toBe("accepted");
    expect(member).toMatchObject({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      role: "manager",
      status: "active",
    });
    expect((await (await admin.get("/api/staff")).json()).total).toBe(13);
    expect((await admin.post(`/api/team/invitations/${created.id}/accept`)).status()).toBe(400);
  });
});
