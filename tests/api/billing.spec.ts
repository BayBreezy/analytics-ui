import { expect, test } from "./fixtures";

test.describe("overview", () => {
  test("shows the Growth plan with usage taken from the store", async ({ admin }) => {
    const body = await (await admin.get("/api/billing")).json();
    expect(body.plan.id).toBe("growth");
    expect(body.subscription).toMatchObject({
      planId: "growth",
      interval: "monthly",
      status: "active",
    });
    expect(new Date(body.subscription.renewsAt).getTime()).toBeGreaterThan(Date.now());
    expect(
      body.usage.map((item: { key: string; used: number; limit: number }) => [
        item.key,
        item.used,
        item.limit,
      ])
    ).toEqual([
      ["products", 60, 200],
      ["seats", 12, 15],
      ["orders", 120, 500],
    ]);
  });

  test("lists three demo cards with one default, and never a full number", async ({ admin }) => {
    const body = await (await admin.get("/api/billing")).json();
    expect(body.paymentMethods).toHaveLength(3);
    expect(
      body.paymentMethods.filter((item: { isDefault: boolean }) => item.isDefault)
    ).toHaveLength(1);
    expect(JSON.stringify(body)).not.toMatch(/\d{13,}/);
  });

  test("usage follows the store", async ({ admin }) => {
    await admin.post("/api/staff", {
      data: {
        name: "Temp Person",
        email: "temp@x.test",
        phone: "555-123-4567",
        role: "support",
        status: "active",
      },
    });
    expect((await (await admin.get("/api/billing")).json()).usage[1].used).toBe(13);
  });
});

test.describe("plan changes", () => {
  test("refuse a plan the store has outgrown, and a plan it is already on", async ({ admin }) => {
    const downgrade = await admin.put("/api/billing/subscription", {
      data: { planId: "starter", interval: "monthly" },
    });
    expect(downgrade.status()).toBe(409);
    expect((await downgrade.json()).message).toContain(
      "Starter allows 50 products, and you have 60"
    );
    const same = await admin.put("/api/billing/subscription", {
      data: { planId: "growth", interval: "monthly" },
    });
    expect(same.status()).toBe(409);
  });

  test("validate the plan and period", async ({ admin }) => {
    expect(
      (
        await admin.put("/api/billing/subscription", {
          data: { planId: "nope", interval: "monthly" },
        })
      ).status()
    ).toBe(400);
    expect(
      (
        await admin.put("/api/billing/subscription", {
          data: { planId: "scale", interval: "weekly" },
        })
      ).status()
    ).toBe(400);
  });

  test("an upgrade renews a year out and adds a paid invoice", async ({ admin }) => {
    const body = await (
      await admin.put("/api/billing/subscription", {
        data: { planId: "scale", interval: "yearly" },
      })
    ).json();
    expect(body.plan.id).toBe("scale");
    expect(new Date(body.subscription.renewsAt).getTime() - Date.now()).toBeGreaterThan(
      360 * 86_400_000
    );
    const invoices = await (await admin.get("/api/billing/invoices")).json();
    expect(invoices).toHaveLength(13);
    expect(invoices[0]).toMatchObject({
      amount: 1990,
      status: "paid",
      description: "Scale plan, yearly",
    });
  });

  test("cancelling keeps the plan until the period ends, and can be undone", async ({ admin }) => {
    expect((await admin.post("/api/billing/subscription/resume")).status()).toBe(409);
    const cancelled = await (await admin.post("/api/billing/subscription/cancel")).json();
    expect(cancelled.subscription.status).toBe("canceling");
    expect((await admin.post("/api/billing/subscription/cancel")).status()).toBe(409);
    const resumed = await (await admin.post("/api/billing/subscription/resume")).json();
    expect(resumed.subscription.status).toBe("active");
  });

  test("choosing a plan while cancelling reactivates it", async ({ admin }) => {
    await admin.post("/api/billing/subscription/cancel");
    const body = await (
      await admin.put("/api/billing/subscription", {
        data: { planId: "scale", interval: "monthly" },
      })
    ).json();
    expect(body.subscription.status).toBe("active");
  });
});

test.describe("cards", () => {
  test("one can be made the default", async ({ admin }) => {
    const body = await (await admin.post("/api/billing/payment-methods/pm_2/default")).json();
    expect(body.paymentMethods.find((item: { id: string }) => item.id === "pm_2").isDefault).toBe(
      true
    );
    expect(
      body.paymentMethods.filter((item: { isDefault: boolean }) => item.isDefault)
    ).toHaveLength(1);
    expect((await admin.post("/api/billing/payment-methods/pm_9/default")).status()).toBe(404);
  });
});

test.describe("invoices", () => {
  test("are listed newest first, with one failed payment", async ({ admin }) => {
    const invoices = await (await admin.get("/api/billing/invoices")).json();
    expect(invoices).toHaveLength(12);
    const dates = invoices.map((item: { issuedAt: string }) => new Date(item.issuedAt).getTime());
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
    expect(invoices.filter((item: { status: string }) => item.status === "failed")).toHaveLength(1);
    expect(await (await admin.get("/api/billing/invoices?status=failed")).json()).toHaveLength(1);
    expect((await admin.get("/api/billing/invoices?status=nope")).status()).toBe(400);
  });

  test("open as a printable page with a locked-down policy", async ({ admin }) => {
    const invoice = (await (await admin.get("/api/billing/invoices")).json())[0];
    const response = await admin.get(`/api/billing/invoices/${invoice.id}`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/html");
    expect(response.headers()["content-security-policy"]).toContain("default-src 'none'");
    expect(response.headers()["content-disposition"]).toBeUndefined();
    const html = await response.text();
    expect(html).toContain(invoice.number);
    expect(html).toContain("$79.00");
  });

  test("download with ?download=1, and escape what they print", async ({ admin }) => {
    const invoice = (await (await admin.get("/api/billing/invoices")).json())[0];
    const response = await admin.get(`/api/billing/invoices/${invoice.id}?download=1`);
    expect(response.headers()["content-disposition"]).toContain(`${invoice.number}.html`);
    const base = await (await admin.get("/api/settings")).json();
    await admin.put("/api/settings", { data: { ...base, storeName: "<script>alert(1)</script>" } });
    const html = await (await admin.get(`/api/billing/invoices/${invoice.id}`)).text();
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect((await admin.get("/api/billing/invoices/bill_nope")).status()).toBe(404);
  });
});
