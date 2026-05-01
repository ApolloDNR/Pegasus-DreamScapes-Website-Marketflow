import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ArrowUpRight, ChevronDown, LogIn, LogOut, Shield, Sparkles, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PegasusMark } from "@/components/brand/pegasus-mark";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PUBLIC_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/development", label: "Development" },
  { href: "/investments", label: "Investments" },
  { href: "/systems", label: "Systems" },
  { href: "/marketflow-beta", label: "MarketFlow Beta" },
  { href: "/contact", label: "Contact" },
];

/** Routes where the portal/app shell is in charge — the public marketing
 *  navigation should still exist but stay quietly out of the way. */
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

function UserMenu({ scrolled }: { scrolled: boolean }) {
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
          className="flex items-center gap-2 rounded-full border border-copper/30 bg-white/[0.03] px-2 py-1.5 transition hover:border-copper/60 hover:bg-white/[0.06]"
          data-testid="button-user-menu"
        >
          <Avatar className="h-7 w-7 border border-copper/30">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-copper/15 text-copper text-[11px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-3.5 w-3.5 text-muted-ivory" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border-copper/20 bg-[hsl(220_30%_8%)] text-ivory"
      >
        <DropdownMenuLabel className="text-muted-ivory">
          <p className="text-sm font-medium text-ivory">{displayName}</p>
          <p className="truncate text-xs">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-copper/20" />
        <Link href="/marketflow">
          <DropdownMenuItem className="gap-2 text-ivory focus:bg-white/5 focus:text-copper">
            <Sparkles className="h-4 w-4" />
            MarketFlow
          </DropdownMenuItem>
        </Link>
        <Link href="/marketflow/dashboard">
          <DropdownMenuItem className="gap-2 text-ivory focus:bg-white/5 focus:text-copper">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
        </Link>
        {isAdmin && (
          <Link href="/marketflow/admin">
            <DropdownMenuItem className="gap-2 text-ivory focus:bg-white/5 focus:text-copper">
              <Shield className="h-4 w-4" />
              Admin
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuSeparator className="bg-copper/20" />
        <a href="/api/logout">
          <DropdownMenuItem className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive">
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
    const onScroll = () => setScrolled(window.scrollY > 16);
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
        className={`transition-all duration-500 ${
          scrolled || onAppShell
            ? "bg-[hsl(38_32%_96%)]/95 backdrop-blur-xl border-b border-[hsl(35_18%_84%)]"
            : "bg-gradient-to-b from-[hsl(220_40%_4%)]/70 via-[hsl(220_35%_5%)]/30 to-transparent"
        }`}
      >
        <div className="container-premium flex h-20 items-center justify-between gap-6">
          {/* Brand lockup */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            data-testid="link-nav-logo"
          >
            <PegasusMark size={42} />
            <div className="hidden sm:flex flex-col leading-none">
              <span className={`font-display-uppercase text-[15px] ${scrolled || onAppShell ? "text-foreground" : "text-ivory"}`}>
                Pegasus Dreamscapes
              </span>
              <span className="kicker mt-1.5 text-[10px] tracking-[0.28em] text-copper/80">
                Dream it. Build it. Live it.
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {PUBLIC_LINKS.map((link) => {
              const active = isActive(location, link.href);
              const isBeta = link.href === "/marketflow-beta";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`relative px-4 py-2 text-[13px] tracking-[0.04em] transition ${
                    active
                      ? "text-copper"
                      : scrolled || onAppShell
                      ? "text-foreground/80 hover:text-foreground"
                      : "text-ivory/80 hover:text-ivory"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {link.label}
                    {isBeta && (
                      <span className="rounded-sm border border-copper/40 px-1 py-px text-[9px] tracking-[0.18em] text-copper">
                        BETA
                      </span>
                    )}
                  </span>
                  <span
                    className={`pointer-events-none absolute bottom-1 left-4 right-4 h-px transition-all duration-300 ${
                      active
                        ? "bg-copper opacity-100"
                        : "bg-copper opacity-0 group-hover:opacity-60"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="hidden md:inline-flex items-center gap-2 rounded-sm border border-copper/50 bg-copper/5 px-4 py-2 text-[12px] uppercase tracking-[0.18em] text-copper transition hover:border-copper hover:bg-copper/10"
              data-testid="button-nav-submit"
            >
              Submit an Opportunity
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            {isAuthenticated ? (
              <UserMenu scrolled={scrolled} />
            ) : (
              <a
                href="/api/login"
                className={`hidden lg:inline-flex items-center gap-1.5 px-2 py-2 text-[12px] uppercase tracking-[0.18em] transition ${
                  scrolled || onAppShell
                    ? "text-foreground/60 hover:text-foreground"
                    : "text-ivory/70 hover:text-ivory"
                }`}
                data-testid="link-nav-signin"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </a>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen((v) => !v)}
              className={`lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-sm border border-copper/30 transition hover:bg-copper/5 ${
                scrolled || onAppShell ? "text-foreground" : "text-ivory"
              }`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              data-testid="button-mobile-menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Hairline accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-copper/30 to-transparent" />
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-[hsl(38_32%_96%)] border-b border-[hsl(35_18%_84%)] backdrop-blur-xl"
          >
            <div className="container-premium py-6">
              <div className="flex flex-col">
                {PUBLIC_LINKS.map((link) => {
                  const active = isActive(location, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between border-b border-[hsl(35_18%_84%)] py-4 text-[15px] tracking-wide transition ${
                        active ? "text-copper" : "text-foreground/80 hover:text-copper"
                      }`}
                      data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {link.label}
                      <ArrowUpRight className="h-4 w-4 opacity-60" />
                    </Link>
                  );
                })}
                <div className="mt-6 flex flex-col gap-3">
                  <Link href="/sell" className="btn-copper w-full justify-center">
                    Submit an Opportunity
                  </Link>
                  {!isAuthenticated && (
                    <a
                      href="/api/login"
                      className="btn-ghost-copper w-full justify-center"
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
