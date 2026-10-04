import { describe, expect, it } from "vitest";
import type { ZodTypeAny } from "zod";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
} from "../../shared/utils/auth-schemas";
import { invoiceQuerySchema, subscriptionSchema } from "../../shared/utils/billing";
import {
  bulkSchema,
  customerSchema,
  exportQuerySchema,
  inviteSchema,
  listQuerySchema,
  orderSchema,
  productSchema,
  reminderSchema,
  settingsSchema,
  staffSchema,
  ticketSchema,
} from "../../shared/utils/store-schemas";

/** The first error message for the input, or undefined if it is valid. */
const firstError = (schema: ZodTypeAny, input: unknown) => {
  const result = schema.safeParse(input);
  return result.success ? undefined : result.error.issues[0]?.message;
};
/** The message for one field, which is what the forms show under it. */
const fieldError = (schema: ZodTypeAny, input: unknown, field: string) => {
  const result = schema.safeParse(input);
  if (result.success) return undefined;
  return result.error.issues.find((issue) => issue.path[0] === field)?.message;
};

const customer = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "555-123-4567",
  city: "Austin",
  country: "USA",
  status: "active",
};
const product = {
  name: "Lamp",
  sku: "LMP-001",
  category: "Home",
  price: 20,
  stock: 5,
  status: "active",
  description: "",
};

describe("auth schemas", () => {
  it("accepts a sign-in and requires a valid email and an 8 character password", () => {
    expect(firstError(loginSchema, { email: "a@b.test", password: "password123" })).toBeUndefined();
    expect(fieldError(loginSchema, { email: "nope", password: "password123" }, "email")).toBe(
      "Enter a valid email address"
    );
    expect(fieldError(loginSchema, { email: "a@b.test", password: "short" }, "password")).toBe(
      "Password must be at least 8 characters"
    );
    expect(fieldError(loginSchema, { password: "password123" }, "email")).toBe(
      "Email address is required"
    );
  });

  it("trims the email", () => {
    const parsed = loginSchema.parse({ email: "  a@b.test ", password: "password123" });
    expect(parsed.email).toBe("a@b.test");
  });

  const register = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
    confirmPassword: "password123",
    terms: true,
  };

  it("registers when everything is right", () => {
    expect(firstError(registerSchema, register)).toBeUndefined();
  });

  it("asks for a number in the password, a matching confirmation and the terms", () => {
    expect(
      fieldError(
        registerSchema,
        { ...register, password: "passwordonly", confirmPassword: "passwordonly" },
        "password"
      )
    ).toBe("Password must contain at least one number");
    expect(
      fieldError(registerSchema, { ...register, confirmPassword: "different1" }, "confirmPassword")
    ).toBe("Passwords do not match");
    expect(fieldError(registerSchema, { ...register, terms: false }, "terms")).toBe(
      "You must accept the terms"
    );
    expect(fieldError(registerSchema, { ...register, name: "J" }, "name")).toBe(
      "Full name must be at least 2 characters"
    );
  });

  it("validates forgot password", () => {
    expect(firstError(forgotPasswordSchema, { email: "a@b.test" })).toBeUndefined();
    expect(firstError(forgotPasswordSchema, { email: "" })).toBe("Email address is required");
  });

  it("validates a profile and defaults the optional fields", () => {
    const parsed = profileSchema.parse({
      name: "Jane",
      email: "j@x.test",
      avatar: "https://e.com/a.svg",
    });
    expect(parsed).toMatchObject({ jobTitle: "", phone: "", bio: "" });
    expect(
      fieldError(profileSchema, { name: "Jane", email: "j@x.test", avatar: "nope" }, "avatar")
    ).toBe("Choose an avatar");
    expect(
      fieldError(
        profileSchema,
        { name: "Jane", email: "j@x.test", avatar: "https://e.com/a", bio: "x".repeat(201) },
        "bio"
      )
    ).toBe("Keep the bio under 200 characters");
  });

  it("validates a password change", () => {
    const ok = {
      currentPassword: "oldpass1",
      newPassword: "newpass12",
      confirmPassword: "newpass12",
    };
    expect(firstError(changePasswordSchema, ok)).toBeUndefined();
    expect(
      fieldError(changePasswordSchema, { ...ok, currentPassword: "" }, "currentPassword")
    ).toBe("Enter your current password");
    expect(
      fieldError(changePasswordSchema, { ...ok, confirmPassword: "other123" }, "confirmPassword")
    ).toBe("Passwords do not match");
    expect(
      fieldError(
        changePasswordSchema,
        { ...ok, newPassword: "oldpass1", confirmPassword: "oldpass1" },
        "newPassword"
      )
    ).toBe("Choose a password you haven't used here before");
    expect(
      fieldError(
        changePasswordSchema,
        { ...ok, newPassword: "nodigitshere", confirmPassword: "nodigitshere" },
        "newPassword"
      )
    ).toBe("Password must contain at least one number");
  });
});

describe("store schemas", () => {
  it("validates a customer", () => {
    expect(firstError(customerSchema, customer)).toBeUndefined();
    expect(fieldError(customerSchema, { ...customer, name: "J" }, "name")).toBe(
      "Name must be at least 2 characters"
    );
    expect(fieldError(customerSchema, { ...customer, phone: "123" }, "phone")).toBe(
      "Enter a valid phone number"
    );
    expect(fieldError(customerSchema, { ...customer, city: "" }, "city")).toBe("City is required");
    expect(fieldError(customerSchema, { ...customer, status: "pending" }, "status")).toBeDefined();
  });

  it("validates a product and turns number strings into numbers", () => {
    expect(productSchema.parse({ ...product, price: "19.5", stock: "3" })).toMatchObject({
      price: 19.5,
      stock: 3,
    });
    expect(fieldError(productSchema, { ...product, sku: "AB" }, "sku")).toBe(
      "SKU must be at least 3 characters"
    );
    expect(fieldError(productSchema, { ...product, sku: "bad sku!" }, "sku")).toBe(
      "Use letters, numbers and dashes only"
    );
    expect(fieldError(productSchema, { ...product, price: -1 }, "price")).toBe(
      "Price can't be negative"
    );
    expect(fieldError(productSchema, { ...product, stock: 1.5 }, "stock")).toBe(
      "Stock must be a whole number"
    );
    expect(fieldError(productSchema, { ...product, category: "Toys" }, "category")).toBe(
      "Select a category"
    );
  });

  it("validates staff", () => {
    const member = {
      name: "Sam Lee",
      email: "sam@x.test",
      phone: "555-123-4567",
      role: "manager",
      status: "active",
    };
    expect(firstError(staffSchema, member)).toBeUndefined();
    expect(fieldError(staffSchema, { ...member, role: "owner" }, "role")).toBe("Select a role");
  });

  it("validates an order: at least one item, quantities between 1 and 99", () => {
    const order = {
      customerId: "cus_1001",
      status: "pending",
      notes: "",
      items: [{ productId: "prd_2001", quantity: 2 }],
    };
    expect(firstError(orderSchema, order)).toBeUndefined();
    expect(fieldError(orderSchema, { ...order, items: [] }, "items")).toBe("Add at least one item");
    expect(fieldError(orderSchema, { ...order, customerId: "" }, "customerId")).toBe(
      "Select a customer"
    );
    expect(firstError(orderSchema, { ...order, items: [{ productId: "p", quantity: 0 }] })).toBe(
      "At least 1"
    );
    expect(firstError(orderSchema, { ...order, items: [{ productId: "p", quantity: 100 }] })).toBe(
      "At most 99"
    );
  });

  it("validates an invitation and defaults the message", () => {
    expect(inviteSchema.parse({ email: "a@b.test", role: "support" }).message).toBe("");
    expect(
      fieldError(
        inviteSchema,
        { email: "a@b.test", role: "support", message: "x".repeat(301) },
        "message"
      )
    ).toBe("The message must be 300 characters or fewer");
  });

  it("validates settings, including every notification channel", () => {
    const channels = { email: true, inApp: false };
    const settings = {
      storeName: "Acme",
      supportEmail: "help@acme.test",
      timezone: "Europe/Paris",
      notifications: {
        newOrder: channels,
        lowStock: channels,
        newCustomer: channels,
        weeklyReport: channels,
        teamInvites: channels,
      },
    };
    expect(firstError(settingsSchema, settings)).toBeUndefined();
    expect(fieldError(settingsSchema, { ...settings, storeName: "A" }, "storeName")).toBe(
      "Store name must be at least 2 characters"
    );
    expect(fieldError(settingsSchema, { ...settings, timezone: "Mars/Base" }, "timezone")).toBe(
      "Select a timezone"
    );
    expect(
      fieldError(
        settingsSchema,
        { ...settings, notifications: { newOrder: channels } },
        "notifications"
      )
    ).toBeDefined();
  });

  it("validates a support ticket", () => {
    const ticket = {
      subject: "Broken chart",
      category: "bug",
      priority: "high",
      message: "The chart is empty.",
    };
    expect(firstError(ticketSchema, ticket)).toBeUndefined();
    expect(fieldError(ticketSchema, { ...ticket, subject: "Hi" }, "subject")).toBe(
      "The subject must be at least 3 characters"
    );
    expect(fieldError(ticketSchema, { ...ticket, message: "short" }, "message")).toBe(
      "Add a few more details (at least 10 characters)"
    );
    expect(fieldError(ticketSchema, { ...ticket, priority: "urgent" }, "priority")).toBe(
      "Select a priority"
    );
  });

  it("validates a reminder with defaults", () => {
    expect(reminderSchema.parse({ title: "Call back" })).toEqual({
      title: "Call back",
      time: "",
      done: false,
    });
    expect(firstError(reminderSchema, { title: "x" })).toBe(
      "Write what you need to do (at least 2 characters)"
    );
    expect(firstError(reminderSchema.partial(), { done: true })).toBeUndefined();
  });

  it("validates a bulk request: 1 to 100 unique ids", () => {
    expect(firstError(bulkSchema, { action: "delete", ids: ["a"] })).toBeUndefined();
    expect(firstError(bulkSchema, { action: "delete", ids: [] })).toBe(
      "Select at least one record"
    );
    expect(
      firstError(bulkSchema, {
        action: "delete",
        ids: Array.from({ length: 101 }, (_, i) => `id${i}`),
      })
    ).toBe("Select 100 records or fewer");
    expect(firstError(bulkSchema, { action: "delete", ids: ["a", "a"] })).toBe(
      "Each record can only be listed once"
    );
    expect(firstError(bulkSchema, { action: "explode", ids: ["a"] })).toBe("Choose an action");
  });

  it("parses list queries with defaults and limits", () => {
    expect(listQuerySchema.parse({})).toMatchObject({ page: 1, pageSize: 10, order: "desc" });
    expect(listQuerySchema.parse({ page: "3", pageSize: "50" })).toMatchObject({
      page: 3,
      pageSize: 50,
    });
    expect(listQuerySchema.safeParse({ pageSize: "101" }).success).toBe(false);
    expect(listQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(listQuerySchema.safeParse({ order: "sideways" }).success).toBe(false);
  });

  it("leaves paging out of the export query", () => {
    expect(exportQuerySchema.parse({ page: "9", search: " ab " })).toEqual({
      search: "ab",
      order: "desc",
    });
  });
});

describe("billing schemas", () => {
  it("validates a plan change", () => {
    expect(
      firstError(subscriptionSchema, { planId: "growth", interval: "yearly" })
    ).toBeUndefined();
    expect(firstError(subscriptionSchema, { planId: "free", interval: "yearly" })).toBe(
      "Select a plan"
    );
    expect(firstError(subscriptionSchema, { planId: "growth", interval: "weekly" })).toBe(
      "Select a billing period"
    );
  });

  it("validates the invoice filter", () => {
    expect(invoiceQuerySchema.parse({})).toEqual({});
    expect(invoiceQuerySchema.safeParse({ status: "paid" }).success).toBe(true);
    expect(invoiceQuerySchema.safeParse({ status: "nope" }).success).toBe(false);
  });
});
