import { 
  LayoutDashboard, 
  Compass, 
  Users, 
  MessageSquare, 
  Calculator, 
  FileText,
  ShieldCheck,
  Briefcase,
  Store,
  DollarSign,
  Home,
  type LucideIcon
} from "lucide-react";
import type { UserRole } from "@/lib/supabase";

export interface RouteConfig {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export const BASE_NAV_ITEMS: RouteConfig[] = [
  { title: "Dashboard", href: "/marketflow", icon: LayoutDashboard, description: "Your role-specific workspace" },
  { title: "Deal Flow", href: "/marketflow/deals", icon: Briefcase, description: "Browse deals and opportunities" },
  { title: "Submit Deal", href: "/marketflow/submit", icon: Store, description: "Submit a new deal" },
  { title: "Community", href: "/marketflow/community", icon: Users, description: "Connect with other members" },
  { title: "Messages", href: "/marketflow/messages", icon: MessageSquare, description: "Direct conversations" },
];

export const TOOL_ITEMS: RouteConfig[] = [
  { title: "Calculators", href: "/marketflow/calculators", icon: Calculator, description: "Deal analysis tools" },
  { title: "Resources", href: "/marketflow/resources", icon: FileText, description: "Guides and learning materials" },
];

export const ROLE_NAV_ITEMS: Record<UserRole, RouteConfig[]> = {
  admin: [
    { title: "Admin Panel", href: "/marketflow/admin", icon: ShieldCheck, description: "Platform management" },
  ],
  pegasus_wholesaler: [
    { title: "Submit a Deal", href: "/marketflow/submit", icon: Store },
  ],
  wholesaler: [
    { title: "Submit a Deal", href: "/marketflow/submit", icon: Store },
  ],
  pegasus_dreamscaper: [
    { title: "Project Intake", href: "/marketflow/submit", icon: Store },
  ],
  dreamscaper: [
    { title: "Project Intake", href: "/marketflow/submit", icon: Store },
  ],
  investor: [
    { title: "Reviewed Deals", href: "/marketflow/deals", icon: Briefcase },
    { title: "Capital Projects", href: "/marketflow/capital", icon: DollarSign },
  ],
  buyer_retail: [
    { title: "Saved Properties", href: "/marketflow/buyer/saved", icon: Home },
    { title: "My Offers", href: "/marketflow/buyer/offers", icon: FileText },
    { title: "Search", href: "/marketflow/properties", icon: Compass },
  ],
  buyer_investment: [
    { title: "Saved Properties", href: "/marketflow/buyer/saved", icon: Home },
    { title: "My Offers", href: "/marketflow/buyer/offers", icon: FileText },
    { title: "Search", href: "/marketflow/properties", icon: Compass },
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  pegasus_wholesaler: "Pegasus Wholesaler",
  wholesaler: "Wholesaler",
  pegasus_dreamscaper: "Pegasus Dreamscaper",
  dreamscaper: "Dreamscaper",
  investor: "Investor",
  buyer_retail: "Retail Buyer",
  buyer_investment: "Investment Buyer",
};

export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: "/marketflow/admin",
  pegasus_wholesaler: "/marketflow/wholesaler",
  wholesaler: "/marketflow/wholesaler",
  pegasus_dreamscaper: "/marketflow/dreamscaper",
  dreamscaper: "/marketflow/dreamscaper",
  investor: "/marketflow/investor",
  buyer_retail: "/marketflow/buyer",
  buyer_investment: "/marketflow/buyer",
};

export function getRoleNavItems(role: UserRole | null): RouteConfig[] {
  if (!role) return [];
  return ROLE_NAV_ITEMS[role] || [];
}

export function getRoleLabel(role: UserRole | null): string {
  if (!role) return "Guest";
  return ROLE_LABELS[role] || "Member";
}

export function getRoleDashboardRoute(role: UserRole | null): string {
  if (!role) return "/marketflow";
  return ROLE_DASHBOARD_ROUTES[role] || "/marketflow";
}

export function isMarketflowRoute(pathname: string): boolean {
  return pathname.startsWith("/marketflow");
}

export function getActiveNavItem(pathname: string): RouteConfig | undefined {
  const allItems = [...BASE_NAV_ITEMS, ...TOOL_ITEMS];
  return allItems.find(item => {
    if (item.href === "/marketflow") {
      return pathname === "/marketflow";
    }
    return pathname.startsWith(item.href);
  });
}
