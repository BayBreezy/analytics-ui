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

/** "active" -> "Active". Used for select options and badges. */
export const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
