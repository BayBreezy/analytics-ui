import { faker } from "@faker-js/faker";

export const DEMO_EMAIL = "demo@analytics.test";

/** Builds a random user. Pass overrides to pin fields (e.g. name/email from a form). */
export function createFakeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    avatar: faker.image.avatar(),
    role: "admin",
    ...overrides,
  };
}

/** Turns "jane.doe@acme.test" into "Jane Doe" for users who sign in without registering. */
export function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function createToken() {
  return `mock_${faker.string.alphanumeric(32)}`;
}
