import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ArrowUpRight, LogIn, LogOut, Shield, Sparkles, BarChart3, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "@assets/image_1765405939117.png";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

const PUBLIC_LINKS: { href: string; label: string; badge?: string }[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/development", label: "Development" },
  { href: "/investments", label: "Investments" },
  { href: "/systems", label: "Systems" },
  { href: "/marketflow-beta", label: "MarketFlow Beta", badge: "Beta" },
  { href: "/contact", label: "Contact" },
];

function isAppShellRoute(pathname: string): boolean {
  return (
    pathname === "/marketflow" ||
    pathname.startsWith("/marketflow/") ||
    pathname.startsWith("/dealflow") ||
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/offer-studio") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname === "/hq"
  );
}

function isActive(current: string, href: string): boolean {
  if (href === "/") return current === "/";
  return current === href || current.startsWith(href + "/");
}

function UserMenu() {
  const { user, profile, isAdmin } = useSupabaseAuth();
  const displayName = profile?.display_name || "Member";
  const initials = displayName
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1.5 text-sm transition hover:border-primary/40 hover:bg-muted"
          data-testid="button-user-menu"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="text-sm font-medium">{displayName}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/marketflow">
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <Sparkles className="h-4 w-4" />
            MarketFlow
          </DropdownMenuItem>
        </Link>
        <Link href="/marketflow/dashboard">
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
        </Link>
        {isAdmin && (
          <Link href="/marketflow/admin">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Shield className="h-4 w-4" />
              Admin
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuSeparator />
        <a href="/api/logout">
          <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </a>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useSupabaseAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const onAppShell = isAppShellRoute(location);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-all duration-300 ${
          scrolled || onAppShell
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-background/80 backdrop-blur-sm border-b border-border/40"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0" data-testid="link-nav-logo">
            <img
              src={logoImage}
              alt="Pegasus Dreamscapes"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {PUBLIC_LINKS.map((link) => {
              const active = isActive(location, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? "text-primary bg-primary/8"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {link.label}
                    {link.badge && (
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-primary/10 text-primary">
                        {link.badge}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <Link
              href="/sell"
              className="hidden md:inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              data-testid="button-nav-submit"
            >
              Submit a Property
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <a
                href="/api/login"
                className="hidden lg:inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition hover:text-foreground hover:bg-muted"
                data-testid="link-nav-signin"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </a>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-muted"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              data-testid="button-mobile-menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden bg-background border-b border-border shadow-md"
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-col gap-1">
                {PUBLIC_LINKS.map((link) => {
                  const active = isActive(location, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between rounded-md px-3 py-3 text-sm font-medium transition ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:text-foreground hover:bg-muted"
                      }`}
                      data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        {link.label}
                        {link.badge && (
                          <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-primary/10 text-primary">
                            {link.badge}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-40" />
                    </Link>
                  );
                })}
                <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
                  <Link
                    href="/sell"
                    className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-center text-primary-foreground transition hover:bg-primary/90"
                  >
                    Submit a Property
                  </Link>
                  {!isAuthenticated && (
                    <a
                      href="/api/login"
                      className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-center text-foreground/80 transition hover:bg-muted"
                    >
                      Sign In
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
