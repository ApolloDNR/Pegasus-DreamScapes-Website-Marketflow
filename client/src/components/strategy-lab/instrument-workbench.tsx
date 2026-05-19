/**
 * Workbench Instrument — graduated production component for the Strategy Lab
 * Full Path mode. Visual contract sourced from
 *   artifacts/mockup-sandbox/src/components/mockups/strategy-lab-redesign/WorkbenchInstrument.tsx
 * and wired to the live engine snapshot + mutations from
 *   client/src/pages/strategy-lab.tsx.
 *
 * Wrapped in `.light bg-[#F6EFE4]` so dark mode does not invert the
 * intentionally cream surface. Brand-token aliases (--pd-*) are defined in
 * client/src/index.css :root.
 */
import { useState } from "react";
import {
  type StrategyLane,
  type StrategySnapshot,
  type LaneFitResult,
  type RiskFlag,
} from "@shared/strategy-lab";
import { LANE_PILLARS } from "@shared/strategy-lab/types";

/* ── tokens (literal var refs from index.css :root) ─────────────────────── */
const NAVY = "var(--pd-navy)";
const COPPER = "var(--pd-copper)";
const CREAM = "var(--pd-cream)";
const RULE = "var(--pd-rule)";
const MUTED = "var(--pd-muted)";
const FONT_SERIF = "var(--pd-font-serif)";
const FONT_SUP = "var(--pd-font-supporting)";
const FONT_SANS = "var(--pd-font-sans)";
const FONT_DISP = "var(--pd-font-display)";

/* ── tone-frame copy (verbatim from approved mockup) ────────────────────── */
export type Tone = "owner" | "wholesaler" | "capital" | "admin";

const TONE_FRAMES: Record<Tone, { kicker: string; verdict: string; cta: string }> = {
  owner: {
    kicker: "For the homeowner",
    verdict:
      "Your home reads as a viable refi-and-hold for a long-term operator. If you sell as-is, a serious buyer pays in the $410–$430k range. If you'd rather not list, we can talk about a private path.",
    cta: "Talk to Apollo about a private offer",
  },
  wholesaler: {
    kicker: "For the wholesaler",
    verdict:
      "Property assigns. Spread to ARV is 18%, refi math holds at 75% LTV with $40k cash left in. If your buyer is a BRRRR operator, push assignment at $425–$435k. If you're walking, comp depth is the only thing in the way.",
    cta: "Submit to Pegasus's buyer list",
  },
  capital: {
    kicker: "For the capital partner",
    verdict:
      "Deal structures as a 75% senior + 25% LP equity refinance with $40k of operator capital at close. DSCR 1.42 at 7.25%. Two open variables would tighten confidence: comp depth and a walk-through of 1985-era systems.",
    cta: "Open the capital stack modeler",
  },
  admin: {
    kicker: "For Pegasus HQ",
    verdict:
      "Route: BRRRR operator network (3 active). Submission SLA 48h. Confidence 72%, range 65–78%. Two flags before any offer: comp depth (3/5) and unverified plumbing/electrical on a 1985 build.",
    cta: "Route to operator network",
  },
};

/* ── scenario overlays (Conservative / Base / Aggressive) ───────────────── */
export type Scenario = "conservative" | "base" | "aggressive";

const SCENARIO_NUMBERS: Record<
  Scenario,
  { asking: string; rehab: string; arv: string }
> = {
  conservative: { asking: "440000", rehab: "85000", arv: "585000" },
  base: { asking: "425000", rehab: "65000", arv: "610000" },
  aggressive: { asking: "410000", rehab: "55000", arv: "640000" },
};

/* ── lane name + subtitle for the mockup row ────────────────────────────── */
const LANE_SUBTITLES: Record<StrategyLane, string> = {
  flip: "Light reno · short hold",
  wholetail: "Light cosmetic resale",
  brrrr: "Refi-and-hold",
  rental_hold: "Long-term cash flow",
  adu_development: "Add unit · upside lot",
  ground_up: "Tear-down + new build",
  wholesale: "Assign to operator",
  jv: "JV with capital",
  listing_referral: "Route to network",
};

const LANE_PRESENTATION_NAMES: Record<StrategyLane, string> = {
  flip: "Fix & Flip",
  wholetail: "Wholetail",
  brrrr: "BRRRR",
  rental_hold: "Rental Hold",
  adu_development: "ADU + Development",
  ground_up: "Ground Up",
  wholesale: "Wholesale Assignment",
  jv: "Capital Partner Match",
  listing_referral: "Operator Referral",
};

function verdictTag(verdictLabel: string): string {
  return verdictLabel.toUpperCase();
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, n));
}

/* ────────────── PUBLIC PROPS ────────────── */

export interface InstrumentWorkbenchProps {
  // form (live)
  form: {
    address: string;
    city: string;
    state: string;
    zip: string;
    beds: string;
    baths: string;
    sqft: string;
    yearBuilt: string;
    condition: string;
    occupancyStatus: string | undefined;
    submitterRole: string;
    dealStatus: string;
    askingPrice: string;
    rehabBudget: string;
    arvEstimate: string;
    marketRent: string;
    loanRatePct: string;
  };
  update: (key: any, value: any) => void;

  // engine + memo
  snapshot: StrategySnapshot | null;
  topLane: LaneFitResult | undefined;
  framedMemo: { paragraph: string; nextStep: string };

  // reading lens (shared with rest of page)
  effectiveLens: Tone;
  selectLens: (lens: Tone) => void;

  // mutation handlers (existing names from strategy-lab.tsx)
  handleSave: () => void;
  handleShare: () => void;
  handleExportPDF: () => void;
  handleSubmit: () => void;
  openLabMode: (mode: "explain" | "stress" | "prepare") => void;

  saveIsPending: boolean;
  submitIsPending: boolean;
  analysisId: number | null;

  // anon/auth state
  isAuthenticated: boolean;
  runsLeft: number;
  freeRunLimit: number;

  // Blueprint upsell
  blueprintTiers: Array<{
    key: string;
    title: string;
    priceCents: number;
    turnaroundDays: string;
    description: string;
  }>;
  onOpenBlueprintTier: (key: string) => void;

  // touchpoints
  fireTouchpoint: (event: string, data?: any) => void;
}

/* ────────────── ROOT ────────────── */

export function InstrumentWorkbench(props: InstrumentWorkbenchProps) {
  const [scenario, setScenario] = useState<Scenario>("base");
  const [showSolver, setShowSolver] = useState(false);
  const [showTrail, setShowTrail] = useState(false);

  const tone: Tone = props.effectiveLens;

  return (
    <div
      className="light"
      style={{
        backgroundColor: CREAM,
        color: NAVY,
        fontFamily: FONT_SANS,
        colorScheme: "light",
      }}
      data-testid="instrument-workbench"
    >
      <SubjectHeader
        tone={tone}
        setTone={props.selectLens}
        form={props.form}
      />
      <PathMap snapshot={props.snapshot} form={props.form} />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_440px] gap-0 px-4 lg:px-10 py-7">
        <LeftRail
          form={props.form}
          snapshot={props.snapshot}
          isAuthenticated={props.isAuthenticated}
          runsLeft={props.runsLeft}
          freeRunLimit={props.freeRunLimit}
        />
        <CenterColumn
          form={props.form}
          update={props.update}
          snapshot={props.snapshot}
          scenario={scenario}
          setScenario={(s) => {
            setScenario(s);
            const n = SCENARIO_NUMBERS[s];
            props.update("askingPrice", n.asking);
            props.update("rehabBudget", n.rehab);
            props.update("arvEstimate", n.arv);
            props.fireTouchpoint("instrument_scenario_select", { scenario: s });
          }}
          showSolver={showSolver}
          setShowSolver={setShowSolver}
        />
        <RightVerdict
          tone={tone}
          frame={TONE_FRAMES[tone]}
          snapshot={props.snapshot}
          topLane={props.topLane}
          framedMemo={props.framedMemo}
          handleSave={props.handleSave}
          handleShare={props.handleShare}
          handleExportPDF={props.handleExportPDF}
          handleSubmit={props.handleSubmit}
          openLabMode={props.openLabMode}
          saveIsPending={props.saveIsPending}
          submitIsPending={props.submitIsPending}
          analysisId={props.analysisId}
          blueprintTiers={props.blueprintTiers}
          onOpenBlueprintTier={props.onOpenBlueprintTier}
        />
      </div>

      <TrailDrawer show={showTrail} toggle={() => setShowTrail((v) => !v)} />

      {/* Footer hairline + copy */}
      <div
        className="px-10 py-5 border-t flex items-center justify-between flex-wrap gap-3"
        style={{ borderColor: RULE, backgroundColor: "rgba(13,27,45,0.03)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-sm flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY} 60%, ${COPPER} 60%, ${COPPER} 100%)`,
            }}
          >
            <span style={{ color: CREAM, fontFamily: FONT_DISP, fontSize: 11 }}>
              P
            </span>
          </div>
          <div
            className="text-[10px] tracking-[0.22em] uppercase"
            style={{ fontFamily: FONT_SUP, color: MUTED }}
          >
            Pegasus Dreamscapes Corp · Private network · Apollo · 925-744-8525
          </div>
        </div>
        <div
          className="text-[10px] tracking-[0.22em] uppercase italic"
          style={{ fontFamily: FONT_SERIF, color: MUTED }}
        >
          Dream it. Build it. Live it.
        </div>
      </div>
      <div className="h-1.5 w-full" style={{ backgroundColor: COPPER }} />
    </div>
  );
}

/* ────────────── SUBJECT HEADER ────────────── */

function SubjectHeader({
  tone,
  setTone,
  form,
}: {
  tone: Tone;
  setTone: (t: Tone) => void;
  form: InstrumentWorkbenchProps["form"];
}) {
  const cityLine = [form.city, form.state, form.zip].filter(Boolean).join(", ");
  return (
    <div className="px-4 lg:px-10 pt-5 pb-4 border-b" style={{ borderColor: RULE }}>
      <div className="flex items-end justify-between gap-8 flex-wrap">
        <div className="flex-1 min-w-0">
          <div
            className="text-[10px] tracking-[0.28em] uppercase mb-1 font-semibold"
            style={{ fontFamily: FONT_SUP, color: COPPER }}
          >
            Active Subject
          </div>
          <div className="flex items-baseline gap-4 flex-wrap">
            <h1
              className="text-[28px] lg:text-[32px] leading-none"
              style={{
                fontFamily: FONT_SERIF,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: NAVY,
              }}
              data-testid="instrument-address"
            >
              {form.address || "Enter an address"}
            </h1>
            {cityLine && (
              <span
                className="text-sm"
                style={{ color: MUTED, fontFamily: FONT_SERIF }}
              >
                {cityLine}
              </span>
            )}
            <span
              className="text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-sm font-semibold border"
              style={{
                borderColor: NAVY,
                color: NAVY,
                fontFamily: FONT_SUP,
              }}
            >
              Full Path · Free tier
            </span>
          </div>
          <div
            className="text-[12px] mt-2 italic"
            style={{ fontFamily: FONT_SERIF, color: COPPER }}
          >
            One address in. Every angle out.
          </div>
        </div>

        {/* Tone-lens switcher */}
        <div>
          <div
            className="text-[9px] tracking-[0.25em] uppercase mb-1.5 font-semibold text-right"
            style={{ fontFamily: FONT_SUP, color: MUTED }}
          >
            Reading lens · UI preview
          </div>
          <div
            className="flex items-center rounded-sm border p-0.5"
            style={{
              borderColor: RULE,
              backgroundColor: "rgba(255,255,255,0.6)",
            }}
            role="tablist"
            aria-label="Decision memo reading lens"
          >
            {(["owner", "wholesaler", "capital", "admin"] as Tone[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tone === t}
                onClick={() => setTone(t)}
                className="px-2.5 py-1.5 text-[10px] tracking-[0.18em] uppercase font-semibold rounded-sm"
                style={{
                  fontFamily: FONT_SUP,
                  backgroundColor: tone === t ? NAVY : "transparent",
                  color: tone === t ? CREAM : MUTED,
                }}
                data-testid={`instrument-lens-${t}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────── PATH MAP (8-stage) ────────────── */

function PathMap({
  snapshot,
  form,
}: {
  snapshot: StrategySnapshot | null;
  form: InstrumentWorkbenchProps["form"];
}) {
  const hasNumbers = !!form.askingPrice;
  const steps: { l: string; s: "done" | "active" | "pending" }[] = [
    { l: "Property", s: form.address ? "done" : "pending" },
    { l: "Situation", s: form.submitterRole && form.submitterRole !== "unknown" ? "done" : "active" },
    { l: "Numbers", s: hasNumbers ? "done" : "active" },
    { l: "Comps", s: snapshot?.arvBand ? "done" : "active" },
    { l: "Risk", s: snapshot?.risks?.length ? "active" : "pending" },
    { l: "Capital", s: hasNumbers ? "done" : "pending" },
    { l: "Verdict", s: snapshot ? "active" : "pending" },
    { l: "Next Step", s: snapshot?.memo?.nextStep ? "active" : "pending" },
  ];
  const doneCount = steps.filter((x) => x.s !== "pending").length;
  return (
    <div className="px-4 lg:px-10 pt-4 pb-4 border-b" style={{ borderColor: RULE }}>
      <div className="flex items-center justify-between mb-1.5">
        <div
          className="text-[9px] tracking-[0.28em] uppercase"
          style={{ fontFamily: FONT_SUP, color: MUTED }}
        >
          Path · Stage {doneCount} of {steps.length} · Full read
        </div>
        <div
          className="text-[9px] tracking-[0.2em] uppercase"
          style={{ fontFamily: FONT_SUP, color: MUTED }}
        >
          Auto-saved
        </div>
      </div>
      <div className="flex items-center gap-0">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const dot =
            step.s === "done" ? (
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COPPER }}
              />
            ) : step.s === "active" ? (
              <div
                className="w-3.5 h-3.5 rotate-45"
                style={{
                  backgroundColor: COPPER,
                  boxShadow: "0 0 0 4px rgba(199,122,58,0.15)",
                }}
              />
            ) : (
              <div
                className="w-2.5 h-2.5 rounded-full border"
                style={{ borderColor: RULE, backgroundColor: CREAM }}
              />
            );
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                <div
                  className="flex-1 h-px"
                  style={{
                    backgroundColor:
                      i === 0
                        ? "transparent"
                        : step.s === "pending"
                          ? RULE
                          : COPPER,
                    opacity: step.s === "pending" ? 0.4 : 1,
                  }}
                />
                {dot}
                <div
                  className="flex-1 h-px"
                  style={{
                    backgroundColor: isLast
                      ? "transparent"
                      : step.s === "done"
                        ? COPPER
                        : RULE,
                    opacity: step.s === "pending" ? 0.4 : 1,
                  }}
                />
              </div>
              <div
                className="mt-2 text-[9px] tracking-[0.18em] uppercase font-semibold text-center"
                style={{
                  fontFamily: FONT_SUP,
                  color:
                    step.s === "active"
                      ? NAVY
                      : step.s === "done"
                        ? COPPER
                        : MUTED,
                  opacity: step.s === "pending" ? 0.6 : 1,
                }}
              >
                {step.l}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────── LEFT RAIL ────────────── */

function LeftRail({
  form,
  snapshot,
  isAuthenticated,
  runsLeft,
  freeRunLimit,
}: {
  form: InstrumentWorkbenchProps["form"];
  snapshot: StrategySnapshot | null;
  isAuthenticated: boolean;
  runsLeft: number;
  freeRunLimit: number;
}) {
  return (
    <aside
      className="pr-0 lg:pr-6 lg:border-r pb-6 lg:pb-0"
      style={{ borderColor: RULE }}
    >
      <Kicker num="§ 1–2" label="Subject" />
      <div className="mt-3 space-y-3">
        <Fact k="Address" v={form.address || "—"} />
        <Fact
          k="City"
          v={[form.city, form.state, form.zip].filter(Boolean).join(", ") || "—"}
        />
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <Fact k="Beds" v={form.beds || "—"} compact />
          <Fact k="Baths" v={form.baths || "—"} compact />
          <Fact k="SQFT" v={form.sqft || "—"} compact />
          <Fact k="Built" v={form.yearBuilt || "—"} compact />
        </div>
        <Fact k="Condition" v={form.condition || "—"} compact />
        <Fact k="Occupancy" v={form.occupancyStatus || "—"} compact />
      </div>

      {/* Tier · what's unlocked */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: RULE }}>
        <div
          className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-2"
          style={{ fontFamily: FONT_SUP, color: NAVY }}
        >
          Tier · what's unlocked
        </div>
        <div className="space-y-1.5">
          <TierRow label="Lane Fit Board" on />
          <TierRow label="Confidence band" on />
          <TierRow label="Reverse solver preview" on />
          <TierRow label="Capital stack model" />
          <TierRow label="Scenario library" />
          <TierRow label="Operator routing" />
          <TierRow label="Execution roadmap" />
        </div>
      </div>

      {/* Run-history banner — anon only */}
      {!isAuthenticated && (
        <div
          className="mt-6 p-3 rounded-sm"
          style={{
            backgroundColor: "rgba(13,27,45,0.04)",
            border: `1px dashed ${RULE}`,
          }}
          data-testid="instrument-run-banner"
        >
          <div
            className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-1"
            style={{ fontFamily: FONT_SUP, color: NAVY }}
          >
            Run history
          </div>
          <div
            className="text-[11px] leading-relaxed"
            style={{ color: MUTED, fontFamily: FONT_SERIF }}
          >
            {runsLeft > 0
              ? `${runsLeft} of ${freeRunLimit} free runs left.`
              : `Free runs used. Sign in to claim them.`}
          </div>
          <a
            href="/api/login"
            className="text-[10px] tracking-[0.18em] uppercase font-semibold mt-1.5 inline-block border-b pb-0.5"
            style={{ fontFamily: FONT_SUP, color: COPPER, borderColor: COPPER }}
            data-testid="instrument-claim-runs"
          >
            Claim anonymous runs →
          </a>
        </div>
      )}

      {/* Doctrine */}
      <div
        className="mt-6 pt-4 border-t text-[11px] leading-relaxed"
        style={{ borderColor: RULE, color: MUTED }}
      >
        <div
          className="text-[9px] tracking-[0.25em] uppercase mb-1.5 font-semibold"
          style={{ fontFamily: FONT_SUP, color: NAVY }}
        >
          Doctrine
        </div>
        Every property gets a serious review. Not every property gets an offer.
      </div>
      {snapshot && (
        <div
          className="mt-3 text-[10px] italic"
          style={{ fontFamily: FONT_SERIF, color: MUTED }}
        >
          Where others see impossible, we see a path.
        </div>
      )}
    </aside>
  );
}

function TierRow({ label, on }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={on ? "" : "line-through"}
        style={{ fontSize: 11, color: on ? NAVY : MUTED, fontFamily: FONT_SERIF }}
      >
        {label}
      </span>
      <span
        className="text-[8px] tracking-[0.2em] uppercase ml-auto"
        style={{
          fontFamily: FONT_SUP,
          color: on ? COPPER : MUTED,
          fontWeight: 600,
        }}
      >
        {on ? "Free" : "Blueprint"}
      </span>
    </div>
  );
}

/* ────────────── CENTER COLUMN ────────────── */

function CenterColumn({
  form,
  update,
  snapshot,
  scenario,
  setScenario,
  showSolver,
  setShowSolver,
}: {
  form: InstrumentWorkbenchProps["form"];
  update: (key: any, value: any) => void;
  snapshot: StrategySnapshot | null;
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  showSolver: boolean;
  setShowSolver: (v: boolean) => void;
}) {
  return (
    <section className="px-0 lg:px-8 py-6 lg:py-0">
      {/* Scenario tabs */}
      <div className="flex items-end justify-between mb-3 flex-wrap gap-2">
        <Kicker num="§ 3" label="Numbers · Scenario set" active />
        <div className="flex items-center gap-1">
          {(["conservative", "base", "aggressive"] as Scenario[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScenario(s)}
              className="px-2.5 py-1.5 text-[10px] tracking-[0.18em] uppercase font-semibold rounded-sm border"
              style={{
                fontFamily: FONT_SUP,
                backgroundColor: scenario === s ? COPPER : "transparent",
                color: scenario === s ? CREAM : MUTED,
                borderColor: scenario === s ? COPPER : RULE,
              }}
              data-testid={`instrument-scenario-${s}`}
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            disabled
            title="Scenario library · Blueprint"
            className="px-2.5 py-1.5 text-[10px] tracking-[0.18em] uppercase font-semibold rounded-sm border opacity-60 cursor-not-allowed"
            style={{ fontFamily: FONT_SUP, borderColor: RULE, color: MUTED }}
          >
            + New
          </button>
        </div>
      </div>

      {/* Compact input row — wired live to form */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-5 border-b"
        style={{ borderColor: RULE }}
      >
        <CompactInput
          label="Asking"
          value={form.askingPrice}
          onChange={(v) => update("askingPrice", v)}
          prefix="$"
          testId="instrument-input-asking"
        />
        <CompactInput
          label="Rehab"
          value={form.rehabBudget}
          onChange={(v) => update("rehabBudget", v)}
          prefix="$"
          testId="instrument-input-rehab"
        />
        <CompactInput
          label="ARV"
          value={form.arvEstimate}
          onChange={(v) => update("arvEstimate", v)}
          prefix="$"
          testId="instrument-input-arv"
        />
        <CompactInput
          label="Rate"
          value={form.loanRatePct}
          onChange={(v) => update("loanRatePct", v)}
          prefix=""
          unit="%"
          testId="instrument-input-rate"
        />
      </div>

      {/* Lane Fit Board */}
      <div className="mb-7">
        <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
          <Kicker
            num="§ 4"
            label={
              snapshot?.lanes.length
                ? `Lane Fit Board · ${snapshot.lanes.length} lanes`
                : "Lane Fit Board"
            }
            active
          />
          <span
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ fontFamily: FONT_SUP, color: MUTED }}
          >
            {snapshot?.lanes.length ? "Sorted by confidence" : "Awaiting inputs"}
          </span>
        </div>
        <div
          className="flex items-center gap-4 mb-3 pb-2 border-b flex-wrap"
          style={{ borderColor: RULE }}
        >
          <span
            className="text-[9px] tracking-[0.22em] uppercase font-semibold"
            style={{ fontFamily: FONT_SUP, color: MUTED }}
          >
            Routed by pillar
          </span>
          <PillarKey letter="D" name="Development" />
          <PillarKey letter="I" name="Investments" />
          <PillarKey letter="S" name="Systems" />
        </div>
        <div className="space-y-2">
          {snapshot?.lanes.map((l, i) => {
            const pillar = LANE_PILLARS[l.lane] ?? "S";
            const conf = l.confidence.score;
            const band: [number, number] = [
              clampPct(conf - 7),
              clampPct(conf + 7),
            ];
            return (
              <LaneRow
                key={l.lane}
                pillar={pillar}
                name={LANE_PRESENTATION_NAMES[l.lane] ?? l.laneLabel}
                sub={LANE_SUBTITLES[l.lane] ?? l.headline.slice(0, 48)}
                band={band}
                verdict={verdictTag(l.verdictLabel)}
                top={i === 0}
                needsData={l.verdict === "needs_more_data"}
              />
            );
          })}
          {!snapshot && (
            <div
              className="text-[12px] italic py-6 text-center"
              style={{ fontFamily: FONT_SERIF, color: MUTED }}
            >
              Add an asking price to score all lanes.
            </div>
          )}
        </div>
        <div
          className="text-[10px] mt-3 italic leading-relaxed"
          style={{ fontFamily: FONT_SERIF, color: MUTED }}
        >
          Confidence bands are a ±7 placeholder until the engine returns a
          true range. The top lane is the engine's verdict for this scenario.
        </div>
      </div>

      {/* Reverse Solver — preview/blueprint */}
      <div
        className="mb-7 rounded-sm"
        style={{
          backgroundColor: "rgba(13,27,45,0.04)",
          border: `1px solid ${RULE}`,
        }}
      >
        <button
          type="button"
          onClick={() => setShowSolver(!showSolver)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span style={{ color: COPPER, fontSize: 14 }}>↳</span>
            <span
              className="text-[12px] tracking-[0.2em] uppercase font-semibold"
              style={{ fontFamily: FONT_SUP, color: NAVY }}
            >
              Reverse Solver
            </span>
            <span
              className="text-[11px] italic"
              style={{ fontFamily: FONT_SERIF, color: MUTED }}
            >
              Solve for the offer that hits your confidence target.
            </span>
            <span
              className="text-[8px] tracking-[0.2em] uppercase px-1.5 py-0.5 font-semibold"
              style={{
                fontFamily: FONT_SUP,
                color: COPPER,
                border: `1px solid ${COPPER}`,
              }}
            >
              Preview · Blueprint
            </span>
          </div>
          <span
            className="text-[10px] tracking-[0.2em] uppercase font-semibold"
            style={{ fontFamily: FONT_SUP, color: COPPER }}
          >
            {showSolver ? "− Collapse" : "+ Open"}
          </span>
        </button>
        {showSolver && (
          <div
            className="px-4 pb-4 border-t"
            style={{ borderColor: RULE }}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 items-end">
              <div>
                <Lbl>Lane</Lbl>
                <select
                  disabled
                  className="mt-1 w-full text-[13px] py-1.5 px-2 bg-white/60 border-0 border-b-2 opacity-60"
                  style={{
                    borderColor: NAVY,
                    fontFamily: FONT_SERIF,
                    color: NAVY,
                  }}
                >
                  <option>BRRRR</option>
                </select>
              </div>
              <div>
                <Lbl>Target confidence</Lbl>
                <input
                  disabled
                  defaultValue="75%"
                  className="mt-1 w-full text-[13px] py-1.5 px-2 bg-white/60 border-0 border-b-2 opacity-60"
                  style={{
                    borderColor: NAVY,
                    fontFamily: FONT_SERIF,
                    color: NAVY,
                  }}
                />
              </div>
              <div>
                <Lbl>Solve for</Lbl>
                <select
                  disabled
                  className="mt-1 w-full text-[13px] py-1.5 px-2 bg-white/60 border-0 border-b-2 opacity-60"
                  style={{
                    borderColor: NAVY,
                    fontFamily: FONT_SERIF,
                    color: NAVY,
                  }}
                >
                  <option>Max offer</option>
                </select>
              </div>
              <button
                type="button"
                disabled
                title="Reverse solver · Blueprint"
                className="py-2 text-[10px] tracking-[0.2em] uppercase font-semibold cursor-not-allowed opacity-60"
                style={{
                  fontFamily: FONT_SUP,
                  backgroundColor: NAVY,
                  color: CREAM,
                }}
              >
                Solve
              </button>
            </div>
            <div
              className="text-[11px] mt-3 italic"
              style={{ color: MUTED, fontFamily: FONT_SERIF }}
            >
              The solver ships with the Blueprint tier. Preview only.
            </div>
          </div>
        )}
      </div>

      {/* Risk register — wired to engine */}
      <div className="mb-7">
        <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <Kicker num="§ 5" label="Risk Register · named with mitigations" active />
          <span
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ fontFamily: FONT_SUP, color: MUTED }}
          >
            {snapshot?.risks?.length ?? 0} active
          </span>
        </div>
        <div className="space-y-2">
          {snapshot?.risks?.slice(0, 6).map((r) => (
            <RiskRow key={r.id} risk={r} />
          ))}
          {(!snapshot || !snapshot.risks?.length) && (
            <div
              className="text-[12px] italic py-3"
              style={{ fontFamily: FONT_SERIF, color: MUTED }}
            >
              No risk flags fired with current inputs.
            </div>
          )}
        </div>
      </div>

      {/* What would change my mind — static narrative from mockup */}
      <div className="mb-2">
        <div className="flex items-baseline justify-between mb-3">
          <Kicker num="§ 6" label="What would change my mind" active />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FlipCard
            finding="Comp depth falls to 2/5"
            flip="BRRRR drops to 51%, Rental Hold becomes top lane."
          />
          <FlipCard
            finding="Rehab quote comes in at $90k"
            flip="BRRRR drops to 50%, Wholesale Assignment rises to top."
          />
          <FlipCard
            finding="Rate quote comes in at 6.75%"
            flip="BRRRR climbs to 84%, $1,420/mo cash flow."
          />
        </div>
      </div>
    </section>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[9px] tracking-[0.22em] uppercase font-semibold"
      style={{ fontFamily: FONT_SUP, color: MUTED }}
    >
      {children}
    </div>
  );
}

function CompactInput({
  label,
  value,
  onChange,
  prefix = "$",
  unit,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  unit?: string;
  testId?: string;
}) {
  return (
    <div>
      <div
        className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-1"
        style={{ fontFamily: FONT_SUP, color: NAVY }}
      >
        {label}
      </div>
      <div
        className="flex items-baseline border-b-2 pb-1"
        style={{ borderColor: NAVY }}
      >
        {prefix && (
          <span
            className="text-[14px] mr-1"
            style={{ color: MUTED, fontFamily: FONT_SERIF }}
          >
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-testid={testId}
          className="flex-1 bg-transparent outline-none text-[18px] tabular-nums w-full"
          style={{ fontFamily: FONT_SERIF, fontWeight: 500, color: NAVY }}
        />
        {unit && (
          <span className="text-[12px]" style={{ color: MUTED }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function PillarKey({ letter, name }: { letter: string; name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-4 h-4 rounded-sm flex items-center justify-center text-[9px] font-semibold"
        style={{ fontFamily: FONT_SUP, backgroundColor: NAVY, color: CREAM }}
      >
        {letter}
      </span>
      <span
        className="text-[9px] tracking-[0.18em] uppercase"
        style={{ fontFamily: FONT_SUP, color: MUTED }}
      >
        {name}
      </span>
    </div>
  );
}

function LaneRow({
  pillar,
  name,
  sub,
  band,
  verdict,
  top,
  needsData,
}: {
  pillar: "D" | "I" | "S";
  name: string;
  sub: string;
  band: [number, number];
  verdict: string;
  top?: boolean;
  needsData?: boolean;
}) {
  const [lo, hi] = band;
  const verdictColor =
    verdict.includes("STRONG")
      ? COPPER
      : verdict.includes("POSSIBLE")
        ? NAVY
        : verdict.includes("NEEDS")
          ? "#b08a4a"
          : MUTED;
  return (
    <div className="flex items-center gap-4 py-1.5 flex-wrap md:flex-nowrap">
      <div className="w-2.5 flex-shrink-0">
        {top && (
          <div className="w-2 h-2 rotate-45" style={{ backgroundColor: COPPER }} />
        )}
      </div>
      <span
        className="w-4 h-4 flex items-center justify-center text-[9px] font-semibold rounded-sm flex-shrink-0"
        style={{
          fontFamily: FONT_SUP,
          backgroundColor: top ? COPPER : "rgba(13,27,45,0.08)",
          color: top ? CREAM : NAVY,
        }}
      >
        {pillar}
      </span>
      <div className="w-48 flex-shrink-0">
        <div
          className="text-[13px] leading-tight"
          style={{
            fontFamily: FONT_SERIF,
            fontWeight: top ? 600 : 500,
            color: NAVY,
          }}
        >
          {name}
        </div>
        <div
          className="text-[10px] leading-tight italic"
          style={{ fontFamily: FONT_SANS, color: MUTED }}
        >
          {sub}
        </div>
      </div>
      <div
        className="flex-1 relative h-3 rounded-sm min-w-[120px]"
        style={{ backgroundColor: RULE }}
      >
        <div
          className="absolute top-0 bottom-0 rounded-sm"
          style={{
            left: `${lo}%`,
            width: `${Math.max(2, hi - lo)}%`,
            backgroundColor: top
              ? COPPER
              : needsData
                ? "#d4b483"
                : "rgba(199,122,58,0.45)",
            opacity: needsData ? 0.5 : 1,
            backgroundImage: needsData
              ? "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 8px)"
              : "none",
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{ left: "50%", backgroundColor: "rgba(13,27,45,0.2)" }}
        />
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{ left: "75%", backgroundColor: "rgba(13,27,45,0.2)" }}
        />
      </div>
      <div
        className="w-20 text-right text-[11px] tabular-nums"
        style={{
          fontFamily: FONT_SERIF,
          color: top ? COPPER : MUTED,
          fontWeight: top ? 600 : 500,
        }}
      >
        {lo}–{hi}%
      </div>
      <div
        className="w-28 text-right text-[9px] tracking-[0.18em] uppercase font-semibold"
        style={{ fontFamily: FONT_SUP, color: verdictColor }}
      >
        {verdict}
      </div>
    </div>
  );
}

function RiskRow({ risk }: { risk: RiskFlag }) {
  const sev = risk.severity;
  const tag =
    sev === "blocker" || sev === "high"
      ? "CRITICAL"
      : sev === "watch"
        ? "WATCH"
        : "NOTE";
  const color =
    sev === "blocker" || sev === "high"
      ? "#c64a3a"
      : sev === "watch"
        ? "#b08a4a"
        : MUTED;
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-sm"
      style={{
        backgroundColor: "rgba(255,255,255,0.4)",
        border: `1px solid ${RULE}`,
      }}
    >
      <span
        className="text-[9px] tracking-[0.22em] uppercase font-semibold px-2 py-0.5 mt-0.5 flex-shrink-0"
        style={{ fontFamily: FONT_SUP, color: CREAM, backgroundColor: color }}
      >
        {tag}
      </span>
      <div className="flex-1">
        <div
          className="text-[13px]"
          style={{ fontFamily: FONT_SERIF, color: NAVY, fontWeight: 500 }}
        >
          {risk.title}
        </div>
        <div
          className="text-[11.5px] mt-0.5 leading-relaxed italic"
          style={{ fontFamily: FONT_SERIF, color: MUTED }}
        >
          → {risk.detail}
        </div>
      </div>
    </div>
  );
}

function FlipCard({ finding, flip }: { finding: string; flip: string }) {
  return (
    <div
      className="p-3 rounded-sm"
      style={{
        backgroundColor: "rgba(13,27,45,0.04)",
        border: `1px solid ${RULE}`,
      }}
    >
      <div
        className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-1.5"
        style={{ fontFamily: FONT_SUP, color: MUTED }}
      >
        If we learn
      </div>
      <div
        className="text-[12px] mb-2 leading-snug"
        style={{ fontFamily: FONT_SERIF, color: NAVY, fontWeight: 500 }}
      >
        {finding}
      </div>
      <div className="h-px mb-2" style={{ backgroundColor: COPPER }} />
      <div
        className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-1"
        style={{ fontFamily: FONT_SUP, color: COPPER }}
      >
        Read flips to
      </div>
      <div
        className="text-[11.5px] leading-snug italic"
        style={{ fontFamily: FONT_SERIF, color: NAVY }}
      >
        {flip}
      </div>
    </div>
  );
}

/* ────────────── RIGHT VERDICT ────────────── */

function RightVerdict({
  tone: _tone,
  frame,
  snapshot,
  topLane,
  framedMemo,
  handleSave,
  handleShare,
  handleExportPDF,
  handleSubmit,
  openLabMode,
  saveIsPending,
  submitIsPending,
  analysisId,
  blueprintTiers,
  onOpenBlueprintTier,
}: {
  tone: Tone;
  frame: typeof TONE_FRAMES[Tone];
  snapshot: StrategySnapshot | null;
  topLane: LaneFitResult | undefined;
  framedMemo: { paragraph: string; nextStep: string };
  handleSave: () => void;
  handleShare: () => void;
  handleExportPDF: () => void;
  handleSubmit: () => void;
  openLabMode: (mode: "explain" | "stress" | "prepare") => void;
  saveIsPending: boolean;
  submitIsPending: boolean;
  analysisId: number | null;
  blueprintTiers: InstrumentWorkbenchProps["blueprintTiers"];
  onOpenBlueprintTier: (key: string) => void;
}) {
  const conf = topLane?.confidence.score ?? 0;
  const band: [number, number] = [clampPct(conf - 7), clampPct(conf + 7)];
  const primary = topLane?.economics?.primaryValue ?? "—";
  const primaryLabel = topLane?.economics?.primaryMetric ?? "Top metric";

  return (
    <aside
      className="pl-0 lg:pl-6 lg:border-l space-y-4 mt-6 lg:mt-0"
      style={{ borderColor: RULE }}
    >
      {/* Verdict card */}
      <div
        className="rounded-sm overflow-hidden"
        style={{ backgroundColor: NAVY, color: CREAM }}
        data-testid="instrument-verdict-card"
      >
        <div
          className="px-5 pt-4 pb-3 flex items-center justify-between border-b"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: "#5fbf7f",
                boxShadow: "0 0 6px #5fbf7f",
              }}
            />
            <span
              className="text-[10px] tracking-[0.28em] uppercase font-semibold"
              style={{ fontFamily: FONT_SUP, color: COPPER }}
            >
              Verdict · Live
            </span>
          </div>
          <span
            className="text-[9px] tracking-[0.2em] uppercase"
            style={{ fontFamily: FONT_SUP, color: "rgba(246,239,228,0.5)" }}
          >
            {snapshot ? `Engine v${snapshot.engineVersion}` : "Engine ready"}
          </span>
        </div>

        {/* Confidence band */}
        <div className="px-5 pt-4">
          <div
            className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-1.5"
            style={{
              fontFamily: FONT_SUP,
              color: "rgba(246,239,228,0.5)",
            }}
          >
            Confidence range
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span
              className="text-[32px] tabular-nums leading-none"
              style={{ fontFamily: FONT_SERIF, fontWeight: 500, color: CREAM }}
              data-testid="instrument-conf-band"
            >
              {topLane ? `${band[0]}–${band[1]}%` : "—"}
            </span>
            <span
              className="text-[11px] italic"
              style={{
                color: "rgba(246,239,228,0.6)",
                fontFamily: FONT_SERIF,
              }}
            >
              {topLane ? `point estimate ${conf}%` : "Add an asking price to score"}
            </span>
          </div>
          <div
            className="relative h-2 rounded-sm"
            style={{ backgroundColor: "rgba(246,239,228,0.12)" }}
          >
            {topLane && (
              <>
                <div
                  className="absolute top-0 bottom-0 rounded-sm"
                  style={{
                    left: `${band[0]}%`,
                    width: `${Math.max(2, band[1] - band[0])}%`,
                    backgroundColor: COPPER,
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-px"
                  style={{ left: `${conf}%`, backgroundColor: CREAM }}
                />
              </>
            )}
            <div
              className="absolute top-0 bottom-0 w-px"
              style={{ left: "75%", backgroundColor: "rgba(246,239,228,0.4)" }}
            />
          </div>
          <div
            className="flex justify-between text-[8px] tracking-[0.18em] uppercase mt-1"
            style={{
              fontFamily: FONT_SUP,
              color: "rgba(246,239,228,0.45)",
            }}
          >
            <span>0</span>
            <span>50</span>
            <span style={{ color: COPPER }}>75 target</span>
            <span>100</span>
          </div>
        </div>

        {/* Top lane + primary metric */}
        <div className="px-5 pt-4 pb-2">
          <div
            className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-1"
            style={{ fontFamily: FONT_SUP, color: COPPER }}
          >
            Top lane
          </div>
          <div
            className="text-[22px] leading-tight"
            style={{ fontFamily: FONT_SERIF, fontWeight: 500, color: CREAM }}
            data-testid="instrument-top-lane"
          >
            {topLane ? LANE_PRESENTATION_NAMES[topLane.lane] ?? topLane.laneLabel : "—"}
          </div>
          <div
            className="text-[11px] mt-0.5 italic"
            style={{
              fontFamily: FONT_SERIF,
              color: "rgba(246,239,228,0.65)",
            }}
          >
            {primaryLabel}: {primary}
          </div>
        </div>

        {/* Tone-framed verdict copy (UI preview) */}
        <div
          className="px-5 py-4 border-t"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            backgroundColor: "rgba(199,122,58,0.06)",
          }}
        >
          <div
            className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-1.5"
            style={{ fontFamily: FONT_SUP, color: COPPER }}
          >
            {frame.kicker} · UI preview
          </div>
          <p
            className="text-[12.5px] leading-[1.6]"
            style={{
              fontFamily: FONT_SERIF,
              color: "rgba(246,239,228,0.92)",
            }}
          >
            {frame.verdict}
          </p>
        </div>

        {/* Engine memo (real) */}
        {framedMemo.paragraph && (
          <div
            className="px-5 py-4 border-t"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            <div
              className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-1.5"
              style={{ fontFamily: FONT_SUP, color: COPPER }}
            >
              Decision memo
            </div>
            <p
              className="text-[12.5px] leading-[1.6]"
              style={{
                fontFamily: FONT_SERIF,
                color: "rgba(246,239,228,0.92)",
              }}
              data-testid="instrument-memo-paragraph"
            >
              {framedMemo.paragraph}
            </p>
            {framedMemo.nextStep && (
              <p
                className="text-[11.5px] leading-relaxed mt-2 italic"
                style={{
                  fontFamily: FONT_SERIF,
                  color: "rgba(246,239,228,0.7)",
                }}
                data-testid="instrument-memo-next"
              >
                Next: {framedMemo.nextStep}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Capital stack modeler tease — routes to /deal-blueprint */}
      <div
        className="rounded-sm overflow-hidden"
        style={{
          border: `1px solid ${RULE}`,
          backgroundColor: "rgba(255,255,255,0.4)",
        }}
      >
        <div
          className="px-4 pt-3 pb-2 flex items-center justify-between border-b"
          style={{ borderColor: RULE }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] tracking-[0.25em] uppercase font-semibold"
              style={{ fontFamily: FONT_SUP, color: NAVY }}
            >
              Capital Stack
            </span>
            <span
              className="text-[8px] tracking-[0.2em] uppercase px-1.5 py-0.5 font-semibold"
              style={{
                fontFamily: FONT_SUP,
                color: COPPER,
                border: `1px solid ${COPPER}`,
              }}
            >
              Blueprint preview
            </span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex h-7 rounded-sm overflow-hidden mb-2">
            <div
              className="flex items-center justify-center"
              style={{ width: "75%", backgroundColor: NAVY }}
            >
              <span
                className="text-[9px] tracking-[0.18em] uppercase font-semibold"
                style={{ fontFamily: FONT_SUP, color: CREAM }}
              >
                Senior 75%
              </span>
            </div>
            <div
              className="flex items-center justify-center"
              style={{ width: "17%", backgroundColor: COPPER }}
            >
              <span
                className="text-[9px] tracking-[0.18em] uppercase font-semibold"
                style={{ fontFamily: FONT_SUP, color: CREAM }}
              >
                LP 17%
              </span>
            </div>
            <div
              className="flex items-center justify-center"
              style={{ width: "8%", backgroundColor: "#a8884a" }}
            >
              <span
                className="text-[8px] tracking-[0.15em] uppercase font-semibold"
                style={{ fontFamily: FONT_SUP, color: CREAM }}
              >
                GP 8%
              </span>
            </div>
          </div>
          <a
            href="/deal-blueprint"
            className="text-[10px] tracking-[0.18em] uppercase font-semibold border-b pb-0.5 inline-block mt-1"
            style={{ fontFamily: FONT_SUP, color: COPPER, borderColor: COPPER }}
            data-testid="instrument-open-modeler"
          >
            Open modeler →
          </a>
        </div>
      </div>

      {/* Peggy Lab Mode (preserved) */}
      <div
        className="rounded-sm p-4"
        style={{
          backgroundColor: "rgba(13,27,45,0.04)",
          border: `1px solid ${RULE}`,
        }}
        data-testid="card-peggy-lab-mode"
      >
        <div
          className="text-[10px] tracking-[0.22em] uppercase font-semibold mb-2"
          style={{ fontFamily: FONT_SUP, color: NAVY }}
        >
          Peggy Lab Mode
        </div>
        <div className="grid grid-cols-1 gap-2">
          {(["explain", "stress", "prepare"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => openLabMode(m)}
              className="text-left border px-3 py-2 hover-elevate"
              style={{ borderColor: RULE, backgroundColor: "rgba(255,255,255,0.4)" }}
              data-testid={`btn-lab-mode-${m}`}
            >
              <div
                className="text-xs font-semibold tracking-wide"
                style={{ fontFamily: FONT_SUP, color: NAVY }}
              >
                {m === "explain"
                  ? "Explain this lane"
                  : m === "stress"
                    ? "Stress test it"
                    : "Prepare for review"}
              </div>
              <div className="text-[11px] leading-snug" style={{ color: MUTED, fontFamily: FONT_SERIF }}>
                {m === "explain"
                  ? "Plain language on why the top lane was recommended."
                  : m === "stress"
                    ? "What breaks first if assumptions slip."
                    : "Tighten inputs and draft submitter notes."}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action block + SLA badge */}
      <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${RULE}` }}>
        <div
          className="grid grid-cols-3 gap-2 p-3"
          style={{ backgroundColor: "rgba(255,255,255,0.4)" }}
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={saveIsPending}
            className="py-2.5 text-[10px] tracking-[0.18em] uppercase font-semibold border disabled:opacity-60"
            style={{ fontFamily: FONT_SUP, borderColor: NAVY, color: NAVY }}
            data-testid="btn-save-snapshot"
          >
            {saveIsPending ? "Saving…" : analysisId ? "Update" : "Save"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="py-2.5 text-[10px] tracking-[0.18em] uppercase font-semibold border"
            style={{ fontFamily: FONT_SUP, borderColor: NAVY, color: NAVY }}
            data-testid="btn-share-snapshot"
          >
            Share
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="py-2.5 text-[10px] tracking-[0.18em] uppercase font-semibold"
            style={{
              fontFamily: FONT_SUP,
              backgroundColor: COPPER,
              color: CREAM,
            }}
            data-testid="btn-export-pdf"
          >
            PDF
          </button>
        </div>
        <div
          className="px-3 py-3 border-t"
          style={{ borderColor: RULE, backgroundColor: NAVY }}
        >
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitIsPending}
            className="w-full py-3 text-[11px] tracking-[0.22em] uppercase font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{
              fontFamily: FONT_SUP,
              backgroundColor: COPPER,
              color: CREAM,
            }}
            data-testid="btn-submit-pegasus"
          >
            {submitIsPending ? "Sending…" : frame.cta}
          </button>
          <div className="flex items-center gap-2 mt-2.5">
            <div
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: "#5fbf7f" }}
            />
            <span
              className="text-[9px] tracking-[0.22em] uppercase font-semibold"
              style={{ fontFamily: FONT_SUP, color: CREAM }}
            >
              SLA · 48 business hours
            </span>
            <span
              className="text-[9px] italic"
              style={{
                color: "rgba(246,239,228,0.55)",
                fontFamily: FONT_SERIF,
              }}
            >
              · or it escalates
            </span>
          </div>
        </div>
        <div
          className="px-3 py-2.5 text-[10px] leading-relaxed border-t"
          style={{
            color: MUTED,
            fontFamily: FONT_SANS,
            backgroundColor: "rgba(255,255,255,0.3)",
            borderColor: RULE,
          }}
        >
          <div className="text-[10px] italic" style={{ fontFamily: FONT_SERIF }}>
            Preliminary. Human review required before any offer, strategy
            release, or execution decision.
          </div>
        </div>
      </div>

      {/* Blueprint tiers list (preserved) */}
      {blueprintTiers.length > 0 && (
        <div
          className="rounded-sm p-4"
          style={{
            border: `1px solid ${COPPER}`,
            backgroundColor: "rgba(199,122,58,0.04)",
          }}
          data-testid="card-blueprint-upsell"
        >
          <div
            className="text-[10px] tracking-[0.22em] uppercase font-semibold mb-2"
            style={{ fontFamily: FONT_SUP, color: NAVY }}
          >
            Pegasus Deal Blueprint
          </div>
          <p
            className="text-xs leading-relaxed mb-3"
            style={{ fontFamily: FONT_SERIF, color: NAVY }}
          >
            Want a written underwriting and structure memo for this property,
            prepared by the Pegasus team? Pick a tier. We confirm scope and
            start work.
          </p>
          <div className="space-y-2">
            {blueprintTiers.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => onOpenBlueprintTier(t.key)}
                className="w-full text-left border px-3 py-2.5 hover-elevate"
                style={{ borderColor: RULE, backgroundColor: CREAM }}
                data-testid={`btn-blueprint-tier-${t.key}`}
              >
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <div
                    className="text-xs font-semibold tracking-wide"
                    style={{ fontFamily: FONT_SUP, color: NAVY }}
                  >
                    {t.title}
                  </div>
                  <div
                    className="text-sm tabular-nums font-semibold"
                    style={{ color: COPPER }}
                  >
                    ${(t.priceCents / 100).toLocaleString()}
                  </div>
                </div>
                <div className="text-[11px]" style={{ color: MUTED }}>
                  Turnaround: {t.turnaroundDays}
                </div>
                <p
                  className="text-[11px] leading-snug mt-1"
                  style={{ color: MUTED, fontFamily: FONT_SERIF }}
                >
                  {t.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

/* ────────────── TRAIL DRAWER ────────────── */

function TrailDrawer({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <div
      className="border-t"
      style={{
        borderColor: RULE,
        backgroundColor: show ? "#0a1424" : "rgba(13,27,45,0.04)",
      }}
      data-testid="instrument-trail-drawer"
    >
      <button
        type="button"
        onClick={toggle}
        className="w-full px-4 lg:px-10 py-2.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span style={{ color: show ? COPPER : NAVY }}>{show ? "▾" : "▸"}</span>
          <span
            className="text-[10px] tracking-[0.28em] uppercase font-semibold"
            style={{ fontFamily: FONT_SUP, color: show ? COPPER : NAVY }}
          >
            Audit Trail
          </span>
          <span
            className="text-[10px] italic"
            style={{
              color: show ? "rgba(246,239,228,0.55)" : MUTED,
              fontFamily: FONT_SERIF,
            }}
          >
            Every input, calc, and lane re-score
          </span>
          <span
            className="text-[8px] tracking-[0.2em] uppercase px-1.5 py-0.5 font-semibold"
            style={{
              fontFamily: FONT_SUP,
              color: show ? CREAM : COPPER,
              border: `1px solid ${show ? CREAM : COPPER}`,
            }}
          >
            Demo data
          </span>
        </div>
        <span
          className="text-[9px] tracking-[0.2em] uppercase"
          style={{
            fontFamily: FONT_SUP,
            color: show ? "rgba(246,239,228,0.55)" : MUTED,
          }}
        >
          {show ? "Collapse" : "Expand"}
        </span>
      </button>
      {show && (
        <div
          className="px-4 lg:px-10 pb-4 text-[11px]"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", color: CREAM }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0.5">
            <TrailLine ts="10:42:01" tag="LANE" msg="Lanes eligible · scored across 3 pillars" />
            <TrailLine ts="10:42:03" tag="INPUT" msg="Scenario · BASE selected" />
            <TrailLine ts="10:42:05" tag="CALC" msg="All-in $498k · spread $112k" />
            <TrailLine ts="10:42:05" tag="LANE" msg="BRRRR · 67% → 72%" tone="up" />
            <TrailLine ts="10:42:06" tag="RISK" msg="Comp depth 3/5 flagged" tone="warn" />
            <TrailLine ts="10:42:08" tag="LENS" msg="Tone frame applied" />
            <TrailLine ts="10:42:09" tag="VERDICT" msg="Top lane locked · range computed" tone="verdict" />
            <TrailLine ts="10:42:10" tag="EXPORT" msg="Snapshot PDF generated" />
          </div>
        </div>
      )}
    </div>
  );
}

function TrailLine({
  ts,
  tag,
  msg,
  tone,
}: {
  ts: string;
  tag: string;
  msg: string;
  tone?: "up" | "warn" | "verdict";
}) {
  const tagColor: Record<string, string> = {
    INPUT: "rgba(246,239,228,0.5)",
    CALC: "#a8b8d4",
    LANE: COPPER,
    RISK: "#e8a07a",
    LENS: "#a8b8d4",
    VERDICT: "#5fbf7f",
    EXPORT: "rgba(246,239,228,0.5)",
  };
  const toneColor =
    tone === "up"
      ? "#7fd09a"
      : tone === "warn"
        ? "#f0c878"
        : tone === "verdict"
          ? CREAM
          : "rgba(246,239,228,0.85)";
  return (
    <div className="flex items-baseline gap-3 py-0.5">
      <span className="tabular-nums" style={{ color: "rgba(246,239,228,0.35)" }}>
        {ts}
      </span>
      <span
        className="text-[9px] tracking-[0.15em] uppercase font-semibold w-14"
        style={{ fontFamily: FONT_SUP, color: tagColor[tag] }}
      >
        {tag}
      </span>
      <span className="flex-1" style={{ color: toneColor }}>
        {msg}
      </span>
    </div>
  );
}

/* ────────────── shared atoms ────────────── */

function Kicker({
  num,
  label,
  active,
}: {
  num: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="text-[10px] tracking-[0.28em] uppercase font-semibold"
        style={{ fontFamily: FONT_SUP, color: active ? COPPER : MUTED }}
      >
        {num} · {label}
      </div>
      {active && <div className="w-12 h-px" style={{ backgroundColor: COPPER }} />}
    </div>
  );
}

function Fact({ k, v, compact = false }: { k: string; v: string; compact?: boolean }) {
  return (
    <div>
      <div
        className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-0.5"
        style={{ fontFamily: FONT_SUP, color: MUTED }}
      >
        {k}
      </div>
      <div
        className={compact ? "text-[13px]" : "text-[14px]"}
        style={{ fontFamily: FONT_SERIF, color: NAVY }}
      >
        {v}
      </div>
    </div>
  );
}
