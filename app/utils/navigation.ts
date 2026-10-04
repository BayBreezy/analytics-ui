/**
 * Single source of truth for the admin navigation. This file is plain data and functions (no Vue or
 * Nuxt auto-imports) so `nuxt.config.ts` can import it to register the "coming soon" routes.
 */
import { RESOURCES } from "../../shared/utils/resources";
import type { ResourceName } from "../../shared/types/store";

export interface NavItem {
  title: string;
  url: string;
  icon?: string;
  children?: NavItem[];
  /** The page is built. Items without this get a "coming soon" placeholder page. */
  real?: boolean;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface Breadcrumb {
  label: string;
  link?: string;
}

/**
 * A store resource gets List and Create entries in the sidebar. Details and Edit need a record, so
 * they are reached from the rows of the list page instead (see `matchRecordRoute`).
 */
const resource = (name: ResourceName): NavItem => {
  const { plural, base, icon } = RESOURCES[name];
  return {
    title: plural,
    url: base,
    icon,
    children: [
      { title: "List", url: base, real: true },
      { title: "Create", url: `${base}/create`, real: true },
    ],
  };
};

export const DASHBOARD_URL = "/dashboard";

export const mainNav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: DASHBOARD_URL, icon: "lucide:layout-dashboard", real: true },
    ],
  },
  {
    label: "Store",
    items: [resource("customers"), resource("orders"), resource("products"), resource("staff")],
  },
  {
    label: "Insights",
    items: [
      {
        title: "Analytics",
        url: "/analytics",
        icon: "lucide:chart-pie",
        children: [
          { title: "Overview", url: "/analytics", real: true },
          { title: "Statistics", url: "/analytics/statistics", real: true },
          { title: "Trends", url: "/analytics/trends", real: true },
        ],
      },
    ],
  },
];

export const secondaryNav: NavItem[] = [
  { title: "Settings", url: "/settings", icon: "lucide:settings", real: true },
  { title: "Help", url: "/help", icon: "lucide:circle-help" },
];

/** Pages reached from the user menu in the sidebar footer. */
export const accountNav: NavItem[] = [
  { title: "Profile", url: "/account/profile", icon: "lucide:user", real: true },
  { title: "Billing", url: "/account/billing", icon: "lucide:credit-card" },
  { title: "Team members", url: "/account/team", icon: "lucide:users-round", real: true },
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

/** Routes that only have a "coming soon" page for now. */
export function getPlaceholderRoutes() {
  const seen = new Set<string>();
  return flatten()
    .filter(({ item }) => !item.real)
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

/** `/customers/cus_1001` and `/customers/cus_1001/edit`: the pages that need a record. */
export function matchRecordRoute(path: string) {
  const match = normalize(path).match(/^(\/[^/]+)\/([^/]+)(\/edit)?$/);
  const name = (Object.keys(RESOURCES) as ResourceName[]).find(
    (key) => RESOURCES[key].base === match?.[1]
  );
  if (!match || !name) return undefined;
  return { name, id: match[2]!, view: match[3] ? ("edit" as const) : ("details" as const) };
}

/** The page title for a path, e.g. "Customers: Create" or "Edit customer". */
export function getPageTitle(path: string) {
  const entry = find(path);
  if (entry) return getTitle(entry.item, entry.parent);
  const record = matchRecordRoute(path);
  if (!record) return "Page";
  const { singular } = RESOURCES[record.name];
  return record.view === "edit" ? `Edit ${singular.toLowerCase()}` : `${singular} details`;
}

/** Breadcrumb trail for a path: Dashboard > Section > Page. */
export function getBreadcrumbs(path: string): Breadcrumb[] {
  const entry = find(path);
  const record = entry ? undefined : matchRecordRoute(path);
  if (record) {
    const { plural, base } = RESOURCES[record.name];
    const detailsPath = `${base}/${record.id}`;
    return [
      { label: "Dashboard", link: DASHBOARD_URL },
      { label: plural, link: base },
      record.view === "edit" ? { label: "Details", link: detailsPath } : { label: "Details" },
      ...(record.view === "edit" ? [{ label: "Edit" }] : []),
    ];
  }
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
