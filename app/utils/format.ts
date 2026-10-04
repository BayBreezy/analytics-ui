const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const currencyWhole = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("en-US");
const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export const formatCurrency = (value: number, whole = false) =>
  (whole ? currencyWhole : currency).format(value);

export const formatNumber = (value: number) => number.format(value);

/** "1.2k" style axis labels. */
export const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

/** "2 hours ago", "yesterday", "3 days ago". */
export function formatRelative(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const initialsOf = (name = "") =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const PRODUCT_CATEGORY_ICONS: Record<ProductCategory, string> = {
  Electronics: "lucide:headphones",
  Clothing: "lucide:shirt",
  Home: "lucide:armchair",
  Beauty: "lucide:sparkles",
  Sports: "lucide:dumbbell",
  Books: "lucide:book-open",
};

/** Each category gets its own colour for its icon. */
export const PRODUCT_CATEGORY_COLORS = {
  Electronics: "info",
  Clothing: "purple",
  Home: "success",
  Beauty: "pink",
  Sports: "warning",
  Books: "teal",
} as const satisfies Record<ProductCategory, string>;

export const PRODUCT_STATUS_VARIANTS = {
  active: "success",
  draft: "secondary",
  archived: "outline",
} as const satisfies Record<ProductStatus, string>;

export const ORDER_STATUS_VARIANTS = {
  paid: "success",
  shipped: "info",
  pending: "warning",
  refunded: "secondary",
  cancelled: "error",
} as const satisfies Record<OrderStatus, string>;
