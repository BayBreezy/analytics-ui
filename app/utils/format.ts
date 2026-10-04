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

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;

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

/** Axis label for a point of a sales series: weekday for 7 days, date for 30 days, month for 12 months. */
export const rangeLabelFormatter = (range: SalesRange) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    ...(range === "12m"
      ? { month: "short" }
      : range === "7d"
        ? { weekday: "short" }
        : { month: "short", day: "numeric" }),
  });

export const RANGE_OPTIONS: { value: SalesRange; label: string; short: string }[] = [
  { value: "7d", label: "7 days", short: "7D" },
  { value: "30d", label: "30 days", short: "30D" },
  { value: "12m", label: "12 months", short: "12M" },
];

export const METRIC_OPTIONS: { value: AnalyticsMetric; label: string; short: string }[] = [
  { value: "revenue", label: "Revenue", short: "Revenue" },
  { value: "orders", label: "Orders", short: "Orders" },
  { value: "customers", label: "New customers", short: "Customers" },
  { value: "averageOrder", label: "Average order", short: "Avg. order" },
];

/** A metric value for display: dollars for revenue and average order, a plain number otherwise. */
export const formatMetric = (metric: AnalyticsMetric, value: number) =>
  metric === "revenue" || metric === "averageOrder"
    ? formatCurrency(value, metric === "revenue" && value >= 1000)
    : formatNumber(Math.round(value));

/** A point's date as text: "Sep 29" for days, "Sep 2026" for months. */
export const formatPeriod = (iso: string, range: SalesRange) =>
  new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    ...(range === "12m" ? { month: "short", year: "numeric" } : { month: "short", day: "numeric" }),
  });
