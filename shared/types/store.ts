export type ResourceName = "customers" | "orders" | "products" | "staff";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  status: CustomerStatus;
  avatar: string;
  createdAt: string;
  /** Added when a customer is read, from the customer's orders. */
  ordersCount?: number;
  totalSpent?: number;
}

export type ProductCategory = "Electronics" | "Clothing" | "Home" | "Beauty" | "Sports" | "Books";
export type ProductStatus = "active" | "draft" | "archived";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  price: number;
  stock: number;
  status: ProductStatus;
  description: string;
  createdAt: string;
}

export type StaffRole = "admin" | "manager" | "support";
export type StaffStatus = "active" | "inactive";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  avatar: string;
  createdAt: string;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "refunded" | "cancelled";

export interface OrderItem {
  productId: string;
  /** The product's name and price when the order was placed. */
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  /** Display number, e.g. "#ORD-4821". */
  number: string;
  /** A snapshot, so the order still reads correctly if the customer is edited or deleted. */
  customer: { id: string; name: string; email: string; avatar: string };
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  notes: string;
  createdAt: string;
}

export type InvitationStatus = "pending" | "accepted" | "cancelled" | "expired";

export interface Invitation {
  id: string;
  email: string;
  role: StaffRole;
  /** `expired` is worked out when the invitation is read: still pending, but past `expiresAt`. */
  status: InvitationStatus;
  message: string;
  invitedBy: string;
  /** When the invitation was last sent. */
  createdAt: string;
  expiresAt: string;
}

/** A device signed in to the account, as listed on the profile page. */
export interface AccountSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActiveAt: string;
  /** The device the request came from. It can't be signed out from the list. */
  current: boolean;
}

export interface ResourceMap {
  customers: Customer;
  orders: Order;
  products: Product;
  staff: StaffMember;
}
