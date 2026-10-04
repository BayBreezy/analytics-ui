// Every resource has a List, Form and Details component in `app/components/<Resource>/`. The
// generic route pages use this to show the right one without knowing about each resource.
const views = {
  List: {
    customers: () => import("../components/Customers/List.vue"),
    orders: () => import("../components/Orders/List.vue"),
    products: () => import("../components/Products/List.vue"),
    staff: () => import("../components/Staff/List.vue"),
  },
  Form: {
    customers: () => import("../components/Customers/Form.vue"),
    orders: () => import("../components/Orders/Form.vue"),
    products: () => import("../components/Products/Form.vue"),
    staff: () => import("../components/Staff/Form.vue"),
  },
  Details: {
    customers: () => import("../components/Customers/Details.vue"),
    orders: () => import("../components/Orders/Details.vue"),
    products: () => import("../components/Products/Details.vue"),
    staff: () => import("../components/Staff/Details.vue"),
  },
} as const;

/** The list, form or details component for a resource, e.g. `Customers/List.vue`. */
export function useResourceView(view: keyof typeof views, resource: ResourceName) {
  return defineAsyncComponent(views[view][resource] as () => Promise<{ default: Component }>);
}
