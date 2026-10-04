import type { H3Event } from "h3";
import type { z } from "zod";

/** Reads the request body and validates it with a zod schema, throwing a 400 with field errors. */
export async function validateBody<T extends z.ZodTypeAny>(
  event: H3Event,
  schema: T
): Promise<z.infer<T>> {
  const body = await readBody(event);
  const result = schema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation Error",
      message: result.error.issues[0]?.message ?? "Invalid request",
      data: result.error.flatten().fieldErrors,
    });
  }
  return result.data;
}

/** Simulates network latency so loading states are visible in the UI. */
export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
