import type { ResourceName } from "../types/store";

/**
 * The store resources that get list, create, details and edit pages. This file is plain data (no Vue
 * or Nuxt auto-imports) so `nuxt.config.ts` can import it to register the routes.
 */
export const RESOURCES = {
  customers: {
    singular: "Customer",
    plural: "Customers",
    base: "/customers",
    icon: "lucide:users",
  },
  orders: { singular: "Order", plural: "Orders", base: "/orders", icon: "lucide:shopping-cart" },
  products: { singular: "Product", plural: "Products", base: "/products", icon: "lucide:package" },
  staff: { singular: "Staff member", plural: "Staff", base: "/staff", icon: "lucide:user-cog" },
} as const satisfies Record<
  ResourceName,
  { singular: string; plural: string; base: string; icon: string }
>;

export const RESOURCE_NAMES = Object.keys(RESOURCES) as ResourceName[];

export const isResourceName = (value: unknown): value is ResourceName =>
  typeof value === "string" && value in RESOURCES;

/** What to call a record in headings and dialogs. */
export const getRecordLabel = (name: ResourceName, record: { name?: string; number?: string }) =>
  (name === "orders" ? record.number : record.name) ?? "this record";
