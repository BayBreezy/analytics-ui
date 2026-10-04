export type PlanId = "starter" | "growth" | "scale";
export type BillingInterval = "monthly" | "yearly";

export interface PlanLimits {
  products: number;
  seats: number;
  orders: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** Price per billing interval, in dollars. */
  price: Record<BillingInterval, number>;
  limits: PlanLimits;
  features: string[];
}

export type SubscriptionStatus = "active" | "canceling";

export interface Subscription {
  planId: PlanId;
  interval: BillingInterval;
  status: SubscriptionStatus;
  /** When the plan renews, or ends if it is being cancelled. */
  renewsAt: string;
}

export type CardBrand = "visa" | "mastercard" | "amex";

/** A demo card. Only the last four digits are ever kept. */
export interface PaymentMethod {
  id: string;
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export type InvoiceStatus = "paid" | "open" | "failed";

export interface Invoice {
  id: string;
  number: string;
  description: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
}

export interface UsageItem {
  key: keyof PlanLimits;
  label: string;
  used: number;
  limit: number;
}

export interface BillingOverview {
  subscription: Subscription;
  plan: Plan;
  usage: UsageItem[];
  paymentMethods: PaymentMethod[];
}
