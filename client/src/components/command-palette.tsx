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
  Calculator, 
  Users, 
  MessageSquare,
  Sparkles,
  TrendingUp,
  Briefcase,
  Target,
  Award,
  Search,
  Mail,
  Shield,
  Zap,
  BarChart3,
  Heart,
  BookOpen,
  Bot
} from "lucide-react";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
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
  const { user, isAuthenticated, isAdmin } = useSupabaseAuth();

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
    { id: "home", label: "Home", description: "Pegasus Dreamscapes public front door", icon: Home, href: "/", keywords: ["main", "start"] },
    { id: "deal-architecture", label: "Deal Architecture", description: "How Pegasus reads and structures complex property situations", icon: Target, href: "/deal-architecture", keywords: ["architecture", "structure", "property"] },
    { id: "submit", label: "Submit a Property", description: "Start a disciplined Pegasus review", icon: Building2, href: "/submit", keywords: ["submit", "property", "intake", "review"] },
    { id: "connect", label: "Connect", description: "Fast route for cards, QR codes, and direct introductions", icon: MessageSquare, href: "/connect", keywords: ["qr", "card", "contact"] },
    { id: "development", label: "Development", description: "ADU, rehab, value-add, and build strategy", icon: Briefcase, href: "/development", keywords: ["adu", "rehab", "build"] },
    { id: "work-with-apollo", label: "Work With Apollo", description: "Brokerage representation through the correct KW lane", icon: Users, href: "/work-with-apollo", keywords: ["apollo", "listing", "kw", "dre"] },
    { id: "marketflow", label: "MarketFlow", description: "Private deal and operator network access", icon: Sparkles, href: "/marketflow", keywords: ["marketflow", "network", "deals"] },
    { id: "peggy-ai", label: "Peggy AI", description: "Guided intake and routing support", icon: Bot, href: "/peggy-ai", keywords: ["peggy", "assistant", "chat"] },
    { id: "capital", label: "Capital & Partnerships", description: "Private capital and relationship conversations", icon: TrendingUp, href: "/capital", keywords: ["partner", "capital"] },
    { id: "contact", label: "Contact", description: "Reach Pegasus directly", icon: Mail, href: "/contact", keywords: ["email", "phone", "message"] },
  ];

  const toolItems: CommandItem[] = [
    { id: "strategy-lab", label: "Strategy Lab", description: "Run a property through the Pegasus lens", icon: Calculator, href: "/strategy-lab", keywords: ["math", "analyze", "calculator", "lane", "verdict"], badge: "New" },
    { id: "library", label: "Strategy Library", description: "Read Pegasus doctrine and field notes", icon: BookOpen, href: "/library", keywords: ["learn", "education", "strategy"] },
    { id: "dreamscaper-standard", label: "Dreamscaper Standard", description: "Operating standards for Pegasus work", icon: Award, href: "/dreamscaper-standard", keywords: ["standard", "values", "doctrine"] },
    { id: "disclosures", label: "Disclosures", description: "Compliance, brokerage, AI, and housing disclosures", icon: Shield, href: "/disclosures", keywords: ["legal", "compliance", "dre", "kw"] },
  ];

  const dealflowItems: CommandItem[] = isAuthenticated ? [
    { id: "marketflow-hub", label: "MarketFlow Hub", description: "Private network command center", icon: Sparkles, href: "/marketflow", keywords: ["dashboard", "main"], badge: "Private" },
    { id: "marketflow-deals", label: "Review Deals", description: "Role-gated opportunities and deal review", icon: Heart, href: "/marketflow/deals", keywords: ["deals", "review"] },
    { id: "marketflow-community", label: "Network Feed", description: "Updates from the private network", icon: MessageSquare, href: "/marketflow/community", keywords: ["posts", "social"] },
    { id: "marketflow-messages", label: "Messages", description: "Private network messages", icon: Mail, href: "/marketflow/messages", keywords: ["chat", "dm"] },
    { id: "marketflow-dashboard", label: "My Dashboard", description: "Saved activity and role-specific tools", icon: BarChart3, href: "/marketflow/dashboard", keywords: ["saved", "dashboard"] },
  ] : [];

  const staffItems: CommandItem[] = isAdmin ? [
    { id: "hq", label: "HQ Dashboard", description: "Staff command center", icon: Shield, href: "/marketflow/admin", keywords: ["admin", "staff"], badge: "Staff" },
  ] : [];

  const quickActions: CommandItem[] = [
    { 
      id: "search", 
      label: "Search Everything", 
      description: "Find pages, tools, and Pegasus surfaces", 
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
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
                <item.icon className="w-4 h-4 text-primary" />
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
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">Enter</kbd>
            to select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">Up/Down</kbd>
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
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-background rounded text-[10px] font-mono border border-border/50">
        Ctrl K
      </kbd>
    </button>
  );
}
