import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
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
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import {
  NAV_PRIMARY,
  NAV_MORE,
  PRIMARY_CTA,
  type NavPrimaryItem,
} from "@/config/navigation";

// Empire Doctrine v1.0.1: five-item primary nav + "Submit a Property" CTA.
// No header More dropdown. Mobile sheet exposes NAV_PRIMARY + NAV_MORE.
// Footer separately mirrors both. Source of truth: @/config/navigation.

type NavItem = NavPrimaryItem;
const NAV_ITEMS: NavItem[] = NAV_PRIMARY;
const MORE_ITEMS = NAV_MORE;

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
          className={`relative p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            onLightSurface
              ? "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]"
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
          className={`flex items-center gap-2 p-1 pr-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            onLightSurface
              ? "border border-border hover:bg-foreground/[0.04]"
              : "border border-white/20 hover:bg-white/10"
          }`}
          data-testid="button-user-menu"
          aria-label="Open account menu"
        >
          <Avatar className="w-7 h-7">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className={`w-3 h-3 ${onLightSurface ? "text-muted-foreground" : "text-white/70"}`} aria-hidden="true" />
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
            <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
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
                <Shield className="w-4 h-4 text-primary" aria-hidden="true" />
                Admin
              </DropdownMenuItem>
            </Link>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="cursor-pointer gap-2 text-destructive">
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navigation() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, isAuthenticated, isAdmin } = useSupabaseAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Force the transparent-over-hero variant only on the homepage hero.
  const isHomepage = location === "/";
  const onLightSurface = !isHomepage || scrolled;

  const handleSignOut = async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  const headerBg = onLightSurface
    ? "bg-background/95 border-b border-border backdrop-blur-md"
    : "bg-transparent border-b border-transparent";
  const linkBase = onLightSurface ? "text-foreground" : "text-white";
  const linkMuted = onLightSurface ? "text-muted-foreground" : "text-white/80";

  function renderNavLink(item: NavItem, mobile = false) {
    const active = isItemActive(item, location);
    const base = mobile
      ? "flex items-center justify-between px-4 py-3 text-base"
      : "px-3 py-2 text-[13px] tracking-wide";
    return (
      <Link
        key={item.label}
        href={item.href}
        onClick={() => mobile && setMobileOpen(false)}
        aria-current={active ? "page" : undefined}
        className={`${base} rounded-sm transition-colors ${
          active
            ? mobile
              ? "border-l-2 border-primary text-foreground font-semibold bg-primary/5"
              : `${linkBase} font-semibold border-b-2 border-primary -mb-px`
            : `${mobile ? "text-foreground" : linkMuted} hover:text-primary`
        }`}
        data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-40 transition-colors duration-200 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 lg:h-20 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Pegasus DreamScapes home">
            <span
              className={`font-serif text-xl lg:text-[22px] tracking-tight font-semibold ${
                onLightSurface ? "text-foreground" : "text-white"
              }`}
              data-testid="text-nav-brand"
            >
              Pegasus DreamScapes
            </span>
            <span
              className={`hidden lg:inline-block text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold pl-3 ml-3 border-l ${
                onLightSurface
                  ? "text-muted-foreground border-border"
                  : "text-white/70 border-white/30"
              }`}
              data-testid="text-nav-tagline"
            >
              The Deal Architect
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {NAV_ITEMS.map((item) => renderNavLink(item))}
          </nav>

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
              <Link href={PRIMARY_CTA.href} className="hidden sm:block">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.14em] font-semibold px-5 h-10 rounded-sm"
                  data-testid="button-nav-cta"
                >
                  {PRIMARY_CTA.label}
                  <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                </Button>
              </Link>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className={`lg:hidden p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    onLightSurface
                      ? "text-foreground hover:bg-foreground/[0.04]"
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
                className="w-full sm:max-w-sm bg-background border-l border-border flex flex-col"
              >
                <VisuallyHidden>
                  <SheetTitle>Site navigation</SheetTitle>
                  <SheetDescription>Primary links and account actions</SheetDescription>
                </VisuallyHidden>

                <div className="flex items-center justify-between pb-6 border-b border-border">
                  <span className="font-serif text-lg font-semibold text-foreground">
                    Pegasus DreamScapes
                  </span>
                </div>

                <nav className="flex-1 py-6 overflow-y-auto" aria-label="Mobile navigation">
                  <ul className="space-y-1">
                    {NAV_ITEMS.map((item) => (
                      <li key={item.label}>{renderNavLink(item, true)}</li>
                    ))}
                  </ul>

                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-supporting font-semibold mb-3">More</p>
                    <ul className="space-y-1">
                      {MORE_ITEMS.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-3 px-4 text-base font-medium text-foreground hover:text-primary transition-colors"
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
                            className="flex items-center gap-2 py-3 px-4 text-base font-medium text-foreground hover:text-primary transition-colors"
                            data-testid="link-mobile-signin"
                          >
                            <LogIn className="w-4 h-4" aria-hidden="true" />
                            Sign In
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                </nav>

                <div className="pt-6 border-t border-border">
                  <Link href={PRIMARY_CTA.href} onClick={() => setMobileOpen(false)}>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.14em] font-semibold h-11 rounded-sm"
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
