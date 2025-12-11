import { Link, useLocation } from "wouter";
import { useSupabaseAuth, getRoleDashboardPath } from "@/contexts/supabase-auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Briefcase,
  Building2,
  Calculator,
  ChevronUp,
  Compass,
  Crown,
  DollarSign,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Store,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/supabase";
import { NotificationDropdown } from "@/components/notification-dropdown";

interface MarketplaceLayoutProps {
  children: React.ReactNode;
}

const baseNavItems = [
  { title: "Dashboard", href: "/marketplace", icon: LayoutDashboard },
  { title: "Discover", href: "/marketplace/discover", icon: Compass },
  { title: "Community", href: "/marketplace/community", icon: Users },
  { title: "Messages", href: "/marketplace/messages", icon: MessageSquare },
];

const toolItems = [
  { title: "Calculators", href: "/marketplace/calculators", icon: Calculator },
  { title: "Resources", href: "/marketplace/resources", icon: FileText },
];

function getRoleSpecificItems(role: UserRole | null) {
  switch (role) {
    case "admin":
      return [
        { title: "Admin Panel", href: "/marketplace/admin", icon: ShieldCheck },
      ];
    case "pegasus_wholesaler":
      return [
        { title: "My Deals", href: "/marketplace/wholesaler/deals", icon: Briefcase },
        { title: "Submit Deal", href: "/marketplace/wholesaler/submit", icon: Store },
        { title: "Buyer Network", href: "/marketplace/wholesaler/buyers", icon: Users },
        { title: "Analytics", href: "/marketplace/wholesaler/analytics", icon: TrendingUp },
      ];
    case "wholesaler":
      return [
        { title: "My Deals", href: "/marketplace/wholesaler/deals", icon: Briefcase },
        { title: "Submit Deal", href: "/marketplace/wholesaler/submit", icon: Store },
        { title: "Buyer Network", href: "/marketplace/wholesaler/buyers", icon: Users },
      ];
    case "pegasus_dreamscaper":
      return [
        { title: "My Projects", href: "/marketplace/dreamscaper/projects", icon: Building2 },
        { title: "Capital Raising", href: "/marketplace/dreamscaper/capital", icon: DollarSign },
        { title: "Team", href: "/marketplace/dreamscaper/team", icon: Users },
        { title: "Analytics", href: "/marketplace/dreamscaper/analytics", icon: TrendingUp },
      ];
    case "dreamscaper":
      return [
        { title: "My Projects", href: "/marketplace/dreamscaper/projects", icon: Building2 },
        { title: "Capital Raising", href: "/marketplace/dreamscaper/capital", icon: DollarSign },
        { title: "Team", href: "/marketplace/dreamscaper/team", icon: Users },
      ];
    case "investor":
      return [
        { title: "My Investments", href: "/marketplace/investor/portfolio", icon: DollarSign },
        { title: "Saved Deals", href: "/marketplace/investor/saved", icon: Sparkles },
        { title: "Watch List", href: "/marketplace/investor/watchlist", icon: Compass },
      ];
    case "buyer_retail":
    case "buyer_investment":
      return [
        { title: "Saved Properties", href: "/marketplace/buyer/saved", icon: Home },
        { title: "My Offers", href: "/marketplace/buyer/offers", icon: FileText },
        { title: "Search", href: "/marketplace/buyer/search", icon: Compass },
      ];
    default:
      return [];
  }
}

function getRoleLabel(role: UserRole | null): string {
  switch (role) {
    case "admin":
      return "Administrator";
    case "pegasus_wholesaler":
      return "Pegasus Wholesaler";
    case "wholesaler":
      return "Wholesaler";
    case "pegasus_dreamscaper":
      return "Pegasus DreamScaper";
    case "dreamscaper":
      return "DreamScaper";
    case "investor":
      return "Investor";
    case "buyer_retail":
      return "Retail Buyer";
    case "buyer_investment":
      return "Investment Buyer";
    default:
      return "Member";
  }
}

function getRoleBadgeVariant(role: UserRole | null): "default" | "secondary" | "outline" {
  if (role?.startsWith("pegasus_") || role === "admin") {
    return "default";
  }
  return "secondary";
}

export function MarketplaceLayout({ children }: MarketplaceLayoutProps) {
  const [location] = useLocation();
  const { profile, user, signOut, userRole } = useSupabaseAuth();

  const roleItems = getRoleSpecificItems(userRole);
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-serif font-semibold text-sm">Pegasus</span>
                <span className="text-xs text-muted-foreground">Marketplace</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {baseNavItems.map((item) => {
                    const dashboardPath = getRoleDashboardPath(userRole);
                    const isActive =
                      item.href === "/marketplace"
                        ? location === dashboardPath ||
                          location === "/marketplace"
                        : location.startsWith(item.href);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <Link href={item.href === "/marketplace" ? dashboardPath : item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {roleItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Your Workspace</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {roleItems.map((item) => {
                      const isActive = location.startsWith(item.href);
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.title}
                          >
                            <Link href={item.href}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup>
              <SidebarGroupLabel>Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {toolItems.map((item) => {
                    const isActive = location.startsWith(item.href);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="h-auto py-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={profile?.avatar_url} alt={displayName} />
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start gap-0.5 group-data-[collapsible=icon]:hidden">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium truncate max-w-[120px]">
                            {displayName}
                          </span>
                          {userRole?.startsWith("pegasus_") && (
                            <Crown className="h-3 w-3 text-primary" />
                          )}
                        </div>
                        <Badge
                          variant={getRoleBadgeVariant(userRole)}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {getRoleLabel(userRole)}
                        </Badge>
                      </div>
                      <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="top"
                    className="w-[--radix-dropdown-menu-trigger-width]"
                  >
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user?.id}`}>
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/marketplace/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex-1" />
            <NotificationDropdown />
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="link-home">
                <Home className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
            </Link>
          </header>

          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
