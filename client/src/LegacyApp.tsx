import { useEffect, Suspense, lazy, type ReactNode } from "react";
import { Switch, Route, Redirect, useLocation, useSearch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PeggyProvider } from "@/contexts/peggy-context";
import { PeggyDock } from "@/components/peggy-dock";
import { PeggyPublicNote } from "@/components/peggy-public-note";
import { SupabaseAuthProvider } from "@/contexts/supabase-auth-context";
import { DealActionProvider } from "@/contexts/deal-action-context";
import { DemoModeProvider } from "@/contexts/demo-mode-context";
import { ErrorBoundary, PageLoader } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { NotificationProvider } from "@/contexts/notification-context";
import { SiteContentProvider } from "@/contexts/site-content-context";
import { EditModeProvider } from "@/contexts/edit-mode-context";
import { AdminBar } from "@/components/AdminBar";
import { AnonymousClaimWatcher } from "@/components/anonymous-claim-watcher";
import { AuthGuard } from "@/components/auth-guard";
import { CookieConsent } from "@/components/cookie-consent";
import { initAnalytics } from "@/lib/analytics";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { Landing as PegasusSite } from "@/pegasus/Landing";
import { PEGASUS_URLS, isSolidNavUrl } from "@/pegasus/routes";
import { PegasusStandaloneShell } from "@/pegasus/standalone-shell";
import { classifyShellMode } from "@/lib/shell-mode";
import type { ShellMode } from "@/lib/shell-mode";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import {
  appendRedirectSearch,
  LEGACY_SPA_EXACT_REDIRECTS,
  LEGACY_SPA_PREFIX_REDIRECTS,
  QUERY_PRESERVING_INTAKE_PATHS,
} from "@shared/redirects";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);

  return null;
}

function QueryPreservingRedirect({ to }: { to: string }) {
  const search = useSearch();
  return <Redirect to={appendRedirectSearch(to, search)} />;
}

// Website Brief v1.0 §11 — boot the consent-gated Plausible loader once
// per app instance; it idempotently injects or removes the script based
// on the current `pegasus-cookie-consent` state and the
// `pegasus:consent-changed` event.
function AnalyticsBoot() {
  useEffect(() => initAnalytics(), []);
  return null;
}

// Empire Doctrine v1.0.1 — Peggy is internal-only on the public surface.
// Gate the floating dock to authenticated visitors so logged-out hero
// landings are not obscured by the chat orb.
function GuestEntry({
  role,
  to,
}: {
  role: import("@/lib/supabase").UserRole;
  to: string;
}) {
  const { enterGuestMode, isAuthenticated, isGuestMode } = useSupabaseAuth();
  useEffect(() => {
    if (!isAuthenticated && !isGuestMode) {
      enterGuestMode(role);
    }
  }, [enterGuestMode, isAuthenticated, isGuestMode, role]);
  return <Redirect to={to} />;
}

// Empire Doctrine Amendment 2 §D / launch gate #4 — Peggy is either
// responsive or hidden, never a broken state. Authenticated operators
// get the full conversational dock; public visitors get the
// "leave a note" public dock so the floating widget never bounces.
function AuthGatedPeggyDock() {
  const { isAuthenticated } = useSupabaseAuth();
  if (isAuthenticated) return <PeggyDock />;
  return <PeggyPublicNote />;
}
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";

const About = lazy(() => import("@/pages/about"));
const Development = lazy(() => import("@/pages/development"));
const Sell = lazy(() => import("@/pages/sell"));
const Invest = lazy(() => import("@/pages/invest"));
const Projects = lazy(() => import("@/pages/projects"));
const ProjectDetail = lazy(() => import("@/pages/project-detail"));
const Calculators = lazy(() => import("@/pages/calculators"));
const StrategyLabLibrary = lazy(() => import("@/pages/strategy-lab-library"));
const StrategyLabSubmitted = lazy(() => import("@/pages/strategy-lab-submitted"));
const StrategyLabBlueprintConfirmed = lazy(() => import("@/pages/strategy-lab-blueprint-confirmed"));
const AdminStrategyLab = lazy(() => import("@/pages/admin-strategy-lab"));
const AdminVendors = lazy(() => import("@/pages/admin-vendors"));
const AdminCtaEvents = lazy(() => import("@/pages/admin-cta-events"));
const AdminHqOutbox = lazy(() => import("@/pages/admin-hq-outbox"));
const AdminPeggyConversations = lazy(() => import("@/pages/admin-peggy-conversations"));
const SnapshotProperty = lazy(() => import("@/pages/snapshot-property"));
const SubmitPropertyPage = lazy(() => import("@/pages/submit-property"));
const PegasusStandardPage = lazy(() => import("@/pages/pegasus-standard"));
const DepartmentsPage = lazy(() => import("@/pages/departments"));
const CaseStudyPage = lazy(() => import("@/pages/case-study"));
const CapitalPage = lazy(() => import("@/pages/capital"));
const ConnectPage = lazy(() => import("@/pages/connect"));
const NelsonDrPage = lazy(() => import("@/pages/project-nelson-dr"));
const MarketflowAccess = lazy(() => import("@/pages/marketflow-access"));
const MarketflowBuyboxes = lazy(() => import("@/pages/marketflow-buyboxes"));
const Contact = lazy(() => import("@/pages/contact"));
const DealflowProject = lazy(() => import("@/pages/dealflow-project"));
const DealflowCommunity = lazy(() => import("@/pages/dealflow-community"));
const DealflowMessages = lazy(() => import("@/pages/dealflow-messages"));
const UserProfile = lazy(() => import("@/pages/user-profile"));
const MarketplaceWholesaler = lazy(() => import("@/pages/marketplace-wholesaler"));
const MarketplaceDreamscaper = lazy(() => import("@/pages/marketplace-dreamscaper"));
const MarketplaceInvestor = lazy(() => import("@/pages/marketplace-investor"));
const MarketplaceBuyer = lazy(() => import("@/pages/marketplace-buyer"));
const MarketplaceAdmin = lazy(() => import("@/pages/marketplace-admin"));
const MarketplaceDealDetail = lazy(() => import("@/pages/marketplace-deal-detail"));
const MarketplaceCapital = lazy(() => import("@/pages/marketplace-capital"));
const MarketplaceCapitalDetail = lazy(() => import("@/pages/marketplace-capital-detail"));
const MarketplaceProperties = lazy(() => import("@/pages/marketplace-properties"));
const MarketplacePropertyDetail = lazy(() => import("@/pages/marketplace-property-detail"));
const MarketplaceCalculators = lazy(() => import("@/pages/marketplace-calculators"));
const MarketplaceResources = lazy(() => import("@/pages/marketplace-resources"));
const MarketflowSubmit = lazy(() => import("@/pages/marketflow-submit"));
const MarketflowDeals = lazy(() => import("@/pages/marketflow-deals"));
const MarketflowNegotiate = lazy(() => import("@/pages/marketflow-negotiate"));
const MarketflowDashboard = lazy(() => import("@/pages/marketflow-dashboard"));
const MyDealsPage = lazy(() => import("@/pages/my-deals"));
const OfferStudioPage = lazy(() => import("@/pages/offer-studio"));
const MarketflowOfferStudio = lazy(() => import("@/pages/marketflow/offer-studio"));
const AnalyticsPage = lazy(() => import("@/pages/analytics"));
const MyAnalyticsPage = lazy(() => import("@/pages/my-analytics"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Disclosures = lazy(() => import("@/pages/disclosures"));
const SnapshotStatus = lazy(() => import("@/pages/snapshot-status"));
const SnapshotCalc = lazy(() => import("@/pages/snapshot-calc"));
const SnapshotCalcGate = lazy(() => import("@/pages/snapshot-calc-gate"));
const DealBlueprint = lazy(() => import("@/pages/deal-blueprint"));
const VendorNetwork = lazy(() => import("@/pages/vendor-network"));
const Systems = lazy(() => import("@/pages/systems"));
const Education = lazy(() => import("@/pages/education"));
const Ecosystem = lazy(() => import("@/pages/ecosystem"));
const FAQ = lazy(() => import("@/pages/faq"));

export const legacyRedirects: [string, string][] = [
  ...LEGACY_SPA_EXACT_REDIRECTS.map(([from, to]) => [from, to] as [string, string]),
  ...LEGACY_SPA_PREFIX_REDIRECTS.map(
    ([prefix, to]) => [`${prefix}/*`, to] as [string, string],
  ),
  // Public library retirement and calculator query behavior intentionally
  // remain specialized rather than becoming permanent shared 301 aliases.
  ["/library", "/strategy-lab"],
  ["/library/:slug", "/strategy-lab"],
  ["/resources", "/strategy-lab"],
  ["/education", "/strategy-lab"],
  ["/strategy-library", "/strategy-lab"],
  ["/calculators", "/strategy-lab?tool=calculators"],
];

export function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Switch>
      {/* Pegasus prototype public shell — owns these exact public URLs.
       * The self-contained <PegasusSite> renders its own nav/footer/Peggy,
       * so the global chrome is gated off for these paths in AppShell. */}
      {PEGASUS_URLS.map((url) => (
        <Route key={url} path={url} component={PegasusSite} />
      ))}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/about" component={About} />
      <Route path="/development" component={Development} />
      {/* Master Blueprint v5.1 (§31): "Bring an Opportunity" is the primary
       * public action — the canonical URL of the multi-step intake desk.
       * /submit-property 301s here via legacyRedirects. */}
      <Route path="/bring-an-opportunity" component={SubmitPropertyPage} />
      <Route path="/pegasus-standard" component={PegasusStandardPage} />
      <Route path="/departments" component={DepartmentsPage} />
      <Route path="/case-study" component={CaseStudyPage} />
      <Route path="/capital" component={CapitalPage} />
      <Route path="/connect" component={ConnectPage} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/nelson-dr" component={NelsonDrPage} />
      <Route path="/projects/:slug" component={ProjectDetail} />
      {/* Website Spec v4 — /strategy-lab is a live prototype shell page again
       * (mounted via PEGASUS_URLS above). The /strategy-lab/* tool subroutes
       * below stay live as their own standalone surfaces. */}
      <Route path="/strategy-lab/library" component={StrategyLabLibrary} />
      <Route path="/strategy-lab/submitted" component={StrategyLabSubmitted} />
      <Route path="/strategy-lab/blueprint-confirmed" component={StrategyLabBlueprintConfirmed} />
      <Route path="/admin/strategy-lab" component={AdminStrategyLab} />
      <Route path="/admin/vendors" component={AdminVendors} />
      <Route path="/admin/cta-events" component={AdminCtaEvents} />
      <Route path="/admin/hq-outbox" component={AdminHqOutbox} />
      <Route path="/admin/peggy/conversations" component={AdminPeggyConversations} />
      <Route path="/strategy-lab/classic" component={Calculators} />
      <Route path="/vendor-network" component={VendorNetwork} />
      {/* Restored to the live public surface: the full FAQ page (accordion +
       * FAQPage JSON-LD), fed by the shared/faq-data.ts source of truth. */}
      <Route path="/faq" component={FAQ} />
      {/* /ecosystem is a footer-linked surface. Website Spec v4 restores the
       * public /peggy page to a live prototype shell page (mounted via
       * PEGASUS_URLS above), alongside the in-shell Peggy concierge widget. */}
      <Route path="/ecosystem" component={Ecosystem} />
      {/* Website Spec v4 — Represent With Apollo is a live prototype shell page
       * again (mounted via PEGASUS_URLS above). The legacy /deal-architecture
       * URL 301s forward to /deal-strategy via legacyRedirects above. */}
      <Route path="/contact" component={Contact} />
      {/* Empire Doctrine v1.0.1 / Amendment 2: /systems, /education,
       * /calculators, /buyers, /wholesale, /capital-raising, /dreamspace
       * are removed from the public surface. /ecosystem is restored by
       * Amendment 2 §C as the footer-only Audience-B release valve. */}
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/disclosures" component={Disclosures} />
      {/*
       * /snapshot/calc/:token is the canonical share URL. The Gate probes
       * property-analyses first (Task #84) and falls back to legacy
       * calculator-share rendering. /snapshot/property/:token is kept as
       * a permanent alias so existing v1 links remain valid.
       */}
      <Route path="/snapshot/calc/:token" component={SnapshotCalcGate} />
      <Route path="/snapshot/property/:token" component={SnapshotProperty} />
      <Route path="/snapshot/:token" component={SnapshotStatus} />
      {/* Phase 2 Copy Proposal — Surface 3: /deal-blueprint is now a real
       * stub page (tier 03 of the Strategy Lab funnel) instead of a
       * redirect. Intake routes through /bring-an-opportunity?intent=blueprint,
       * which preserves Blueprint-specific HQ triage. */}
      <Route path="/deal-blueprint" component={DealBlueprint} />
      {/* Legacy /dashboard route. Kept as a redirect because the auth-aware
       * destination lives at /marketflow/dashboard; the role router there
       * forwards staff vs. operator vs. investor to the right surface. */}
      <Route path="/dashboard">{() => <Redirect to="/marketflow/dashboard" />}</Route>
      <Route path="/dealflow/project/:id">{() => <AuthGuard><DealflowProject /></AuthGuard>}</Route>

      {/* Legacy route redirects to MarketFlow - consolidated for maintainability */}
      {legacyRedirects.map(([from, to]) => (
        <Route key={from} path={from}>
          {() => QUERY_PRESERVING_INTAKE_PATHS.has(from)
            ? <QueryPreservingRedirect to={to} />
            : <Redirect to={to} />}
        </Route>
      ))}

      {/* MarketFlow Routes with Supabase Auth. Website Spec v4 restores the
       * public /marketflow landing as a live prototype shell page (mounted via
       * PEGASUS_URLS above). Its public access and criteria continuations use
       * the premium standalone shell; authenticated operator surfaces keep
       * their own product chrome. */}
      <Route path="/marketflow/access" component={MarketflowAccess} />
      {/* Website Structure v1 FINAL §7 — Pegasus Buyboxes moved off the
       * MarketFlow landing into a dedicated public surface. */}
      <Route path="/marketflow/buyboxes" component={MarketflowBuyboxes} />
      <Route path="/marketflow/wholesaler">{() => <AuthGuard><MarketplaceWholesaler /></AuthGuard>}</Route>
      <Route path="/marketflow/dreamscaper">{() => <AuthGuard><MarketplaceDreamscaper /></AuthGuard>}</Route>
      <Route path="/marketflow/investor">{() => <AuthGuard><MarketplaceInvestor /></AuthGuard>}</Route>
      <Route path="/marketflow/buyer/saved">{() => <AuthGuard><MarketplaceBuyer /></AuthGuard>}</Route>
      <Route path="/marketflow/buyer/offers">{() => <AuthGuard><MarketplaceBuyer /></AuthGuard>}</Route>
      <Route path="/marketflow/buyer">{() => <AuthGuard><MarketplaceBuyer /></AuthGuard>}</Route>
      <Route path="/marketflow/admin/:rest*">{() => <AuthGuard><MarketplaceAdmin /></AuthGuard>}</Route>
      <Route path="/marketflow/admin">{() => <AuthGuard><MarketplaceAdmin /></AuthGuard>}</Route>
      <Route path="/marketflow/discover">{() => <GuestEntry role="investor" to="/marketflow/deals" />}</Route>
      <Route path="/marketflow/calculators">{() => <AuthGuard><MarketplaceCalculators /></AuthGuard>}</Route>
      <Route path="/marketflow/resources">{() => <AuthGuard><MarketplaceResources /></AuthGuard>}</Route>
      {/* Empire Doctrine v1.0.1 — private MarketFlow surfaces. The public
          v1 surface is /marketflow (gated landing) and /marketflow/access
          (request-access form). Most dashboards / capital / property /
          negotiate / offer-studio routes are operator surfaces and stay
          behind AuthGuard. /marketflow/deals self-gates: public visitors
          see the private-beta hold, and authenticated operators see real
          reviewed opportunities. */}
      <Route path="/marketflow/community">{() => <AuthGuard><DealflowCommunity /></AuthGuard>}</Route>
      <Route path="/marketflow/messages">{() => <AuthGuard><DealflowMessages /></AuthGuard>}</Route>
      <Route path="/marketflow/deals" component={MarketflowDeals} />
      <Route path="/marketflow/deals/:id">{() => <AuthGuard><MarketplaceDealDetail /></AuthGuard>}</Route>
      <Route path="/marketflow/capital">{() => <AuthGuard><MarketplaceCapital /></AuthGuard>}</Route>
      <Route path="/marketflow/capital/:id">{() => <AuthGuard><MarketplaceCapitalDetail /></AuthGuard>}</Route>
      <Route path="/marketflow/listings/:id">{() => <AuthGuard><MarketplacePropertyDetail inventorySource="legacy" /></AuthGuard>}</Route>
      <Route path="/marketflow/properties">{() => <AuthGuard><MarketplaceProperties /></AuthGuard>}</Route>
      <Route path="/marketflow/properties/:id">{() => <AuthGuard><MarketplacePropertyDetail /></AuthGuard>}</Route>
      <Route path="/marketflow/submit">{() => <AuthGuard><MarketflowSubmit /></AuthGuard>}</Route>
      <Route path="/marketflow/deals/:id/negotiate">{() => <AuthGuard><MarketflowNegotiate /></AuthGuard>}</Route>
      <Route path="/marketflow/negotiate/:lane/:id">{() => <AuthGuard><MarketflowNegotiate /></AuthGuard>}</Route>
      <Route path="/marketflow/dashboard">{() => <AuthGuard><MarketflowDashboard /></AuthGuard>}</Route>
      <Route path="/marketflow/my-deals">{() => <AuthGuard><MyDealsPage /></AuthGuard>}</Route>
      <Route path="/marketflow/analytics">{() => <AuthGuard><AnalyticsPage /></AuthGuard>}</Route>
      <Route path="/marketflow/my-analytics">{() => <AuthGuard><MyAnalyticsPage /></AuthGuard>}</Route>

      {/* Offer Studio - Full page deal offer experience (operator-only) */}
      <Route path="/marketflow/offer-studio/:dealId">{() => <AuthGuard><MarketflowOfferStudio /></AuthGuard>}</Route>
      <Route path="/offer-studio/:dealType/:dealId">{() => <AuthGuard><OfferStudioPage /></AuthGuard>}</Route>

      <Route path="/profile/:userId">{() => <AuthGuard><UserProfile /></AuthGuard>}</Route>
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function PageRouteTransition() {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <ErrorBoundary>
          <Router />
        </ErrorBoundary>
      </motion.div>
    </AnimatePresence>
  );
}

// The Pegasus prototype shell (PegasusSite) is fully self-contained: it
// renders its own nav, footer, and Peggy dock scoped under `.pg-root`.
// On those URLs we suppress the legacy global chrome so the page is not
// double-framed; every other (functional) surface keeps the global chrome.
function AppShell() {
  const [location] = useLocation();
  const {
    isAuthenticated,
    isGuestMode,
    profile,
    userRole,
    isAdmin,
  } = useSupabaseAuth();
  // Three chrome modes:
  //  - pegasus:    the prototype shell (<PegasusSite>) renders its own
  //                nav/footer/Peggy, so no global chrome at all.
  //  - standalone: a non-prototype public page that should still wear the
  //                pegasus NavBar/Footer chrome (via PegasusStandaloneShell)
  //                so the public site is visually seamless.
  //  - legacy:     everything else (admin, auth, marketflow internals) keeps
  //                the legacy global Navigation/Footer/Peggy dock.
  const shellMode = classifyShellMode({
    location,
    isAuthenticated,
    isGuestMode,
    isPegasusBadged: profile?.is_pegasus_badged,
    isStaff: isAdmin,
    roles: [profile?.primary_role, userRole],
  });
  const pegasus = shellMode === "pegasus";
  const standalone = shellMode === "standalone";
  const legacy = shellMode === "legacy";
  return (
    <>
      <ScrollToTop />
      <AnalyticsBoot />
      <AdminBar />
      <AnonymousClaimWatcher />
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <a href="#main-content" className="skip-to-content">Skip to main content</a>
        {legacy && <Navigation />}
        {pegasus ? (
          // PegasusSite owns the semantic content landmark because its fixed
          // NavBar must precede the skip-link target in DOM order. Wrapping the
          // site in another <main> here would create an invalid nested main.
          <div className="flex-1">
            <PageRouteTransition />
          </div>
        ) : standalone ? (
          <PegasusStandaloneShell solidNav={isSolidNavUrl(location)}>
            <main id="main-content" className="flex-1" tabIndex={-1}>
              <PageRouteTransition />
            </main>
          </PegasusStandaloneShell>
        ) : (
          <main id="main-content" className="flex-1" tabIndex={-1}>
            <PageRouteTransition />
          </main>
        )}
        {legacy && <Footer />}
      </div>
      {legacy && <AuthGatedPeggyDock />}
      <CookieConsent />
      <Toaster />
    </>
  );
}

function LegacyApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="pegasus-ui-theme">
        <SupabaseAuthProvider>
          <SiteContentProvider>
            <EditModeProvider>
              <DemoModeProvider>
                <TooltipProvider>
                  <DealActionProvider>
                    <PeggyProvider>
                      <NotificationProvider>
                        <AppShell />
                      </NotificationProvider>
                    </PeggyProvider>
                  </DealActionProvider>
                </TooltipProvider>
              </DemoModeProvider>
            </EditModeProvider>
          </SiteContentProvider>
        </SupabaseAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default LegacyApp;
