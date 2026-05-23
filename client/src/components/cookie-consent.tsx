import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import {
  hasDecided,
  readConsent,
  writeConsent,
  type ConsentState,
} from "@/lib/consent";

// Website Brief v1.0 §11 / Wave 1 — slim bottom-bar consent notice. Default
// view is a single horizontal strip (44–56px tall on desktop) with a
// one-line message + Manage / Accept buttons; it does NOT cover the hero.
// "Manage" opens an expanded panel with the per-category toggles. Cookies
// remain off-by-default until the visitor explicitly opts in.
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!hasDecided()) {
        const current = readConsent();
        setAnalytics(current.analytics);
        setMarketing(current.marketing);
        setVisible(true);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const persist = (next: Pick<ConsentState, "analytics" | "marketing">) => {
    writeConsent(next);
    setVisible(false);
  };

  if (showDetails) {
    return (
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-consent-title"
        className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none"
        data-testid="cookie-consent-banner"
      >
        <div className="pointer-events-auto mx-auto max-w-2xl rounded-md border border-border bg-card shadow-2xl">
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  id="cookie-consent-title"
                  className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-2"
                >
                  Cookie preferences
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Analytics and marketing cookies are off until you opt in.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close cookie preferences"
                data-testid="button-cookie-close-details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 border-t border-border/60 pt-4" data-testid="cookie-consent-details">
              <ToggleRow
                label="Essential"
                description="Required to run the site, store your theme, and keep submissions secure. Cannot be disabled."
                checked={true}
                disabled
                testId="toggle-cookie-essential"
              />
              <ToggleRow
                label="Analytics"
                description="Anonymous, aggregated traffic stats (no third-party advertising profiles)."
                checked={analytics}
                onChange={setAnalytics}
                testId="toggle-cookie-analytics"
              />
              <ToggleRow
                label="Marketing"
                description="Reserved for future first-party campaign attribution. We do not currently run third-party retargeting."
                checked={marketing}
                onChange={setMarketing}
                testId="toggle-cookie-marketing"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => persist({ analytics: false, marketing: false })}
                data-testid="button-cookie-reject"
              >
                Reject non-essential
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => persist({ analytics, marketing })}
                data-testid="button-cookie-save"
              >
                Save preferences
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-[60] pointer-events-none"
      data-testid="cookie-consent-banner"
    >
      <div className="pointer-events-auto bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <p
            id="cookie-consent-title"
            className="text-xs sm:text-sm text-foreground leading-snug flex-1"
          >
            <span className="hidden sm:inline">We use essential cookies to run this site. </span>
            Analytics and marketing are off until you opt in.{" "}
            <a
              href="/privacy"
              className="underline hover:text-primary transition-colors"
              data-testid="link-cookie-privacy"
            >
              Privacy
            </a>
            .
          </p>
          <div className="flex items-center gap-2 self-stretch sm:self-auto flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setShowDetails(true)}
              data-testid="button-cookie-customize"
            >
              Manage
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => persist({ analytics: false, marketing: false })}
              data-testid="button-cookie-reject"
            >
              Reject
            </Button>
            <Button
              size="sm"
              className="h-8 px-4 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => persist({ analytics: true, marketing: true })}
              data-testid="button-cookie-accept-all"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
  testId,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  testId: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={(v) => onChange?.(!!v)}
        disabled={disabled}
        data-testid={testId}
        aria-label={`${label} cookies`}
      />
    </div>
  );
}
