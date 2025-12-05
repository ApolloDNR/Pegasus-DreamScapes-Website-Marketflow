import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  Home, 
  Building2, 
  DollarSign, 
  Calculator, 
  FileText, 
  Users, 
  MessageSquare,
  Sparkles,
  TrendingUp,
  Briefcase,
  Target,
  Award,
  Search,
  Settings,
  Bell,
  Mail,
  Shield,
  Zap,
  BarChart3,
  Heart,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: any;
  href?: string;
  action?: () => void;
  keywords?: string[];
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigate = useCallback((href: string) => {
    setLocation(href);
    setOpen(false);
  }, [setLocation]);

  const navigationItems: CommandItem[] = [
    { id: "home", label: "Home", description: "Return to homepage", icon: Home, href: "/", keywords: ["main", "start"] },
    { id: "properties", label: "Properties for Buyers", description: "Browse renovated homes", icon: Home, href: "/buyers", keywords: ["buy", "house", "real estate"] },
    { id: "wholesale", label: "Wholesale Deals", description: "Off-market investment opportunities", icon: Briefcase, href: "/wholesale", keywords: ["deals", "investment"] },
    { id: "sell", label: "Sell Your Property", description: "Get a cash offer today", icon: DollarSign, href: "/sell", keywords: ["sell", "cash", "offer"] },
    { id: "invest", label: "Invest With Us", description: "Partner on projects", icon: TrendingUp, href: "/invest", keywords: ["partner", "capital"] },
    { id: "projects", label: "Case Studies", description: "Real project examples", icon: Target, href: "/projects", keywords: ["portfolio", "examples"] },
    { id: "about", label: "About Us", description: "Our story and mission", icon: Users, href: "/about", keywords: ["team", "company"] },
    { id: "contact", label: "Contact", description: "Get in touch", icon: Mail, href: "/contact", keywords: ["email", "phone", "message"] },
  ];

  const toolItems: CommandItem[] = [
    { id: "calculators", label: "Deal Calculators", description: "ARV, ROI, BRRRR analysis", icon: Calculator, href: "/calculators", keywords: ["math", "analyze"], badge: "Pro" },
    { id: "resources", label: "Investment Guides", description: "Learn the fundamentals", icon: BookOpen, href: "/resources", keywords: ["learn", "education"] },
    { id: "community", label: "Community Hub", description: "Connect with investors", icon: MessageSquare, href: "/dealflow/community", keywords: ["forum", "chat", "social"] },
  ];

  const dealflowItems: CommandItem[] = isAuthenticated ? [
    { id: "dealflow", label: "Dealflow Hub", description: "Your investment command center", icon: Sparkles, href: "/dealflow", keywords: ["dashboard", "main"], badge: "New" },
    { id: "deals", label: "Discover Deals", description: "Swipe through opportunities", icon: Heart, href: "/dealflow/deals", keywords: ["match", "swipe"] },
    { id: "community-feed", label: "Community Feed", description: "Social updates from your network", icon: MessageSquare, href: "/dealflow/community", keywords: ["posts", "social"] },
    { id: "messages", label: "Messages", description: "Direct messages", icon: Mail, href: "/dealflow/messages", keywords: ["chat", "dm"] },
    { id: "office", label: "My Office", description: "Saved deals and analytics", icon: BarChart3, href: "/dealflow/office", keywords: ["saved", "dashboard"] },
  ] : [];

  const staffItems: CommandItem[] = user?.isStaff ? [
    { id: "hq", label: "HQ Dashboard", description: "Staff command center", icon: Shield, href: "/dealflow/hq", keywords: ["admin", "staff"], badge: "Staff" },
  ] : [];

  const quickActions: CommandItem[] = [
    { 
      id: "search", 
      label: "Search Everything", 
      description: "Find deals, members, projects", 
      icon: Search, 
      action: () => {},
      keywords: ["find", "lookup"]
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." data-testid="input-command-search" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {isAuthenticated && dealflowItems.length > 0 && (
          <CommandGroup heading="Dealflow">
            {dealflowItems.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => item.href && navigate(item.href)}
                className="flex items-center gap-3 cursor-pointer"
                data-testid={`command-${item.id}`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant={item.badgeVariant || "secondary"} className="text-[10px] px-1.5 py-0">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {staffItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Staff">
              {staffItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => item.href && navigate(item.href)}
                  className="flex items-center gap-3 cursor-pointer"
                  data-testid={`command-${item.id}`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
                    <item.icon className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500/50 text-blue-500">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => item.href && navigate(item.href)}
              className="flex items-center gap-3 cursor-pointer"
              data-testid={`command-${item.id}`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary">
                <item.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <span className="font-medium">{item.label}</span>
                {item.description && (
                  <span className="text-xs text-muted-foreground block">{item.description}</span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Tools & Resources">
          {toolItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => item.href && navigate(item.href)}
              className="flex items-center gap-3 cursor-pointer"
              data-testid={`command-${item.id}`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-tan/20">
                <item.icon className="w-4 h-4 text-tan" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      
      <div className="border-t border-border px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">↵</kbd>
            to select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">↑↓</kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">esc</kbd>
            to close
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-primary" />
          <span>Powered by Pegasus AI</span>
        </div>
      </div>
    </CommandDialog>
  );
}

export function CommandTrigger({ className }: { className?: string }) {
  const [, setOpen] = useState(false);

  const handleClick = () => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-secondary/50 hover:bg-secondary rounded-lg border border-border/50 transition-all hover:border-border ${className}`}
      data-testid="button-command-trigger"
    >
      <Search className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-background rounded text-[10px] font-mono border border-border/50">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
