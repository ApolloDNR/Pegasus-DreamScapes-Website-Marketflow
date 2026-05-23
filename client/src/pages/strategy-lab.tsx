/**
 * Strategy Lab — Console (Desktop). Task #83.
 *
 * Three-zone workspace: Property Identity (320) / Strategy Inputs (flex) /
 * Pegasus Verdict (380). Quick Read collapses Strategy Inputs to essentials.
 * Verdict updates live via the pure-TS engine in `shared/strategy-lab`.
 */
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Plus,
  Minus,
  Pencil,
  Download,
  Share2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertTriangle,
  Info,
  Activity,
  X as XIcon,
  Lock,
  Library,
  Copy,
  Check,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { trackEvent } from "@/lib/analytics";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { usePeggyContext } from "@/contexts/peggy-context";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getOrCreateLabSessionId,
  bumpLabRunCount,
  getLabRunCount,
  freeRunsRemaining,
  FREE_RUN_LIMIT,
} from "@/lib/strategy-lab-session";
import {
  runStrategyLab,
  fmtDollars,
  fmtPct,
  buildStrategyLabInputs,
  inferFinancingCommitted,
  frameDecisionMemo,
  type PropertyInput,
  type CompEntry,
  type SubmitterRole,
  type ConditionRating,
  type LabSubmitterRole,
} from "@shared/strategy-lab";
import { PathMap } from "@/components/strategy-lab/path-map";
import { StrategyFitBoard } from "@/components/strategy-lab/fit-board";
import { SensitivityHeatmap } from "@/components/strategy-lab/sensitivity-heatmap";
import { InstrumentWorkbench } from "@/components/strategy-lab/instrument-workbench";
import { useAccountWall } from "@/hooks/use-account-wall";

// ───────────────────────────────────────────────────────────────────────────
// Form state — superset of PropertyInput plus comps + status + situation.
// ───────────────────────────────────────────────────────────────────────────

type DealStatus =
  | "listed"
  | "off_market"
  | "pending"
  | "wholesale"
  | "pocket"
  | "owner_submitted"
  | "unknown";

const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  listed: "Listed (MLS)",
  off_market: "Off-market",
  pending: "Pending",
  wholesale: "Wholesale",
  pocket: "Pocket listing",
  owner_submitted: "Owner-submitted",
  unknown: "Not specified",
};

const ROLE_LABELS: Record<SubmitterRole, string> = {
  owner_seller: "I own the property",
  wholesaler: "Wholesaler",
  investor_buyer: "Investor / buyer",
  agent: "Agent / broker",
  capital_partner: "Capital partner",
  unknown: "Just analyzing",
};

// ───────────────────────────────────────────────────────────────────────────
// 4-tone Reading Lens (Task #90). Re-frames the Decision Memo + Next Step
// in place via `frameDecisionMemo` so the same snapshot reads differently
// for different audiences. Default lens follows the Submission role.
// ───────────────────────────────────────────────────────────────────────────
type ToneLens = "owner" | "wholesaler" | "capital" | "admin";

const LENS_OPTIONS: { value: ToneLens; label: string; hint: string }[] = [
  { value: "owner", label: "Owner", hint: "Read as the seller/owner." },
  { value: "wholesaler", label: "Wholesaler", hint: "Read as the assignor pricing a spread." },
  { value: "capital", label: "Capital", hint: "Read as the debt or JV partner." },
  { value: "admin", label: "Admin", hint: "Engine memo, unframed." },
];

const LENS_TO_ROLE: Record<ToneLens, LabSubmitterRole> = {
  owner: "owner_seller",
  wholesaler: "wholesaler",
  capital: "capital_partner",
  admin: "unknown",
};

function defaultLensFromRole(role: SubmitterRole): ToneLens {
  switch (role) {
    case "owner_seller":
    case "agent":
      return "owner";
    case "wholesaler":
      return "wholesaler";
    case "investor_buyer":
    case "capital_partner":
      return "capital";
    case "unknown":
    default:
      return "admin";
  }
}

const TONE_LENS_STORAGE_KEY = "pegasus.lab.toneLens";

const CONDITIONS: { value: ConditionRating; label: string }[] = [
  { value: "turnkey", label: "Turnkey" },
  { value: "light", label: "Light cosmetic" },
  { value: "moderate", label: "Moderate rehab" },
  { value: "heavy", label: "Heavy rehab" },
  { value: "gut", label: "Gut" },
];

interface CompRow {
  pricePerSqft: string;
  sqft: string;
  beds: string;
  baths: string;
  distance: string;
  conditionDelta: string; // "-2".."2"
}
const emptyComp = (): CompRow => ({
  pricePerSqft: "",
  sqft: "",
  beds: "",
  baths: "",
  distance: "",
  conditionDelta: "0",
});

type FinancingType =
  | "cash"
  | "conventional"
  | "hard_money"
  | "private_money"
  | "dscr"
  | "seller_carry"
  | "unsure";

const FINANCING_LABELS: Record<FinancingType, string> = {
  cash: "All cash",
  conventional: "Conventional / DSCR (long-term)",
  hard_money: "Hard money (bridge)",
  private_money: "Private money / friend & family",
  dscr: "DSCR refi after stabilization",
  seller_carry: "Seller carry / subject-to",
  unsure: "Not sure yet",
};

type TargetUse =
  | "flip"
  | "rental_hold"
  | "brrrr"
  | "wholesale"
  | "owner_occupy"
  | "adu_development"
  | "undecided";

const TARGET_USE_LABELS: Record<TargetUse, string> = {
  flip: "Flip and resell",
  rental_hold: "Buy and hold rental",
  brrrr: "BRRRR (rehab + refi)",
  wholesale: "Wholesale assignment",
  owner_occupy: "Owner-occupy",
  adu_development: "ADU / development play",
  undecided: "Open to the best path",
};

interface FormState {
  // identity
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: string;
  baths: string;
  sqft: string;
  lotSqft: string;
  yearBuilt: string;
  condition: ConditionRating;
  occupancyStatus: PropertyInput["occupancyStatus"];
  photoNames: string[];
  // role + status
  submitterRole: SubmitterRole;
  dealStatus: DealStatus;
  situation: string;
  timelineDaysToClose: string;
  // numbers
  askingPrice: string;
  rehabBudget: string;
  arvEstimate: string;
  marketRent: string;
  monthlyHoa: string;
  monthlyInsurance: string;
  // intent (Quick Read essentials)
  targetUse: TargetUse;
  financingType: FinancingType;
  // financing + flags
  loanLtvPct: string;
  loanRatePct: string;
  loanTermYears: string;
  financingCommitted: boolean | undefined;
  titleClouded: boolean;
  permitConcerns: boolean;
  zoningAllowsAdu: boolean;
  developmentPotential: boolean;
  // holding + exit + capital stack
  holdingMonths: string;
  monthlyTaxAnnualPct: string;
  exitStrategy: "list_retail" | "wholesale_assignment" | "refi_hold" | "auction" | "owner_finance" | "undecided";
  exitFeesPct: string;
  capitalDownPaymentPct: string;
  capitalRehabSource: "cash" | "hard_money" | "private_money" | "credit_line";
  capitalReservePct: string;
  // comps
  saleComps: CompRow[];
  rentComps: CompRow[];
}

const EMPTY_STATE: FormState = {
  address: "",
  city: "",
  state: "",
  zip: "",
  beds: "",
  baths: "",
  sqft: "",
  lotSqft: "",
  yearBuilt: "",
  condition: "moderate",
  occupancyStatus: "unknown",
  photoNames: [],
  submitterRole: "unknown",
  dealStatus: "unknown",
  situation: "",
  timelineDaysToClose: "",
  askingPrice: "",
  rehabBudget: "",
  arvEstimate: "",
  marketRent: "",
  monthlyHoa: "",
  monthlyInsurance: "",
  targetUse: "undecided",
  financingType: "unsure",
  loanLtvPct: "75",
  loanRatePct: "7.5",
  loanTermYears: "30",
  financingCommitted: undefined,
  titleClouded: false,
  permitConcerns: false,
  zoningAllowsAdu: false,
  developmentPotential: false,
  holdingMonths: "6",
  monthlyTaxAnnualPct: "1.1",
  exitStrategy: "undecided",
  exitFeesPct: "8",
  capitalDownPaymentPct: "25",
  capitalRehabSource: "cash",
  capitalReservePct: "5",
  saleComps: [emptyComp(), emptyComp(), emptyComp()],
  rentComps: [emptyComp(), emptyComp(), emptyComp()],
};

// Illustrative-only sample — loaded by the "View Example Snapshot" CTA so
// first-time visitors can see a populated verdict. Numbers are explicitly
// labeled as illustrative in the UI; never used as production data.
const EXAMPLE_STATE: FormState = {
  ...EMPTY_STATE,
  address: "1247 Aberdeen Way (illustrative)",
  city: "Sacramento",
  state: "CA",
  zip: "95822",
  beds: "3",
  baths: "2",
  sqft: "1450",
  lotSqft: "5500",
  yearBuilt: "1972",
  condition: "moderate",
  occupancyStatus: "vacant",
  askingPrice: "285000",
  rehabBudget: "62000",
  arvEstimate: "475000",
  marketRent: "1950",
  monthlyHoa: "0",
  monthlyInsurance: "150",
};

function parseNum(v: string): number | undefined {
  if (v == null || v.trim() === "") return undefined;
  const n = Number(v.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

function compRowToEntry(row: CompRow, type: "sale" | "rent"): CompEntry | null {
  const pps = parseNum(row.pricePerSqft);
  if (pps == null || pps <= 0) return null;
  const cd = Number(row.conditionDelta);
  const clamped: -2 | -1 | 0 | 1 | 2 = (cd >= -2 && cd <= 2 ? cd : 0) as
    | -2 | -1 | 0 | 1 | 2;
  return {
    type,
    pricePerSqft: pps,
    sqft: parseNum(row.sqft),
    beds: parseNum(row.beds),
    baths: parseNum(row.baths),
    distanceMiles: parseNum(row.distance),
    conditionDelta: clamped,
  };
}

function buildPropertyInput(s: FormState): PropertyInput {
  const inferredFinancingCommitted = inferFinancingCommitted(
    s.financingType,
    s.financingCommitted,
  );
  return {
    address: s.address || undefined,
    city: s.city || undefined,
    state: s.state || undefined,
    zip: s.zip || undefined,
    beds: parseNum(s.beds),
    baths: parseNum(s.baths),
    sqft: parseNum(s.sqft),
    lotSqft: parseNum(s.lotSqft),
    yearBuilt: parseNum(s.yearBuilt),
    condition: s.condition,
    occupancyStatus: s.occupancyStatus,
    submitterRole: s.submitterRole,
    dealStatus: s.dealStatus,
    askingPrice: parseNum(s.askingPrice) ?? 0,
    rehabBudget: parseNum(s.rehabBudget),
    arvEstimate: parseNum(s.arvEstimate),
    marketRent: parseNum(s.marketRent),
    monthlyHoa: parseNum(s.monthlyHoa),
    monthlyInsurance: parseNum(s.monthlyInsurance),
    monthlyTaxAnnualPct: parseNum(s.monthlyTaxAnnualPct),
    timelineDaysToClose: parseNum(s.timelineDaysToClose),
    titleClouded: s.titleClouded || undefined,
    permitConcerns: s.permitConcerns || undefined,
    zoningAllowsAdu: s.zoningAllowsAdu || undefined,
    developmentPotential: s.developmentPotential || undefined,
    financingCommitted: inferredFinancingCommitted,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Role + deal-status aware Decision Memo framing + Next-Step copy now
// lives in `shared/strategy-lab/ui-adapter.ts` (`frameDecisionMemo`).
// ───────────────────────────────────────────────────────────────────────────
// Small UI primitives — kept inline to keep file count low.
// ───────────────────────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-[0.18em] font-supporting font-semibold text-muted-foreground mb-1">
        {label}
      </div>
      {children}
      {hint && (
        <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{hint}</div>
      )}
    </label>
  );
}

function NumInput({
  value,
  onChange,
  placeholder,
  testId,
  prefix,
  suffix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  testId?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-2 text-xs text-muted-foreground pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        inputMode="decimal"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={testId}
        className={`w-full bg-background border border-[hsl(var(--rule))] py-1.5 text-sm font-mono tabular-nums focus:border-[hsl(var(--copper))] focus:outline-none transition-colors ${prefix ? "pl-6" : "pl-2"} ${suffix ? "pr-9" : "pr-2"}`}
      />
      {suffix && (
        <span className="absolute right-2 text-[10px] text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  testId,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  testId?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid={testId}
      className="w-full bg-background border border-[hsl(var(--rule))] px-2 py-1.5 text-sm focus:border-[hsl(var(--copper))] focus:outline-none transition-colors"
    />
  );
}

function SelectInput<T extends string>({
  value,
  onChange,
  options,
  testId,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  testId?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      data-testid={testId}
      className="w-full bg-background border border-[hsl(var(--rule))] px-2 py-1.5 text-sm focus:border-[hsl(var(--copper))] focus:outline-none transition-colors"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function CheckRow({
  label,
  hint,
  checked,
  onChange,
  testId,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  testId?: string;
}) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer text-sm py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        data-testid={testId}
        className="mt-1 accent-[hsl(var(--copper))]"
      />
      <span className="flex-1">
        <span className="text-foreground">{label}</span>
        {hint && (
          <span className="block text-[11px] text-muted-foreground leading-snug">{hint}</span>
        )}
      </span>
    </label>
  );
}

function SectionCard({
  id,
  title,
  kicker,
  children,
  defaultOpen = true,
  collapsible = true,
}: {
  id?: string;
  title: string;
  kicker?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      id={id}
      className="border-t border-[hsl(var(--rule))] pt-5 pb-1"
      data-testid={id ? `card-${id}` : undefined}
    >
      <button
        type="button"
        onClick={() => collapsible && setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-3 text-left ${collapsible ? "cursor-pointer group" : "cursor-default"}`}
      >
        <div>
          {kicker && (
            <div className="text-[10px] uppercase tracking-[0.26em] font-supporting font-semibold text-primary mb-1">
              {kicker}
            </div>
          )}
          <h3 className="font-serif text-xl font-semibold text-foreground leading-tight group-hover:text-[hsl(var(--copper))] transition-colors">
            {title}
          </h3>
        </div>
        {collapsible && (
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`}
          />
        )}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Comp Pad
// ───────────────────────────────────────────────────────────────────────────
function CompPadRow({
  row,
  onChange,
  onRemove,
  canRemove,
  testIdPrefix,
}: {
  row: CompRow;
  onChange: (r: CompRow) => void;
  onRemove: () => void;
  canRemove: boolean;
  testIdPrefix: string;
}) {
  return (
    <div className="grid grid-cols-[1.2fr_1fr_0.7fr_0.7fr_0.9fr_0.9fr_auto] gap-1.5 items-center">
      <NumInput
        value={row.pricePerSqft}
        onChange={(v) => onChange({ ...row, pricePerSqft: v })}
        prefix="$"
        suffix="/sf"
        placeholder="0"
        testId={`${testIdPrefix}-pps`}
      />
      <NumInput
        value={row.sqft}
        onChange={(v) => onChange({ ...row, sqft: v })}
        suffix="sf"
        placeholder="sqft"
        testId={`${testIdPrefix}-sqft`}
      />
      <NumInput
        value={row.beds}
        onChange={(v) => onChange({ ...row, beds: v })}
        placeholder="bd"
        testId={`${testIdPrefix}-beds`}
      />
      <NumInput
        value={row.baths}
        onChange={(v) => onChange({ ...row, baths: v })}
        placeholder="ba"
        testId={`${testIdPrefix}-baths`}
      />
      <NumInput
        value={row.distance}
        onChange={(v) => onChange({ ...row, distance: v })}
        suffix="mi"
        placeholder="dist"
        testId={`${testIdPrefix}-dist`}
      />
      <SelectInput
        value={row.conditionDelta}
        onChange={(v) => onChange({ ...row, conditionDelta: v })}
        options={[
          { value: "-2", label: "Worse −−" },
          { value: "-1", label: "Worse −" },
          { value: "0", label: "Match" },
          { value: "1", label: "Better +" },
          { value: "2", label: "Better ++" },
        ]}
        testId={`${testIdPrefix}-cond`}
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="p-1.5 text-muted-foreground disabled:opacity-30 hover:text-foreground"
        aria-label="Remove comp row"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Page
// ───────────────────────────────────────────────────────────────────────────
export default function StrategyLabPage() {
  useSEO({
    title: "Strategy Lab",
    description:
      "Run a property through the Pegasus lens. Lane fit, risk, and a recommended next step. Preliminary; human review required.",
    image: "/og/strategy-lab.png",
  });

  // Brief §11 analytics — fire `strategy_lab_started` once per mount
  // (consent-gated; no-op until the visitor opts in).
  useEffect(() => {
    trackEvent("strategy_lab_started");
  }, []);

  const [form, setForm] = useState<FormState>(EMPTY_STATE);
  const [mode, setMode] = useState<"quick" | "full">(() => {
    if (typeof window === "undefined") return "quick";
    const m = new URLSearchParams(window.location.search).get("mode");
    return m === "full" || m === "fullpath" ? "full" : "quick";
  });

  // Deep-link to ?mode=full → scroll past hero to the workbench on mount.
  useEffect(() => {
    if (mode !== "full" || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") !== "full" && params.get("mode") !== "fullpath") return;
    const t = setTimeout(() => {
      document
        .querySelector('[data-testid="instrument-workbench"]')
        ?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 80);
    return () => clearTimeout(t);
    // intentionally only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [selectedLane, setSelectedLane] = useState<string | null>(null);
  const [exampleLoaded, setExampleLoaded] = useState(false);

  // ── Open-in-Lab loader (Task #84) ───────────────────────────────────────
  // When the Library or a deep link points back at the Lab with
  // ?analysisId=N, hydrate the form from that saved row so the user can
  // refresh the math, re-share, or update the snapshot.
  const [pendingLoadId, setPendingLoadId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const id = Number(new URLSearchParams(window.location.search).get("analysisId"));
    return Number.isFinite(id) && id > 0 ? id : null;
  });

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((s) => ({ ...s, [key]: value }));
  }, []);

  const property = useMemo(() => buildPropertyInput(form), [form]);
  const comps: CompEntry[] = useMemo(() => {
    const out: CompEntry[] = [];
    for (const r of form.saleComps) {
      const e = compRowToEntry(r, "sale");
      if (e) out.push(e);
    }
    for (const r of form.rentComps) {
      const e = compRowToEntry(r, "rent");
      if (e) out.push(e);
    }
    return out;
  }, [form.saleComps, form.rentComps]);

  // All input shaping (LTV from down payment, rate floor from capital
  // source, financing-commitment inference) lives in the shared adapter so
  // this page stays a pure presenter.
  const engineInputs = useMemo(
    () =>
      buildStrategyLabInputs({
        property,
        comps,
        loanLtvPct: parseNum(form.loanLtvPct) ?? 75,
        loanRatePct: parseNum(form.loanRatePct) ?? 7.5,
        loanTermYears: parseNum(form.loanTermYears) ?? 30,
        financingType: form.financingType,
        capitalRehabSource: form.capitalRehabSource,
        capitalDownPaymentPct: parseNum(form.capitalDownPaymentPct),
      }),
    [
      property,
      comps,
      form.loanLtvPct,
      form.loanRatePct,
      form.loanTermYears,
      form.financingType,
      form.capitalRehabSource,
      form.capitalDownPaymentPct,
    ],
  );

  // Quick Read editable assumptions — defaults match Apollo's underwriting
  // baseline and were previously hidden inside the engine. Surfacing them
  // here means a Quick Read user can sanity-check (or override) every lever
  // without graduating to Full Path.
  const [quickAssumptions, setQuickAssumptions] = useState({
    loanLtvPct: "75",
    loanRatePct: "7.5",
    managementPct: "8",
    closingReservePct: "3",
    vacancyPct: "8",
  });
  const updateQuick = useCallback(
    <K extends keyof typeof quickAssumptions>(k: K, v: string) =>
      setQuickAssumptions((s) => ({ ...s, [k]: v })),
    [],
  );

  // Quick Read inline validation — non-blocking warnings for the small set
  // of inputs where 0 / blank / inverted values would silently produce a
  // misleading verdict. Reads the raw form fields so users see the warning
  // the instant they finish typing.
  const quickValidation = useMemo(() => {
    const out: { field: string; message: string }[] = [];
    const price = parseNum(form.askingPrice);
    const arv = parseNum(form.arvEstimate);
    const rehab = parseNum(form.rehabBudget);
    const rent = parseNum(form.marketRent);
    if (price != null && price <= 0) {
      out.push({ field: "askingPrice", message: "Asking price must be greater than $0." });
    }
    if (arv != null && arv <= 0) {
      out.push({ field: "arvEstimate", message: "ARV must be greater than $0." });
    }
    if (price != null && arv != null && price > 0 && arv > 0 && arv < price) {
      out.push({
        field: "arvEstimate",
        message: `ARV ($${arv.toLocaleString()}) is below asking price — this isn't a fix-and-flip or BRRRR candidate.`,
      });
    }
    if (rehab != null && rehab < 0) {
      out.push({ field: "rehabBudget", message: "Rehab budget cannot be negative." });
    }
    if (rent != null && rent <= 0 && rent != null) {
      out.push({ field: "marketRent", message: "Market rent must be greater than $0/mo to score rental lanes." });
    }
    return out;
  }, [form.askingPrice, form.arvEstimate, form.rehabBudget, form.marketRent]);

  const snapshot = useMemo(() => {
    if (!engineInputs.property.askingPrice || engineInputs.property.askingPrice <= 0) return null;
    try {
      // Quick Read assumption overrides take precedence over the form-level
      // financing fields so users can experiment without polluting Full Path.
      const ltvOverride = parseNum(quickAssumptions.loanLtvPct);
      const rateOverride = parseNum(quickAssumptions.loanRatePct);
      const mgmtOverride = parseNum(quickAssumptions.managementPct);
      const closingOverride = parseNum(quickAssumptions.closingReservePct);
      const vacancyOverride = parseNum(quickAssumptions.vacancyPct);
      return runStrategyLab(engineInputs.property, {
        comps: engineInputs.comps,
        loanLtvPct: mode === "quick" && ltvOverride != null ? ltvOverride : engineInputs.loanLtvPct,
        loanRatePct: mode === "quick" && rateOverride != null ? rateOverride : engineInputs.loanRatePct,
        loanTermYears: engineInputs.loanTermYears,
        managementPct: mode === "quick" && mgmtOverride != null ? mgmtOverride : undefined,
        closingReservePct: mode === "quick" && closingOverride != null ? closingOverride : undefined,
        vacancyPctBase: mode === "quick" && vacancyOverride != null ? vacancyOverride : undefined,
      });
    } catch (e) {
      // Engine should never throw on user input, but if it does we surface the
      // empty state rather than crashing the page.
      // eslint-disable-next-line no-console
      console.error("Strategy Lab engine error:", e);
      return null;
    }
  }, [engineInputs, quickAssumptions, mode]);

  // 4-tone Reading Lens (Task #90). `toneLens` of null means "follow the
  // submission role". A manual selection pins the lens for the session and
  // persists in sessionStorage. Effective lens drives both the in-page memo
  // framing and the `?tone=` query passed to the PDF export.
  const [toneLens, setToneLens] = useState<ToneLens | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.sessionStorage.getItem(TONE_LENS_STORAGE_KEY);
      if (stored && (LENS_TO_ROLE as Record<string, unknown>)[stored]) {
        setToneLens(stored as ToneLens);
      }
    } catch {
      /* ignore */
    }
  }, []);
  const effectiveLens: ToneLens = toneLens ?? defaultLensFromRole(form.submitterRole);
  const selectLens = useCallback((lens: ToneLens) => {
    setToneLens(lens);
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(TONE_LENS_STORAGE_KEY, lens);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const framedMemo = useMemo(() => {
    if (!snapshot) return { paragraph: "", nextStep: "" };
    return frameDecisionMemo(snapshot.memo, LENS_TO_ROLE[effectiveLens], form.dealStatus);
  }, [snapshot, effectiveLens, form.dealStatus]);

  const topLane = snapshot?.lanes[0];

  // "How we got this number" — substituted values for the headline metric of
  // the TOP lane that the snapshot actually surfaces. Keeps the math reveal
  // honest: if Quick Read shows "Monthly cash flow", the chain shown is NOI
  // minus debt service, not a generic refi expression.
  const quickMath = useMemo(() => {
    if (!snapshot || !topLane) return null;
    const price = engineInputs.property.purchasePrice ?? engineInputs.property.askingPrice ?? 0;
    if (!price) return null;
    const arv = engineInputs.property.arvEstimate ?? 0;
    const rehab = engineInputs.property.rehabBudget ?? 0;
    const rent = engineInputs.property.marketRent ?? 0;
    const ltvPct = parseNum(quickAssumptions.loanLtvPct) ?? 75;
    const ratePct = parseNum(quickAssumptions.loanRatePct) ?? 7.5;
    const mgmtPct = parseNum(quickAssumptions.managementPct) ?? 8;
    const closingPct = parseNum(quickAssumptions.closingReservePct) ?? 3;
    const vacancyPct = parseNum(quickAssumptions.vacancyPct) ?? 8;
    const downPayment = price * (1 - ltvPct / 100);
    const loanAmount = price * (ltvPct / 100);
    const closingReserve = price * (closingPct / 100);
    const totalCashIn = downPayment + rehab + closingReserve;
    const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;

    // Lane-specific arithmetic chain leading to the displayed primaryValue.
    const lane = topLane.lane;
    const base = snapshot.scenarios.base;
    const lines: { label: string; value: string }[] = [
      { label: "Effective price", value: fmt(price) },
      { label: `Down payment (price × ${(100 - ltvPct).toFixed(0)}%)`, value: fmt(downPayment) },
      { label: `Loan amount (price × ${ltvPct}%)`, value: fmt(loanAmount) },
      { label: `Closing reserve (price × ${closingPct}%)`, value: fmt(closingReserve) },
      { label: "Total cash in (down + rehab + closing)", value: fmt(totalCashIn) },
    ];

    // Lane-specific arithmetic that mirrors shared/strategy-lab/lanes.ts so
    // every line in the reveal terminates at the same number the lane scorer
    // surfaced as `economics.primaryValue`. Calculator-math test asserts
    // parity for BRRRR + rental_hold.
    if (lane === "flip") {
      const closing = arv * 0.06; // lanes.ts: closing = c.arv * 0.06
      const netProfit = arv - price - rehab - closing;
      lines.push(
        { label: "Selling cost (ARV × 6%)", value: fmt(closing) },
        { label: "Net profit = ARV − price − rehab − selling", value: fmt(netProfit) },
      );
    } else if (lane === "wholetail") {
      const closing = arv * 0.07; // lanes.ts: c.arv * 0.07
      const netProfit = arv - price - rehab - closing;
      lines.push(
        { label: "Selling cost (ARV × 7%)", value: fmt(closing) },
        { label: "Net after light rehab = ARV − price − rehab − selling", value: fmt(netProfit) },
      );
    } else if (lane === "brrrr") {
      // lanes.ts scoreBrrrr uses totalIn = askingPrice + rehab (NOT the
      // engine's down+rehab+closing). Mirror exactly so the reveal lands
      // on the same `Cash left in after refi` value.
      const refiProceeds = arv * 0.75;
      const totalIn = price + rehab;
      const cashLeft = Math.max(0, totalIn - refiProceeds);
      lines.push(
        { label: "Total in (price + rehab)", value: fmt(totalIn) },
        { label: "Refi cash-out (ARV × 75% LTV)", value: fmt(refiProceeds) },
        { label: "Cash left in = max(0, total in − refi)", value: fmt(cashLeft) },
      );
    } else if (lane === "rental_hold" || lane === "jv") {
      lines.push(
        { label: `EGI (rent × 12 × ${(100 - vacancyPct).toFixed(0)}%)`, value: fmt(base.effectiveGrossIncome) },
        { label: "NOI (EGI − opex, Base)", value: fmt(base.noiAnnual) },
        { label: `Debt service @ ${ratePct}% / 30 yr`, value: fmt(base.annualDebtService) },
        { label: "Annual cash flow = NOI − debt", value: fmt(base.annualCashFlow) },
        { label: "Monthly cash flow = annual / 12", value: fmt(base.annualCashFlow / 12) },
      );
    } else if (lane === "wholesale") {
      // lanes.ts: fee = max(0, arv * 0.7 - rehab - askingPrice)
      const seventyMao = arv * 0.7 - rehab;
      const fee = Math.max(0, seventyMao - price);
      lines.push(
        { label: "70% rule MAO = ARV × 70% − rehab", value: fmt(seventyMao) },
        { label: "Assignment fee = max(0, MAO − asking)", value: fmt(fee) },
      );
    }

    return { price, arv, rehab, rent, ltvPct, ratePct, mgmtPct, closingPct, vacancyPct, lines, fmt };
  }, [snapshot, topLane, engineInputs, quickAssumptions]);

  // ── Persistence + share + PDF + submit (Task #84) ──────────────────────
  const { isAuthenticated } = useSupabaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const peggy = usePeggyContext();
  const sessionIdRef = useRef<string>("");
  if (!sessionIdRef.current) sessionIdRef.current = getOrCreateLabSessionId();
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [shareInfo, setShareInfo] = useState<{ token: string; visibility: "summary" | "full" } | null>(null);
  // Full-tier sharing exposes raw underwriting math; require an explicit
  // second-step confirmation before the share token is minted.
  const [pendingFullShareConfirm, setPendingFullShareConfirm] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  // Account wall state + dismissed flag + ensureAuth live in a dedicated
  // hook so the behavior is unit-testable. See use-account-wall.ts and
  // client/src/__tests__/strategy-lab/account-wall.test.tsx.
  const {
    accountWallOpen,
    accountWallReason,
    openAccountWall,
    handleWallOpenChange,
    ensureAuth: ensureAuthFromHook,
    wallDismissedRef,
  } = useAccountWall({ isAuthenticated, toast });
  // Keep a ref of isAuthenticated so the run-limit effect does not re-fire
  // every time auth state recomputes (which was causing the wall to re-pop).
  const isAuthenticatedRef = useRef(isAuthenticated);
  useEffect(() => { isAuthenticatedRef.current = isAuthenticated; }, [isAuthenticated]);
  const [shareCopied, setShareCopied] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [runsLeft, setRunsLeft] = useState<number>(() => freeRunsRemaining());

  // Stable signature of every engine input that materially affects the
  // analysis. Bumping the run counter on this signature (rather than on
  // topLane shifts) means each meaningful scenario the user runs counts
  // as one run, even when the recommended lane stays the same. The
  // signature is debounced via a 600ms timer to avoid counting every
  // keystroke as a new run.
  const runSignature = useMemo(() => {
    if (!snapshot) return null;
    const p = engineInputs.property;
    return [
      p.askingPrice ?? "", p.arvEstimate ?? "", p.rehabBudget ?? "",
      p.marketRent ?? "", p.sqft ?? "", p.beds ?? "", p.baths ?? "",
      p.condition ?? "", p.occupancyStatus ?? "",
      form.financingType ?? "", engineInputs.loanLtvPct,
      engineInputs.loanRatePct, engineInputs.loanTermYears,
      form.capitalRehabSource ?? "", form.capitalDownPaymentPct ?? "",
      snapshot.topLane,
    ].join("|");
  }, [snapshot, engineInputs, form.financingType, form.capitalRehabSource, form.capitalDownPaymentPct]);

  // Run-limit policy (3 free runs, gate on the 4th):
  //   - Run #1, #2, #3 → bump counter, render Verdict normally.
  //   - Run #4 (any further unique signature)  → DO NOT bump the counter
  //     and open the Account Wall instead. The user keeps the snapshot
  //     already on screen but cannot run a new analysis until they sign in.
  const lastSignatureRef = useRef<string | null>(null);
  useEffect(() => {
    if (!runSignature || runSignature === lastSignatureRef.current) return;
    const t = window.setTimeout(() => {
      if (runSignature === lastSignatureRef.current) return;
      lastSignatureRef.current = runSignature;
      if (!isAuthenticatedRef.current && freeRunsRemaining() === 0) {
        // 4th attempt — gate without consuming a free run.
        // openAccountWall is a no-op once the user dismissed the wall this session.
        openAccountWall("keep running new properties");
        setRunsLeft(0);
        return;
      }
      bumpLabRunCount();
      setRunsLeft(freeRunsRemaining());
    }, 600);
    return () => window.clearTimeout(t);
  }, [runSignature, openAccountWall]);

  const draftSavedSignatureRef = useRef<string | null>(null);
  const draftInFlightRef = useRef(false);

  // Hydrate from ?analysisId once.
  useEffect(() => {
    if (!pendingLoadId) return;
    let cancelled = false;
    (async () => {
      try {
        const url = isAuthenticated
          ? `/api/property-analyses/${pendingLoadId}`
          : `/api/property-analyses/${pendingLoadId}?sessionId=${encodeURIComponent(sessionIdRef.current)}`;
        const res = await apiRequest("GET", url);
        const row = (await res.json()) as {
          id: number;
          address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          propertyInput: Partial<{ askingPrice: number; arvEstimate: number; rehabBudget: number; marketRent: number; sqft: number; beds: number; baths: number }> | null;
        };
        if (cancelled || !row) return;
        const p = row.propertyInput ?? {};
        setForm((s) => ({
          ...s,
          address: row.address ?? s.address,
          city: row.city ?? s.city,
          state: row.state ?? s.state,
          zip: row.zip ?? s.zip,
          askingPrice: p.askingPrice != null ? String(p.askingPrice) : s.askingPrice,
          arvEstimate: p.arvEstimate != null ? String(p.arvEstimate) : s.arvEstimate,
          rehabBudget: p.rehabBudget != null ? String(p.rehabBudget) : s.rehabBudget,
          marketRent: p.marketRent != null ? String(p.marketRent) : s.marketRent,
          sqft: p.sqft != null ? String(p.sqft) : s.sqft,
          beds: p.beds != null ? String(p.beds) : s.beds,
          baths: p.baths != null ? String(p.baths) : s.baths,
        }));
        setAnalysisId(row.id);
      } catch (err) {
        toast({ title: "Could not load saved snapshot", description: "It may have been deleted.", variant: "destructive" });
      } finally {
        if (!cancelled) setPendingLoadId(null);
      }
    })();
    return () => { cancelled = true; };
  }, [pendingLoadId, isAuthenticated, toast]);

  const buildAnalysisPayload = useCallback(() => {
    if (!snapshot) return null;
    const askingPriceCents = engineInputs.property.askingPrice
      ? Math.round(engineInputs.property.askingPrice * 100)
      : null;
    const arvCents = engineInputs.property.arvEstimate
      ? Math.round(engineInputs.property.arvEstimate * 100)
      : null;
    const rehabCents = engineInputs.property.rehabBudget
      ? Math.round(engineInputs.property.rehabBudget * 100)
      : null;
    const rentCents = engineInputs.property.marketRent
      ? Math.round(engineInputs.property.marketRent * 100)
      : null;
    return {
      sessionId: sessionIdRef.current,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      zip: form.zip || null,
      askingPrice: askingPriceCents,
      arvEstimate: arvCents,
      rehabBudget: rehabCents,
      monthlyRent: rentCents,
      engineVersion: snapshot.engineVersion,
      topLane: snapshot.topLane,
      topLaneVerdict: snapshot.lanes[0]?.verdict ?? null,
      topLaneScore: snapshot.lanes[0]?.confidence?.score ?? null,
      propertyInput: engineInputs.property,
      snapshot,
      runCount: getLabRunCount(),
    };
  }, [form, engineInputs, snapshot]);

  // Anonymous draft auto-save (Task #84 reviewer pass 5).
  // While the user is anonymous, every settled snapshot is auto-persisted
  // as a userId=null row keyed by sessionId. This guarantees that when the
  // user later signs in (Account Wall → /api/login), AnonymousClaimWatcher
  // has a real row to migrate — no in-progress work is ever lost. The
  // server route already strips body.userId for unauthenticated POSTs.
  // Authenticated users use the explicit Save button instead.
  useEffect(() => {
    if (isAuthenticated) return;
    if (!snapshot || !runSignature) return;
    if (draftSavedSignatureRef.current === runSignature) return;
    if (draftInFlightRef.current) return;
    const t = window.setTimeout(async () => {
      const payload = buildAnalysisPayload();
      if (!payload) return;
      draftInFlightRef.current = true;
      try {
        if (analysisId) {
          await apiRequest("PATCH", `/api/property-analyses/${analysisId}`, payload);
        } else {
          const res = await apiRequest("POST", "/api/property-analyses", payload);
          const created = await res.json().catch(() => ({} as { id?: number }));
          if (created?.id) setAnalysisId(created.id);
        }
        draftSavedSignatureRef.current = runSignature;
      } catch {
        // Auto-save is best-effort; the explicit Save button surfaces errors.
      } finally {
        draftInFlightRef.current = false;
      }
    }, 1200);
    return () => window.clearTimeout(t);
  }, [isAuthenticated, snapshot, runSignature, analysisId, buildAnalysisPayload]);

  // ensureAuth is provided by useAccountWall. Explicit gated actions
  // (Save / Share / PDF / Submit) always force-open the wall and also
  // fire a parallel sign-in toast, even if the user previously
  // dismissed the run-limit auto-pop. See `use-account-wall.ts`.
  const ensureAuth = ensureAuthFromHook;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildAnalysisPayload();
      if (!payload) throw new Error("Run the engine first.");
      if (analysisId) {
        const res = await apiRequest("PATCH", `/api/property-analyses/${analysisId}`, payload);
        return await res.json();
      }
      const res = await apiRequest("POST", "/api/property-analyses", payload);
      return await res.json();
    },
    onSuccess: (row: any) => {
      if (row?.id) setAnalysisId(row.id);
      queryClient.invalidateQueries({ queryKey: ["/api/property-analyses"] });
      fireTouchpoint("save", { analysisId: row?.id ?? analysisId });
      toast({ title: "Saved to your library", description: "Find it under Strategy Lab → Library." });
    },
    onError: (err: any) => {
      toast({ title: "Could not save", description: err?.message ?? "Try again.", variant: "destructive" });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async (visibility: "summary" | "full") => {
      let id = analysisId;
      if (!id) {
        const payload = buildAnalysisPayload();
        if (!payload) throw new Error("Run the engine first.");
        const res = await apiRequest("POST", "/api/property-analyses", payload);
        const created = await res.json();
        id = created.id;
        setAnalysisId(created.id);
      }
      const res = await apiRequest("POST", `/api/property-analyses/${id}/share`, { visibility });
      return (await res.json()) as { shareToken: string; visibility: "summary" | "full" };
    },
    onSuccess: (data) => {
      setShareInfo({ token: data.shareToken, visibility: data.visibility });
      queryClient.invalidateQueries({ queryKey: ["/api/property-analyses"] });
      fireTouchpoint("share", { visibility: data.visibility });
    },
    onError: (err: any) => {
      toast({ title: "Could not create share link", description: err?.message ?? "Try again.", variant: "destructive" });
    },
  });

  // ── Task #85 — Funnel telemetry, Submit-to-Pegasus, Blueprint upsell ──
  // Lightweight fire-and-forget event log. Best-effort: failures are
  // intentionally swallowed so the lab never blocks on analytics.
  const fireTouchpoint = useCallback(
    (action: string, payload?: Record<string, unknown>) => {
      try {
        void apiRequest("POST", "/api/strategy-lab/touchpoint", {
          sessionId: sessionIdRef.current,
          action,
          propertyAnalysisId: analysisId ?? undefined,
          topLane: snapshot?.topLane ?? undefined,
          payload: payload ?? undefined,
        }).catch(() => {});
      } catch {
        /* ignore */
      }
    },
    [analysisId, snapshot],
  );

  // Funnel telemetry: fire a `run` touchpoint each time the recommended top
  // lane changes (the engine recomputes synchronously on every input change,
  // so this is debounced to lane shifts rather than every keystroke).
  const lastRunLaneRef = useRef<string | null>(null);
  useEffect(() => {
    if (!snapshot || !topLane) return;
    const key = `${mode}:${topLane.lane}`;
    if (lastRunLaneRef.current === key) return;
    lastRunLaneRef.current = key;
    fireTouchpoint(mode === "quick" ? "quick_run" : "full_run", {
      topLane: topLane.lane,
      verdict: topLane.verdict,
      analysisId: analysisId ?? undefined,
      mode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot?.topLane, topLane?.lane, mode]);

  // Push lab snapshot into Peggy's context whenever the recommended lane
  // shifts so Peggy's "Explain / Stress / Prepare" replies always reference
  // the current address + verdict, not stale form state.
  useEffect(() => {
    if (!snapshot || !topLane) {
      peggy.updateContext({ labAnalysis: undefined });
      return;
    }
    peggy.updateContext({
      page: "strategy-lab",
      labAnalysis: {
        address: form.address || undefined,
        topLane: snapshot.topLane,
        topLaneLabel: topLane.laneLabel,
        topLaneVerdict: topLane.verdictLabel,
        confidenceScore: topLane.confidence?.score ?? null,
        memoParagraph: framedMemo.paragraph,
        memoNextStep: framedMemo.nextStep,
        laneSummary: snapshot.lanes.slice(0, 4).map((l) => ({
          lane: l.lane,
          label: l.laneLabel,
          verdict: l.verdictLabel,
          headline: l.economics?.primaryMetric
            ? `${l.economics.primaryMetric}: ${l.economics.primaryValue}`
            : (l.confidence?.score != null ? `Confidence ${l.confidence.score}` : ""),
        })),
        primaryMetric: topLane.economics
          ? { label: topLane.economics.primaryMetric, value: String(topLane.economics.primaryValue) }
          : null,
        risks: snapshot.risks.slice(0, 6).map((r: any) => ({
          severity: r.severity,
          title: r.title,
          detail: r.detail,
        })),
        inputs: {
          askingPrice: form.askingPrice,
          arvEstimate: form.arvEstimate,
          rehabBudget: form.rehabBudget,
          marketRent: form.marketRent,
          holdingMonths: form.holdingMonths,
          condition: form.condition,
          targetUse: form.targetUse,
          financingType: form.financingType,
          exitStrategy: form.exitStrategy,
          dealStatus: form.dealStatus,
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot?.topLane, topLane?.laneLabel, framedMemo.paragraph, form.address, snapshot?.risks?.length]);

  // Submit to Pegasus — Task #85 priority-escalation 48hr SLA path.
  // Posts via /api/strategy-lab/submit (NOT the legacy boolean route),
  // collecting submitter contact + notes via a small dialog before fan-out.
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({ submitterName: "", email: "", phone: "", notes: "" });
  const submitMutation = useMutation({
    mutationFn: async (vals: { submitterName: string; email: string; phone: string; notes: string }) => {
      let id = analysisId;
      if (!id) {
        const payload = buildAnalysisPayload();
        if (!payload) throw new Error("Run the engine first.");
        const res = await apiRequest("POST", "/api/property-analyses", payload);
        const created = await res.json();
        id = created.id;
        setAnalysisId(created.id);
      }
      const res = await apiRequest("POST", "/api/strategy-lab/submit", {
        propertyAnalysisId: id,
        sessionId: sessionIdRef.current,
        submitterName: vals.submitterName || undefined,
        submitterEmail: vals.email || undefined,
        submitterPhone: vals.phone || undefined,
        submitterRole: form.submitterRole !== "unknown" ? form.submitterRole : undefined,
        notes: vals.notes || undefined,
      });
      return (await res.json()) as { submissionId: number; slaDueAt: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-analyses"] });
      fireTouchpoint("submit_pegasus_success", { submissionId: data.submissionId });
      // Brief §11 analytics — Strategy Lab funnel completion.
      trackEvent("strategy_lab_completed", { submissionId: data.submissionId });
      setSubmitDialogOpen(false);
      navigate(`/strategy-lab/submitted?id=${data.submissionId}`);
    },
    onError: (err: any) => {
      toast({ title: "Could not submit", description: err?.message ?? "Try again.", variant: "destructive" });
    },
  });

  // Blueprint tiers (CMS-overridable via site_content)
  const blueprintTiersQuery = useQuery<{
    tiers: Array<{ key: string; title: string; priceCents: number; description: string; turnaroundDays: string }>;
    stripeEnabled: boolean;
  }>({
    queryKey: ["/api/strategy-lab/blueprint-tiers"],
  });
  const [blueprintDialogOpen, setBlueprintDialogOpen] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [blueprintForm, setBlueprintForm] = useState({ buyerName: "", email: "", phone: "", notes: "" });
  const blueprintOrderMutation = useMutation({
    mutationFn: async (vals: { tierId: string; buyerName: string; email: string; phone: string; notes: string }) => {
      let id = analysisId;
      if (!id && snapshot) {
        const payload = buildAnalysisPayload();
        if (payload) {
          const res = await apiRequest("POST", "/api/property-analyses", payload);
          const created = await res.json();
          id = created.id;
          setAnalysisId(created.id);
        }
      }
      const res = await apiRequest("POST", "/api/strategy-lab/blueprint-order", {
        propertyAnalysisId: id ?? undefined,
        sessionId: sessionIdRef.current,
        tier: vals.tierId,
        contactName: vals.buyerName || undefined,
        contactEmail: vals.email || undefined,
        contactPhone: vals.phone || undefined,
        notes: vals.notes || undefined,
      });
      return (await res.json()) as {
        orderId: number;
        paymentMethod: "stripe" | "invoice";
        paymentStatus: string;
        checkoutUrl: string | null;
      };
    },
    onSuccess: (data) => {
      fireTouchpoint("blueprint_order_created", { orderId: data.orderId, paymentMethod: data.paymentMethod });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setBlueprintDialogOpen(false);
      toast({
        title: "Order received. Invoice incoming.",
        description: "Apollo's team will email a custom invoice within one business day.",
      });
      navigate(`/strategy-lab/blueprint-confirmed?orderId=${data.orderId}`);
    },
    onError: (err: any) => {
      toast({ title: "Could not place order", description: err?.message ?? "Try again.", variant: "destructive" });
    },
  });

  const handleSave = useCallback(() => {
    if (!snapshot) {
      toast({ title: "Add a price first", description: "Enter at least the asking price to save.", variant: "destructive" });
      return;
    }
    if (!ensureAuth("save this snapshot to your library")) return;
    saveMutation.mutate();
  }, [snapshot, ensureAuth, saveMutation, toast]);

  const handleExportPDF = useCallback(async () => {
    if (!snapshot) {
      toast({ title: "Add a price first", description: "Enter at least the asking price to export.", variant: "destructive" });
      return;
    }
    if (!ensureAuth("export the full Snapshot PDF")) return;
    try {
      let id = analysisId;
      if (!id) {
        const payload = buildAnalysisPayload();
        if (!payload) return;
        const res = await apiRequest("POST", "/api/property-analyses", payload);
        const created = await res.json();
        id = created.id;
        setAnalysisId(created.id);
      }
      fireTouchpoint("pdf", { analysisId: id, tone: effectiveLens });
      const url = `/api/pdf/strategy-snapshot/by-id/${id}?tone=${effectiveLens}`;
      // Mobile-friendly: show an in-page preview first so the user can review
      // the PDF before saving / printing instead of triggering an immediate
      // cross-tab download. Desktop users see the same preview and can open
      // the raw PDF from the dialog.
      setPdfPreviewUrl(url);
    } catch (err: any) {
      toast({ title: "Could not export PDF", description: err?.message ?? "Try again.", variant: "destructive" });
    }
  }, [snapshot, analysisId, buildAnalysisPayload, ensureAuth, toast, effectiveLens, fireTouchpoint]);

  const handleShare = useCallback(() => {
    if (!snapshot) {
      toast({ title: "Add a price first", description: "Enter at least the asking price to share.", variant: "destructive" });
      return;
    }
    if (!ensureAuth("create a shareable link")) return;
    setShareDialogOpen(true);
  }, [snapshot, ensureAuth, toast]);

  const handleSubmit = useCallback(() => {
    if (!snapshot) {
      toast({ title: "Add a price first", description: "Enter at least the asking price to submit.", variant: "destructive" });
      return;
    }
    if (!ensureAuth("submit this property to Pegasus for review")) return;
    fireTouchpoint("submit_dialog_open");
    setSubmitDialogOpen(true);
  }, [snapshot, ensureAuth, toast, fireTouchpoint]);

  // Lab Mode panel — flips Peggy into Explain / Stress test / Prepare for review.
  const openLabMode = useCallback(
    (mode: "explain" | "stress" | "prepare") => {
      if (!snapshot || !topLane) {
        toast({ title: "Run the lab first", description: "Enter at least the asking price to use Peggy Lab Mode.", variant: "destructive" });
        return;
      }
      peggy.updateContext({ page: "strategy-lab", labMode: mode });
      const seed =
        mode === "explain"
          ? `Explain in plain language why "${topLane.laneLabel}" was recommended for ${form.address || "this property"}. What signals carried the most weight, and what would flip the recommendation?`
          : mode === "stress"
            ? `Stress test the "${topLane.laneLabel}" recommendation for ${form.address || "this property"}. What breaks first if ARV softens, rehab overruns, hold time doubles, or rates rise? Which input is most worth re-checking before I submit?`
            : `I'm preparing to submit ${form.address || "this property"} to Pegasus. What inputs should I sharpen, what documents will the team ask for, and draft a one-paragraph submitter notes block I can paste into the form.`;
      peggy.setPendingPrompt(seed);
      peggy.openChat();
      fireTouchpoint("lab_mode_open", { mode });
    },
    [snapshot, topLane, form.address, peggy, toast, fireTouchpoint],
  );

  const shareUrl = shareInfo
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/snapshot/calc/${shareInfo.token}`
    : "";

  const copyShareUrl = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Select the link and copy manually.", variant: "destructive" });
    }
  }, [shareUrl, toast]);

  // ── Path Map node activation ────────────────────────────────────────────
  const pathNodes = useMemo(() => {
    return [
      {
        id: "property",
        label: "Property",
        scrollTo: "section-identity",
        active: !!(form.address || form.city) && !!parseNum(form.sqft),
      },
      {
        id: "situation",
        label: "Situation",
        scrollTo: "section-identity",
        active: form.submitterRole !== "unknown" && form.dealStatus !== "unknown",
      },
      {
        id: "numbers",
        label: "Numbers",
        scrollTo: "section-acquisition",
        active:
          !!parseNum(form.askingPrice) &&
          (!!parseNum(form.rehabBudget) || !!parseNum(form.arvEstimate)),
      },
      {
        id: "comps",
        label: "Comps",
        scrollTo: "section-comps",
        active: comps.length >= 3,
      },
      {
        id: "risk",
        label: "Risk",
        scrollTo: "section-risk",
        active: !!snapshot && snapshot.risks.length > 0,
      },
      {
        id: "paths",
        label: "Strategy Paths",
        scrollTo: "section-fit",
        active: !!snapshot,
      },
      {
        id: "exit",
        label: "Exit",
        scrollTo: "section-memo",
        active: !!snapshot,
      },
      {
        id: "next",
        label: "Next Step",
        scrollTo: "section-memo",
        active: !!snapshot && !!snapshot.memo.nextStep,
      },
    ];
  }, [form, comps, snapshot]);

  const altLanes = snapshot?.lanes.slice(1, 3) ?? [];
  const ruledOut = snapshot?.lanes.find((l) => l.verdict === "not_recommended");
  const focusLane =
    snapshot?.lanes.find((l) => l.lane === selectedLane) ?? topLane;
  const focusSensitivity = snapshot?.sensitivities.find(
    (s) => s.lane === focusLane?.lane,
  ) ?? snapshot?.sensitivities[0];

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-[hsl(var(--rule))]">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 pt-28 lg:pt-32 pb-10">
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
            Strategy Lab
          </div>
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 xl:col-span-7 min-w-0">
              <h1 className="font-serif font-semibold tracking-[-0.02em] leading-[1.04]">
                <span className="block text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl">Strategy Lab.</span>
                <span className="block italic bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] mt-2">
                  One address in. Every angle out.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mt-5 max-w-2xl font-serif">
                Run the property through the Pegasus lens. Lane fit, risk register, scenario
                stress, and a recommended next step. Preliminary, transparent, and editable.
              </p>
            </div>
            <div className="lg:col-span-4 xl:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:items-end lg:justify-end">
              <button
                onClick={() => {
                  document
                    .getElementById("section-identity")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="bg-[hsl(var(--copper))] text-primary-foreground px-6 py-3 text-sm font-supporting font-semibold tracking-wide hover:bg-[hsl(27_56%_44%)] transition-colors"
                data-testid="cta-start-analysis"
              >
                Start an Analysis
              </button>
              <button
                onClick={() => {
                  setForm(EXAMPLE_STATE);
                  setExampleLoaded(true);
                }}
                className="border border-[hsl(var(--rule))] text-foreground px-6 py-3 text-sm font-supporting font-semibold tracking-wide hover:bg-[hsl(var(--ink)/0.04)] transition-colors"
                data-testid="cta-example-snapshot"
              >
                View Example Snapshot
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-6 max-w-3xl leading-relaxed">
            Preliminary analysis only. Human review required before any offer, strategy
            release, or execution decision. Outputs are illustrative and do not constitute
            an offer of guaranteed returns or principal protection.
          </p>

          {/* ── 3-tier funnel ribbon (intake-only, hidden in Full Path) ── */}
          <div
            className={`${mode === "full" ? "hidden" : ""} mt-8 grid grid-cols-1 sm:grid-cols-3 border border-[hsl(var(--rule))] bg-background`}
            data-testid="ribbon-funnel-tiers"
          >
            <div className="p-4 border-b sm:border-b-0 sm:border-r border-[hsl(var(--rule))]">
              <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-1">
                01 · Free Quick Read
              </div>
              <div className="text-sm font-semibold text-foreground mb-0.5">Run any address now</div>
              <div className="text-xs text-muted-foreground leading-snug">
                No account. Lane fit, verdict, headline math. {FREE_RUN_LIMIT} free runs before sign-in.
              </div>
            </div>
            <div className="p-4 border-b sm:border-b-0 sm:border-r border-[hsl(var(--rule))]">
              <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-1">
                02 · Full Path Analyzer
              </div>
              <div className="text-sm font-semibold text-foreground mb-0.5">Save · Share · PDF</div>
              <div className="text-xs text-muted-foreground leading-snug">
                Free with a Pegasus account. Scenarios, risk register, sensitivity, snapshot PDF.
              </div>
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-[hsl(var(--copper))] mb-1">
                03 · Pegasus Deal Blueprint
              </div>
              <div className="text-sm font-semibold text-foreground mb-0.5">Human-prepared memo</div>
              <div className="text-xs text-muted-foreground leading-snug">
                Paid tier. Underwriting + structure + outreach scripts, written by the Pegasus team.
              </div>
            </div>
          </div>
        </div>
        {/* Brand stripe accent. */}
        <div className="brand-stripe" aria-hidden="true" />
      </section>

      {/* Sticky sub-nav: mode toggle + section anchors + status */}
      <div
        className="sticky top-16 lg:top-20 z-30 border-b border-[hsl(var(--rule))] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        data-testid="strategy-lab-subnav"
      >
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="inline-flex border border-[hsl(var(--rule))]" role="tablist" aria-label="Strategy Lab mode">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "quick"}
                onClick={() => setMode("quick")}
                className={`px-4 py-2 text-xs uppercase tracking-[0.18em] font-supporting font-semibold transition-colors ${mode === "quick" ? "bg-[hsl(var(--ink))] text-[hsl(var(--paper))]" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="mode-quick"
              >
                Quick Read
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "full"}
                onClick={() => {
                  setMode("full");
                  requestAnimationFrame(() => {
                    document
                      .querySelector('[data-testid="instrument-workbench"]')
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
                }}
                className={`px-4 py-2 text-xs uppercase tracking-[0.18em] font-supporting font-semibold border-l border-[hsl(var(--rule))] transition-colors ${mode === "full" ? "bg-[hsl(var(--ink))] text-[hsl(var(--paper))]" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="mode-full"
              >
                Full Path
              </button>
            </div>
            {mode === "full" && (
              <nav
                aria-label="Strategy Lab sections"
                className="hidden md:flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] font-supporting font-semibold text-muted-foreground"
                data-testid="subnav-section-anchors"
              >
                {[
                  { id: "section-identity", label: "Property" },
                  { id: "section-recommendation", label: "Verdict" },
                  { id: "section-fit", label: "Fit" },
                  { id: "section-risk", label: "Risk" },
                  { id: "section-memo", label: "Memo" },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => document.getElementById(a.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="px-2 py-1 hover:text-foreground transition-colors"
                    data-testid={`subnav-${a.id}`}
                  >
                    {a.label}
                  </button>
                ))}
              </nav>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
            {exampleLoaded && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setForm(EMPTY_STATE);
                    setExampleLoaded(false);
                    setSelectedLane(null);
                  }}
                  className="underline underline-offset-2 hover:text-foreground"
                  data-testid="btn-clear-example"
                >
                  Clear example
                </button>
                <span className="px-2 py-0.5 border border-[hsl(var(--rule))] text-[10px] uppercase tracking-[0.16em] font-supporting font-semibold text-muted-foreground">
                  Illustrative example
                </span>
              </>
            )}
            <span className="hidden sm:inline">
              {snapshot
                ? `Engine v${snapshot.engineVersion} · ${comps.length} comp${comps.length === 1 ? "" : "s"}`
                : "Engine ready · awaiting inputs"}
            </span>
          </div>
        </div>
      </div>

      {/* PathMap is rendered by InstrumentWorkbench in Full Path mode; Quick Read has none. */}
      {/* (Full Path PathMap moved into InstrumentWorkbench.) */}

      {/* Portable calculators — canonical card row. Deep-link to /strategy-lab/classic?tab=. Always visible. */}
      <section className="border-b border-[hsl(var(--rule))] bg-[hsl(var(--paper))]" data-testid="strategy-lab-calc-row" aria-labelledby="portable-calc-heading">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-10 py-10">
          <div className="flex items-end justify-between gap-6 mb-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary/70" aria-hidden="true" />
                <span className="text-[11px] uppercase tracking-[0.3em] font-supporting font-semibold text-primary">
                  Portable calculators
                </span>
              </div>
              <h2 id="portable-calc-heading" className="mt-3 font-serif text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-foreground">
                Need just one number? Pull the right calculator.
              </h2>
            </div>
            <Link
              href="/strategy-lab/classic"
              className="hidden md:inline text-[11px] uppercase tracking-[0.24em] font-supporting font-semibold text-primary hover:text-[hsl(var(--copper))]"
              data-testid="link-classic-suite"
            >
              See the classic suite →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" data-testid="calc-tiles">
            {[
              { tab: "arv", label: "ARV", desc: "70% rule, comps in, MAO out." },
              { tab: "roi", label: "ROI", desc: "Cap rate, CoC, total return." },
              { tab: "brrrr", label: "BRRRR", desc: "Cash left in deal after refi." },
              { tab: "cashflow", label: "Cash Flow", desc: "Rent vs PITI plus opex." },
              { tab: "wholesale", label: "Wholesale MAO", desc: "Assignment fee headroom." },
              { tab: "piti", label: "PITI", desc: "Housing affordability, 28/36." },
              { tab: "ownvsrent", label: "Own vs Rent", desc: "Net worth crossover year." },
              { tab: "hardmoney", label: "Hard Money", desc: "Short-term carry cost." },
            ].map((c) => (
              <Link
                key={c.tab}
                href={`/strategy-lab/classic?tab=${c.tab}`}
                className="group relative block border border-[hsl(var(--rule))] bg-background hover:bg-[hsl(var(--paper))] hover:border-[hsl(var(--copper))]/60 transition-colors p-4"
                data-testid={`calc-tile-${c.tab}`}
              >
                <div className="text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold text-primary">
                  Calculator
                </div>
                <h3 className="mt-1.5 font-serif text-xl font-semibold tracking-tight leading-tight text-foreground">
                  {c.label}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-snug">{c.desc}</p>
                <span
                  className="absolute right-3 bottom-3 text-[hsl(var(--copper))] opacity-0 group-hover:opacity-100 transition-opacity text-base"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Read (one-screen) ───────────────────────────────────── */}
      {mode === "quick" && (
        <main className="max-w-5xl mx-auto px-6 lg:px-10 py-8" data-testid="quick-read-layout">
          <div className="grid gap-6 lg:grid-cols-2 items-start">
            {/* Compact 5-field form */}
            <section
              className="border border-[hsl(var(--rule))] bg-background shadow-[0_1px_0_rgba(13,27,45,0.04),0_8px_24px_-12px_rgba(13,27,45,0.18)] p-6 lg:p-7 space-y-5"
              data-testid="quick-form"
            >
              <div className="pb-4 border-b border-[hsl(var(--rule))]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-px w-6 bg-primary/60" aria-hidden="true" />
                  <div className="text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold text-primary">
                    Quick Read
                  </div>
                </div>
                <h2 className="font-serif text-3xl font-semibold tracking-tight leading-tight">
                  Five fields. One verdict.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  The basics. Pegasus reads the most likely outcome lane and the headline number, live as you type.
                </p>
              </div>
              <Field label="Address">
                <TextInput
                  value={form.address}
                  onChange={(v) => update("address", v)}
                  placeholder="1247 Aberdeen Way"
                  testId="quick-input-address"
                />
              </Field>
              <Field label="Asking / target price">
                <NumInput
                  value={form.askingPrice}
                  onChange={(v) => update("askingPrice", v)}
                  prefix="$"
                  testId="quick-input-price"
                />
                {quickValidation.filter((v) => v.field === "askingPrice").map((v, i) => (
                  <p key={i} className="text-[11px] text-amber-700 mt-1" data-testid="validation-quick-askingPrice">
                    {v.message}
                  </p>
                ))}
              </Field>
              <Field label="Rehab budget" hint="Engineer or GC estimate.">
                <NumInput
                  value={form.rehabBudget}
                  onChange={(v) => update("rehabBudget", v)}
                  prefix="$"
                  testId="quick-input-rehab"
                />
                {quickValidation.filter((v) => v.field === "rehabBudget").map((v, i) => (
                  <p key={i} className="text-[11px] text-amber-700 mt-1" data-testid="validation-quick-rehabBudget">
                    {v.message}
                  </p>
                ))}
              </Field>
              <Field label="ARV (After-Repair)" hint="Appraised value post-rehab.">
                <NumInput
                  value={form.arvEstimate}
                  onChange={(v) => update("arvEstimate", v)}
                  prefix="$"
                  testId="quick-input-arv"
                />
                {quickValidation.filter((v) => v.field === "arvEstimate").map((v, i) => (
                  <p key={i} className="text-[11px] text-amber-700 mt-1" data-testid="validation-quick-arvEstimate">
                    {v.message}
                  </p>
                ))}
              </Field>
              <Field label="Market rent" hint="If you held it as a rental.">
                <NumInput
                  value={form.marketRent}
                  onChange={(v) => update("marketRent", v)}
                  prefix="$"
                  suffix="/mo"
                  testId="quick-input-rent"
                />
                {quickValidation.filter((v) => v.field === "marketRent").map((v, i) => (
                  <p key={i} className="text-[11px] text-amber-700 mt-1" data-testid="validation-quick-marketRent">
                    {v.message}
                  </p>
                ))}
              </Field>
              <div className="pt-2 text-[11px] text-muted-foreground leading-snug">
                Need scenarios, risks, sensitivity, or PDF export? Switch to Full Path on the right.
              </div>

              {/* Hidden defaults — now editable inline. The static fallbacks
                  (vacancy 8%, tax 1.1%, insurance $150/mo) live in
                  scenarios.ts and the methodology doc. */}
              <details
                className="mt-2 rounded-md border border-[hsl(var(--rule))] bg-muted/20 p-4 [&[open]>summary>span.chev]:rotate-90"
                data-testid="quick-assumptions"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary">
                    What we're assuming. Tap to edit.
                  </span>
                  <span className="chev transition-transform text-primary text-xs" aria-hidden="true">›</span>
                </summary>
                <p className="mt-2 text-[11px] text-muted-foreground leading-snug" data-testid="quick-assumptions-scope">
                  These drive scenario economics (cash flow, NOI, capital stack). Lane scoring still uses the doctrinal levers (70% rule for flips, 75% refi for BRRRR) so verdicts stay comparable across deals.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field label="Loan LTV" hint="Default 75%.">
                    <NumInput
                      value={quickAssumptions.loanLtvPct}
                      onChange={(v) => updateQuick("loanLtvPct", v)}
                      suffix="%"
                      testId="quick-assume-ltv"
                    />
                  </Field>
                  <Field label="Loan rate" hint="Default 7.5%.">
                    <NumInput
                      value={quickAssumptions.loanRatePct}
                      onChange={(v) => updateQuick("loanRatePct", v)}
                      suffix="%"
                      testId="quick-assume-rate"
                    />
                  </Field>
                  <Field label="Mgmt %" hint="Default 8% of rent.">
                    <NumInput
                      value={quickAssumptions.managementPct}
                      onChange={(v) => updateQuick("managementPct", v)}
                      suffix="%"
                      testId="quick-assume-mgmt"
                    />
                  </Field>
                  <Field label="Closing reserve" hint="Default 3% of price.">
                    <NumInput
                      value={quickAssumptions.closingReservePct}
                      onChange={(v) => updateQuick("closingReservePct", v)}
                      suffix="%"
                      testId="quick-assume-closing"
                    />
                  </Field>
                  <Field label="Vacancy (Base)" hint="Default 8%. Stressed/Worst auto-stack +2pp/+4pp.">
                    <NumInput
                      value={quickAssumptions.vacancyPct}
                      onChange={(v) => updateQuick("vacancyPct", v)}
                      suffix="%"
                      testId="quick-assume-vacancy"
                    />
                  </Field>
                </div>
                <ul className="mt-3 text-[11px] text-muted-foreground leading-snug space-y-1 border-t border-[hsl(var(--rule))] pt-3">
                  <li className="flex justify-between gap-3"><span>Property tax</span><span className="tabular-nums text-foreground">1.1% / yr of price</span></li>
                  <li className="flex justify-between gap-3"><span>Insurance</span><span className="tabular-nums text-foreground">$150 / mo</span></li>
                  <li className="flex justify-between gap-3"><span>Loan term</span><span className="tabular-nums text-foreground">30 yr fixed</span></li>
                </ul>
                <p className="text-[11px] text-muted-foreground leading-snug pt-2">
                  Need to edit vacancy, tax, insurance, or comps? Switch to <span className="font-semibold text-foreground">Full Path</span>.
                </p>
              </details>
            </section>

            {/* Stripped 3-card verdict */}
            <aside className="space-y-3 lg:sticky lg:top-24" data-testid="quick-verdict">
              {!snapshot || !topLane ? (
                <div className="border border-dashed border-[hsl(var(--rule))] p-6 text-center">
                  <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-2">
                    Pegasus Verdict
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Enter an asking price to see the live verdict.
                  </div>
                </div>
              ) : (
                <>
                  {/* Card 1 — Top lane */}
                  <div
                    className="border border-[hsl(var(--copper))] bg-[hsl(var(--copper)/0.05)] p-4"
                    data-testid="quick-card-lane"
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary">
                        Recommended lane
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.16em] font-supporting font-bold text-[hsl(var(--copper))]">
                        {topLane.verdictLabel}
                      </div>
                    </div>
                    <h3 className="font-serif text-2xl font-semibold leading-tight mb-1">
                      {topLane.laneLabel}
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed">
                      {topLane.headline}
                    </p>
                  </div>

                  {/* Card 2 — Confidence */}
                  <div
                    className="border border-[hsl(var(--rule))] p-4"
                    data-testid="quick-card-confidence"
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary">
                        Confidence
                      </div>
                      <div className="text-xs tabular-nums text-muted-foreground">
                        {topLane.confidence.score}/100
                      </div>
                    </div>
                    <div className="font-serif text-2xl font-semibold tabular-nums">
                      {topLane.confidence.score >= 70
                        ? "Strong"
                        : topLane.confidence.score >= 45
                          ? "Moderate"
                          : "Thin"}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-1">
                      {topLane.confidence.score >= 70
                        ? "Inputs support this read."
                        : topLane.confidence.score >= 45
                          ? "Some inputs need firming up."
                          : "Add more data for a stronger read."}
                    </p>
                  </div>

                  {/* Card 3 — Primary metric */}
                  {topLane.economics && (
                    <div
                      className="border border-[hsl(var(--rule))] p-4"
                      data-testid="quick-card-metric"
                    >
                      <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-2">
                        Headline number
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.16em] font-supporting font-semibold text-muted-foreground mb-1">
                        {topLane.economics.primaryMetric}
                      </div>
                      <div className="font-serif text-3xl font-semibold tabular-nums">
                        {topLane.economics.primaryValue}
                      </div>

                      {quickMath && (
                        <details className="mt-3 border-t border-[hsl(var(--rule))] pt-3 [&[open]>summary>span.chev]:rotate-90">
                          <summary className="cursor-pointer list-none flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary">
                              How we got this number
                            </span>
                            <span className="chev transition-transform text-primary text-xs" aria-hidden="true">›</span>
                          </summary>
                          <ul className="mt-3 text-[11px] text-muted-foreground leading-relaxed space-y-1.5 font-mono" data-testid="quick-math-reveal">
                            {quickMath.lines.map((ln, i) => (
                              <li key={i} className="flex justify-between gap-3">
                                <span className="text-foreground">{ln.label}</span>
                                <span className="tabular-nums">{ln.value}</span>
                              </li>
                            ))}
                            <li className="pt-1 text-[10px] italic border-t border-[hsl(var(--rule))]/50">
                              Mgmt {quickMath.mgmtPct}% · Rate {quickMath.ratePct}% / 30 yr · Vacancy {quickMath.vacancyPct}% (Base)
                            </li>
                          </ul>
                          <p className="mt-2 text-[10px] text-muted-foreground leading-snug">
                            Edit any assumption above to recompute. Full Path adds Stressed / Worst scenarios, DSCR, and the lane-by-lane sensitivity grid.
                          </p>
                        </details>
                      )}
                    </div>
                  )}

                  {/* See full analysis CTA */}
                  <button
                    type="button"
                    onClick={() => {
                      fireTouchpoint("quick_to_full", {
                        topLane: topLane.lane,
                      });
                      setMode("full");
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--ink))] text-[hsl(var(--paper))] px-4 py-3 text-xs font-supporting font-semibold tracking-wide uppercase hover:bg-[hsl(var(--charcoal))] transition-colors"
                    data-testid="btn-see-full-analysis"
                  >
                    See full analysis <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {!isAuthenticated && (
                    <div
                      className="text-[11px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary border-l-2 border-[hsl(var(--copper))] pl-2"
                      data-testid="text-runs-remaining-quick"
                    >
                      {runsLeft > 0
                        ? `${runsLeft} of ${FREE_RUN_LIMIT} free runs left`
                        : "Free runs used. Sign in to keep going."}
                    </div>
                  )}
                </>
              )}
            </aside>
          </div>
        </main>
      )}

      {/* Full Path — Workbench Instrument (graduated from approved mockup). */}
      {mode === "full" && (
        <InstrumentWorkbench
          form={{
            address: form.address,
            city: form.city,
            state: form.state,
            zip: form.zip,
            beds: form.beds,
            baths: form.baths,
            sqft: form.sqft,
            yearBuilt: form.yearBuilt,
            condition: form.condition,
            occupancyStatus: form.occupancyStatus,
            submitterRole: form.submitterRole,
            dealStatus: form.dealStatus,
            askingPrice: form.askingPrice,
            rehabBudget: form.rehabBudget,
            arvEstimate: form.arvEstimate,
            marketRent: form.marketRent,
            loanRatePct: form.loanRatePct,
          }}
          update={update}
          snapshot={snapshot}
          topLane={topLane}
          framedMemo={framedMemo}
          effectiveLens={effectiveLens}
          selectLens={selectLens}
          handleSave={handleSave}
          handleShare={handleShare}
          handleExportPDF={handleExportPDF}
          handleSubmit={handleSubmit}
          openLabMode={openLabMode}
          saveIsPending={saveMutation.isPending}
          submitIsPending={submitMutation.isPending}
          analysisId={analysisId}
          isAuthenticated={isAuthenticated}
          runsLeft={runsLeft}
          freeRunLimit={FREE_RUN_LIMIT}
          blueprintTiers={blueprintTiersQuery.data?.tiers ?? []}
          onOpenBlueprintTier={(key) => {
            setSelectedTierId(key);
            setBlueprintDialogOpen(true);
            fireTouchpoint("blueprint_tier_open", { tierId: key });
          }}
          fireTouchpoint={fireTouchpoint}
        />
      )}

      {/* Mobile sticky Verdict drawer (Task #84) — Full Path only */}
      {mode === "full" && snapshot && topLane && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-[hsl(var(--rule))] bg-[hsl(var(--paper))] shadow-[0_-8px_24px_rgba(13,27,45,0.08)]" data-testid="mobile-verdict-drawer">
          {!drawerOpen ? (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="w-full px-4 py-3 pr-24 flex items-center justify-between gap-3 text-left"
              data-testid="mobile-drawer-collapsed"
            >
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary">Verdict</div>
                <div className="font-serif text-base font-semibold truncate">{topLane.laneLabel}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {topLane.economics?.primaryMetric}: <span className="font-semibold text-foreground">{topLane.economics?.primaryValue}</span>
                </div>
              </div>
              <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>
          ) : (
            <div className="max-h-[78vh] overflow-y-auto">
              <div className="sticky top-0 bg-[hsl(var(--paper))] border-b border-[hsl(var(--rule))] px-4 py-2.5 flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary">Pegasus Verdict</div>
                <button onClick={() => setDrawerOpen(false)} className="p-1" data-testid="mobile-drawer-close" aria-label="Close verdict">
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="px-4 py-4 space-y-4">
                <div>
                  <div className="font-serif text-2xl font-semibold leading-tight">{topLane.laneLabel}</div>
                  <div className="text-sm text-muted-foreground mt-1">{topLane.headline}</div>
                </div>
                {topLane.economics && (
                  <div className="border border-[hsl(var(--rule))] p-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-2">{topLane.economics.primaryMetric}</div>
                    <div className="font-serif text-2xl font-semibold tabular-nums">{topLane.economics.primaryValue}</div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {(topLane.economics.metrics ?? []).slice(0, 4).map((m) => (
                        <div key={m.label}>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-supporting">{m.label}</div>
                          <div className="text-sm font-semibold tabular-nums">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {framedMemo.paragraph && (
                  <div className="border-l-2 border-[hsl(var(--copper))] pl-3">
                    <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-1">Decision Memo</div>
                    <p className="text-sm font-serif leading-relaxed">{framedMemo.paragraph}</p>
                    {framedMemo.nextStep && (
                      <p className="text-xs text-muted-foreground mt-2 italic">Next: {framedMemo.nextStep}</p>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button onClick={handleSave} className="border border-[hsl(var(--rule))] px-3 py-2.5 text-xs font-supporting font-semibold flex items-center justify-center gap-1.5" data-testid="mobile-btn-save">
                    <Library className="w-3.5 h-3.5" /> Save
                  </button>
                  <button onClick={handleShare} className="border border-[hsl(var(--rule))] px-3 py-2.5 text-xs font-supporting font-semibold flex items-center justify-center gap-1.5" data-testid="mobile-btn-share">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <button onClick={handleExportPDF} className="bg-[hsl(var(--ink))] text-[hsl(var(--paper))] px-3 py-2.5 text-xs font-supporting font-semibold flex items-center justify-center gap-1.5" data-testid="mobile-btn-pdf">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button onClick={handleSubmit} className="bg-[hsl(var(--copper))] text-primary-foreground px-3 py-2.5 text-xs font-supporting font-semibold flex items-center justify-center gap-1.5" data-testid="mobile-btn-submit">
                    <Activity className="w-3.5 h-3.5" /> Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile/desktop PDF preview dialog (Task #84). Replaces window.open
          so mobile users can review the snapshot in-page before downloading. */}
      <Dialog open={!!pdfPreviewUrl} onOpenChange={(o) => { if (!o) setPdfPreviewUrl(null); }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col" data-testid="dialog-pdf-preview">
          <DialogHeader>
            <div className="text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold text-primary mb-2">Snapshot PDF</div>
            <DialogTitle className="font-serif text-2xl">Preview before you save or share.</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Review the snapshot below. Use Download to save a copy, or Open in new tab if your device cannot render the inline preview.
            </DialogDescription>
          </DialogHeader>
          {pdfPreviewUrl && (
            <iframe
              src={pdfPreviewUrl}
              title="Strategy Snapshot PDF preview"
              className="flex-1 w-full min-h-[55vh] border border-[hsl(var(--rule))] bg-[hsl(var(--paper))]"
              data-testid="iframe-pdf-preview"
            />
          )}
          <DialogFooter className="gap-2">
            {pdfPreviewUrl && (
              <>
                <a
                  href={pdfPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[hsl(var(--rule))] px-4 py-2 text-sm font-supporting font-semibold inline-flex items-center gap-1.5"
                  data-testid="link-pdf-open-new-tab"
                >
                  Open in new tab
                </a>
                <a
                  href={pdfPreviewUrl}
                  download
                  className="bg-[hsl(var(--copper))] text-primary-foreground px-4 py-2 text-sm font-supporting font-semibold inline-flex items-center gap-1.5"
                  data-testid="link-pdf-download"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </>
            )}
            <button
              type="button"
              className="border border-[hsl(var(--rule))] px-4 py-2 text-sm font-supporting font-semibold"
              onClick={() => setPdfPreviewUrl(null)}
              data-testid="btn-pdf-preview-close"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Wall modal (soft, after FREE_RUN_LIMIT or on gated action) */}
      <Dialog open={accountWallOpen} onOpenChange={handleWallOpenChange}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-account-wall">
          <DialogHeader>
            <div className="text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold text-primary mb-2 flex items-center gap-2">
              <Lock className="w-3 h-3" /> Sign in to continue
            </div>
            <DialogTitle className="font-serif text-2xl">Save your work in a free account.</DialogTitle>
            <DialogDescription className="font-serif text-base text-muted-foreground leading-relaxed">
              You've used {getLabRunCount()} of your {FREE_RUN_LIMIT} free Strategy Lab runs. Sign in to {accountWallReason || "save and share"}. It takes ten seconds, and your current snapshot will follow you in.
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground border-l-2 border-[hsl(var(--copper))] pl-3 italic">
            Every property gets a serious review. Not every property gets an offer.
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              className="border border-[hsl(var(--rule))] px-4 py-2 text-sm font-supporting font-semibold"
              onClick={() => handleWallOpenChange(false)}
              data-testid="btn-account-wall-dismiss"
            >
              Maybe later
            </button>
            <button
              type="button"
              className="bg-[hsl(var(--copper))] text-primary-foreground px-4 py-2 text-sm font-supporting font-semibold"
              onClick={() => {
                handleWallOpenChange(false);
                navigate("/api/login");
              }}
              data-testid="btn-account-wall-signin"
            >
              Sign in / Create account
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={(o) => { setShareDialogOpen(o); if (!o) { setShareInfo(null); setPendingFullShareConfirm(false); } }}>
        <DialogContent className="sm:max-w-lg" data-testid="dialog-share">
          <DialogHeader>
            <div className="text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold text-primary mb-2">Share Snapshot</div>
            <DialogTitle className="font-serif text-2xl">Choose what your viewer sees.</DialogTitle>
            <DialogDescription className="font-serif text-base text-muted-foreground leading-relaxed">
              The summary tier shows the recommended path and a short memo. The full tier shows numbers, risk register, capital stack, and sensitivity.
            </DialogDescription>
          </DialogHeader>
          {!shareInfo && !pendingFullShareConfirm ? (
            <div className="grid sm:grid-cols-2 gap-3 py-2">
              <button
                type="button"
                onClick={() => shareMutation.mutate("summary")}
                disabled={shareMutation.isPending}
                className="border border-[hsl(var(--rule))] p-4 text-left hover:bg-[hsl(var(--ink)/0.04)] disabled:opacity-60"
                data-testid="btn-share-summary"
              >
                <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-1">Summary</div>
                <div className="font-serif text-lg font-semibold mb-1">Recommended path only</div>
                <div className="text-xs text-muted-foreground">Best for capital partners and external operators reviewing the lane fit.</div>
              </button>
              <button
                type="button"
                onClick={() => setPendingFullShareConfirm(true)}
                disabled={shareMutation.isPending}
                className="border border-[hsl(var(--copper))] p-4 text-left hover:bg-[hsl(var(--copper)/0.05)] disabled:opacity-60"
                data-testid="btn-share-full"
              >
                <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-1">Full</div>
                <div className="font-serif text-lg font-semibold mb-1">Everything in the snapshot</div>
                <div className="text-xs text-muted-foreground">Best for trusted partners. Numbers, risks, capital stack, sensitivity.</div>
              </button>
            </div>
          ) : !shareInfo && pendingFullShareConfirm ? (
            <div className="space-y-4 py-2" data-testid="confirm-share-full">
              <div className="border-l-2 border-[hsl(var(--copper))] pl-4 py-2 bg-[hsl(var(--copper)/0.05)]">
                <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-1">Confirm full share</div>
                <div className="font-serif text-base text-foreground leading-relaxed">
                  This link will expose the full underwriting math: pricing, rehab,
                  capital stack, and sensitivity. Anyone who receives the URL can
                  see every number. Only share with a trusted partner.
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPendingFullShareConfirm(false)}
                  className="border border-[hsl(var(--rule))] px-4 py-2 text-sm font-supporting font-semibold"
                  data-testid="btn-share-full-cancel"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { setPendingFullShareConfirm(false); shareMutation.mutate("full"); }}
                  disabled={shareMutation.isPending}
                  className="bg-[hsl(var(--copper))] text-primary-foreground px-4 py-2 text-sm font-supporting font-semibold disabled:opacity-60"
                  data-testid="btn-share-full-confirm"
                >
                  Yes, share full math
                </button>
              </div>
            </div>
          ) : shareInfo ? (
            <div className="space-y-3 py-2">
              <div className="text-xs text-muted-foreground">
                Sharing as <span className="font-semibold text-foreground uppercase tracking-wider">{shareInfo.visibility}</span>. Anyone with this link can view.
              </div>
              <div className="flex items-center gap-2 border border-[hsl(var(--rule))] p-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent text-xs font-mono outline-none"
                  data-testid="input-share-url"
                />
                <button
                  type="button"
                  onClick={copyShareUrl}
                  className="bg-[hsl(var(--ink))] text-[hsl(var(--paper))] px-3 py-1.5 text-xs font-supporting font-semibold flex items-center gap-1.5"
                  data-testid="btn-copy-share-url"
                >
                  {shareCopied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="flex gap-2">
                <a href={`/api/pdf/strategy-snapshot/by-token/${shareInfo.token}`} target="_blank" rel="noopener noreferrer"
                   className="border border-[hsl(var(--rule))] px-3 py-1.5 text-xs font-supporting font-semibold inline-flex items-center gap-1.5"
                   data-testid="link-share-pdf">
                  <Download className="w-3 h-3" /> Open PDF
                </a>
                <button
                  type="button"
                  onClick={() => setShareInfo(null)}
                  className="text-xs text-muted-foreground underline"
                  data-testid="btn-share-change-tier"
                >
                  Change tier
                </button>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <button
              type="button"
              className="border border-[hsl(var(--rule))] px-4 py-2 text-sm font-supporting font-semibold"
              onClick={() => setShareDialogOpen(false)}
              data-testid="btn-share-close"
            >
              Done
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Submit-to-Pegasus Dialog (Task #85) ─────────────────────────── */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="sm:max-w-lg" data-testid="dialog-submit-pegasus">
          <DialogHeader>
            <div className="text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold text-primary mb-2">
              Submit to Pegasus
            </div>
            <DialogTitle className="font-serif text-2xl">Send this snapshot in for review.</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Apollo's team reviews every submission within two business days. If we miss the window, your request is escalated for priority review. This is not an offer. Every property gets a serious read.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="submit-name" className="text-xs font-supporting font-semibold">Name</Label>
              <Input
                id="submit-name"
                value={submitForm.submitterName}
                onChange={(e) => setSubmitForm((s) => ({ ...s, submitterName: e.target.value }))}
                data-testid="input-submit-name"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="submit-email" className="text-xs font-supporting font-semibold">Email</Label>
                <Input
                  id="submit-email"
                  type="email"
                  value={submitForm.email}
                  onChange={(e) => setSubmitForm((s) => ({ ...s, email: e.target.value }))}
                  data-testid="input-submit-email"
                />
              </div>
              <div>
                <Label htmlFor="submit-phone" className="text-xs font-supporting font-semibold">Phone</Label>
                <Input
                  id="submit-phone"
                  value={submitForm.phone}
                  onChange={(e) => setSubmitForm((s) => ({ ...s, phone: e.target.value }))}
                  data-testid="input-submit-phone"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="submit-notes" className="text-xs font-supporting font-semibold">Notes for the reviewer</Label>
              <Textarea
                id="submit-notes"
                rows={4}
                value={submitForm.notes}
                onChange={(e) => setSubmitForm((s) => ({ ...s, notes: e.target.value }))}
                placeholder="Anything the team should know: timeline pressure, title issues, seller motivation, capital you've lined up."
                data-testid="textarea-submit-notes"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              className="border border-[hsl(var(--rule))] px-4 py-2 text-sm font-supporting font-semibold"
              onClick={() => setSubmitDialogOpen(false)}
              data-testid="btn-submit-cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitMutation.isPending}
              onClick={() => submitMutation.mutate(submitForm)}
              className="bg-[hsl(var(--copper))] text-primary-foreground px-4 py-2 text-sm font-supporting font-semibold disabled:opacity-60"
              data-testid="btn-submit-confirm"
            >
              {submitMutation.isPending ? "Sending…" : "Send to Pegasus"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Blueprint Order Dialog (Task #85) ───────────────────────────── */}
      <Dialog open={blueprintDialogOpen} onOpenChange={setBlueprintDialogOpen}>
        <DialogContent className="sm:max-w-lg" data-testid="dialog-blueprint-order">
          <DialogHeader>
            <div className="text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold text-primary mb-2">
              Pegasus Deal Blueprint
            </div>
            <DialogTitle className="font-serif text-2xl">
              {(() => {
                const t = blueprintTiersQuery.data?.tiers.find((x) => x.key === selectedTierId);
                return t ? `${t.title}: $${(t.priceCents / 100).toLocaleString()}` : "Order a Blueprint";
              })()}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Confirm your contact info and we'll either send a Stripe checkout link or a custom invoice within one business day. Work begins once payment is received.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="bp-name" className="text-xs font-supporting font-semibold">Name</Label>
              <Input
                id="bp-name"
                value={blueprintForm.buyerName}
                onChange={(e) => setBlueprintForm((s) => ({ ...s, buyerName: e.target.value }))}
                data-testid="input-bp-name"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="bp-email" className="text-xs font-supporting font-semibold">Email</Label>
                <Input
                  id="bp-email"
                  type="email"
                  value={blueprintForm.email}
                  onChange={(e) => setBlueprintForm((s) => ({ ...s, email: e.target.value }))}
                  data-testid="input-bp-email"
                />
              </div>
              <div>
                <Label htmlFor="bp-phone" className="text-xs font-supporting font-semibold">Phone</Label>
                <Input
                  id="bp-phone"
                  value={blueprintForm.phone}
                  onChange={(e) => setBlueprintForm((s) => ({ ...s, phone: e.target.value }))}
                  data-testid="input-bp-phone"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bp-notes" className="text-xs font-supporting font-semibold">Anything we should know?</Label>
              <Textarea
                id="bp-notes"
                rows={3}
                value={blueprintForm.notes}
                onChange={(e) => setBlueprintForm((s) => ({ ...s, notes: e.target.value }))}
                data-testid="textarea-bp-notes"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              className="border border-[hsl(var(--rule))] px-4 py-2 text-sm font-supporting font-semibold"
              onClick={() => setBlueprintDialogOpen(false)}
              data-testid="btn-bp-cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedTierId || blueprintOrderMutation.isPending}
              onClick={() => {
                if (!selectedTierId) return;
                blueprintOrderMutation.mutate({ tierId: selectedTierId, ...blueprintForm });
              }}
              className="bg-[hsl(var(--copper))] text-primary-foreground px-4 py-2 text-sm font-supporting font-semibold disabled:opacity-60"
              data-testid="btn-bp-confirm"
            >
              {blueprintOrderMutation.isPending ? "Placing order…" : "Place order"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
