import type { H3Event } from "h3";

/**
 * The mock database: four in-memory collections, seeded with faker. Changes made through the API
 * show up immediately and last until the server restarts. The store lives on `globalThis` so
 * editing server files in dev doesn't wipe the data.
 */
interface Store {
  customers: Customer[];
  orders: Order[];
  products: Product[];
  staff: StaffMember[];
  /** Next number to use for each id prefix. */
  counters: Record<string, number>;
}

const globalStore = globalThis as typeof globalThis & { __analyticsStore?: Store };

function seed(): Store {
  const people = createMock(101);
  const customers: Customer[] = Array.from({ length: 48 }, (_, index) => {
    const firstName = people.person.firstName();
    const lastName = people.person.lastName();
    return {
      id: `cus_${1001 + index}`,
      name: `${firstName} ${lastName}`,
      email: people.internet.email({ firstName, lastName }).toLowerCase(),
      phone: people.phone.number(),
      city: people.location.city(),
      country: people.location.country(),
      status: people.helpers.weightedArrayElement<CustomerStatus>([
        { weight: 9, value: "active" },
        { weight: 1, value: "inactive" },
      ]),
      avatar: people.image.avatar(),
      createdAt: hoursAgo(index * 8 + people.number.float({ min: 0.5, max: 6 })),
    };
  });

  const catalog = createMock(201);
  const products: Product[] = Array.from({ length: 60 }, (_, index) => {
    const category = catalog.helpers.arrayElement(PRODUCT_CATEGORIES);
    return {
      id: `prd_${2001 + index}`,
      name: catalog.commerce.productName(),
      sku: `${category.slice(0, 3).toUpperCase()}-${catalog.string.numeric(5)}`,
      category,
      price: Number(catalog.commerce.price({ min: 9, max: 380 })),
      stock:
        catalog.helpers.maybe(() => catalog.number.int({ min: 0, max: 240 }), {
          probability: 0.9,
        }) ?? 0,
      status: catalog.helpers.weightedArrayElement<ProductStatus>([
        { weight: 14, value: "active" },
        { weight: 2, value: "draft" },
        { weight: 1, value: "archived" },
      ]),
      description: catalog.commerce.productDescription(),
      createdAt: daysAgo(index * 1.3 + catalog.number.float({ min: 0.1, max: 1 })),
    };
  });

  const team = createMock(301);
  const roles: StaffRole[] = ["admin", "admin", "manager", "manager", "manager", "manager"];
  const staff: StaffMember[] = Array.from({ length: 12 }, (_, index) => {
    const firstName = team.person.firstName();
    const lastName = team.person.lastName();
    return {
      id: `stf_${301 + index}`,
      name: `${firstName} ${lastName}`,
      email: team.internet.email({ firstName, lastName, provider: "analytics.test" }).toLowerCase(),
      phone: team.phone.number(),
      role: roles[index] ?? "support",
      status: team.helpers.weightedArrayElement<StaffStatus>([
        { weight: 11, value: "active" },
        { weight: 1, value: "inactive" },
      ]),
      avatar: team.image.avatar(),
      createdAt: daysAgo(30 + index * 40 + team.number.float({ min: 0, max: 20 })),
    };
  });

  const sales = createMock(401);
  const orders: Order[] = Array.from({ length: 120 }, (_, index) => {
    const customer = sales.helpers.arrayElement(customers);
    const items: OrderItem[] = sales.helpers
      .arrayElements(products, { min: 1, max: 4 })
      .map((product) => ({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: sales.number.int({ min: 1, max: 3 }),
      }));
    const number = 4821 - index;
    return {
      id: `ord_${number}`,
      number: `#ORD-${number}`,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        avatar: customer.avatar,
      },
      items,
      total: orderTotal(items),
      status: sales.helpers.weightedArrayElement<OrderStatus>([
        { weight: 5, value: "paid" },
        { weight: 3, value: "shipped" },
        { weight: 3, value: "pending" },
        { weight: 1, value: "refunded" },
        { weight: 1, value: "cancelled" },
      ]),
      notes: sales.helpers.maybe(() => sales.lorem.sentence(), { probability: 0.25 }) ?? "",
      createdAt: hoursAgo(index * 1.4 + sales.number.float({ min: 0.1, max: 1 })),
    };
  });

  return {
    customers,
    orders,
    products,
    staff,
    counters: {
      cus_: 1001 + customers.length,
      prd_: 2001 + products.length,
      stf_: 301 + staff.length,
      ord_: 4822,
    },
  };
}

export const getStore = () => (globalStore.__analyticsStore ??= seed());

export const orderTotal = (items: OrderItem[]) =>
  Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;

const PREFIXES: Record<ResourceName, string> = {
  customers: "cus_",
  orders: "ord_",
  products: "prd_",
  staff: "stf_",
};

/** Takes the next free number for a resource. */
export function nextNumber(name: ResourceName) {
  const counters = getStore().counters;
  const prefix = PREFIXES[name];
  return (counters[prefix] = (counters[prefix] ?? 0) + 1) - 1;
}

/** What gets searched, sorted and filtered for each resource. */
const queryConfig = {
  customers: {
    search: (item: Customer) => [item.name, item.email, item.phone, item.city, item.country],
    filters: { status: (item: Customer) => item.status },
  },
  orders: {
    search: (item: Order) => [
      item.number,
      item.customer.name,
      item.customer.email,
      ...item.items.map((line) => line.name),
    ],
    filters: {
      status: (item: Order) => item.status,
      customerId: (item: Order) => item.customer.id,
    },
  },
  products: {
    search: (item: Product) => [item.name, item.sku, item.category],
    filters: {
      status: (item: Product) => item.status,
      category: (item: Product) => item.category,
    },
  },
  staff: {
    search: (item: StaffMember) => [item.name, item.email, item.phone, item.role],
    filters: { status: (item: StaffMember) => item.status, role: (item: StaffMember) => item.role },
  },
} as const;

/** A customer plus how many orders they have placed and how much they have spent. */
function withOrderStats(customer: Customer): Customer {
  const orders = getStore().orders.filter(
    (order) => order.customer.id === customer.id && order.status !== "cancelled"
  );
  return {
    ...customer,
    ordersCount: orders.length,
    totalSpent: Math.round(orders.reduce((sum, order) => sum + order.total, 0) * 100) / 100,
  };
}

const decorate = <K extends ResourceName>(name: K, item: ResourceMap[K]): ResourceMap[K] =>
  (name === "customers" ? withOrderStats(item as Customer) : item) as ResourceMap[K];

function compare(a: unknown, b: unknown) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true });
}

export function listResource<K extends ResourceName>(
  name: K,
  query: ListQuery
): Paginated<ResourceMap[K]> {
  const config = queryConfig[name];
  const filterQuery = query as unknown as Record<string, string | undefined>;
  const search = query.search?.toLowerCase();

  let items = (getStore()[name] as ResourceMap[K][]).map((item) => decorate(name, item));

  if (search) {
    items = items.filter((item) =>
      (config.search as (item: unknown) => string[])(item).join(" ").toLowerCase().includes(search)
    );
  }
  for (const [key, getValue] of Object.entries(config.filters)) {
    const wanted = filterQuery[key];
    if (wanted)
      items = items.filter((item) => (getValue as (item: unknown) => unknown)(item) === wanted);
  }

  const sort = query.sort && query.sort in (items[0] ?? {}) ? query.sort : "createdAt";
  const direction = query.order === "asc" ? 1 : -1;
  items = [...items].sort(
    (a, b) =>
      direction *
      compare(
        (a as unknown as Record<string, unknown>)[sort],
        (b as unknown as Record<string, unknown>)[sort]
      )
  );

  const total = items.length;
  const start = (query.page - 1) * query.pageSize;
  return {
    items: items.slice(start, start + query.pageSize),
    total,
    page: query.page,
    pageSize: query.pageSize,
    pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export function getResource<K extends ResourceName>(
  name: K,
  id: string
): ResourceMap[K] | undefined {
  const item = (getStore()[name] as ResourceMap[K][]).find((entry) => entry.id === id);
  return item && decorate(name, item);
}

export function notFound(name: ResourceName, id?: string): never {
  const singular = RESOURCES[name].singular.toLowerCase();
  throw createError({
    statusCode: 404,
    statusMessage: "Not Found",
    message: id ? `No ${singular} with id "${id}"` : `Unknown resource "${name}"`,
  });
}

/** Reads the `:resource` route param, or throws a 404 if it isn't one of our resources. */
export function getResourceParam(event: H3Event): ResourceName {
  const name = getRouterParam(event, "resource");
  if (!isResourceName(name)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Unknown resource "${name}"`,
    });
  }
  return name;
}
