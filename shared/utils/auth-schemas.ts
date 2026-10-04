import { z } from "zod";

const email = z
  .string({ required_error: "Email address is required" })
  .trim()
  .min(1, "Email address is required")
  .email("Enter a valid email address");

const password = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters");

export const loginSchema = z.object({
  email,
  password,
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: "Full name is required" })
      .trim()
      .min(2, "Full name must be at least 2 characters"),
    email,
    password: password.regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string({ required_error: "Confirm your password" }),
    terms: z
      .boolean({
        required_error: "You must accept the terms",
        invalid_type_error: "You must accept the terms",
      })
      .refine((value) => value === true, "You must accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const forgotPasswordSchema = z.object({ email });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
