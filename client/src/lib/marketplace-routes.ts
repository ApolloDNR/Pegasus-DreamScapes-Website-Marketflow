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
  TrendingUp,
  Building2,
  DollarSign,
  Sparkles,
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
  { title: "Dashboard", href: "/marketplace", icon: LayoutDashboard, description: "Overview and quick actions" },
  { title: "Discover", href: "/marketplace/discover", icon: Compass, description: "Browse deals and opportunities" },
  { title: "Community", href: "/marketplace/community", icon: Users, description: "Connect with other members" },
  { title: "Messages", href: "/marketplace/messages", icon: MessageSquare, description: "Direct conversations" },
];

export const TOOL_ITEMS: RouteConfig[] = [
  { title: "Calculators", href: "/marketplace/calculators", icon: Calculator, description: "Deal analysis tools" },
  { title: "Resources", href: "/marketplace/resources", icon: FileText, description: "Guides and learning materials" },
];

export const ROLE_NAV_ITEMS: Record<UserRole, RouteConfig[]> = {
  admin: [
    { title: "Admin Panel", href: "/marketplace/admin", icon: ShieldCheck, description: "Platform management" },
  ],
  pegasus_wholesaler: [
    { title: "My Deals", href: "/marketplace/wholesaler/deals", icon: Briefcase },
    { title: "Submit Deal", href: "/marketplace/wholesaler/submit", icon: Store },
    { title: "Buyer Network", href: "/marketplace/wholesaler/buyers", icon: Users },
    { title: "Analytics", href: "/marketplace/wholesaler/analytics", icon: TrendingUp },
  ],
  wholesaler: [
    { title: "My Deals", href: "/marketplace/wholesaler/deals", icon: Briefcase },
    { title: "Submit Deal", href: "/marketplace/wholesaler/submit", icon: Store },
    { title: "Buyer Network", href: "/marketplace/wholesaler/buyers", icon: Users },
  ],
  pegasus_dreamscaper: [
    { title: "My Projects", href: "/marketplace/dreamscaper/projects", icon: Building2 },
    { title: "Capital Raising", href: "/marketplace/dreamscaper/capital", icon: DollarSign },
    { title: "Team", href: "/marketplace/dreamscaper/team", icon: Users },
    { title: "Analytics", href: "/marketplace/dreamscaper/analytics", icon: TrendingUp },
  ],
  dreamscaper: [
    { title: "My Projects", href: "/marketplace/dreamscaper/projects", icon: Building2 },
    { title: "Capital Raising", href: "/marketplace/dreamscaper/capital", icon: DollarSign },
    { title: "Team", href: "/marketplace/dreamscaper/team", icon: Users },
  ],
  investor: [
    { title: "My Investments", href: "/marketplace/investor/portfolio", icon: DollarSign },
    { title: "Saved Deals", href: "/marketplace/investor/saved", icon: Sparkles },
    { title: "Watch List", href: "/marketplace/investor/watchlist", icon: Compass },
  ],
  buyer_retail: [
    { title: "Saved Properties", href: "/marketplace/buyer/saved", icon: Home },
    { title: "My Offers", href: "/marketplace/buyer/offers", icon: FileText },
    { title: "Search", href: "/marketplace/buyer/search", icon: Compass },
  ],
  buyer_investment: [
    { title: "Saved Properties", href: "/marketplace/buyer/saved", icon: Home },
    { title: "My Offers", href: "/marketplace/buyer/offers", icon: FileText },
    { title: "Search", href: "/marketplace/buyer/search", icon: Compass },
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
  admin: "/marketplace/admin",
  pegasus_wholesaler: "/marketplace/wholesaler",
  wholesaler: "/marketplace/wholesaler",
  pegasus_dreamscaper: "/marketplace/dreamscaper",
  dreamscaper: "/marketplace/dreamscaper",
  investor: "/marketplace/investor",
  buyer_retail: "/marketplace/buyer",
  buyer_investment: "/marketplace/buyer",
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
  if (!role) return "/marketplace";
  return ROLE_DASHBOARD_ROUTES[role] || "/marketplace";
}

export function isMarketplaceRoute(pathname: string): boolean {
  return pathname.startsWith("/marketplace");
}

export function getActiveNavItem(pathname: string): RouteConfig | undefined {
  const allItems = [...BASE_NAV_ITEMS, ...TOOL_ITEMS];
  return allItems.find(item => {
    if (item.href === "/marketplace") {
      return pathname === "/marketplace";
    }
    return pathname.startsWith(item.href);
  });
}
