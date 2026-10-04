/**
 * Single source of truth for the admin navigation. This file is plain data and functions (no Vue or
 * Nuxt auto-imports) so `nuxt.config.ts` can import it to register the "coming soon" routes.
 */
export interface NavItem {
  title: string;
  url: string;
  icon?: string;
  children?: NavItem[];
  /** Keeps the page and its route but leaves it out of the sidebar menu. */
  hidden?: boolean;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface Breadcrumb {
  label: string;
  link?: string;
}

/** The List / Create / Edit / Delete / Details pages every store resource gets. */
const resource = (title: string, base: string, icon: string): NavItem => ({
  title,
  url: base,
  icon,
  children: [
    { title: "List", url: base },
    { title: "Create", url: `${base}/create` },
    // Edit, Delete and Details all need a record, so they're reached from a row on the list page
    // rather than from the sidebar.
    { title: "Edit", url: `${base}/edit`, hidden: true },
    { title: "Delete", url: `${base}/delete`, hidden: true },
    { title: "Details", url: `${base}/details`, hidden: true },
  ],
});

export const DASHBOARD_URL = "/dashboard";

export const mainNav: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: DASHBOARD_URL, icon: "lucide:layout-dashboard" }],
  },
  {
    label: "Store",
    items: [
      resource("Customers", "/customers", "lucide:users"),
      resource("Orders", "/orders", "lucide:shopping-cart"),
      resource("Products", "/products", "lucide:package"),
      resource("Staff", "/staff", "lucide:user-cog"),
    ],
  },
  {
    label: "Insights",
    items: [
      {
        title: "Analytics",
        url: "/analytics",
        icon: "lucide:chart-pie",
        children: [
          { title: "Overview", url: "/analytics" },
          { title: "Statistics", url: "/analytics/statistics" },
          { title: "Trends", url: "/analytics/trends" },
        ],
      },
    ],
  },
];

export const secondaryNav: NavItem[] = [
  { title: "Settings", url: "/settings", icon: "lucide:settings" },
  { title: "Help", url: "/help", icon: "lucide:circle-help" },
];

/** The sub-pages of an item that should appear in the sidebar menu. */
export const visibleChildren = (item: NavItem) =>
  item.children?.filter((child) => !child.hidden) ?? [];

/** Pages reached from the user menu in the sidebar footer. */
export const accountNav: NavItem[] = [
  { title: "Profile", url: "/account/profile", icon: "lucide:user" },
  { title: "Billing", url: "/account/billing", icon: "lucide:credit-card" },
  { title: "Team members", url: "/account/team", icon: "lucide:users-round" },
];

/** Every page with an entry in the navigation, flattened, with the parent item if there is one. */
function flatten() {
  const entries: { item: NavItem; parent?: NavItem }[] = [];
  const walk = (items: NavItem[], parent?: NavItem) => {
    for (const item of items) {
      if (item.children?.length) walk(item.children, item);
      else entries.push({ item, parent });
    }
  };
  walk([...mainNav.flatMap((group) => group.items), ...secondaryNav, ...accountNav]);
  return entries;
}

/** Routes that only have a "coming soon" page for now (everything except the dashboard). */
export function getPlaceholderRoutes() {
  const seen = new Set<string>();
  return flatten()
    .filter(({ item }) => item.url !== DASHBOARD_URL)
    .filter(({ item }) => !seen.has(item.url) && seen.add(item.url))
    .map(({ item, parent }) => ({ path: item.url, title: getTitle(item, parent) }));
}

function getTitle(item: NavItem, parent?: NavItem) {
  if (!parent || item.url === parent.url) return parent?.title ?? item.title;
  return `${parent.title}: ${item.title}`;
}

const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

function find(path: string) {
  const target = normalize(path);
  return flatten().find(({ item }) => item.url === target);
}

/** The page title for a path, e.g. "Customers: Create". */
export function getPageTitle(path: string) {
  const entry = find(path);
  return entry ? getTitle(entry.item, entry.parent) : "Page";
}

/** Breadcrumb trail for a path: Dashboard > Section > Page. */
export function getBreadcrumbs(path: string): Breadcrumb[] {
  const entry = find(path);
  if (!entry || entry.item.url === DASHBOARD_URL) return [{ label: "Dashboard" }];

  const trail: Breadcrumb[] = [{ label: "Dashboard", link: DASHBOARD_URL }];
  const { item, parent } = entry;
  if (!parent || item.url === parent.url) trail.push({ label: parent?.title ?? item.title });
  else trail.push({ label: parent.title, link: parent.url }, { label: item.title });
  return trail;
}

/** Whether `url` is the current page, or (with `exact: false`) a section the current page is inside. */
export function isActive(path: string, url: string, exact = false) {
  const current = normalize(path);
  return current === url || (!exact && url !== DASHBOARD_URL && current.startsWith(`${url}/`));
}

/** Whether any child page of `item` is the current page. */
export function hasActiveChild(path: string, item: NavItem) {
  return Boolean(item.children?.some((child) => isActive(path, child.url, true)));
}
