import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { getPlaceholderRoutes } from "./app/utils/navigation";

const comingSoonPage = fileURLToPath(
  new URL("./app/placeholders/coming-soon.vue", import.meta.url)
);

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  hooks: {
    // Every sidebar link without a real page yet gets a "coming soon" route. These are registered
    // explicitly (rather than with a catch-all page) so unknown URLs like /sw.js still 404.
    "pages:extend"(pages) {
      for (const { path } of getPlaceholderRoutes()) {
        pages.push({
          name: `coming-soon${path.replaceAll("/", "-")}`,
          path,
          file: comingSoonPage,
        });
      }
    },
  },

  modules: [
    "@nuxtjs/color-mode",
    "motion-v/nuxt",
    "@vueuse/nuxt",
    "@nuxt/icon",
    "@nuxt/fonts",
    "@vee-validate/nuxt",
    "vue-sonner/nuxt",
  ],

  imports: {
    imports: [
      {
        from: "tailwind-variants",
        name: "tv",
      },
      {
        from: "tailwind-variants",
        name: "VariantProps",
        type: true,
      },
      {
        from: "vue-sonner",
        name: "toast",
        as: "useSonner",
      },
    ],
  },

  runtimeConfig: {
    public: {
      // Signed-in users are logged out after this much inactivity. Override with
      // NUXT_PUBLIC_IDLE_TIMEOUT_MS.
      idleTimeoutMs: 5 * 60 * 1000,
    },
  },

  colorMode: {
    storageKey: "analytics-ui-color-mode",
    classSuffix: "",
  },

  icon: {
    clientBundle: {
      scan: true,
      sizeLimitKb: 0,
    },

    mode: "svg",
    class: "shrink-0",
    fetchTimeout: 2000,
    serverBundle: "local",
  },

  css: ["~/assets/css/tailwind.css"],

  vite: {
    plugins: [tailwindcss()],
  },
});
