import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  hasDecided,
  readConsent,
  writeConsent,
  type ConsentState,
} from "@/lib/consent";

// Website Brief v1.0 §11 — first-visit cookie banner with granular toggles.
// Renders only when the visitor has not yet recorded a decision. Essential
// cookies are always on (required for the site to function); Analytics and
// Marketing default to OFF until the visitor explicitly opts in.
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // Defer the visibility check until after hydration so SSR / first paint
    // never flashes a banner the user already dismissed.
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

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none"
      data-testid="cookie-consent-banner"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-md border border-border bg-card shadow-2xl">
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <p
              id="cookie-consent-title"
              className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-2"
            >
              Privacy & cookies
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              Pegasus DreamScapes uses cookies that are strictly necessary to
              run this site. Anything beyond that (analytics, marketing) is
              off by default and only turned on if you opt in. You can change
              your choice any time on our{" "}
              <a
                href="/privacy"
                className="underline hover:text-primary transition-colors"
                data-testid="link-cookie-privacy"
              >
                Privacy
              </a>{" "}
              page.
            </p>
          </div>

          {showDetails && (
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
                description="Anonymous, aggregated traffic stats (no third-party advertising profiles). Off until you opt in."
                checked={analytics}
                onChange={setAnalytics}
                testId="toggle-cookie-analytics"
              />
              <ToggleRow
                label="Marketing"
                description="Reserved for future first-party campaign attribution. Off by default. We do not currently run third-party retargeting."
                checked={marketing}
                onChange={setMarketing}
                testId="toggle-cookie-marketing"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            {!showDetails ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(true)}
                data-testid="button-cookie-customize"
              >
                Customize
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => persist({ analytics, marketing })}
                data-testid="button-cookie-save"
              >
                Save preferences
              </Button>
            )}
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
              onClick={() => persist({ analytics: true, marketing: true })}
              data-testid="button-cookie-accept-all"
            >
              Accept all
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
