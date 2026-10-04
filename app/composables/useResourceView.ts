// Every resource has a List, Form and Details component in `app/components/<Resource>/`. The
// generic route pages use this to show the right one without knowing about each resource.
type Loader = () => Promise<{ default: Component }>;

const views: Record<"List" | "Form" | "Details", Partial<Record<ResourceName, Loader>>> = {
  List: {
    customers: (() => import("../components/Customers/List.vue")) as Loader,
  },
  Form: {
    customers: (() => import("../components/Customers/Form.vue")) as Loader,
  },
  Details: {
    customers: (() => import("../components/Customers/Details.vue")) as Loader,
  },
};

/** The list, form or details component for a resource, e.g. `Customers/List.vue`. */
export function useResourceView(view: keyof typeof views, resource: ResourceName) {
  const load = views[view][resource];
  if (!load) throw createError({ statusCode: 404, message: `No ${view} view for ${resource}` });
  return defineAsyncComponent(load);
}
