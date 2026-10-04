import type { ResourceName } from "~~/shared/types/store";

declare module "#app" {
  interface PageMeta {
    /** `guest` pages (login, register, ...) are only for signed-out users. Everything else requires auth. */
    auth?: "guest";
    /** Set on the generic list, create, details and edit pages of a store resource. */
    resource?: ResourceName;
  }
}

export {};
