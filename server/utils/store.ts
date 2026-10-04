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
  invitations: Invitation[];
  settings: Settings;
  sessions: AccountSession[];
  tickets: Ticket[];
  billing: {
    subscription: Subscription;
    paymentMethods: PaymentMethod[];
    invoices: Invoice[];
  };
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

  // A few invitations in every state. The accepted one is for someone already on the team.
  const invites = createMock(501);
  const invitation = (
    index: number,
    email: string,
    role: StaffRole,
    status: Invitation["status"],
    sentDaysAgo: number,
    expiresInDays: number
  ): Invitation => ({
    id: `inv_${7001 + index}`,
    email,
    role,
    status,
    message: invites.helpers.maybe(() => invites.lorem.sentence(), { probability: 0.5 }) ?? "",
    invitedBy: "Demo User",
    createdAt: daysAgo(sentDaysAgo),
    expiresAt: daysAgo(-expiresInDays),
  });
  const invitations: Invitation[] = [
    invitation(0, invites.internet.email().toLowerCase(), "support", "pending", 1, 6),
    invitation(1, invites.internet.email().toLowerCase(), "manager", "pending", 6, 1),
    invitation(2, invites.internet.email().toLowerCase(), "support", "pending", 2, 5),
    invitation(3, invites.internet.email().toLowerCase(), "admin", "pending", 12, -5),
    invitation(4, invites.internet.email().toLowerCase(), "support", "cancelled", 10, 0),
    invitation(5, staff[5]!.email, staff[5]!.role, "accepted", 40, 0),
  ];

  const settings: Settings = {
    storeName: "Analytics",
    supportEmail: "support@analytics.test",
    timezone: "America/New_York",
    notifications: {
      newOrder: { email: true, inApp: true },
      lowStock: { email: true, inApp: true },
      newCustomer: { email: false, inApp: true },
      weeklyReport: { email: true, inApp: false },
      teamInvites: { email: false, inApp: true },
    },
  };

  const sessions: AccountSession[] = [
    ["MacBook Pro", "Chrome 141", "Austin, United States", 0, true],
    ["iPhone 16", "Safari 19", "Austin, United States", 5, false],
    ["Windows desktop", "Edge 141", "Chicago, United States", 52, false],
    ["iPad Air", "Safari 19", "Toronto, Canada", 190, false],
  ].map(([device, browser, location, hours, current], index) => ({
    id: `ses_${9001 + index}`,
    device: device as string,
    browser: browser as string,
    location: location as string,
    lastActiveAt: hoursAgo(hours as number),
    current: current as boolean,
  }));

  // A year of monthly invoices. The store started on Starter and moved up to Growth six months ago,
  // and one payment failed along the way.
  const billing = createMock(601);
  const invoices: Invoice[] = Array.from({ length: 12 }, (_, index) => {
    const monthsAgo = 11 - index;
    const plan = getPlan(monthsAgo >= 6 ? "starter" : "growth");
    const number = 5001 + index;
    return {
      id: `bill_${number}`,
      number: `INV-${new Date().getFullYear()}-${number}`,
      description: `${plan.name} plan, monthly`,
      amount: plan.price.monthly,
      status: monthsAgo === 8 ? "failed" : "paid",
      issuedAt: daysAgo(monthsAgo * 30 + 18 + billing.number.float({ min: 0, max: 1 })),
    } satisfies Invoice;
  }).reverse();
  const paymentMethods: PaymentMethod[] = [
    { id: "pm_1", brand: "visa", last4: "4242", expMonth: 8, expYear: 2029, isDefault: true },
    {
      id: "pm_2",
      brand: "mastercard",
      last4: "4444",
      expMonth: 3,
      expYear: 2028,
      isDefault: false,
    },
    { id: "pm_3", brand: "amex", last4: "0005", expMonth: 11, expYear: 2030, isDefault: false },
  ];

  const tickets: Ticket[] = [
    {
      id: "tkt_8001",
      subject: "Order #ORD-4790 shows the wrong total",
      category: "orders",
      priority: "high",
      message:
        "The total on the order page doesn't match what the customer was charged. Can you take a look?",
      status: "open",
      createdAt: hoursAgo(5),
    },
    {
      id: "tkt_8002",
      subject: "How do I change the owner of the account?",
      category: "account",
      priority: "normal",
      message: "We have a new store manager and want to hand over the main account to them.",
      status: "answered",
      reply:
        "Make them an admin from Team members, then ask them to sign in and remove your own admin role. Let us know if you get stuck.",
      createdAt: daysAgo(3),
    },
    {
      id: "tkt_8003",
      subject: "Invoice for last March",
      category: "billing",
      priority: "low",
      message: "Could you resend the invoice for March? I can't find it in my inbox.",
      status: "closed",
      reply: "All invoices are under Billing, where you can view or download each one.",
      createdAt: daysAgo(21),
    },
  ];

  return {
    customers,
    orders,
    products,
    staff,
    invitations,
    settings,
    sessions,
    tickets,
    billing: {
      subscription: {
        planId: "growth",
        interval: "monthly",
        status: "active",
        renewsAt: daysAgo(-12),
      },
      paymentMethods,
      invoices,
    },
    counters: {
      cus_: 1001 + customers.length,
      prd_: 2001 + products.length,
      stf_: 301 + staff.length,
      ord_: 4822,
      inv_: 7001 + invitations.length,
      bill_: 5001 + invoices.length,
      tkt_: 8001 + tickets.length,
    },
  };
}

export const getStore = () => (globalStore.__analyticsStore ??= seed());

/** Throws away every change and goes back to the seed data. */
export const resetStore = () => (globalStore.__analyticsStore = seed());

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

/** An invitation as it should be shown: pending ones past their expiry are `expired`. */
export const withInvitationStatus = (invitation: Invitation): Invitation =>
  invitation.status === "pending" && new Date(invitation.expiresAt).getTime() < Date.now()
    ? { ...invitation, status: "expired" }
    : invitation;

/** Takes the next free number for a support ticket. */
export function nextTicketNumber() {
  const counters = getStore().counters;
  return (counters.tkt_ = (counters.tkt_ ?? 0) + 1) - 1;
}

/** Takes the next free number for an invoice. */
export function nextInvoiceNumber() {
  const counters = getStore().counters;
  return (counters.bill_ = (counters.bill_ ?? 0) + 1) - 1;
}

/** Takes the next free number for an invitation id. */
export function nextInvitationNumber() {
  const counters = getStore().counters;
  return (counters.inv_ = (counters.inv_ ?? 0) + 1) - 1;
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

/** Finds an invitation by id, or throws a 404. */
export function findInvitation(id: string) {
  const invitation = getStore().invitations.find((entry) => entry.id === id);
  if (!invitation) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `No invitation with id "${id}"`,
    });
  }
  return invitation;
}
