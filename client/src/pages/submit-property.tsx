import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { trackEvent } from "@/lib/analytics";
import { useSEO } from "@/hooks/use-seo";
import {
  clearStrategyLabHandoff,
  formatStrategyLabHandoffSummary,
  readStrategyLabHandoff,
  type StrategyLabHandoffBrief,
} from "@/pegasus/strategy-lab-handoff";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

/**
 * Bring an Opportunity — Master Blueprint v5.1 (§14, §31).
 * The primary public action: a multi-step intake desk opening on the
 * §14 first question ("What are you bringing to Pegasus?"). Every
 * completed submission creates a structured opportunity record via
 * POST /api/opportunities and is pre-routed to the lane that should
 * read it first. URL intent params (?intent=sell | deal-jv |
 * partnership) preselect the answer so lane CTAs land mid-flow.
 * Supersedes the issue-#22 "Submit a Property" framing.
 */

const VISITOR_TYPES = [
  { value: "owner", label: "A property I own", desc: "Condition, timing, inheritance, occupancy, or a sale that stalled." },
  { value: "deal_finder", label: "A lead or opportunity", desc: "You found it; the contract is not signed yet." },
  { value: "deal_finder_contract", label: "A property under contract", desc: "You hold the agreement and need the next piece." },
  { value: "strategy_only", label: "A project or development plan", desc: "A scope, a lot, or a plan that needs a straight read." },
  { value: "capital_partner", label: "An existing capital relationship or personal introduction", desc: "Use this only if Apollo already knows you or someone personally introduced you." },
  { value: "buyer", label: "An investor-interest request", desc: "A property mandate for possible consideration, not a request for licensed representation or MarketFlow access." },
  { value: "vendor_operator", label: "A specialist relationship", desc: "GC, trade, lender, title, design, or another service." },
  { value: "other", label: "Something else", desc: "Tell us in the notes; we route it to the right desk." },
] as const;

/** §14 choices that share a backend lane keep their nuance in the record. */
const VISITOR_VALUE_MAP: Record<string, { backend: string; tag?: string }> = {
  deal_finder_contract: { backend: "deal_finder", tag: "Holds a signed contract" },
};

const PROPERTY_TYPES = ["Single-family", "Duplex", "Triplex", "Fourplex", "Multifamily 5+", "Land", "Mixed-use", "Commercial", "Other"];
const OCCUPANCY = ["Owner occupied", "Tenant occupied", "Vacant", "Partially occupied", "Unknown"];
const CONDITIONS = ["Turnkey", "Light cosmetic", "Moderate repairs", "Heavy repairs", "Fire/water damage", "Unfinished project", "Unknown"];
const SITUATIONS = ["Inherited / probate", "Pre-foreclosure", "Behind on payments", "Divorce", "Vacant", "Tenant issue", "Major repairs", "Fire/water damage", "Unfinished project", "Partnership dispute", "Deal not publicly listed", "Need buyer", "Need capital", "Need construction", "Just exploring", "Other"];
const GOALS = ["Sell", "Get offer", "Partner / JV", "List through Apollo / Keller Williams", "Develop / reposition", "Find buyer", "Hold / rent", "Refinance", "Not sure", "Other"];
// Text messaging requires its own consent record. Until that contract exists,
// the public intake offers only email and phone-call follow-up.
const CONTACT_METHODS = ["Phone call", "Email", "Any"];

const STEPS = ["Bringing", "Property", "Situation", "Goal", "Contact"] as const;

/** Lane CTAs deep-link with an intent; it preselects the §14 answer. */
const INTENT_TO_VISITOR: Record<string, string> = {
  sell: "owner",
  property: "owner",
  "deal-jv": "deal_finder",
  deal: "deal_finder",
  adu: "strategy_only",
  explore: "strategy_only",
  blueprint: "strategy_only",
  partnership: "capital_partner",
  buyer: "buyer",
};

const OWNER_SITUATION_TO_INTAKE: Record<string, string> = {
  "Significant repairs": "Major repairs",
  "Vacant property": "Vacant",
  "Inherited property": "Inherited / probate",
  "Unfinished construction": "Unfinished project",
  "Tenant or occupancy issues": "Tenant issue",
  "Code or permit concerns": "Other",
  "Time-sensitive sale": "Other",
  "ADU or development potential": "Other",
  "A listing that is not working": "Other",
};

const STRATEGY_LAB_PROPERTY_TYPE_TO_INTAKE: Record<string, string> = {
  "Single-family residence": "Single-family",
  "single_family": "Single-family",
  "sfh": "Single-family",
  "Land or development site": "Land",
  "mixed_use": "Mixed-use",
};

const STRATEGY_LAB_OCCUPANCY_TO_INTAKE: Record<string, string> = {
  "Unknown or needs review": "Unknown",
};

const STRATEGY_LAB_CONDITION_TO_INTAKE: Record<string, string> = {
  "Light updates": "Light cosmetic",
  "Moderate renovation": "Moderate repairs",
  "Heavy renovation": "Heavy repairs",
  "Full reconstruction": "Heavy repairs",
};

const STRATEGY_LAB_SITUATION_TO_INTAKE: Record<string, string> = {
  "Inherited or estate property": "Inherited / probate",
  "Contract or sourced opportunity": "Deal not publicly listed",
  "Development or ADU potential": "Need construction",
};

function knownIntakeChoice(
  value: string | undefined,
  choices: readonly string[],
  aliases: Record<string, string> = {},
): string {
  if (!value) return "";
  const candidate = aliases[value] ?? value;
  return choices.includes(candidate) ? candidate : "";
}

function strategyLabPrefill(
  brief: StrategyLabHandoffBrief | null,
): Partial<FormState> {
  if (!brief) return {};
  return {
    propertyAddress: brief.address ?? "",
    propertyType: knownIntakeChoice(
      brief.propertyType,
      PROPERTY_TYPES,
      STRATEGY_LAB_PROPERTY_TYPE_TO_INTAKE,
    ),
    occupancyStatus: knownIntakeChoice(
      brief.occupancy,
      OCCUPANCY,
      STRATEGY_LAB_OCCUPANCY_TO_INTAKE,
    ),
    condition: knownIntakeChoice(
      brief.condition,
      CONDITIONS,
      STRATEGY_LAB_CONDITION_TO_INTAKE,
    ),
    situation: knownIntakeChoice(
      brief.situation,
      SITUATIONS,
      STRATEGY_LAB_SITUATION_TO_INTAKE,
    ),
    estimatedValue:
      brief.arvEstimate !== undefined ? String(brief.arvEstimate) : "",
  };
}

export function normalizeOwnerSituation(rawValue: string | null): {
  situation: string;
  sourceLabel: string;
} {
  const bounded = (rawValue ?? "").slice(0, 160);
  const situation = OWNER_SITUATION_TO_INTAKE[bounded] ?? "";
  return {
    situation,
    sourceLabel: situation ? bounded : "",
  };
}

const CONSENT_COPY =
  "By submitting this form, you agree that Pegasus Dreamscapes may contact you about your submission. " +
  "No agency relationship, offer, or agreement is created by submitting this form.";

const CONFIRMATION_COPY =
  "Your submission has been recorded. This receipt does not promise review, routing, a response, an offer, representation, referral, or any other service.";

type FormState = {
  visitorType: string;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  occupancyStatus: string;
  condition: string;
  estimatedValue: string;
  estimatedDebt: string;
  urgency: string;
  situation: string;
  goal: string;
  contactName: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  bestTimeToContact: string;
  notes: string;
  consentAccepted: boolean;
};

type ContactErrorKey = "contactName" | "email" | "consentAccepted";
type ContactErrors = Partial<Record<ContactErrorKey, string>>;

const EMPTY: FormState = {
  visitorType: "", propertyAddress: "", city: "", state: "CA", zipCode: "",
  propertyType: "", occupancyStatus: "", condition: "", estimatedValue: "",
  estimatedDebt: "", urgency: "", situation: "", goal: "", contactName: "",
  email: "", phone: "", preferredContactMethod: "", bestTimeToContact: "",
  notes: "", consentAccepted: false,
};

const field =
  "w-full rounded-none border-0 border-b border-[#bdb09d] dark:border-[#415066] bg-transparent " +
  "px-0 py-3 text-[15px] text-[#171f2a] dark:text-[#f4efe6] outline-none " +
  "focus:border-[#9c5a24] focus:ring-0 transition-colors disabled:cursor-not-allowed disabled:opacity-60";

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b5f4d] dark:text-[#b9a888] mb-2">
      {children}
    </label>
  );
}

type Choice = string | { label: string; desc?: string };
const choiceLabel = (c: Choice) => (typeof c === "string" ? c : c.label);

function ChoiceGrid({ options, value, onPick, cols = 2 }:
  { options: readonly Choice[]; value: string; onPick: (v: string) => void; cols?: number }) {
  return (
    <div className={`grid gap-3 ${cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
      {options.map((c) => {
        const label = choiceLabel(c);
        const desc = typeof c === "string" ? undefined : c.desc;
        const active = value === label;
        return (
          <button key={label} type="button" onClick={() => onPick(label)} aria-pressed={active}
            className={`group relative border-x-0 border-t-0 border-b px-0 py-4 pr-9 text-left transition-colors duration-200 ${
              active
                ? "border-[#9c5a24] bg-transparent"
                : "border-[#c9bead] bg-transparent hover:border-[#9c5a24] dark:border-[#35455a] dark:hover:border-[#c88a5d]"
            }`}>
            <span className={`block text-[15px] leading-snug ${active ? "font-medium text-[#171f2a] dark:text-[#f4efe6]" : "text-[#454b55] dark:text-[#cfc5b4]"}`}>
              {label}
            </span>
            {desc && (
              <span className="mt-1 block text-[12.5px] leading-snug text-[#6e6455] dark:text-[#7d8ba0]">
                {desc}
              </span>
            )}
            <span aria-hidden="true"
              className={`absolute right-0 top-4 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-200 ${
                active ? "border-[#b47645] bg-[#9c5a24] opacity-100" : "border-[#d8cdbc] opacity-0 group-hover:opacity-60 dark:border-[#2a3a4e]"
              }`}>
              <Check className="h-3 w-3 text-white" strokeWidth={3} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function SubmitPropertyPage() {
  useSEO({
    title: "Bring an Opportunity",
    description: "Record a property, contract, project, or plan for possible consideration. Submission does not promise review, routing, service, or response timing.",
    image: "/og/submit.png",
  });

  const utm = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    const intent = (p.get("intent") ?? p.get("type") ?? "").toLowerCase();
    const ownerSituation = normalizeOwnerSituation(p.get("owner_situation"));
    return {
      intent,
      address: (p.get("address") ?? "").slice(0, 500),
      referralReference: (p.get("ref") ?? "").slice(0, 160),
      preVisitor: INTENT_TO_VISITOR[intent] ?? "",
      ownerSituation: ownerSituation.situation,
      ownerSituationLabel: ownerSituation.sourceLabel,
    };
  }, []);
  const [strategyLabBrief] = useState<StrategyLabHandoffBrief | null>(() =>
    utm.referralReference === "strategy-lab"
      ? readStrategyLabHandoff()
      : null,
  );
  const labPrefill = useMemo(
    () => strategyLabPrefill(strategyLabBrief),
    [strategyLabBrief],
  );

  useEffect(() => {
    if (strategyLabBrief) clearStrategyLabHandoff();
  }, [strategyLabBrief]);

  // A lane CTA that already answered the §14 question lands mid-flow.
  const [step, setStep] = useState(utm.preVisitor ? 1 : 0);
  const [form, setForm] = useState<FormState>(
    {
      ...EMPTY,
      ...labPrefill,
      visitorType: utm.preVisitor,
      propertyAddress: utm.address || labPrefill.propertyAddress || "",
      situation: utm.ownerSituation || labPrefill.situation || "",
    },
  );
  const [hp, setHp] = useState("");
  const [result, setResult] = useState<{ id: string } | null>(null);
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [contactValidationMessage, setContactValidationMessage] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [announcement, setAnnouncement] = useState(
    `Step ${utm.preVisitor ? 2 : 1} of ${STEPS.length}: ${STEPS[utm.preVisitor ? 1 : 0]}`,
  );
  const startedAt = useRef(Date.now());
  const startedTracked = useRef(false);
  const stepPromptRef = useRef<HTMLLegendElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const moveToStep = (nextStep: number) => {
    setStep(nextStep);
    setAnnouncement(`Step ${nextStep + 1} of ${STEPS.length}: ${STEPS[nextStep]}`);
  };

  const set = (patch: Partial<FormState>) => {
    if (!startedTracked.current) {
      startedTracked.current = true;
      trackEvent("submit_property_started");
    }
    setForm((f) => ({ ...f, ...patch }));
  };

  const clearContactError = (key: ContactErrorKey) => {
    setContactErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    setContactValidationMessage("");
  };

  const submit = useMutation({
    mutationFn: async () => {
      const mapped = VISITOR_VALUE_MAP[form.visitorType];
      const intakeArv = form.estimatedValue
        ? Number(form.estimatedValue.replace(/[^0-9.]/g, ""))
        : undefined;
      const labFactsChanged = Boolean(strategyLabBrief) && (
        form.propertyAddress !== (labPrefill.propertyAddress || "") ||
        form.propertyType !== (labPrefill.propertyType || "") ||
        form.occupancyStatus !== (labPrefill.occupancyStatus || "") ||
        form.condition !== (labPrefill.condition || "") ||
        form.situation !== (labPrefill.situation || "") ||
        intakeArv !== strategyLabBrief?.arvEstimate
      );
      const strategyLabSummary = strategyLabBrief
        ? formatStrategyLabHandoffSummary({
            ...strategyLabBrief,
            address: form.propertyAddress || undefined,
            propertyType: form.propertyType || undefined,
            occupancy: form.occupancyStatus || undefined,
            condition: form.condition || undefined,
            situation: form.situation || undefined,
            arvEstimate: intakeArv,
            topLaneLabel: labFactsChanged ? undefined : strategyLabBrief.topLaneLabel,
            topLaneVerdict: labFactsChanged ? undefined : strategyLabBrief.topLaneVerdict,
            primaryMetric: labFactsChanged ? undefined : strategyLabBrief.primaryMetric,
            memoNextStep: labFactsChanged
              ? "Intake facts changed after the Strategy Lab read; rerun the automated path comparison with the updated inputs before relying on it."
              : strategyLabBrief.memoNextStep,
          })
        : undefined;
      const res = await apiRequest("POST", "/api/opportunities", {
        hp_company: hp,
        ts_elapsed_ms: Date.now() - startedAt.current,
        sourcePage: "/bring-an-opportunity",
        leadSource:
          utm.intent === "blueprint"
            ? "blueprint_request"
            : strategyLabBrief
              ? "strategy_lab_handoff"
              : "public_website_v1",
        visitorType: mapped ? mapped.backend : form.visitorType,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone || undefined,
        preferredContactMethod: form.preferredContactMethod || undefined,
        bestTimeToContact: form.bestTimeToContact || undefined,
        propertyAddress: form.propertyAddress || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        zipCode: form.zipCode || undefined,
        propertyType: form.propertyType || undefined,
        occupancyStatus: form.occupancyStatus || undefined,
        condition: form.condition || undefined,
        situation: form.situation || undefined,
        goal: form.goal || undefined,
        urgency: form.urgency || undefined,
        estimatedValue: intakeArv,
        estimatedDebt: form.estimatedDebt ? Number(form.estimatedDebt.replace(/[^0-9.]/g, "")) : undefined,
        notes: [
          mapped?.tag,
          utm.intent ? `Intake intent: ${utm.intent}` : undefined,
          utm.ownerSituationLabel ? `Owner situation: ${utm.ownerSituationLabel}` : undefined,
          utm.referralReference ? `Referral reference: ${utm.referralReference}` : undefined,
          strategyLabSummary,
          form.notes,
        ].filter(Boolean).join(" — ") || undefined,
        consentAccepted: form.consentAccepted,
      });
      return res.json();
    },
    onSuccess: (data: { id: string }) => {
      trackEvent("submit_property_completed", { visitor_type: form.visitorType });
      setRetrying(false);
      setAnnouncement(`Submission received. Reference ${data.id}.`);
      setResult(data);
      window.scrollTo({ top: 0, behavior: "auto" });
    },
    onError: () => {
      setRetrying(false);
      setAnnouncement(
        "Submission could not be recorded. Your information is still here; retry when ready.",
      );
    },
  });

  useEffect(() => {
    if (result) return;
    stepPromptRef.current?.focus();
  }, [result, step]);

  useEffect(() => {
    if (submit.isError && !retrying) errorRef.current?.focus();
  }, [retrying, submit.isError]);

  useEffect(() => {
    if (result) successRef.current?.focus();
  }, [result]);

  const beginSubmission = () => {
    setRetrying(false);
    setAnnouncement("Recording your opportunity for possible consideration.");
    submit.mutate();
  };

  const retrySubmission = () => {
    setRetrying(true);
    setAnnouncement("Retrying your submission.");
    submit.mutate();
  };

  const validateContact = () => {
    const nextErrors: ContactErrors = {};
    if (!form.contactName.trim()) {
      nextErrors.contactName = "Enter your full name.";
    }
    if (!/.+@.+\..+/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.consentAccepted) {
      nextErrors.consentAccepted = "Agree to contact about this submission before sending.";
    }

    setContactErrors(nextErrors);
    const firstInvalid = ([
      ["contactName", "sp-name"],
      ["email", "sp-email"],
      ["consentAccepted", "sp-consent"],
    ] as const).find(([key]) => nextErrors[key]);

    if (firstInvalid) {
      setContactValidationMessage(
        "Please complete the required contact fields and consent before submitting.",
      );
      document.getElementById(firstInvalid[1])?.focus();
      return false;
    }

    setContactValidationMessage("");
    return true;
  };

  const canNext = [
    !!form.visitorType,
    true, // property details are welcome but not required to advance
    !!form.situation,
    !!form.goal,
    !!form.contactName && /.+@.+\..+/.test(form.email) && form.consentAccepted,
  ][step];

  return (
    <>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="intake-live-status"
      >
        {announcement}
      </p>
      {result ? (
      <div className="min-h-screen bg-[#f4efe6] dark:bg-[#091421] pt-32 pb-24 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#b47645]">
            <Check className="h-7 w-7 text-[#8b5a36] dark:text-[#c88a5d]" strokeWidth={2.4} />
          </div>
          <h1
            ref={successRef}
            tabIndex={-1}
            className="font-serif text-4xl text-[#171f2a] dark:text-[#f4efe6] mb-6"
          >
            Received.
          </h1>
          <p className="text-[17px] leading-relaxed text-[#454b55] dark:text-[#cfc5b4]">{CONFIRMATION_COPY}</p>
          <p className="mt-6 text-sm text-[#6b5f4d] dark:text-[#b9a888]">Reference: {result.id}</p>
          <a href="/" className="mt-10 inline-block border border-[#9c5a24] bg-[#9c5a24] px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#8b5a36] transition-colors">
            Back to Pegasus
          </a>
        </div>
      </div>
      ) : (
    <div className="min-h-screen bg-[#f4efe6] dark:bg-[#091421] pt-28 pb-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b5a36] dark:text-[#c88a5d]">
            Bring an Opportunity
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl leading-tight text-[#171f2a] dark:text-[#f4efe6]">
            Bring the property, the contract, the project, or the plan.
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#454b55] dark:text-[#cfc5b4]">
            This intake records what you know for possible consideration. Partial information is fine;
            review and response are not promised.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start lg:gap-12">
        <div className="min-w-0">
        {/* progress */}
        <ol className="mb-10 flex items-center gap-2" aria-label="Form progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <button type="button" disabled={submit.isPending || i >= step} onClick={() => moveToStep(i)}
                className="block w-full text-left disabled:cursor-default"
                aria-label={i < step ? `Return to ${s}` : s}
                aria-current={i === step ? "step" : undefined}>
                <div className={`h-1 rounded-full transition-colors ${i <= step ? "bg-[#9c5a24]" : "bg-[#d8cdbc] dark:bg-[#2a3a4e]"}`} />
                <span className={`mt-2 hidden items-center gap-1 sm:inline-flex text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  i === step ? "text-[#8b5a36] dark:text-[#c88a5d]" : i < step ? "text-[#6b5f4d] hover:text-[#8b5a36] dark:text-[#b9a888] dark:hover:text-[#c88a5d]" : "text-[#6e6455] dark:text-[#7d8ba0]"}`}>
                  {i < step && <Check className="h-3 w-3 text-[#8b5a36] dark:text-[#c88a5d]" strokeWidth={3} />}{s}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <form
          noValidate
          data-testid="opportunity-intake-form"
          aria-busy={submit.isPending}
          className="border-y border-[#c9bead] bg-transparent py-8 dark:border-[#35455a] sm:py-10"
          onSubmit={(e) => {
            e.preventDefault();
            if (submit.isPending) return;
            if (step < 4) {
              moveToStep(step + 1);
              return;
            }
            if (validateContact()) beginSubmission();
          }}>
          {/* honeypot */}
          <input type="text" name="hp_company" value={hp} onChange={(e) => setHp(e.target.value)}
            className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

          {step === 0 && (
            <fieldset>
              <legend
                ref={stepPromptRef}
                tabIndex={-1}
                data-testid="intake-step-heading"
                className="font-serif text-2xl text-[#171f2a] dark:text-[#f4efe6] mb-6"
              >
                What are you bringing to Pegasus?
              </legend>
              <ChoiceGrid options={VISITOR_TYPES}
                value={VISITOR_TYPES.find((v) => v.value === form.visitorType)?.label ?? ""}
                onPick={(labelPicked) => set({ visitorType: VISITOR_TYPES.find((v) => v.label === labelPicked)!.value })} />
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="space-y-6">
              <legend
                ref={stepPromptRef}
                tabIndex={-1}
                data-testid="intake-step-heading"
                className="font-serif text-2xl text-[#171f2a] dark:text-[#f4efe6] mb-2"
              >
                The property.
              </legend>
              <p className="text-sm text-[#6b5f4d] dark:text-[#b9a888]">Share what you know — partial information is fine.</p>
              <div>
                <Label htmlFor="sp-address">Property address</Label>
                <input id="sp-address" className={field} value={form.propertyAddress}
                  onChange={(e) => set({ propertyAddress: e.target.value })} placeholder="Street address" autoComplete="street-address" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><Label htmlFor="sp-city">City</Label>
                  <input id="sp-city" className={field} value={form.city} onChange={(e) => set({ city: e.target.value })} /></div>
                <div><Label htmlFor="sp-state">State</Label>
                  <input id="sp-state" className={field} value={form.state} onChange={(e) => set({ state: e.target.value })} /></div>
                <div><Label htmlFor="sp-zip">ZIP</Label>
                  <input id="sp-zip" className={field} value={form.zipCode} onChange={(e) => set({ zipCode: e.target.value })} inputMode="numeric" /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><Label htmlFor="sp-type">Property type</Label>
                  <select id="sp-type" className={field} value={form.propertyType} onChange={(e) => set({ propertyType: e.target.value })}>
                    <option value="">Select…</option>{PROPERTY_TYPES.map((o) => <option key={o}>{o}</option>)}
                  </select></div>
                <div><Label htmlFor="sp-occ">Occupancy</Label>
                  <select id="sp-occ" className={field} value={form.occupancyStatus} onChange={(e) => set({ occupancyStatus: e.target.value })}>
                    <option value="">Select…</option>{OCCUPANCY.map((o) => <option key={o}>{o}</option>)}
                  </select></div>
                <div><Label htmlFor="sp-cond">Condition</Label>
                  <select id="sp-cond" className={field} value={form.condition} onChange={(e) => set({ condition: e.target.value })}>
                    <option value="">Select…</option>{CONDITIONS.map((o) => <option key={o}>{o}</option>)}
                  </select></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label htmlFor="sp-val">Estimated value (if known)</Label>
                  <input id="sp-val" className={field} value={form.estimatedValue} onChange={(e) => set({ estimatedValue: e.target.value })} placeholder="$" inputMode="numeric" /></div>
                <div><Label htmlFor="sp-debt">Estimated mortgage balance (if relevant)</Label>
                  <input id="sp-debt" className={field} value={form.estimatedDebt} onChange={(e) => set({ estimatedDebt: e.target.value })} placeholder="$" inputMode="numeric" /></div>
              </div>
              <div>
                <Label htmlFor="sp-urgent">Anything urgent?</Label>
                <input id="sp-urgent" className={field} value={form.urgency} onChange={(e) => set({ urgency: e.target.value })}
                  placeholder="Auction date, notice received, deadline…" />
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset>
              <legend
                ref={stepPromptRef}
                tabIndex={-1}
                data-testid="intake-step-heading"
                className="font-serif text-2xl text-[#171f2a] dark:text-[#f4efe6] mb-6"
              >
                The situation.
              </legend>
              <ChoiceGrid options={SITUATIONS} value={form.situation} onPick={(v) => set({ situation: v })} cols={3} />
            </fieldset>
          )}

          {step === 3 && (
            <fieldset>
              <legend
                ref={stepPromptRef}
                tabIndex={-1}
                data-testid="intake-step-heading"
                className="font-serif text-2xl text-[#171f2a] dark:text-[#f4efe6] mb-6"
              >
                The goal.
              </legend>
              <ChoiceGrid options={GOALS} value={form.goal} onPick={(v) => set({ goal: v })} />
            </fieldset>
          )}

          {step === 4 && (
            <fieldset className="space-y-6" aria-describedby="sp-contact-requirements">
              <legend
                ref={stepPromptRef}
                tabIndex={-1}
                data-testid="intake-step-heading"
                className="font-serif text-2xl text-[#171f2a] dark:text-[#f4efe6] mb-2"
              >
                How do we reach you?
              </legend>
              <p id="sp-contact-requirements" className="text-sm leading-relaxed text-[#6b5f4d] dark:text-[#b9a888]">
                Full name, email, and contact consent are required. Phone and scheduling details are optional.
              </p>
              <p
                id="sp-contact-validation"
                role={contactValidationMessage ? "alert" : undefined}
                aria-live="assertive"
                aria-atomic="true"
                className="text-sm text-red-600 dark:text-red-400 empty:hidden"
              >
                {contactValidationMessage}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label htmlFor="sp-name">Full name (required)</Label>
                  <input
                    id="sp-name"
                    className={field}
                    value={form.contactName}
                    onChange={(e) => {
                      set({ contactName: e.target.value });
                      clearContactError("contactName");
                    }}
                    autoComplete="name"
                    required
                    disabled={submit.isPending}
                    aria-invalid={!!contactErrors.contactName}
                    aria-describedby={contactErrors.contactName ? "sp-name-error" : undefined}
                  />
                  {contactErrors.contactName && (
                    <p id="sp-name-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {contactErrors.contactName}
                    </p>
                  )}
                </div>
                <div><Label htmlFor="sp-phone">Phone (optional)</Label>
                  <input id="sp-phone" className={field} value={form.phone} onChange={(e) => set({ phone: e.target.value })} autoComplete="tel" inputMode="tel" disabled={submit.isPending} /></div>
              </div>
              <div><Label htmlFor="sp-email">Email (required)</Label>
                <input
                  id="sp-email"
                  type="email"
                  className={field}
                  value={form.email}
                  onChange={(e) => {
                    set({ email: e.target.value });
                    clearContactError("email");
                  }}
                  autoComplete="email"
                  required
                  disabled={submit.isPending}
                  aria-invalid={!!contactErrors.email}
                  aria-describedby={contactErrors.email ? "sp-email-error" : undefined}
                />
                {contactErrors.email && (
                  <p id="sp-email-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {contactErrors.email}
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label htmlFor="sp-method">Preferred contact method</Label>
                  <select id="sp-method" className={field} value={form.preferredContactMethod} onChange={(e) => set({ preferredContactMethod: e.target.value })} disabled={submit.isPending}>
                    <option value="">Select…</option>{CONTACT_METHODS.map((o) => <option key={o}>{o}</option>)}
                  </select></div>
                <div><Label htmlFor="sp-time">Best time to contact</Label>
                  <input id="sp-time" className={field} value={form.bestTimeToContact} onChange={(e) => set({ bestTimeToContact: e.target.value })} placeholder="Weekday mornings…" disabled={submit.isPending} /></div>
              </div>
              <div>
                <Label htmlFor="sp-notes">Anything else we should know?</Label>
                <textarea id="sp-notes" className={`${field} min-h-[110px]`} value={form.notes} onChange={(e) => set({ notes: e.target.value })} disabled={submit.isPending} />
              </div>
              <label className="flex items-start gap-3 text-sm leading-relaxed text-[#454b55] dark:text-[#cfc5b4] cursor-pointer">
                <input id="sp-consent" type="checkbox" checked={form.consentAccepted}
                  onChange={(e) => {
                    set({ consentAccepted: e.target.checked });
                    clearContactError("consentAccepted");
                  }}
                  className="mt-1 h-4 w-4 accent-[#b47645]" required
                  disabled={submit.isPending}
                  aria-invalid={!!contactErrors.consentAccepted}
                  aria-describedby={`sp-privacy-notice${contactErrors.consentAccepted ? " sp-consent-error" : ""}`} />
                <span>{CONSENT_COPY}</span>
              </label>
              {contactErrors.consentAccepted && (
                <p id="sp-consent-error" className="text-sm text-red-600 dark:text-red-400">
                  {contactErrors.consentAccepted}
                </p>
              )}
              <p id="sp-privacy-notice" className="text-xs leading-relaxed text-[#6e6455] dark:text-[#9aa6b7]">
                Pegasus may use this information to consider the request and may share it
                with service providers as described in the privacy notice. The{' '}
                <a className="underline underline-offset-2" href="/privacy">Privacy Policy</a>{' '}
                explains retention and your rights. To request access or deletion, email{' '}
                <a className="underline underline-offset-2" href="mailto:apollo@pegasusdreamscapes.com">
                  apollo@pegasusdreamscapes.com
                </a>.
              </p>
              {(submit.isError || retrying) && (
                <div
                  ref={errorRef}
                  role="alert"
                  tabIndex={-1}
                  className="border-l-2 border-red-700 py-1 pl-4 text-sm text-red-800 dark:border-red-400 dark:text-red-300"
                >
                  <p className="leading-relaxed">
                    {retrying
                      ? "Trying the secure submission again. Keep this page open."
                      : "We could not record your submission. Your information is still here; retry now, or email "}
                    {!retrying && (
                      <a className="underline" href="mailto:apollo@pegasusdreamscapes.com">
                        apollo@pegasusdreamscapes.com
                      </a>
                    )}
                    {!retrying && "."}
                  </p>
                  <button
                    type="button"
                    aria-disabled={retrying || undefined}
                    aria-busy={retrying || undefined}
                    onClick={() => {
                      if (!retrying) retrySubmission();
                    }}
                    className="mt-3 border-b border-current pb-0.5 font-semibold uppercase tracking-[0.12em] aria-disabled:cursor-wait aria-disabled:opacity-65"
                  >
                    {retrying ? "Retrying…" : "Retry submission"}
                  </button>
                </div>
              )}
            </fieldset>
          )}

          <div className="mt-10 flex items-center justify-between gap-4">
            <button type="button" disabled={submit.isPending} onClick={() => moveToStep(Math.max(0, step - 1))}
              className={`inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#6b5f4d] transition-colors hover:text-[#8b5a36] disabled:cursor-not-allowed disabled:opacity-45 dark:text-[#b9a888] dark:hover:text-[#c88a5d] ${step === 0 ? "invisible" : ""}`}>
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button type="submit" disabled={(step < 4 && !canNext) || submit.isPending}
              aria-busy={submit.isPending || undefined}
              aria-describedby={step === 4 ? "sp-contact-requirements sp-contact-validation" : undefined}
              className="inline-flex items-center gap-2 border border-[#9c5a24] bg-[#9c5a24] px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#8b5a36] disabled:cursor-not-allowed disabled:opacity-45">
              {submit.isPending ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : null}
              {submit.isPending ? "Recording…" : step < 4 ? "Continue" : "Record Opportunity"}
              {step < 4 && !submit.isPending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          <p className="mt-5 text-center text-[12px] text-[#6e6455] dark:text-[#7d8ba0] lg:hidden">
            Receipt is immediate. Review and response timing are not promised. No agency is created by submitting.
          </p>
        </form>

        <p className="mt-8 text-xs leading-relaxed text-[#6e6455] dark:text-[#7d8ba0]">
          Pegasus Dreamscapes Corp. is a real estate investment, development, and strategy company.
          Pegasus Dreamscapes Corp. is not a real estate brokerage. This site uses Paolo “Apollo”
          Duran as a public-facing name. For license verification, CA DRE #02333658 is listed under
          Duran Ramirez, Paolo Ariel, with responsible broker BMP Realty Inc DBA Keller Williams
          Realty-East Bay. Verify current status. No agency relationship exists without a written agreement.
        </p>
        </div>

        {/* The desk's promise, kept in view while the visitor works. */}
        <aside className="mt-10 hidden lg:sticky lg:top-28 lg:mt-0 lg:block" aria-label="What happens next">
          <div className="border-l border-[#bdb09d] bg-transparent py-1 pl-6 dark:border-[#415066]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b5a36] dark:text-[#c88a5d]">What happens next</p>
            <ol className="mt-5 space-y-5">
              {[
                ["Received", "Your submission creates a private record — never a public listing."],
                ["Possible consideration", "Pegasus may assess fit, information needs, and current capacity."],
                ["Possible next step", "If Pegasus elects to proceed, it may request information or discuss a lane."],
                ["Separate terms", "Any analysis, offer, service, representation, referral, or transaction requires its own terms."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-px font-serif text-[15px] leading-none text-[#8b5a36] dark:text-[#c88a5d]">{`0${i + 1}`}</span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-[#171f2a] dark:text-[#f4efe6]">{t}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-[#6b5f4d] dark:text-[#b9a888]">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-6 border-t border-[#d8cdbc] pt-5 dark:border-[#2a3a4e]">
              <ul className="space-y-2 text-[12px] leading-relaxed text-[#6b5f4d] dark:text-[#b9a888]">
                <li className="flex gap-2"><span aria-hidden="true" className="mt-1.5 h-1 w-1 rounded-full bg-[#9c5a24]" />No review or response-time commitment</li>
                <li className="flex gap-2"><span aria-hidden="true" className="mt-1.5 h-1 w-1 rounded-full bg-[#9c5a24]" />No agency created by submitting</li>
                <li className="flex gap-2"><span aria-hidden="true" className="mt-1.5 h-1 w-1 rounded-full bg-[#9c5a24]" />Data use follows the privacy notice</li>
              </ul>
            </div>
          </div>
        </aside>
        </div>
      </div>
    </div>
      )}
    </>
  );
}
