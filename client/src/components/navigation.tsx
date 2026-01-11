import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Menu, 
  X, 
  ChevronDown, 
  Calculator, 
  TrendingUp, 
  Home,
  DollarSign,
  BookOpen,
  Users,
  Building2,
  FileText,
  Target,
  Award,
  BarChart3,
  Briefcase,
  Sparkles,
  LogIn,
  User,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Shield,
  Zap,
  Activity,
  ChevronRight,
  Command,
  Search
} from "lucide-react";
import logoImage from "@assets/image_1765405939117.png";
import { useSupabaseAuth, getRoleDashboardPath } from "@/contexts/supabase-auth-context";
import { CommandTrigger, CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";
import { motion, AnimatePresence } from "framer-motion";

const homeLinks = [
  { href: "#services", label: "Services" },
  { href: "#sell", label: "Sell" },
  { href: "/buyers", label: "Buy", isPage: true },
  { href: "#invest", label: "Invest" },
  { href: "#creed", label: "Dreamscaper" },
  { href: "#contact", label: "Contact" },
];

import { Handshake } from "lucide-react";

const megaMenuSections = {
  opportunities: {
    title: "Opportunities",
    icon: DollarSign,
    gradient: "from-amber-500/20 to-orange-500/20",
    items: [
      { href: "/buyers", label: "Properties for Buyers", description: "Renovated homes & wholesale deals", icon: Home },
      { href: "/wholesale", label: "Wholesale Deals", description: "Off-market properties available", icon: Briefcase },
      { href: "/sell", label: "Sell Your Property", description: "Get a cash offer", icon: DollarSign },
      { href: "/invest", label: "Invest With Us", description: "Partner on projects", icon: TrendingUp },
      { href: "/submit-deal", label: "Submit a Deal", description: "Wholesalers submit deals", icon: FileText },
    ]
  },
  tools: {
    title: "Tools & Resources",
    icon: Calculator,
    gradient: "from-blue-500/20 to-cyan-500/20",
    items: [
      { href: "/calculators", label: "Deal Calculators", description: "ARV, ROI, BRRRR analysis", icon: Calculator, badge: "Pro" },
      { href: "/resources", label: "Investment Guides", description: "Learn the fundamentals", icon: FileText },
      { href: "/marketflow/community", label: "Community Hub", description: "Connect with investors", icon: MessageSquare },
      { href: "/projects", label: "Case Studies", description: "Real project examples", icon: Target },
    ]
  },
  company: {
    title: "Company",
    icon: Building2,
    gradient: "from-purple-500/20 to-pink-500/20",
    items: [
      { href: "/about", label: "About Us", description: "Our story and mission", icon: Users },
      { href: "/projects", label: "Portfolio", description: "Completed projects", icon: Briefcase },
      { href: "/partner", label: "Partner With Us", description: "Join our marketplace", icon: Handshake, badge: "New" },
      { href: "/contact", label: "Contact", description: "Get in touch", icon: Award },
    ]
  }
};

function NotificationBell({ scrolled, isHomePage }: { scrolled: boolean; isHomePage: boolean }) {
  const [hasNotifications] = useState(true);
  const [notificationCount] = useState(3);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={`relative p-2 rounded-lg transition-all hover-elevate ${
            (scrolled || !isHomePage) 
              ? 'text-muted-foreground hover:text-foreground hover:bg-secondary/50' 
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          {hasNotifications && (
            <>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-ping" />
            </>
          )}
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Badge variant="secondary" className="text-[10px]">{notificationCount} new</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">New deal matched!</p>
              <p className="text-xs text-muted-foreground truncate">123 Oak Street matches your criteria</p>
              <p className="text-[10px] text-muted-foreground mt-1">2 min ago</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">New message</p>
              <p className="text-xs text-muted-foreground truncate">Sarah: Interested in the downtown project...</p>
              <p className="text-[10px] text-muted-foreground mt-1">1 hour ago</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Investment update</p>
              <p className="text-xs text-muted-foreground truncate">Phase 2 milestone completed</p>
              <p className="text-[10px] text-muted-foreground mt-1">3 hours ago</p>
            </div>
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-primary cursor-pointer">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({ profile, userEmail, scrolled, isHomePage, isAdmin }: { profile: any; userEmail: string; scrolled: boolean; isHomePage: boolean; isAdmin: boolean }) {
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const displayName = profile?.display_name || 'User';
  const avatarUrl = profile?.avatar_url;
  const email = userEmail || '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={`flex items-center gap-2 p-1.5 pr-3 rounded-full transition-all ${
            (scrolled || !isHomePage) 
              ? 'hover:bg-secondary/50 border border-border/50' 
              : 'hover:bg-white/10 border border-white/20'
          }`}
          data-testid="button-user-menu"
        >
          <Avatar className="w-7 h-7 border-2 border-primary/20">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className={`text-xs font-medium leading-tight ${(scrolled || !isHomePage) ? 'text-foreground' : 'text-white'}`}>
              {displayName}
            </p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className={`text-[10px] ${(scrolled || !isHomePage) ? 'text-muted-foreground' : 'text-white/60'}`}>
                Online
              </span>
            </div>
          </div>
          <ChevronDown className={`w-3 h-3 ${(scrolled || !isHomePage) ? 'text-muted-foreground' : 'text-white/60'}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <Link href="/marketflow">
          <DropdownMenuItem className="cursor-pointer gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>MarketFlow Hub</span>
            <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">New</Badge>
          </DropdownMenuItem>
        </Link>
        
        <Link href="/marketflow">
          <DropdownMenuItem className="cursor-pointer gap-2">
            <BarChart3 className="w-4 h-4" />
            <span>My Dashboard</span>
          </DropdownMenuItem>
        </Link>
        
        <Link href="/marketflow/messages">
          <DropdownMenuItem className="cursor-pointer gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>Messages</span>
            <Badge variant="outline" className="ml-auto text-[10px] px-1.5">2</Badge>
          </DropdownMenuItem>
        </Link>
        
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <Link href="/marketflow/admin">
              <DropdownMenuItem className="cursor-pointer gap-2 text-blue-600">
                <Shield className="w-4 h-4" />
                <span>Admin Dashboard</span>
                <Badge variant="outline" className="ml-auto text-[10px] px-1.5 border-blue-500/50 text-blue-500">Staff</Badge>
              </DropdownMenuItem>
            </Link>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <Link href="/marketflow/settings">
          <DropdownMenuItem className="cursor-pointer gap-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        
        <a href="/api/logout">
          <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </a>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, profile, isAuthenticated, isAdmin } = useSupabaseAuth();

  const isHomePage = location === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setMegaMenuOpen(true);
  };

  const handleMenuLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 150);
  };

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#") && isHomePage) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setIsOpen(false);
    }
  };

  return (
    <>
      <CommandPalette />
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className={`transition-all duration-500 ${
          scrolled || !isHomePage 
            ? 'bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-border/50' 
            : 'bg-gradient-to-b from-black/50 to-transparent'
        }`}>
          <div className="w-full px-6 lg:px-10 xl:px-12 h-18 lg:h-22 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4 group flex-shrink-0" data-testid="link-logo">
              <div className="relative">
                <img 
                  src={logoImage} 
                  alt="Pegasus Dreamscapes" 
                  className="h-12 lg:h-14 w-auto transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="hidden md:block min-w-max">
                <h1 className={`font-serif text-xl lg:text-2xl font-semibold tracking-tight transition-colors whitespace-nowrap ${scrolled || !isHomePage ? 'text-foreground' : 'text-white'}`}>
                  Pegasus Dreamscapes
                </h1>
                <div className="flex items-center gap-2">
                  <p className={`text-[11px] uppercase tracking-[0.2em] transition-colors ${scrolled || !isHomePage ? 'text-muted-foreground' : 'text-white/70'}`}>
                    Corp
                  </p>
                  <div className={`h-3 w-px ${scrolled || !isHomePage ? 'bg-border' : 'bg-white/30'}`} />
                  <div className="flex items-center gap-1">
                    <Zap className={`w-3 h-3 ${scrolled || !isHomePage ? 'text-primary' : 'text-amber-400'}`} />
                    <span className={`text-[11px] font-medium ${scrolled || !isHomePage ? 'text-primary' : 'text-amber-400'}`}>
                      AI-Powered
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2 xl:gap-3">
              {isHomePage ? (
                <>
                  {homeLinks.map((link) => (
                    (link as any).isPage ? (
                      <Link 
                        key={link.href} 
                        href={link.href}
                        className={`px-4 py-2.5 text-sm font-medium tracking-wide transition-all cursor-pointer relative group rounded-lg ${
                          scrolled 
                            ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                            : 'text-white/90 hover:text-white hover:bg-white/10'
                        }`}
                        data-testid={`link-nav-${link.label.toLowerCase()}`}
                      >
                        {link.label}
                        <span className={`absolute bottom-1 left-4 right-4 h-0.5 scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${scrolled ? 'bg-primary' : 'bg-white'}`} />
                      </Link>
                    ) : (
                      <a 
                        key={link.href} 
                        href={link.href}
                        onClick={(e) => handleScrollClick(e, link.href)}
                        className={`px-4 py-2.5 text-sm font-medium tracking-wide transition-all cursor-pointer relative group rounded-lg ${
                          scrolled 
                            ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                            : 'text-white/90 hover:text-white hover:bg-white/10'
                        }`}
                        data-testid={`link-nav-${link.label.toLowerCase()}`}
                      >
                        {link.label}
                        <span className={`absolute bottom-1 left-4 right-4 h-0.5 scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${scrolled ? 'bg-primary' : 'bg-white'}`} />
                      </a>
                    )
                  ))}
                </>
              ) : (
                <Link 
                  href="/"
                  className="px-3 py-2 text-sm font-medium tracking-wide transition-all hover:text-primary text-foreground relative group rounded-lg hover:bg-primary/5"
                  data-testid="link-nav-home"
                >
                  Home
                  <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-primary scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              )}
              
              <div 
                className="relative"
                onMouseEnter={handleMenuEnter}
                onMouseLeave={handleMenuLeave}
              >
                <button 
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium tracking-wide cursor-pointer transition-all rounded-lg ${
                    (scrolled || !isHomePage) 
                      ? 'text-foreground hover:text-primary hover:bg-primary/5' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                  data-testid="button-nav-explore"
                  aria-expanded={megaMenuOpen}
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                >
                  Explore
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {megaMenuOpen && (
                  <div className="absolute top-full left-0 h-5 w-full bg-transparent" />
                )}
                
                <AnimatePresence>
                  {megaMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-4 w-[750px] bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-tan/5" />
                      <div className="absolute -top-2 right-6 w-4 h-4 bg-card border-l border-t border-border/50 rotate-45" />
                      
                      <div className="relative grid grid-cols-3 divide-x divide-border/50">
                        {Object.entries(megaMenuSections).map(([key, section]) => (
                          <div key={key} className="p-5">
                            <div className={`flex items-center gap-2 mb-4 p-2 rounded-lg bg-gradient-to-r ${section.gradient}`}>
                              <div className="w-8 h-8 rounded-lg bg-background/80 flex items-center justify-center shadow-sm">
                                <section.icon className="w-4 h-4 text-primary" />
                              </div>
                              <span className="font-semibold text-sm text-foreground">{section.title}</span>
                            </div>
                            <div className="space-y-1">
                              {section.items.map((item, idx) => (
                                <Link
                                  key={idx}
                                  href={item.href}
                                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-all group"
                                  onClick={() => setMegaMenuOpen(false)}
                                  data-testid={`link-mega-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  <div className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:scale-110 transition-all shadow-sm">
                                    <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                                      {(item as any).badge && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                          {(item as any).badge}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="relative bg-gradient-to-r from-primary/10 via-tan/10 to-primary/10 px-5 py-4 flex items-center justify-between border-t border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Ready to start investing?</p>
                            <p className="text-xs text-muted-foreground">Join our network of successful investors</p>
                          </div>
                        </div>
                        <Link href="/sell" onClick={() => setMegaMenuOpen(false)}>
                          <Button size="sm" className="gap-2" data-testid="button-mega-cta">
                            Get Started
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <CommandTrigger className={scrolled || !isHomePage ? '' : 'border-white/20 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white hover:border-white/30'} />
              
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/marketflow"
                    className={`hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      (scrolled || !isHomePage) 
                        ? 'text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20' 
                        : 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30'
                    }`}
                    data-testid="link-nav-marketflow"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>MarketFlow</span>
                  </Link>
                  
                  <NotificationBell scrolled={scrolled} isHomePage={isHomePage} />
                  <UserMenu profile={profile} userEmail={user?.email || ''} scrolled={scrolled} isHomePage={isHomePage} isAdmin={isAdmin} />
                </>
              ) : (
                <>
                  <a 
                    href="/api/login"
                    className={`hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      (scrolled || !isHomePage) 
                        ? 'text-muted-foreground hover:text-foreground hover:bg-secondary/50' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    data-testid="link-nav-login"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </a>
                  {isHomePage && (
                    <a href="#sell" onClick={(e) => handleScrollClick(e, "#sell")}>
                      <Button size="sm" className={`hidden sm:flex gap-2 ${scrolled ? '' : 'bg-white text-foreground hover:bg-white/90'}`} data-testid="button-nav-cta">
                        <Zap className="w-4 h-4" />
                        Get Started
                      </Button>
                    </a>
                  )}
                </>
              )}
              
              <button
                className={`lg:hidden p-2 rounded-lg transition-all ${
                  (scrolled || !isHomePage) 
                    ? 'text-foreground hover:bg-secondary/50' 
                    : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setIsOpen(!isOpen)}
                data-testid="button-mobile-menu"
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
        
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              id="mobile-menu" 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
                <div className="mb-4">
                  <CommandTrigger className="w-full justify-start" />
                </div>
                
                {isHomePage ? (
                  <>
                    {homeLinks.map((link) => (
                      <a 
                        key={link.href} 
                        href={link.href}
                        onClick={(e) => handleScrollClick(e, link.href)}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all text-foreground hover:bg-secondary cursor-pointer"
                        data-testid={`link-mobile-${link.label.toLowerCase()}`}
                      >
                        {link.label}
                      </a>
                    ))}
                  </>
                ) : (
                  <Link 
                    href="/"
                    className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all text-foreground hover:bg-secondary"
                    onClick={() => setIsOpen(false)}
                    data-testid="link-mobile-home"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </Link>
                )}
                
                {Object.entries(megaMenuSections).map(([key, section]) => (
                  <div key={key} className="pt-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${section.gradient}`}>
                      <section.icon className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{section.title}</span>
                    </div>
                    {section.items.map((item, idx) => (
                      <Link 
                        key={idx}
                        href={item.href}
                        className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all text-foreground hover:bg-secondary"
                        onClick={() => setIsOpen(false)}
                        data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        {item.label}
                        {(item as any).badge && (
                          <Badge variant="secondary" className="ml-auto text-[10px]">{(item as any).badge}</Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                ))}
                
                <div className="pt-4 border-t border-border space-y-1">
                  {isAuthenticated ? (
                    <>
                      <Link 
                        href="/marketflow"
                        className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-primary bg-primary/5 transition-all"
                        onClick={() => setIsOpen(false)} 
                        data-testid="link-mobile-marketflow"
                      >
                        <Sparkles className="w-4 h-4" />
                        MarketFlow
                        <Badge variant="secondary" className="ml-auto text-[10px]">New</Badge>
                      </Link>
                      <Link 
                        href="/marketflow/dashboard"
                        className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-all"
                        onClick={() => setIsOpen(false)} 
                        data-testid="link-mobile-dashboard"
                      >
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        My Dashboard
                      </Link>
                      {isAdmin && (
                        <Link 
                          href="/marketflow/admin"
                          className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-blue-600 bg-blue-500/5 transition-all"
                          onClick={() => setIsOpen(false)} 
                          data-testid="link-mobile-admin"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                          <Badge variant="outline" className="ml-auto text-[10px] border-blue-500/50 text-blue-500">Staff</Badge>
                        </Link>
                      )}
                      <a 
                        href="/api/logout"
                        className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-all"
                        data-testid="link-mobile-logout"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </a>
                    </>
                  ) : (
                    <>
                      <a 
                        href="/api/login"
                        className="flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-all"
                        data-testid="link-mobile-login"
                      >
                        <LogIn className="w-4 h-4 text-muted-foreground" />
                        Sign In
                      </a>
                      <Link href="/sell" onClick={() => setIsOpen(false)}>
                        <Button className="w-full gap-2 mt-2" data-testid="button-mobile-cta">
                          <Zap className="w-4 h-4" />
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
