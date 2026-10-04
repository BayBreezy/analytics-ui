export const CUSTOMER_STATUSES = ["active", "inactive"] as const;
export const PRODUCT_STATUSES = ["active", "draft", "archived"] as const;
export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home",
  "Beauty",
  "Sports",
  "Books",
] as const;
export const STAFF_ROLES = ["admin", "manager", "support"] as const;
export const STAFF_STATUSES = ["active", "inactive"] as const;
export const ORDER_STATUSES = ["pending", "paid", "shipped", "refunded", "cancelled"] as const;

export const TICKET_CATEGORIES = ["orders", "billing", "account", "bug", "other"] as const;
export const TICKET_PRIORITIES = ["low", "normal", "high"] as const;

export const NOTIFICATION_EVENTS = [
  { id: "newOrder", label: "New order", description: "When a customer places an order." },
  { id: "lowStock", label: "Low stock", description: "When a product has fewer than 20 left." },
  { id: "newCustomer", label: "New customer", description: "When someone creates an account." },
  { id: "weeklyReport", label: "Weekly report", description: "A summary of sales every Monday." },
  { id: "teamInvites", label: "Team invitations", description: "When an invitation is accepted." },
] as const;

export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Lagos",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

/** "active" -> "Active". Used for select options and badges. */
export const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
