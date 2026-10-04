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

export type NotificationEventId =
  | "newOrder"
  | "lowStock"
  | "newCustomer"
  | "weeklyReport"
  | "teamInvites";

export interface NotificationChannels {
  email: boolean;
  inApp: boolean;
}

/** Store-wide settings. One record, edited from the Settings page. */
export interface Settings {
  storeName: string;
  supportEmail: string;
  timezone: string;
  notifications: Record<NotificationEventId, NotificationChannels>;
}

/** Something that happened in the store, shown in the bell in the header. */
export interface AppNotification {
  id: string;
  type: NotificationEventId;
  title: string;
  body: string;
  /** Where clicking the notification goes. */
  href: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  items: AppNotification[];
  unread: number;
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

export type TicketCategory = "orders" | "billing" | "account" | "bug" | "other";
export type TicketPriority = "low" | "normal" | "high";
export type TicketStatus = "open" | "answered" | "closed";

/** A request to the support team, made from the Help page. */
export interface Ticket {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  message: string;
  status: TicketStatus;
  /** What the support team said, once they have answered. */
  reply?: string;
  createdAt: string;
}

export interface ResourceMap {
  customers: Customer;
  orders: Order;
  products: Product;
  staff: StaffMember;
}
