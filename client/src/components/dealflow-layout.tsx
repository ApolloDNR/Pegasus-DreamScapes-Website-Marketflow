import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "./notification-bell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Briefcase, 
  Store, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronDown,
  Loader2,
  Home
} from "lucide-react";

interface DealflowLayoutProps {
  children: React.ReactNode;
}

export function DealflowLayout({ children }: DealflowLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/__replit/auth/login";
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const navItems = [
    { path: "/dealflow/office", label: "My Office", icon: Briefcase },
    { path: "/dealflow/deals", label: "Deals", icon: Store },
    { path: "/dealflow/community", label: "Community", icon: Users },
    { path: "/dealflow/messages", label: "Messages", icon: MessageSquare },
  ];

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getUserRoles = () => {
    const roles = [];
    if (user?.isStaff) roles.push("Dreamscaper");
    if (user?.isInvestor) roles.push("Investor");
    if (user?.isWholesaler) roles.push("Wholesaler");
    if (user?.isBuyer) roles.push("Buyer");
    return roles;
  };

  const userRoles = getUserRoles();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="/dealflow" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">P</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-serif text-lg font-bold leading-none">Dreamscaper Dealflow</h1>
                  <p className="text-xs text-muted-foreground">The Pegasus Network</p>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location === item.path || (item.path === "/dealflow/office" && location === "/dealflow");
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className="gap-2"
                      data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                      asChild
                    >
                      <Link href={item.path}>
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="hidden sm:flex" data-testid="button-home" asChild>
                <Link href="/">
                  <Home className="h-5 w-5" />
                </Link>
              </Button>

              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-medium leading-none">
                        {user?.firstName || "User"}
                      </span>
                      <div className="flex gap-1 mt-0.5">
                        {userRoles.slice(0, 2).map((role) => (
                          <Badge key={role} variant="outline" className="text-[10px] px-1 py-0">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userRoles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dealflow/office" className="cursor-pointer">
                      <Briefcase className="mr-2 h-4 w-4" />
                      My Office
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dealflow/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/__replit/auth/logout" className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <nav className="flex md:hidden items-center gap-1 pb-3 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = location === item.path || (item.path === "/dealflow/office" && location === "/dealflow");
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1.5 whitespace-nowrap"
                  data-testid={`nav-mobile-${item.label.toLowerCase().replace(" ", "-")}`}
                  asChild
                >
                  <Link href={item.path}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Dreamscaper Dealflow by Pegasus Dreamscapes Corp.</p>
          <p className="text-xs mt-1">"The Pegasus network for projects, capital, and trusted operators."</p>
        </div>
      </footer>
    </div>
  );
}
