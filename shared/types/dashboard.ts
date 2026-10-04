export type SalesRange = "7d" | "30d" | "12m";

export interface StatCard {
  id: "revenue" | "orders" | "customers" | "averageOrder";
  label: string;
  value: number;
  format: "currency" | "number";
  /** Change versus the previous period, in percent. */
  changePercent: number;
  trend: "up" | "down";
  caption: string;
}

export interface SalesPoint {
  /** ISO date. For the `12m` range this is the first day of the month. */
  date: string;
  revenue: number;
  orders: number;
}

export interface SalesResponse {
  range: SalesRange;
  points: SalesPoint[];
  totals: { revenue: number; orders: number };
}

export type ActivityType = "order" | "customer" | "review" | "refund" | "stock";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  /** Display time, e.g. "10:00 AM". */
  time: string;
  done: boolean;
}
