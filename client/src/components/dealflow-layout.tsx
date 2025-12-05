import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { NotificationBell } from "./notification-bell";
import { CommandPalette, CommandTrigger } from "./command-palette";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Briefcase, 
  Store, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronDown,
  Loader2,
  Home,
  Sparkles,
  TrendingUp,
  DollarSign,
  Target,
  Shield,
  Zap,
  Activity,
  ChevronRight,
  Command,
  BarChart3,
  Heart,
  BookmarkCheck,
  Clock,
  ArrowUpRight,
  Bell,
  Search,
  Menu,
  X,
  Building2,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@assets/image_1764616120774.png";

interface DealflowLayoutProps {
  children: React.ReactNode;
}

interface QuickStat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}

function QuickStatsCard({ stats }: { stats: QuickStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="p-3 rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/20 border border-border/50 hover:border-primary/30 transition-all group"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-6 h-6 rounded-lg ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-lg font-bold text-foreground">{stat.value}</span>
            {stat.change && (
              <span className={`text-[10px] font-medium ${
                stat.trend === 'up' ? 'text-green-500' : 
                stat.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
              }`}>
                {stat.change}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityPulse() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span>Live Updates Active</span>
    </div>
  );
}

export function DealflowLayout({ children }: DealflowLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/__replit/auth/login";
    }
  }, [isLoading, isAuthenticated]);

  const { data: statsData } = useQuery<any>({
    queryKey: ['/api/dealflow/stats'],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Loading Dealflow...</p>
        </div>
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

  const getUserRole = () => {
    if (user?.isStaff) return { name: "Dreamscaper", color: "text-purple-500", bgColor: "bg-purple-500/10" };
    if (user?.isInvestor) return { name: "Investor", color: "text-green-500", bgColor: "bg-green-500/10" };
    if (user?.isWholesaler) return { name: "Wholesaler", color: "text-blue-500", bgColor: "bg-blue-500/10" };
    if (user?.isBuyer) return { name: "Buyer", color: "text-amber-500", bgColor: "bg-amber-500/10" };
    return { name: "Member", color: "text-muted-foreground", bgColor: "bg-secondary" };
  };
  
  const userRole = getUserRole();

  const navItems = [
    { path: "/dealflow/office", label: "My Office", icon: Briefcase, badge: null },
    { path: "/dealflow/deals", label: "Discover", icon: Heart, badge: "12" },
    { path: "/dealflow/community", label: "Community", icon: Users, badge: null },
    { path: "/dealflow/messages", label: "Messages", icon: MessageSquare, badge: "3" },
  ];
  
  const toolItems = [
    { path: "/calculators", label: "Calculators", icon: BarChart3 },
    { path: "/resources", label: "Resources", icon: Building2 },
  ];

  const quickStats: QuickStat[] = [
    { label: "Match Score", value: "87%", icon: Target, color: "bg-primary" },
    { label: "Saved Deals", value: statsData?.savedDeals || 0, icon: BookmarkCheck, color: "bg-blue-500" },
    { label: "Active", value: statsData?.activeDeals || 12, change: "+4", trend: 'up', icon: TrendingUp, color: "bg-green-500" },
    { label: "Pending", value: statsData?.pendingDeals || 3, icon: Clock, color: "bg-amber-500" },
  ];

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getUserRoles = () => {
    const roles = [];
    if (user?.isStaff) roles.push({ name: "Dreamscaper", color: "bg-purple-500" });
    if (user?.isInvestor) roles.push({ name: "Investor", color: "bg-blue-500" });
    if (user?.isWholesaler) roles.push({ name: "Wholesaler", color: "bg-green-500" });
    if (user?.isBuyer) roles.push({ name: "Buyer", color: "bg-amber-500" });
    return roles;
  };

  const userRoles = getUserRoles();

  return (
    <>
      <CommandPalette />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex">
        <aside className={`hidden lg:flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-72'} border-r bg-card/50 backdrop-blur-sm transition-all duration-300`}>
          <div className={`p-4 border-b flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <Link href="/dealflow" className="flex items-center gap-3" data-testid="link-dealflow-logo">
              <div className="relative">
                <img 
                  src={logoImage} 
                  alt="Pegasus" 
                  className="h-10 w-auto"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="font-serif text-lg font-bold leading-none">Dealflow</h1>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Zap className="w-2.5 h-2.5 text-primary" />
                    <span className="text-[10px] text-primary font-medium">AI-Powered</span>
                  </div>
                </div>
              )}
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              data-testid="button-toggle-sidebar"
            >
              {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </Button>
          </div>

          {!sidebarCollapsed && (
            <div className="p-4 border-b">
              <CommandTrigger className="w-full justify-start" />
            </div>
          )}

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.path || (item.path === "/dealflow/office" && location === "/dealflow");
              const Icon = item.icon;
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link 
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                      data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
                    >
                      <div className={`relative ${isActive ? '' : 'group-hover:scale-110'} transition-transform`}>
                        <Icon className="w-5 h-5" />
                        {item.badge && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-[10px] font-bold text-destructive-foreground rounded-full flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {!sidebarCollapsed && (
                        <>
                          <span className="font-medium flex-1">{item.label}</span>
                          {isActive && <ChevronRight className="w-4 h-4" />}
                        </>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {sidebarCollapsed && (
                    <TooltipContent side="right" className="flex items-center gap-2">
                      {item.label}
                      {item.badge && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{item.badge}</Badge>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}

            <div className={`my-3 border-t border-border/50 ${sidebarCollapsed ? '' : 'mx-3'}`} />
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Tools</p>
            )}
            {toolItems.map((item) => {
              const Icon = item.icon;
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link 
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-muted-foreground hover:text-foreground hover:bg-secondary/50 ${sidebarCollapsed ? 'justify-center' : ''}`}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      <Icon className="w-5 h-5" />
                      {!sidebarCollapsed && (
                        <span className="font-medium flex-1">{item.label}</span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {sidebarCollapsed && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              );
            })}

            {user?.isStaff && (
              <>
                <div className={`my-3 border-t border-border/50 ${sidebarCollapsed ? '' : 'mx-3'}`} />
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link 
                      href="/dealflow/hq"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-blue-500 hover:bg-blue-500/10 ${sidebarCollapsed ? 'justify-center' : ''}`}
                      data-testid="nav-hq"
                    >
                      <Shield className="w-5 h-5" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="font-medium flex-1">HQ Dashboard</span>
                          <Badge variant="outline" className="text-[10px] border-blue-500/50 text-blue-500">Staff</Badge>
                        </>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {sidebarCollapsed && (
                    <TooltipContent side="right">HQ Dashboard (Staff)</TooltipContent>
                  )}
                </Tooltip>
              </>
            )}
          </nav>

          {!sidebarCollapsed && (
            <div className="p-4 border-t space-y-4">
              <QuickStatsCard stats={quickStats} />
              <ActivityPulse />
            </div>
          )}

          <div className={`p-4 border-t ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-secondary/50 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
                  data-testid="button-sidebar-user"
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium truncate">{user?.firstName || "User"}</p>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-[10px] text-muted-foreground">Online</span>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-64">
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {userRoles.map((role) => (
                      <Badge key={role.name} variant="secondary" className={`text-xs ${role.color} text-white`}>
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dealflow/settings" className="cursor-pointer gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" className="cursor-pointer gap-2">
                    <Home className="w-4 h-4" />
                    Back to Website
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/__replit/auth/logout" className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between h-16 px-4">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  data-testid="button-mobile-menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
                <Link href="/dealflow" className="flex items-center gap-2">
                  <img src={logoImage} alt="Pegasus" className="h-8 w-auto" />
                  <span className="font-serif font-bold">Dealflow</span>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell />
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t overflow-hidden"
                >
                  <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                      const isActive = location === item.path || (item.path === "/dealflow/office" && location === "/dealflow");
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'text-foreground hover:bg-secondary/50'
                          }`}
                          data-testid={`nav-mobile-${item.label.toLowerCase().replace(" ", "-")}`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge variant={isActive ? "secondary" : "destructive"} className="text-[10px]">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                    <div className="pt-4 border-t mt-4">
                      <p className="px-4 mb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Tools</p>
                      {toolItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
                            data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                    {user?.isStaff && (
                      <Link
                        href="/dealflow/hq"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-500 hover:bg-blue-500/10 transition-all"
                        data-testid="nav-mobile-hq"
                      >
                        <Shield className="w-5 h-5" />
                        <span className="font-medium flex-1">HQ Dashboard</span>
                        <Badge variant="outline" className="text-[10px] border-blue-500/50 text-blue-500">Staff</Badge>
                      </Link>
                    )}
                    <div className="pt-4 border-t mt-4 space-y-1">
                      <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary/50 transition-all"
                      >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">Back to Website</span>
                      </Link>
                      <a
                        href="/__replit/auth/logout"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                      </a>
                    </div>
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <header className="hidden lg:flex sticky top-0 z-40 border-b bg-card/50 backdrop-blur-sm h-14 items-center px-6 gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Platform Status:</span>
                <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">
                  All Systems Operational
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Button variant="ghost" size="icon" asChild data-testid="button-home">
                <Link href="/">
                  <Home className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>

          <footer className="border-t py-4 bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Dreamscaper Dealflow</span>
                <span className="text-border">|</span>
                <span>Pegasus Dreamscapes Corp.</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-primary" />
                <span>"The Pegasus network for projects, capital, and trusted operators."</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
