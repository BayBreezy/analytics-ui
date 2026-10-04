import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { resourcePermission } from "./shared/utils/permissions";
import { RESOURCE_NAMES, RESOURCES } from "./shared/utils/resources";

const resourcePage = (view: string) =>
  fileURLToPath(new URL(`./app/resource-pages/${view}.vue`, import.meta.url));

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  hooks: {
    // There is no catch-all page, so unknown URLs like /sw.js still 404.
    "pages:extend"(pages) {
      // Customers, orders, products and staff share four generic pages (list, create, details,
      // edit) that read `meta.resource` to know which resource they are showing.
      for (const name of RESOURCE_NAMES) {
        const { base } = RESOURCES[name];
        for (const [view, path] of [
          ["list", base],
          ["create", `${base}/create`],
          ["details", `${base}/:id`],
          ["edit", `${base}/:id/edit`],
        ] as const) {
          const writes = view === "create" || view === "edit";
          pages.push({
            name: `${name}-${view}`,
            path,
            file: resourcePage(view),
            meta: {
              resource: name,
              permission: resourcePermission(name, writes ? "write" : "read"),
            },
          });
        }
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
    // Pre-bundle these at startup. Otherwise Vite discovers them on the first page load, re-optimizes
    // and reloads modules mid-render, which logs a one-time "Cannot read properties of null" error.
    optimizeDeps: {
      include: [
        "@tanstack/vue-table",
        "@vee-validate/zod",
        "culori",
        "lodash-es",
        "reka-ui",
        "tailwind-variants",
        "vue3-apexcharts",
        "zod",
      ],
    },
  },
});
