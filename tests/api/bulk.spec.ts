import type { APIRequestContext } from "@playwright/test";
import { expect, test } from "./fixtures";

const list = async (request: APIRequestContext, name: string, query = "") =>
  (await (await request.get(`/api/${name}?pageSize=100${query}`)).json()) as {
    total: number;
    items: { id: string; status: string; role?: string }[];
  };
const ids = (items: { id: string }[], count: number) =>
  items.slice(0, count).map((item) => item.id);
const bulk = (request: APIRequestContext, name: string, data: object) =>
  request.post(`/api/${name}/bulk`, { data });

test.describe("bulk update and delete", () => {
  test("change the status of several records", async ({ admin }) => {
    const customers = (await list(admin, "customers")).items;
    const result = await (
      await bulk(admin, "customers", {
        action: "update",
        ids: ids(customers, 3),
        status: "inactive",
      })
    ).json();
    expect(result).toEqual({ done: 3, failed: [] });
    const after = (await list(admin, "customers")).items;
    for (const id of ids(customers, 3))
      expect(after.find((item) => item.id === id)!.status).toBe("inactive");
    expect(after).toHaveLength(48);

    const orders = (await list(admin, "orders")).items;
    expect(
      (
        await (
          await bulk(admin, "orders", { action: "update", ids: ids(orders, 4), status: "shipped" })
        ).json()
      ).done
    ).toBe(4);
  });

  test("delete several records", async ({ admin }) => {
    const products = (await list(admin, "products")).items;
    expect(
      (await (await bulk(admin, "products", { action: "delete", ids: ids(products, 2) })).json())
        .done
    ).toBe(2);
    expect((await list(admin, "products")).total).toBe(58);
  });

  test("one failure doesn't stop the others, and says which and why", async ({ admin }) => {
    const products = (await list(admin, "products")).items;
    const result = await (
      await bulk(admin, "products", {
        action: "delete",
        ids: [products[5]!.id, "prd_9999", products[6]!.id],
      })
    ).json();
    expect(result.done).toBe(2);
    expect(result.failed).toHaveLength(1);
    expect(result.failed[0]).toMatchObject({ id: "prd_9999" });
    expect(result.failed[0].message).toContain("prd_9999");
    expect((await list(admin, "products")).total).toBe(58);
  });

  test("ids of another resource fail one by one", async ({ admin }) => {
    const result = await (
      await bulk(admin, "products", { action: "delete", ids: ["cus_1001"] })
    ).json();
    expect(result).toMatchObject({ done: 0, failed: [{ id: "cus_1001" }] });
  });

  test("the last admin is protected, the rest still go through", async ({ admin }) => {
    const staff = (await list(admin, "staff")).items;
    const admins = staff.filter((item) => item.role === "admin");
    const result = await (
      await bulk(admin, "staff", { action: "delete", ids: admins.map((item) => item.id) })
    ).json();
    expect(admins).toHaveLength(2);
    expect(result.done).toBe(1);
    expect(result.failed[0].message).toContain("At least one active admin");
    const last = (await list(admin, "staff")).items.find((item) => item.role === "admin")!;
    const deactivate = await (
      await bulk(admin, "staff", { action: "update", ids: [last.id], status: "inactive" })
    ).json();
    expect(deactivate).toMatchObject({ done: 0 });
    const managers = staff.filter((item) => item.role === "manager");
    expect(
      await (
        await bulk(admin, "staff", {
          action: "update",
          ids: managers.map((item) => item.id),
          status: "inactive",
        })
      ).json()
    ).toEqual({ done: managers.length, failed: [] });
  });
});

test.describe("bulk requests are validated", () => {
  test("ids: 1 to 100, no repeats", async ({ admin }) => {
    expect((await bulk(admin, "customers", { action: "delete", ids: [] })).status()).toBe(400);
    expect(
      (
        await bulk(admin, "customers", {
          action: "delete",
          ids: Array.from({ length: 101 }, (_, i) => `cus_${i}`),
        })
      ).status()
    ).toBe(400);
    expect(
      (await bulk(admin, "customers", { action: "delete", ids: ["cus_1001", "cus_1001"] })).status()
    ).toBe(400);
    expect((await admin.post("/api/customers/bulk")).status()).toBe(400);
  });

  test("action and status", async ({ admin }) => {
    expect(
      (await bulk(admin, "customers", { action: "explode", ids: ["cus_1001"] })).status()
    ).toBe(400);
    expect((await bulk(admin, "customers", { action: "update", ids: ["cus_1001"] })).status()).toBe(
      400
    );
    const wrong = await bulk(admin, "customers", {
      action: "update",
      ids: ["cus_1001"],
      status: "shipped",
    });
    expect(wrong.status()).toBe(400);
    expect((await wrong.json()).message).toContain("isn't a valid customer status");
  });

  test("the resource must exist", async ({ admin }) => {
    expect((await bulk(admin, "nothing", { action: "delete", ids: ["x"] })).status()).toBe(404);
  });
});

test.describe("bulk permissions", () => {
  test("need a session", async ({ anon }) => {
    expect((await bulk(anon, "customers", { action: "delete", ids: ["cus_1005"] })).status()).toBe(
      401
    );
  });

  test("a manager can change the store but not the staff", async ({ manager, admin }) => {
    expect(
      (
        await bulk(manager, "customers", {
          action: "update",
          ids: ["cus_1004"],
          status: "inactive",
        })
      ).status()
    ).toBe(200);
    const member = (await list(admin, "staff")).items[0]!;
    expect((await bulk(manager, "staff", { action: "delete", ids: [member.id] })).status()).toBe(
      403
    );
  });

  test("support can only work on orders", async ({ support, admin }) => {
    const order = (await list(admin, "orders")).items[5]!;
    expect(
      (
        await (
          await bulk(support, "orders", { action: "update", ids: [order.id], status: "paid" })
        ).json()
      ).done
    ).toBe(1);
    expect(
      (await bulk(support, "products", { action: "delete", ids: ["prd_2010"] })).status()
    ).toBe(403);
    expect(
      (await bulk(support, "customers", { action: "delete", ids: ["cus_1010"] })).status()
    ).toBe(403);
  });

  test("don't break the neighbouring routes", async ({ admin }) => {
    expect((await admin.get("/api/customers/export")).status()).toBe(200);
    expect((await admin.get("/api/customers/cus_1004")).status()).toBe(200);
  });
});
