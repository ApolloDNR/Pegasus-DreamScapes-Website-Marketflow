import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CookieConsent } from "@/components/cookie-consent";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { initAnalytics } from "@/lib/analytics";
import { Landing } from "@/pegasus/Landing";

// The Pegasus public shell only uses React Query for its lazily loaded public
// forms. Keep its cache independent from the authenticated application so the
// public entry does not import the Supabase-aware shared query client.
const publicQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: false,
    },
  },
});

function PublicEffects() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);

  useEffect(() => initAnalytics(), []);

  return null;
}

export default function PublicApp() {
  return (
    <QueryClientProvider client={publicQueryClient}>
      <ThemeProvider defaultTheme="system" storageKey="pegasus-ui-theme">
        <PublicEffects />
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          <div className="flex-1">
            <ErrorBoundary>
              <Landing />
            </ErrorBoundary>
          </div>
        </div>
        <CookieConsent />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
