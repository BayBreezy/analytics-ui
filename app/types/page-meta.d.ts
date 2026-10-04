declare module "#app" {
  interface PageMeta {
    /** `guest` pages (login, register, ...) are only for signed-out users. Everything else requires auth. */
    auth?: "guest";
  }
}

export {};
