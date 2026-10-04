import { z } from "zod";

const name = z
  .string({ required_error: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name is too long");

const email = z
  .string({ required_error: "Email address is required" })
  .trim()
  .min(1, "Email address is required")
  .email("Enter a valid email address");

const phone = z
  .string({ required_error: "Phone number is required" })
  .trim()
  .min(7, "Enter a valid phone number")
  .max(30, "Phone number is too long");

const text = (label: string) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(2, `${label} is required`);

export const customerSchema = z.object({
  name,
  email,
  phone,
  city: text("City"),
  country: text("Country"),
  status: z.enum(CUSTOMER_STATUSES),
});

export const productSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),
  sku: z
    .string({ required_error: "SKU is required" })
    .trim()
    .min(3, "SKU must be at least 3 characters")
    .max(30, "SKU is too long")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and dashes only"),
  category: z.enum(PRODUCT_CATEGORIES, { errorMap: () => ({ message: "Select a category" }) }),
  price: z.coerce
    .number({ invalid_type_error: "Enter a price" })
    .min(0, "Price can't be negative")
    .max(100_000, "Price is too high"),
  stock: z.coerce
    .number({ invalid_type_error: "Enter the stock level" })
    .int("Stock must be a whole number")
    .min(0, "Stock can't be negative")
    .max(100_000, "Stock is too high"),
  status: z.enum(PRODUCT_STATUSES),
  description: z.string().trim().max(500, "Description must be 500 characters or fewer"),
});

export const staffSchema = z.object({
  name,
  email,
  phone,
  role: z.enum(STAFF_ROLES, { errorMap: () => ({ message: "Select a role" }) }),
  status: z.enum(STAFF_STATUSES),
});

export const orderItemSchema = z.object({
  productId: z
    .string({ required_error: "Select a product", invalid_type_error: "Select a product" })
    .min(1, "Select a product"),
  quantity: z.coerce
    .number({ invalid_type_error: "Enter a quantity" })
    .int("Quantity must be a whole number")
    .min(1, "At least 1")
    .max(99, "At most 99"),
});

export const orderSchema = z.object({
  customerId: z
    .string({ required_error: "Select a customer", invalid_type_error: "Select a customer" })
    .min(1, "Select a customer"),
  items: z.array(orderItemSchema).min(1, "Add at least one item"),
  status: z.enum(ORDER_STATUSES),
  notes: z.string().trim().max(500, "Notes must be 500 characters or fewer"),
});

export const resourceSchemas = {
  customers: customerSchema,
  orders: orderSchema,
  products: productSchema,
  staff: staffSchema,
} as const;

/** Query string for list endpoints. Filter keys that don't apply to a resource are ignored. */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: z.string().optional(),
  category: z.string().optional(),
  role: z.string().optional(),
  customerId: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type StaffInput = z.infer<typeof staffSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
