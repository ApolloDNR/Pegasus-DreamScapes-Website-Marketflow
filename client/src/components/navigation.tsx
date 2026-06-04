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
  BookOpen,
  Calculator,
  Network,
  Mail,
  FileText,
  ClipboardCheck,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import logoImage from "@/assets/brand/pegasus-mark-full.png";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { trackCtaClick } from "@/lib/analytics";
import { CommandPalette } from "./command-palette";
import {
  NAV_PRIMARY,
  NAV_MORE,
  PRIMARY_CTA,
  type NavPrimaryItem,
} from "@/config/navigation";

// Locked Pass D grouping. Header desktop = 5 noun items + a "More" dropdown.
// Mobile sheet mirrors the same set under its "More" group for parity.
// The canonical lists live in `@/config/navigation` so the desktop header,
// mobile sheet, and footer all read from one source of truth (verified by
// `client/src/__tests__/nav-parity.test.tsx`).
type NavItem = NavPrimaryItem & { useAnchor?: boolean };
const NAV_ITEMS: NavItem[] = NAV_PRIMARY;
const MORE_ITEMS = NAV_MORE;
const DESKTOP_LABELS: Record<string, string> = {};

// Editorial metadata for the More mega-menu. Keys must match NAV_MORE hrefs.
// Tested separately by `nav-parity.test.tsx` which only asserts label presence,
// so adding icons + taglines stays within guardrails.
const MORE_META: Record<string, { icon: LucideIcon; tagline: string }> = {
  "/connect": {
    icon: MessageSquare,
    tagline: "The QR and card landing page for direct next steps.",
  },
  "/about": {
    icon: BookOpen,
    tagline: "The company, the founder, and the operating doctrine.",
  },
  "/ecosystem": {
    icon: Layers,
    tagline: "How Strategy Lab, Peggy, MarketFlow, and HQ fit together.",
  },
  "/dreamscaper-standard": {
    icon: ClipboardCheck,
    tagline: "The commitments behind every review and routed outcome.",
  },
  "/peggy-ai": {
    icon: Sparkles,
    tagline: "Pegasus's AI strategy assistant and public guidance layer.",
  },
  "/vendor-network": {
    icon: Network,
    tagline: "Trusted operators, trades, and capital partners.",
  },
  "/contact": {
    icon: Mail,
    tagline: "Reach Apollo and the strategy desk directly.",
  },
  "/disclosures": {
    icon: FileText,
    tagline: "DRE, KW East Bay, Equal Housing, and securities-safe language.",
  },
};

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
  onSignOut,
}: {
  profile: any;
  userEmail: string;
  onLightSurface: boolean;
  isAdmin: boolean;
  onSignOut: () => void;
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
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
          onSelect={(event) => {
            event.preventDefault();
            onSignOut();
          }}
          data-testid="button-user-menu-signout"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user, profile, isAuthenticated, isAdmin, signOut } = useSupabaseAuth();

  const handleSignOut = async () => {
    // Clear the SPA's Supabase session first, then hand off to the
    // server-side Replit OIDC end-session flow at /api/logout. The app
    // treats Replit Auth as the primary session source (see
    // `supabase-auth-context.tsx`); doing only the Supabase signOut
    // would leave the server-backed OIDC session active and the user
    // would silently re-authenticate on next request.
    try {
      await signOut();
    } catch {
      // Continue to server logout even if client signOut fails.
    }
    if (typeof window !== "undefined") {
      window.location.assign("/api/logout");
    } else {
      navigate("/");
    }
  };

  // The public shell now stays on a single dark glass surface so route changes
  // feel steady and the header never flashes from cream to navy mid-scroll.
  const onLightSurface = false;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkBase =
    "relative whitespace-nowrap px-2.5 py-2 text-[12px] tracking-[0.03em] font-semibold rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))] focus-visible:ring-offset-2";

  const renderNavLink = (item: NavItem, isMobile = false) => {
    const active = isItemActive(item, location);
    // Active state keeps high-contrast ink/white text (WCAG AA) and uses the
    // copper underline + font weight for state. Bronze on cream is too light
    // for normal text contrast.
    const desktopColor = "!text-white hover:!text-white";
    const className = isMobile
      ? `relative block rounded-sm px-4 py-3 text-base transition-colors ${
          active
            ? "bg-white/[0.06] text-white font-semibold border-l-2 border-[hsl(var(--bronze))]"
            : "text-cream/80 font-medium hover:bg-white/[0.04] hover:text-white"
        }`
      : `${navLinkBase} ${desktopColor}`;
    const testId = `link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
    const ariaCurrent = active ? "page" : undefined;
    const underline = !isMobile && active ? (
      <span
        aria-hidden="true"
        className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-[hsl(var(--bronze))]"
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
          {isMobile ? item.label : DESKTOP_LABELS[item.href] ?? item.label}
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
        {isMobile ? item.label : DESKTOP_LABELS[item.href] ?? item.label}
        {underline}
      </Link>
    );
  };

  const moreActive = MORE_ITEMS.some((m) => location === m.href || location.startsWith(m.href + "/"));
  const moreDesktopColor = "!text-white hover:!text-white";

  return (
    <>
      <CommandPalette />
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b border-white/10 transition-all duration-300 ${
          scrolled
            ? "bg-[hsl(var(--navy)/0.96)] shadow-[0_20px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl"
            : "bg-[hsl(var(--navy)/0.84)] backdrop-blur-md"
        }`}
      >
        <div className="relative mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-6 lg:h-[80px] lg:px-10">
          {/* Wordmark — semantic <a>, NOT an <h1> */}
          <Link
            href="/"
            className="flex min-w-0 max-w-[calc(100vw-6.5rem)] flex-1 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))] focus-visible:ring-offset-2 sm:max-w-none sm:flex-none sm:flex-shrink-0 lg:gap-4 group"
            aria-label="Pegasus Dreamscapes home"
            data-testid="link-logo"
          >
            <img
              src={logoImage}
              alt=""
              aria-hidden="true"
              className={`hidden h-11 w-auto transition-transform duration-300 group-hover:scale-[1.03] sm:block lg:h-12 ${
                onLightSurface
                  ? "[filter:drop-shadow(0_2px_4px_rgba(13,27,45,0.18))]"
                  : "[filter:drop-shadow(0_3px_8px_rgba(0,0,0,0.45))]"
              }`}
            />
            <span
              className={`hidden sm:block h-9 lg:h-10 w-px ${
                onLightSurface
                  ? "bg-gradient-to-b from-transparent via-[hsl(var(--bronze)/0.5)] to-transparent"
                  : "bg-gradient-to-b from-transparent via-[hsl(var(--bronze-soft)/0.65)] to-transparent"
              }`}
              aria-hidden="true"
            />
            <span className="flex min-w-0 flex-col leading-tight">
              <span
                className={`truncate font-display text-[13px] tracking-[0.12em] sm:text-[14px] sm:tracking-[0.16em] lg:text-[16px] ${
                  onLightSurface ? "text-[hsl(var(--ink))]" : "text-white"
                }`}
              >
                Pegasus Dreamscapes
              </span>
              <span
                className={`mt-1 truncate font-supporting text-[8px] uppercase tracking-[0.24em] sm:text-[9px] sm:tracking-[0.32em] lg:text-[10px] ${
                  onLightSurface ? "text-[hsl(var(--bronze))]" : "text-[hsl(var(--bronze-soft))]"
                }`}
              >
                The Deal Architect
              </span>
            </span>
          </Link>

          {/* Desktop nav — 5 noun items + More dropdown */}
          <nav
            className="hidden xl:flex items-center gap-0.5"
            aria-label="Primary navigation"
          >
            {NAV_ITEMS.map((item) => {
              if (item.label !== "MarketFlow") return renderNavLink(item);
              const active = isItemActive(item, location);
              const colorClass = "!text-white hover:!text-white";
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${navLinkBase} ${colorClass} inline-flex items-center gap-1.5`}
                  data-testid="link-nav-marketflow"
                  aria-current={active ? "page" : undefined}
                >
                  MarketFlow
                  <span className="rounded-sm border border-[hsl(var(--bronze)/0.35)] bg-[hsl(var(--bronze)/0.12)] px-1.5 py-0.5 text-[8px] font-semibold tracking-wider text-[hsl(var(--bronze))]">
                    BETA
                  </span>
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-[hsl(var(--bronze))]"
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
                      className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-[hsl(var(--bronze))]"
                    />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="w-[410px] overflow-hidden rounded-sm border border-white/10 bg-[hsl(var(--navy))] p-0 text-cream shadow-[0_30px_80px_-20px_rgba(0,0,0,0.72),0_0_0_1px_rgba(199,122,58,0.16)]"
              >
                {/* Editorial header */}
                <div className="relative px-5 pt-5 pb-4 bg-white/[0.035]">
                  <span aria-hidden="true" className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-1.5">
                    More from Pegasus
                  </p>
                  <p className="font-serif text-base text-white leading-snug">
                    Tools, the network, and the fine print.
                  </p>
                </div>

                {/* Items */}
                <div className="py-2">
                  {MORE_ITEMS.map((item) => {
                    const meta = MORE_META[item.href];
                    const Icon = meta?.icon ?? BookOpen;
                    const testid = `link-nav-more-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
                    return (
                      <Link key={item.href} href={item.href}>
                        <DropdownMenuItem
                          className="group cursor-pointer rounded-none border-l-2 border-transparent px-5 py-3 focus:border-[hsl(var(--bronze))] focus:bg-white/[0.06] data-[highlighted]:border-[hsl(var(--bronze))] data-[highlighted]:bg-white/[0.06]"
                          data-testid={testid}
                        >
                          <div className="flex items-start gap-3.5 w-full">
                            <div className="flex-shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-sm border border-primary/25 bg-white/[0.035] transition-colors duration-200 group-hover:border-primary/55 group-hover:bg-white/[0.07]">
                              <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-serif text-[15px] font-semibold text-white leading-none">
                                  {item.label}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" aria-hidden="true" />
                              </div>
                              {meta?.tagline && (
              <p className="mt-1 text-xs text-cream/70 leading-snug">
                                  {meta.tagline}
                                </p>
                              )}
                            </div>
                          </div>
                        </DropdownMenuItem>
                      </Link>
                    );
                  })}
                </div>

                {!isAuthenticated && (
                  <div className="relative px-5 py-3 bg-white/[0.025]">
                    <span aria-hidden="true" className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <Link href="/login" className="block">
                      <DropdownMenuItem
                        className="cursor-pointer gap-2 rounded-sm px-3 py-2 text-cream hover:bg-white/[0.04] focus:bg-white/[0.06] focus:ring-2 focus:ring-[hsl(var(--bronze))] focus:ring-offset-1 focus:ring-offset-[hsl(var(--navy))]"
                        data-testid="link-nav-more-signin"
                      >
                        <LogIn className="w-4 h-4 text-primary" aria-hidden="true" />
                        <span className="text-[10px] uppercase tracking-[0.25em] font-supporting font-semibold">
                          Sign In
                        </span>
                      </DropdownMenuItem>
                    </Link>
                  </div>
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
                  onSignOut={handleSignOut}
                />
              </>
            ) : (
              <Link
                href={PRIMARY_CTA.href}
                className="hidden xl:block"
                onClick={() => trackCtaClick("nav_desktop", PRIMARY_CTA.label, PRIMARY_CTA.href)}
              >
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
                  className={`fixed right-5 top-4 z-[80] inline-flex h-10 w-10 items-center justify-center rounded-sm border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))] focus-visible:ring-offset-2 sm:right-6 lg:top-5 xl:hidden ${
                    onLightSurface
                      ? "border-[hsl(var(--rule))] text-[hsl(var(--ink))] hover:bg-[hsl(var(--ink)/0.04)]"
                      : "border-white/15 bg-white/[0.03] text-white hover:border-[hsl(var(--bronze)/0.55)] hover:bg-white/10"
                  }`}
                  aria-label="Open navigation menu"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="w-5 h-5" aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-full flex-col border-l border-white/10 bg-[hsl(var(--navy))] text-cream sm:max-w-sm"
              >
                <VisuallyHidden>
                  <SheetTitle>Site navigation</SheetTitle>
                  <SheetDescription>Primary links and account actions</SheetDescription>
                </VisuallyHidden>

                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div className="flex items-center gap-3">
                    <img src={logoImage} alt="" aria-hidden="true" className="h-10 w-auto [filter:drop-shadow(0_3px_8px_rgba(0,0,0,0.35))]" />
                    <span className="font-display text-sm tracking-[0.16em] text-white">
                      Pegasus Dreamscapes
                    </span>
                  </div>
                </div>

                <nav className="flex-1 py-6 overflow-y-auto" aria-label="Mobile navigation">
                  <ul className="space-y-1">
                    {NAV_ITEMS.map((item) => (
                      <li key={item.label}>{renderNavLink(item, true)}</li>
                    ))}
                  </ul>

                  {/* Wave 2 — single "More" accordion mirroring desktop IA.
                      Uses native <details> so children stay in DOM when
                      collapsed (nav-parity test queries by testId). */}
                  <details open className="group mt-8 border-t border-white/10 pt-6" data-testid="mobile-more-accordion">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-sm py-2 font-supporting text-[11px] font-semibold uppercase tracking-[0.24em] text-cream/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--bronze))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--navy))]">
                      <span>More</span>
                      <ChevronDown className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <ul className="space-y-1 pt-2">
                      {MORE_ITEMS.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="block rounded-sm px-4 py-3 text-base font-medium text-cream/80 transition-colors hover:bg-white/[0.04] hover:text-white"
                            data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                      {!isAuthenticated && (
                        <li>
                          <Link
                            href="/login"
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 rounded-sm px-4 py-3 text-base font-medium text-cream/80 transition-colors hover:bg-white/[0.04] hover:text-white"
                            data-testid="link-mobile-signin"
                          >
                            <LogIn className="w-4 h-4" aria-hidden="true" />
                            Sign In
                          </Link>
                        </li>
                      )}
                    </ul>
                  </details>
                </nav>

                <div className="border-t border-white/10 pt-6">
                  <Link
                    href={PRIMARY_CTA.href}
                    onClick={() => {
                      trackCtaClick("nav_mobile", PRIMARY_CTA.label, PRIMARY_CTA.href);
                      setMobileOpen(false);
                    }}
                  >
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
