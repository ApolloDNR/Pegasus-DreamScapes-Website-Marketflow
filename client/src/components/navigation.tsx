import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
  ChevronDown,
  BarChart3,
  Sparkles,
  LogIn,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Shield,
  ArrowRight,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import logoImage from "@assets/image_1765405939117.png";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { CommandPalette } from "./command-palette";

type NavItem = { href: string; label: string; useAnchor?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/sell", label: "Approach" },
  { href: "/#development-pathway", label: "Development", useAnchor: true },
  { href: "/projects", label: "Projects" },
  { href: "/invest", label: "Capital" },
  { href: "/about", label: "About" },
];

const PRIMARY_CTA = { href: "/sell", label: "Start a Strategy Review" };

function NotificationBell({ onLightSurface }: { onLightSurface: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`relative p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))] focus-visible:ring-offset-2 ${
            onLightSurface
              ? "text-[hsl(var(--muted-text))] hover:text-[hsl(var(--ink))] hover:bg-[hsl(var(--ink)/0.04)]"
              : "text-white/80 hover:text-white hover:bg-white/10"
          }`}
          data-testid="button-notifications"
          aria-label="Open notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[hsl(var(--bronze))] rounded-full" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-sm text-muted-foreground cursor-default">
          You're all caught up.
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({
  profile,
  userEmail,
  onLightSurface,
  isAdmin,
}: {
  profile: any;
  userEmail: string;
  onLightSurface: boolean;
  isAdmin: boolean;
}) {
  const initials = (profile?.display_name || userEmail || "U")
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0]?.toUpperCase())
    .join("");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 p-1 pr-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))] focus-visible:ring-offset-2 ${
            onLightSurface
              ? "border border-[hsl(var(--rule))] hover:bg-[hsl(var(--ink)/0.04)]"
              : "border border-white/20 hover:bg-white/10"
          }`}
          data-testid="button-user-menu"
          aria-label="Open account menu"
        >
          <Avatar className="w-7 h-7">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-[hsl(var(--bronze)/0.1)] text-[hsl(var(--bronze))] text-xs font-medium">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className={`w-3 h-3 ${onLightSurface ? "text-[hsl(var(--muted-text))]" : "text-white/70"}`} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium text-sm">{profile?.display_name || "Account"}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/marketflow">
          <DropdownMenuItem className="cursor-pointer gap-2">
            <Sparkles className="w-4 h-4 text-[hsl(var(--bronze))]" aria-hidden="true" />
            MarketFlow
          </DropdownMenuItem>
        </Link>
        <Link href="/marketflow/dashboard">
          <DropdownMenuItem className="cursor-pointer gap-2">
            <BarChart3 className="w-4 h-4" aria-hidden="true" />
            My Dashboard
          </DropdownMenuItem>
        </Link>
        <Link href="/marketflow/messages">
          <DropdownMenuItem className="cursor-pointer gap-2">
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            Messages
          </DropdownMenuItem>
        </Link>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <Link href="/marketflow/admin">
              <DropdownMenuItem className="cursor-pointer gap-2">
                <Shield className="w-4 h-4" aria-hidden="true" />
                Admin
                <Badge variant="outline" className="ml-auto text-[10px]">Staff</Badge>
              </DropdownMenuItem>
            </Link>
          </>
        )}
        <DropdownMenuSeparator />
        <Link href="/marketflow/settings">
          <DropdownMenuItem className="cursor-pointer gap-2">
            <Settings className="w-4 h-4" aria-hidden="true" />
            Settings
          </DropdownMenuItem>
        </Link>
        <a href="/api/logout">
          <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive">
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign Out
          </DropdownMenuItem>
        </a>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, profile, isAuthenticated, isAdmin } = useSupabaseAuth();

  const isHomePage = location === "/";
  // On home, the hero is dark, so the nav floats on a dark surface until scroll.
  // On every other page the nav sits on a light surface from the start.
  const onLightSurface = scrolled || !isHomePage;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkBase =
    "px-3 py-2 text-[13px] tracking-[0.04em] font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))] focus-visible:ring-offset-2";

  const renderNavLink = (item: NavItem, isMobile = false) => {
    const className = isMobile
      ? "block py-3 text-base font-medium text-[hsl(var(--ink))] hover:text-[hsl(var(--bronze))] transition-colors"
      : `${navLinkBase} ${
          onLightSurface
            ? "text-[hsl(var(--ink))] hover:text-[hsl(var(--bronze))]"
            : "text-white/85 hover:text-white"
        }`;
    const testId = `link-nav-${item.label.toLowerCase()}`;
    if (item.useAnchor) {
      // Use a real anchor so browsers can navigate cross-page to the hash target.
      return (
        <a
          key={item.label}
          href={item.href}
          className={className}
          data-testid={testId}
          onClick={() => isMobile && setMobileOpen(false)}
        >
          {item.label}
        </a>
      );
    }
    return (
      <Link
        key={item.label}
        href={item.href}
        className={className}
        data-testid={testId}
        onClick={() => isMobile && setMobileOpen(false)}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <CommandPalette />
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          onLightSurface
            ? "bg-[hsl(var(--paper)/0.92)] backdrop-blur-md border-b border-[hsl(var(--rule))]"
            : "bg-gradient-to-b from-black/45 via-black/20 to-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 lg:h-[72px] flex items-center justify-between gap-6">
          {/* Wordmark — semantic <a>, NOT an <h1> */}
          <Link
            href="/"
            className="flex items-center gap-3 flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))] focus-visible:ring-offset-2 rounded-sm"
            aria-label="Pegasus DreamScapes — home"
            data-testid="link-logo"
          >
            <img
              src={logoImage}
              alt=""
              aria-hidden="true"
              className="h-9 lg:h-10 w-auto"
            />
            <span className="hidden sm:flex flex-col leading-tight">
              <span
                className={`font-display text-[15px] lg:text-base tracking-[0.14em] uppercase ${
                  onLightSurface ? "text-[hsl(var(--ink))]" : "text-white"
                }`}
              >
                Pegasus DreamScapes
              </span>
              <span
                className={`text-[10px] tracking-[0.28em] uppercase font-supporting ${
                  onLightSurface ? "text-[hsl(var(--bronze))]" : "text-[hsl(var(--bronze-soft))]"
                }`}
              >
                The Deal Architect
              </span>
            </span>
          </Link>

          {/* Desktop nav — 5 noun items */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Primary navigation"
          >
            {NAV_ITEMS.map((item) => renderNavLink(item))}
          </nav>

          {/* Right cluster — public state is exactly: bronze CTA. Auth state adds account utilities. */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationBell onLightSurface={onLightSurface} />
                <UserMenu
                  profile={profile}
                  userEmail={user?.email || ""}
                  onLightSurface={onLightSurface}
                  isAdmin={isAdmin}
                />
              </>
            ) : (
              <Link href={PRIMARY_CTA.href} className="hidden sm:block">
                <Button
                  size="sm"
                  className="bg-[hsl(var(--bronze))] hover:bg-[hsl(var(--bronze))]/90 text-white text-[12px] uppercase tracking-[0.14em] font-semibold px-5 h-10 rounded-sm shadow-sm shadow-black/10 focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))] focus-visible:ring-offset-2"
                  data-testid="button-nav-cta"
                >
                  {PRIMARY_CTA.label}
                  <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                </Button>
              </Link>
            )}

            {/* Mobile menu trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className={`lg:hidden p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))] focus-visible:ring-offset-2 ${
                    onLightSurface
                      ? "text-[hsl(var(--ink))] hover:bg-[hsl(var(--ink)/0.04)]"
                      : "text-white hover:bg-white/10"
                  }`}
                  aria-label="Open navigation menu"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="w-5 h-5" aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:max-w-sm bg-[hsl(var(--paper))] border-l border-[hsl(var(--rule))] flex flex-col"
              >
                <VisuallyHidden>
                  <SheetTitle>Site navigation</SheetTitle>
                  <SheetDescription>Primary links and account actions</SheetDescription>
                </VisuallyHidden>

                <div className="flex items-center justify-between pb-6 border-b border-[hsl(var(--rule))]">
                  <span className="font-display text-sm tracking-[0.18em] uppercase text-[hsl(var(--ink))]">
                    Pegasus DreamScapes
                  </span>
                </div>

                <nav className="flex-1 py-6 overflow-y-auto" aria-label="Mobile navigation">
                  <ul className="space-y-1">
                    {NAV_ITEMS.map((item) => (
                      <li key={item.label}>{renderNavLink(item, true)}</li>
                    ))}
                  </ul>

                  <div className="mt-8 pt-6 border-t border-[hsl(var(--rule))]">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--muted-text))] font-supporting font-semibold mb-3">More</p>
                    <ul className="space-y-1">
                      <li>
                        <Link
                          href="/marketflow"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between py-3 text-base font-medium text-[hsl(var(--ink))] hover:text-[hsl(var(--bronze))] transition-colors"
                          data-testid="link-mobile-marketflow"
                        >
                          MarketFlow
                          <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wider bg-[hsl(var(--bronze)/0.1)] text-[hsl(var(--bronze))] rounded">BETA</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/resources"
                          onClick={() => setMobileOpen(false)}
                          className="block py-3 text-base font-medium text-[hsl(var(--ink))] hover:text-[hsl(var(--bronze))] transition-colors"
                          data-testid="link-mobile-strategy-library"
                        >
                          Strategy Library
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/vendor-network"
                          onClick={() => setMobileOpen(false)}
                          className="block py-3 text-base font-medium text-[hsl(var(--ink))] hover:text-[hsl(var(--bronze))] transition-colors"
                          data-testid="link-mobile-vendor-network"
                        >
                          Vendor Network
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/contact"
                          onClick={() => setMobileOpen(false)}
                          className="block py-3 text-base font-medium text-[hsl(var(--ink))] hover:text-[hsl(var(--bronze))] transition-colors"
                          data-testid="link-mobile-contact"
                        >
                          Contact
                        </Link>
                      </li>
                    </ul>
                  </div>
                </nav>

                <div className="pt-6 border-t border-[hsl(var(--rule))] space-y-4">
                  <Link href={PRIMARY_CTA.href} onClick={() => setMobileOpen(false)}>
                    <Button
                      className="w-full bg-[hsl(var(--bronze))] hover:bg-[hsl(var(--bronze))]/90 text-white text-[12px] uppercase tracking-[0.14em] font-semibold h-11 rounded-sm"
                      data-testid="button-mobile-cta"
                    >
                      {PRIMARY_CTA.label}
                      <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                    </Button>
                  </Link>
                  {!isAuthenticated && (
                    <a
                      href="/api/login"
                      className="flex items-center justify-center gap-2 text-sm text-[hsl(var(--muted-text))] hover:text-[hsl(var(--ink))] transition-colors"
                      data-testid="link-mobile-login"
                    >
                      <LogIn className="w-4 h-4" aria-hidden="true" />
                      Sign In
                    </a>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
