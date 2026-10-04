import { z } from "zod";

const querySchema = z.object({ q: z.string().trim().min(2, "Type at least 2 characters").max(50) });

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

/**
 * Looks for a customer, order, product or team member by name, email, number and so on. It
 * returns the top 5 of each, and leaves out what the user's role may not read.
 */
export default defineEventHandler(async (event): Promise<SearchResults> => {
  const user = getSessionUser(event);
  const { q } = validateQuery(event, querySchema);
  await sleep(120);

  const find = <K extends ResourceName>(name: K) => {
    const permission = resourcePermission(name, "read");
    if (permission && !hasPermission(user?.role, permission)) return [];
    return listResource(name, { page: 1, pageSize: 5, search: q, order: "desc" }).items;
  };

  return {
    customers: find("customers").map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: item.email,
      href: `/customers/${item.id}`,
    })),
    orders: find("orders").map((item) => ({
      id: item.id,
      title: item.number,
      subtitle: `${item.customer.name} · ${money(item.total)}`,
      href: `/orders/${item.id}`,
    })),
    products: find("products").map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: `${item.sku} · ${item.category}`,
      href: `/products/${item.id}`,
    })),
    staff: find("staff").map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: `${item.email} · ${item.role}`,
      href: `/staff/${item.id}`,
    })),
  };
});
