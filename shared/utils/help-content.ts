/** Static content for the Help page. */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqTopic {
  id: string;
  label: string;
  icon: string;
  items: FaqItem[];
}

export const FAQ_TOPICS: FaqTopic[] = [
  {
    id: "orders",
    label: "Orders",
    icon: "lucide:shopping-cart",
    items: [
      {
        id: "orders-create",
        question: "How do I create an order?",
        answer:
          "Open Orders → Create. Pick a customer, add one or more products with a quantity, and the total updates as you go. Both pickers are searchable, so type a name to find one.",
      },
      {
        id: "orders-status",
        question: "How do I change an order's status?",
        answer:
          "Open the order and use the Update status menu on the details page. You can also edit the order from the list's row menu.",
      },
      {
        id: "orders-customer",
        question: "How do I see all the orders from one customer?",
        answer:
          "Open the customer and choose View all next to their recent orders. It opens the Orders list filtered to that customer.",
      },
    ],
  },
  {
    id: "products",
    label: "Products",
    icon: "lucide:package",
    items: [
      {
        id: "products-stock",
        question: "What do the stock labels mean?",
        answer:
          "A product is Low with fewer than 20 left and Out of stock at 0. Anything more is in stock. Statistics → Stock health shows how many active products are in each state.",
      },
      {
        id: "products-archive",
        question: "What is the difference between draft and archived?",
        answer:
          "Draft products are still being set up. Archived products are kept for your records but are no longer sold. Only active products count towards stock health.",
      },
    ],
  },
  {
    id: "team",
    label: "Team",
    icon: "lucide:users-round",
    items: [
      {
        id: "team-invite",
        question: "How do I invite someone to my team?",
        answer:
          "Go to Team members from the user menu and choose Invite member. Enter their email and a role. Invitations last 7 days and can be resent or cancelled. No email is sent in this demo, so use Copy invite link or Mark as accepted.",
      },
      {
        id: "team-roles",
        question: "What can each role do?",
        answer:
          "Admins can do everything. Managers handle customers, orders, products and analytics, and can see the team but not change it. Support staff can see customers and products and work on orders. Change a role from the Members tab at any time. To try a role, sign in with that team member's email (any password).",
      },
      {
        id: "team-admin",
        question: "Why can't I remove an admin?",
        answer:
          "There must always be at least one active admin. Make someone else an admin first, then change or remove the original one.",
      },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    icon: "lucide:credit-card",
    items: [
      {
        id: "billing-change",
        question: "How do I change my plan?",
        answer:
          "Open Billing and choose Change plan. Pick a plan and a monthly or yearly period. A plan can't be chosen if you already use more than it allows, for example more products than it has room for.",
      },
      {
        id: "billing-cancel",
        question: "What happens when I cancel?",
        answer:
          "Your plan keeps working until the end of the period you've paid for. Choose Keep my plan before then to change your mind.",
      },
      {
        id: "billing-demo",
        question: "Will I really be charged?",
        answer:
          "No. This is a demo with sample data. Cards are placeholders and invoices are generated for show.",
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    icon: "lucide:user",
    items: [
      {
        id: "account-signout",
        question: "Why was I signed out?",
        answer:
          "You are signed out after a period without activity. The default is 5 minutes, and you can change it, or turn it off, under Settings → Security.",
      },
      {
        id: "account-reset",
        question: "How do I start again with the original sample data?",
        answer:
          "Open Settings → Data and choose Reset demo data. Everything you created or changed is replaced with the sample data. Restarting the dev server does the same.",
      },
      {
        id: "account-theme",
        question: "How do I switch to dark mode?",
        answer:
          "Use the sun/moon button in the header, or pick Light, Dark or System under Settings → Appearance.",
      },
    ],
  },
];

export interface Shortcut {
  keys: string[];
  description: string;
}

/** Shortcuts that are really wired up, in `useGlobalShortcuts` and the sidebar. */
export const SHORTCUTS: { group: string; items: Shortcut[] }[] = [
  {
    group: "General",
    items: [
      { keys: ["Ctrl / ⌘", "B"], description: "Collapse or expand the sidebar" },
      { keys: ["?"], description: "Open these shortcuts" },
    ],
  },
  {
    group: "Go to",
    items: [
      { keys: ["G", "then", "D"], description: "Dashboard" },
      { keys: ["G", "then", "O"], description: "Orders" },
      { keys: ["G", "then", "C"], description: "Customers" },
      { keys: ["G", "then", "P"], description: "Products" },
      { keys: ["G", "then", "S"], description: "Staff" },
    ],
  },
];

/** The "G then ..." destinations. */
export const GO_TO_SHORTCUTS: Record<string, string> = {
  d: "/dashboard",
  o: "/orders",
  c: "/customers",
  p: "/products",
  s: "/staff",
};

export interface ChangelogEntry {
  title: string;
  description: string;
  items: string[];
}

/** Newest first. */
export const CHANGELOG: ChangelogEntry[] = [
  {
    title: "Account, settings, billing and help",
    description: "The rest of the sidebar is now real.",
    items: [
      "Profile: your details, avatar, password and signed-in devices",
      "Settings: store details, theme, rows per page, notifications and automatic sign-out",
      "Billing: plans, usage, payment method and invoices",
      "Help: this page, with an FAQ, support requests and keyboard shortcuts",
    ],
  },
  {
    title: "Analytics and team members",
    description: "Understand how the store is doing and who works on it.",
    items: [
      "Analytics overview, statistics and trends with period comparisons",
      "Team page with invitations, roles and deactivation",
    ],
  },
  {
    title: "Customers, orders, products and staff",
    description: "Full create, edit and delete for the store's records.",
    items: [
      "Searchable, sortable lists with filters kept in the URL",
      "Orders with multiple line items and searchable pickers",
    ],
  },
  {
    title: "Dashboard and admin layout",
    description: "The store at a glance.",
    items: [
      "Collapsible sidebar, metric cards, sales chart and recent activity",
      "Light and dark mode",
    ],
  },
  {
    title: "Authentication",
    description: "Where it all started.",
    items: [
      "Login, register and forgot password",
      "Protected routes, returning to your last page and automatic sign-out",
    ],
  },
];
