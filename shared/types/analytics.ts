export type AnalyticsMetric = "revenue" | "orders" | "customers" | "averageOrder";

export interface SeriesPoint {
  /** ISO date. For the `12m` range this is the first day of the month. */
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrder: number;
}

export interface CategoryStat {
  category: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  units: number;
}

export interface AnalyticsOverview {
  range: SalesRange;
  kpis: StatCard[];
  series: SeriesPoint[];
  previous: SeriesPoint[];
  categories: CategoryStat[];
  topProducts: TopProduct[];
}

export interface TopCustomer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  orders: number;
  spent: number;
}

export interface AnalyticsStatistics {
  categories: CategoryStat[];
  statuses: { status: OrderStatus; count: number; revenue: number }[];
  topCustomers: TopCustomer[];
  /** Customers split by how many orders they have placed. */
  segments: { none: number; once: number; repeat: number };
  stock: { inStock: number; low: number; out: number; total: number };
  /** Orders by weekday (Mon first) and three-hour time slot. */
  heatmap: { day: string; slots: number[] }[];
}

export interface TrendPoint {
  date: string;
  value: number;
  /** The same position in the previous period. Only set when comparing. */
  previous?: number;
  /** Moving average of `value`. */
  average: number;
}

export interface AnalyticsTrends {
  metric: AnalyticsMetric;
  range: SalesRange;
  compare: boolean;
  points: TrendPoint[];
  summary: {
    total: number;
    previousTotal: number;
    changePercent: number;
    averagePerPeriod: number;
    best: { date: string; value: number };
    worst: { date: string; value: number };
  };
  /** Change from each period to the one before it, in percent. */
  growth: { date: string; change: number }[];
}
