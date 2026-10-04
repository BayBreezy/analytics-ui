import { z } from "zod";

export const BILLING_INTERVALS = ["monthly", "yearly"] as const;

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For a shop that is just getting going.",
    price: { monthly: 29, yearly: 290 },
    limits: { products: 50, seats: 3, orders: 100 },
    features: ["Up to 50 products", "3 team members", "100 orders a month", "Basic analytics"],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "For a store with a growing team.",
    price: { monthly: 79, yearly: 790 },
    limits: { products: 200, seats: 15, orders: 500 },
    features: [
      "Up to 200 products",
      "15 team members",
      "500 orders a month",
      "Full analytics and trends",
      "Priority support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For busy stores with big catalogs.",
    price: { monthly: 199, yearly: 1990 },
    limits: { products: 1000, seats: 50, orders: 5000 },
    features: [
      "Up to 1,000 products",
      "50 team members",
      "5,000 orders a month",
      "Full analytics and trends",
      "Priority support",
      "A named account manager",
    ],
  },
];

export const getPlan = (id: PlanId) => PLANS.find((plan) => plan.id === id) ?? PLANS[0]!;

export const subscriptionSchema = z.object({
  planId: z.enum(["starter", "growth", "scale"], {
    errorMap: () => ({ message: "Select a plan" }),
  }),
  interval: z.enum(BILLING_INTERVALS, { errorMap: () => ({ message: "Select a billing period" }) }),
});

export const invoiceQuerySchema = z.object({
  status: z.enum(["paid", "open", "failed"]).optional(),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
