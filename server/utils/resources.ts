import { Faker, en } from "@faker-js/faker";

const badRequest = (message: string) =>
  createError({ statusCode: 400, statusMessage: "Bad Request", message });

const avatarFor = (seed: number) => {
  const faker = new Faker({ locale: [en] });
  faker.seed(seed);
  return faker.image.avatar();
};

function resolveCustomer(customerId: string): Order["customer"] {
  const customer = getStore().customers.find((entry) => entry.id === customerId);
  if (!customer) throw badRequest(`Customer "${customerId}" doesn't exist`);
  return { id: customer.id, name: customer.name, email: customer.email, avatar: customer.avatar };
}

/**
 * Turns the form's `{ productId, quantity }` rows into order lines that remember the product's name
 * and price. Lines that were already on the order keep their original price.
 */
function resolveItems(rows: OrderInput["items"], existing: OrderItem[] = []): OrderItem[] {
  return rows.map(({ productId, quantity }) => {
    const previous = existing.find((item) => item.productId === productId);
    const product = getStore().products.find((entry) => entry.id === productId);
    if (!product && !previous) throw badRequest(`Product "${productId}" doesn't exist`);
    return {
      productId,
      name: previous?.name ?? product!.name,
      price: previous?.price ?? product!.price,
      quantity,
    };
  });
}

/** The team always keeps at least one active admin, so nobody can be locked out of managing it. */
function guardLastAdmin(member: StaffMember, change: "remove" | Partial<StaffMember>) {
  if (member.role !== "admin" || member.status !== "active") return;
  const losesAdmin =
    change === "remove" ||
    (change.role !== undefined && change.role !== "admin") ||
    change.status === "inactive";
  if (!losesAdmin) return;
  const otherAdmins = getStore().staff.filter(
    (entry) => entry.id !== member.id && entry.role === "admin" && entry.status === "active"
  );
  if (otherAdmins.length === 0) {
    throw badRequest("At least one active admin is required. Make someone else an admin first.");
  }
}

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

/** A product that has just fallen below the low-stock line (or was added already below it). */
function notifyIfLow(product: Product, before?: Product) {
  const wasLow = before ? before.stock < LOW_STOCK_BELOW : false;
  if (product.status !== "active" || product.stock >= LOW_STOCK_BELOW || wasLow) return;
  notify("lowStock", {
    title: `Low stock: ${product.name}`,
    body: product.stock === 0 ? "Out of stock" : `Only ${product.stock} left`,
    href: `/products/${product.id}`,
  });
}

export function createResource<K extends ResourceName>(
  name: K,
  input: Record<string, unknown>
): ResourceMap[K] {
  const store = getStore();
  const number = nextNumber(name);
  const createdAt = new Date().toISOString();
  let record: ResourceMap[ResourceName];

  switch (name) {
    case "customers": {
      record = {
        ...(input as CustomerInput),
        id: `cus_${number}`,
        avatar: avatarFor(number),
        createdAt,
      };
      store.customers.unshift(record);
      notify("newCustomer", {
        title: `${record.name} signed up`,
        body: "A new customer account",
        href: `/customers/${record.id}`,
      });
      break;
    }
    case "products": {
      record = { ...(input as ProductInput), id: `prd_${number}`, createdAt };
      store.products.unshift(record);
      notifyIfLow(record);
      break;
    }
    case "staff": {
      record = {
        ...(input as StaffInput),
        id: `stf_${number}`,
        avatar: avatarFor(number),
        createdAt,
      };
      store.staff.unshift(record);
      break;
    }
    case "orders": {
      const { customerId, items, status, notes } = input as OrderInput;
      const lines = resolveItems(items);
      record = {
        id: `ord_${number}`,
        number: `#ORD-${number}`,
        customer: resolveCustomer(customerId),
        items: lines,
        total: orderTotal(lines),
        status,
        notes,
        createdAt,
      };
      store.orders.unshift(record);
      notify("newOrder", {
        title: `New order ${record.number}`,
        body: `${record.customer.name} · ${money(record.total)}`,
        href: `/orders/${record.id}`,
      });
      break;
    }
    default:
      return notFound(name);
  }

  return getResource(name, record.id) as ResourceMap[K];
}

export function updateResource<K extends ResourceName>(
  name: K,
  id: string,
  patch: Record<string, unknown>
): ResourceMap[K] {
  const collection = getStore()[name] as ResourceMap[K][];
  const index = collection.findIndex((entry) => entry.id === id);
  if (index === -1) return notFound(name, id);

  const current = collection[index]!;
  if (name === "staff") guardLastAdmin(current as StaffMember, patch as Partial<StaffMember>);
  let next = {
    ...current,
    ...patch,
    id: current.id,
    createdAt: current.createdAt,
  } as ResourceMap[K];

  if (name === "orders") {
    const order = current as Order;
    const { customerId, items } = patch as Partial<OrderInput>;
    const updated = next as Order;
    if (customerId && customerId !== order.customer.id)
      updated.customer = resolveCustomer(customerId);
    else updated.customer = order.customer;
    updated.items = items ? resolveItems(items, order.items) : order.items;
    updated.total = orderTotal(updated.items);
    updated.number = order.number;
    delete (updated as unknown as Record<string, unknown>).customerId;
    next = updated as ResourceMap[K];
  }

  collection[index] = next;
  if (name === "products") notifyIfLow(next as Product, current as Product);
  return getResource(name, id) as ResourceMap[K];
}

export function deleteResource(name: ResourceName, id: string) {
  const collection = getStore()[name] as { id: string }[];
  const index = collection.findIndex((entry) => entry.id === id);
  if (index === -1) return notFound(name, id);
  if (name === "staff") guardLastAdmin(collection[index] as StaffMember, "remove");
  collection.splice(index, 1);
}
