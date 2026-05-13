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
  LogOut,
  Shield,
  ArrowRight,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import logoImage from "@assets/image_1765405939117.png";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { CommandPalette } from "./command-palette";

type NavItem = { href: string; label: string; useAnchor?: boolean; matchPrefix?: string };
type MoreItem = { href: string; label: string; badge?: string };

// Locked Pass D grouping. Header desktop = 5 noun items + a "More" dropdown.
// Mobile sheet mirrors the same set under its "More" group for parity.
const NAV_ITEMS: NavItem[] = [
  { href: "/sell", label: "Approach", matchPrefix: "/sell" },
  { href: "/projects", label: "Projects", matchPrefix: "/projects" },
  { href: "/invest", label: "Capital", matchPrefix: "/invest" },
  { href: "/marketflow", label: "MarketFlow", matchPrefix: "/marketflow" },
  { href: "/about", label: "About", matchPrefix: "/about" },
];

const MORE_ITEMS: MoreItem[] = [
  { href: "/resources", label: "Strategy Library" },
  { href: "/calculators", label: "Calculators" },
  { href: "/vendor-network", label: "Vendor Network" },
  { href: "/contact", label: "Contact" },
  { href: "/disclosures", label: "Disclosures" },
];

const PRIMARY_CTA = { href: "/sell", label: "Start a Strategy Review" };

function isItemActive(item: NavItem, location: string): boolean {
  const prefix = item.matchPrefix ?? item.href;
  if (prefix === "/") return location === "/";
  return location === prefix || location.startsWith(prefix + "/");
}

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
    "relative px-3 py-2 text-[13px] tracking-[0.04em] font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))] focus-visible:ring-offset-2";

  const renderNavLink = (item: NavItem, isMobile = false) => {
    const active = isItemActive(item, location);
    // Active state keeps high-contrast ink/white text (WCAG AA) and uses the
    // copper underline + font weight for state. Bronze on cream is too light
    // for normal text contrast.
    const desktopColor = onLightSurface
      ? active
        ? "text-[hsl(var(--ink))] font-semibold"
        : "text-[hsl(var(--ink))] hover:text-[hsl(var(--bronze))]"
      : active
        ? "text-white font-semibold"
        : "text-white/85 hover:text-white";
    const className = isMobile
      ? `relative block py-3 text-base transition-colors ${
          active
            ? "text-[hsl(var(--ink))] font-semibold border-l-2 border-[hsl(var(--bronze))] pl-3"
            : "text-[hsl(var(--ink))] font-medium hover:text-[hsl(var(--bronze))]"
        }`
      : `${navLinkBase} ${desktopColor}`;
    const testId = `link-nav-${item.label.toLowerCase()}`;
    const ariaCurrent = active ? "page" : undefined;
    const underline = !isMobile && active ? (
      <span
        aria-hidden="true"
        className={`absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full ${
          onLightSurface ? "bg-[hsl(var(--bronze))]" : "bg-white"
        }`}
      />
    ) : null;
    if (item.useAnchor) {
      // Use a real anchor so browsers can navigate cross-page to the hash target.
      return (
        <a
          key={item.label}
          href={item.href}
          className={className}
          data-testid={testId}
          aria-current={ariaCurrent}
          onClick={() => isMobile && setMobileOpen(false)}
        >
          {item.label}
          {underline}
        </a>
      );
    }
    return (
      <Link
        key={item.label}
        href={item.href}
        className={className}
        data-testid={testId}
        aria-current={ariaCurrent}
        onClick={() => isMobile && setMobileOpen(false)}
      >
        {item.label}
        {underline}
      </Link>
    );
  };

  const moreActive = MORE_ITEMS.some((m) => location === m.href || location.startsWith(m.href + "/"));
  const moreDesktopColor = onLightSurface
    ? moreActive
      ? "text-[hsl(var(--ink))] font-semibold"
      : "text-[hsl(var(--ink))] hover:text-[hsl(var(--bronze))]"
    : moreActive
      ? "text-white font-semibold"
      : "text-white/85 hover:text-white";

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

          {/* Desktop nav — 5 noun items + More dropdown */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Primary navigation"
          >
            {NAV_ITEMS.map((item) => {
              if (item.label !== "MarketFlow") return renderNavLink(item);
              const active = isItemActive(item, location);
              const colorClass = onLightSurface
                ? active
                  ? "text-[hsl(var(--ink))] font-semibold"
                  : "text-[hsl(var(--ink))] hover:text-[hsl(var(--bronze))]"
                : active
                  ? "text-white font-semibold"
                  : "text-white/85 hover:text-white";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${navLinkBase} ${colorClass} inline-flex items-center gap-1.5`}
                  data-testid="link-nav-marketflow"
                  aria-current={active ? "page" : undefined}
                >
                  MarketFlow
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wider bg-[hsl(var(--bronze)/0.15)] text-[hsl(var(--bronze))] rounded">
                    BETA
                  </span>
                  {active && (
                    <span
                      aria-hidden="true"
                      className={`absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full ${
                        onLightSurface ? "bg-[hsl(var(--bronze))]" : "bg-white"
                      }`}
                    />
                  )}
                </Link>
              );
            })}

            {/* More dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`${navLinkBase} ${moreDesktopColor} inline-flex items-center gap-1`}
                  data-testid="button-nav-more"
                  aria-label="More navigation"
                >
                  More
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  {moreActive && (
                    <span
                      aria-hidden="true"
                      className={`absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full ${
                        onLightSurface ? "bg-[hsl(var(--bronze))]" : "bg-white"
                      }`}
                    />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {MORE_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      data-testid={`link-nav-more-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  </Link>
                ))}
                {!isAuthenticated && (
                  <>
                    <DropdownMenuSeparator />
                    <a href="/api/login">
                      <DropdownMenuItem className="cursor-pointer gap-2" data-testid="link-nav-more-signin">
                        <LogIn className="w-4 h-4" aria-hidden="true" />
                        Sign In
                      </DropdownMenuItem>
                    </a>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
                      {MORE_ITEMS.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-3 text-base font-medium text-[hsl(var(--ink))] hover:text-[hsl(var(--bronze))] transition-colors"
                            data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                      {!isAuthenticated && (
                        <li>
                          <a
                            href="/api/login"
                            className="flex items-center gap-2 py-3 text-base font-medium text-[hsl(var(--ink))] hover:text-[hsl(var(--bronze))] transition-colors"
                            data-testid="link-mobile-signin"
                          >
                            <LogIn className="w-4 h-4" aria-hidden="true" />
                            Sign In
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                </nav>

                <div className="pt-6 border-t border-[hsl(var(--rule))]">
                  <Link href={PRIMARY_CTA.href} onClick={() => setMobileOpen(false)}>
                    <Button
                      className="w-full bg-[hsl(var(--bronze))] hover:bg-[hsl(var(--bronze))]/90 text-white text-[12px] uppercase tracking-[0.14em] font-semibold h-11 rounded-sm"
                      data-testid="button-mobile-cta"
                    >
                      {PRIMARY_CTA.label}
                      <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
