import { Faker, en } from "@faker-js/faker";

/**
 * A local faker instance with its own seed. Every request builds the same data, so reloading the
 * dashboard doesn't reshuffle it. Dates are relative to "now" so the data always looks recent.
 */
export function createMock(seed: number) {
  const faker = new Faker({ locale: [en] });
  faker.seed(seed);
  return faker;
}

export const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();
export const daysAgo = (days: number) => hoursAgo(days * 24);

/** Latency for the dashboard endpoints, so skeletons are visible. */
export const delay = () => sleep(350);

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home",
  "Beauty",
  "Sports",
  "Books",
] as const satisfies readonly ProductCategory[];
