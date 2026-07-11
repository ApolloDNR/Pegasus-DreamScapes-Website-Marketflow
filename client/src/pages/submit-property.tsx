import { useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { trackEvent } from "@/lib/analytics";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

/**
 * Public Website v1 (issue #22) — Submit a Property.
 * PRD §7.1: the primary conversion flow, built as a professional
 * multi-step intake desk. Every completed submission creates a
 * structured opportunity record via POST /api/opportunities and is
 * pre-routed to the department that should read it first.
 */

const VISITOR_TYPES = [
  { value: "owner", label: "I own the property", desc: "Distressed, inherited, occupied, vacant, or simply complicated." },
  { value: "owner_representative", label: "I represent or help the owner", desc: "Family member, attorney, advisor, or agent acting for the owner." },
  { value: "deal_finder", label: "I found a deal", desc: "Wholesaler, agent, or finder with an opportunity to show." },
  { value: "buyer", label: "I want to buy", desc: "A finished home, an investment, or representation." },
  { value: "capital_partner", label: "I want to invest / partner", desc: "Back specific projects on defined terms." },
  { value: "vendor_operator", label: "I am a vendor / operator", desc: "GC, trade, lender, title, or service partner." },
  { value: "strategy_only", label: "I need advice / strategy", desc: "Not sure whether to sell, hold, refinance, or exit." },
  { value: "other", label: "Other", desc: "Something else — tell us in the notes." },
] as const;

const PROPERTY_TYPES = ["Single-family", "Duplex", "Triplex", "Fourplex", "Multifamily 5+", "Land", "Mixed-use", "Commercial", "Other"];
const OCCUPANCY = ["Owner occupied", "Tenant occupied", "Vacant", "Partially occupied", "Unknown"];
const CONDITIONS = ["Turnkey", "Light cosmetic", "Moderate repairs", "Heavy repairs", "Fire/water damage", "Unfinished project", "Unknown"];
const SITUATIONS = ["Inherited / probate", "Pre-foreclosure", "Behind on payments", "Divorce", "Vacant", "Tenant issue", "Major repairs", "Fire/water damage", "Unfinished project", "Partnership dispute", "Off-market deal", "Need buyer", "Need capital", "Need construction", "Just exploring", "Other"];
const GOALS = ["Sell", "Get offer", "Partner / JV", "List through Apollo / Keller Williams", "Develop / reposition", "Find buyer", "Hold / rent", "Refinance", "Not sure", "Other"];
const CONTACT_METHODS = ["Phone call", "Text", "Email", "Any"];

const STEPS = ["Visitor", "Property", "Situation", "Goal", "Contact"] as const;

const CONSENT_COPY =
  "By submitting this form, you agree that Pegasus Dreamscapes may contact you about your submission. " +
  "No agency relationship, offer, or agreement is created by submitting this form.";

const CONFIRMATION_COPY =
  "Your submission has been received. Pegasus will review the property and route it to the appropriate lane: " +
  "acquisition, development, disposition, asset management, licensed representation, referral, or pass/no-fit.";

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

const EMPTY: FormState = {
  visitorType: "", propertyAddress: "", city: "", state: "CA", zipCode: "",
  propertyType: "", occupancyStatus: "", condition: "", estimatedValue: "",
  estimatedDebt: "", urgency: "", situation: "", goal: "", contactName: "",
  email: "", phone: "", preferredContactMethod: "", bestTimeToContact: "",
  notes: "", consentAccepted: false,
};

const field =
  "w-full rounded-md border border-[#d8cdbc] dark:border-[#2a3a4e] bg-white dark:bg-[#0d1b2a] " +
  "px-4 py-3 text-[15px] text-[#171f2a] dark:text-[#f4efe6] outline-none " +
  "focus:border-[#b47645] focus:ring-1 focus:ring-[#b47645] transition-colors";

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
            className={`group relative rounded-md border px-4 py-3.5 text-left transition-all duration-200 ${
              active
                ? "border-[#b47645] bg-[#b47645]/[0.08] shadow-[0_10px_28px_-18px_rgba(139,90,54,0.55)]"
                : "border-[#d8cdbc] bg-white/60 hover:-translate-y-px hover:border-[#b47645]/60 hover:shadow-[0_10px_24px_-20px_rgba(23,31,42,0.45)] dark:border-[#2a3a4e] dark:bg-[#0d1b2a]/60"
            }`}>
            <span className={`block text-[15px] leading-snug ${active ? "font-medium text-[#171f2a] dark:text-[#f4efe6]" : "text-[#454b55] dark:text-[#cfc5b4]"}`}>
              {label}
            </span>
            {desc && (
              <span className="mt-1 block text-[12.5px] leading-snug text-[#8a7f6d] dark:text-[#7d8ba0]">
                {desc}
              </span>
            )}
            <span aria-hidden="true"
              className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-200 ${
                active ? "border-[#b47645] bg-[#b47645] opacity-100" : "border-[#d8cdbc] opacity-0 group-hover:opacity-60 dark:border-[#2a3a4e]"
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
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [hp, setHp] = useState("");
  const [result, setResult] = useState<{ id: string } | null>(null);
  const startedAt = useRef(Date.now());
  const startedTracked = useRef(false);

  const utm = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      utmSource: p.get("utm_source") ?? undefined,
      utmMedium: p.get("utm_medium") ?? undefined,
      utmCampaign: p.get("utm_campaign") ?? undefined,
      preType: p.get("type") ?? "",
    };
  }, []);

  const set = (patch: Partial<FormState>) => {
    if (!startedTracked.current) {
      startedTracked.current = true;
      trackEvent("submit_property_started");
    }
    setForm((f) => ({ ...f, ...patch }));
  };

  const submit = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/opportunities", {
        hp_company: hp,
        ts_elapsed_ms: Date.now() - startedAt.current,
        sourcePage: "/submit-property",
        leadSource: "public_website_v1",
        visitorType: form.visitorType,
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
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue.replace(/[^0-9.]/g, "")) : undefined,
        estimatedDebt: form.estimatedDebt ? Number(form.estimatedDebt.replace(/[^0-9.]/g, "")) : undefined,
        notes: form.notes || undefined,
        consentAccepted: form.consentAccepted,
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
        referrer: document.referrer || undefined,
      });
      return res.json();
    },
    onSuccess: (data: { id: string }) => {
      trackEvent("submit_property_completed", { visitor_type: form.visitorType });
      setResult(data);
      window.scrollTo({ top: 0, behavior: "auto" });
    },
  });

  const canNext = [
    !!form.visitorType,
    true, // property details are welcome but not required to advance
    !!form.situation,
    !!form.goal,
    !!form.contactName && /.+@.+\..+/.test(form.email) && form.consentAccepted,
  ][step];

  if (result) {
    return (
      <main className="min-h-screen bg-[#f4efe6] dark:bg-[#091421] pt-32 pb-24 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#b47645]">
            <Check className="h-7 w-7 text-[#b47645]" strokeWidth={2.4} />
          </div>
          <h1 className="font-serif text-4xl text-[#171f2a] dark:text-[#f4efe6] mb-6">Received.</h1>
          <p className="text-[17px] leading-relaxed text-[#454b55] dark:text-[#cfc5b4]">{CONFIRMATION_COPY}</p>
          <p className="mt-6 text-sm text-[#6b5f4d] dark:text-[#b9a888]">Reference: {result.id}</p>
          <a href="/" className="mt-10 inline-block rounded-md bg-[#b47645] px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#8b5a36] transition-colors">
            Back to Pegasus
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4efe6] dark:bg-[#091421] pt-28 pb-24 px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b47645] mb-3">
            The Intake Desk
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl leading-tight text-[#171f2a] dark:text-[#f4efe6]">
            Submit a property for review.
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#454b55] dark:text-[#cfc5b4]">
            Whether you are dealing with a distressed property, inherited home, off-market opportunity,
            unfinished project, partnership idea, or possible sale, Pegasus reviews the situation and
            helps identify the right path.
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start lg:gap-12">
        <div className="min-w-0">
        {/* progress */}
        <ol className="mb-10 flex items-center gap-2" aria-label="Form progress">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <button type="button" disabled={i >= step} onClick={() => setStep(i)}
                className="block w-full text-left disabled:cursor-default"
                aria-label={i < step ? `Return to ${s}` : s}
                aria-current={i === step ? "step" : undefined}>
                <div className={`h-1 rounded-full transition-colors ${i <= step ? "bg-[#b47645]" : "bg-[#d8cdbc] dark:bg-[#2a3a4e]"}`} />
                <span className={`mt-2 hidden items-center gap-1 sm:inline-flex text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  i === step ? "text-[#b47645]" : i < step ? "text-[#6b5f4d] hover:text-[#b47645] dark:text-[#b9a888]" : "text-[#8a7f6d] dark:text-[#7d8ba0]"}`}>
                  {i < step && <Check className="h-3 w-3 text-[#b47645]" strokeWidth={3} />}{s}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <form
          className="rounded-xl border border-[#d8cdbc] dark:border-[#2a3a4e] bg-white/70 dark:bg-[#0d1b2a]/70 p-6 sm:p-10 backdrop-blur"
          onSubmit={(e) => { e.preventDefault(); if (step < 4) setStep(step + 1); else submit.mutate(); }}>
          {/* honeypot */}
          <input type="text" name="hp_company" value={hp} onChange={(e) => setHp(e.target.value)}
            className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

          {step === 0 && (
            <fieldset>
              <legend className="font-serif text-2xl text-[#171f2a] dark:text-[#f4efe6] mb-6">What brings you here?</legend>
              <ChoiceGrid options={VISITOR_TYPES}
                value={VISITOR_TYPES.find((v) => v.value === form.visitorType)?.label ?? ""}
                onPick={(labelPicked) => set({ visitorType: VISITOR_TYPES.find((v) => v.label === labelPicked)!.value })} />
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="space-y-6">
              <legend className="font-serif text-2xl text-[#171f2a] dark:text-[#f4efe6] mb-2">The property.</legend>
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
              <legend className="font-serif text-2xl text-[#171f2a] dark:text-[#f4efe6] mb-6">The situation.</legend>
              <ChoiceGrid options={SITUATIONS} value={form.situation} onPick={(v) => set({ situation: v })} cols={3} />
            </fieldset>
          )}

          {step === 3 && (
            <fieldset>
              <legend className="font-serif text-2xl text-[#171f2a] dark:text-[#f4efe6] mb-6">The goal.</legend>
              <ChoiceGrid options={GOALS} value={form.goal} onPick={(v) => set({ goal: v })} />
            </fieldset>
          )}

          {step === 4 && (
            <fieldset className="space-y-6">
              <legend className="font-serif text-2xl text-[#171f2a] dark:text-[#f4efe6] mb-2">How do we reach you?</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label htmlFor="sp-name">Full name</Label>
                  <input id="sp-name" className={field} value={form.contactName} onChange={(e) => set({ contactName: e.target.value })} autoComplete="name" required /></div>
                <div><Label htmlFor="sp-phone">Phone</Label>
                  <input id="sp-phone" className={field} value={form.phone} onChange={(e) => set({ phone: e.target.value })} autoComplete="tel" inputMode="tel" /></div>
              </div>
              <div><Label htmlFor="sp-email">Email</Label>
                <input id="sp-email" type="email" className={field} value={form.email} onChange={(e) => set({ email: e.target.value })} autoComplete="email" required /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label htmlFor="sp-method">Preferred contact method</Label>
                  <select id="sp-method" className={field} value={form.preferredContactMethod} onChange={(e) => set({ preferredContactMethod: e.target.value })}>
                    <option value="">Select…</option>{CONTACT_METHODS.map((o) => <option key={o}>{o}</option>)}
                  </select></div>
                <div><Label htmlFor="sp-time">Best time to contact</Label>
                  <input id="sp-time" className={field} value={form.bestTimeToContact} onChange={(e) => set({ bestTimeToContact: e.target.value })} placeholder="Weekday mornings…" /></div>
              </div>
              <div>
                <Label htmlFor="sp-notes">Anything else we should know?</Label>
                <textarea id="sp-notes" className={`${field} min-h-[110px]`} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
              </div>
              <label className="flex items-start gap-3 text-sm leading-relaxed text-[#454b55] dark:text-[#cfc5b4] cursor-pointer">
                <input type="checkbox" checked={form.consentAccepted}
                  onChange={(e) => set({ consentAccepted: e.target.checked })}
                  className="mt-1 h-4 w-4 accent-[#b47645]" required />
                <span>{CONSENT_COPY}</span>
              </label>
              {submit.isError && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                  Something went wrong recording the submission. Please try again, or email
                  {" "}<a className="underline" href="mailto:apollo@pegasusdreamscapes.com">apollo@pegasusdreamscapes.com</a>.
                </p>
              )}
            </fieldset>
          )}

          <div className="mt-10 flex items-center justify-between gap-4">
            <button type="button" onClick={() => setStep(Math.max(0, step - 1))}
              className={`inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#6b5f4d] dark:text-[#b9a888] hover:text-[#b47645] transition-colors ${step === 0 ? "invisible" : ""}`}>
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button type="submit" disabled={!canNext || submit.isPending}
              className="inline-flex items-center gap-2 rounded-md bg-[#b47645] px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_14px_30px_-16px_rgba(139,90,54,0.7)] transition-all hover:bg-[#8b5a36] disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none">
              {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {step < 4 ? "Continue" : "Submit for Review"}
              {step < 4 && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-5 text-center text-[12px] text-[#8a7f6d] dark:text-[#7d8ba0] lg:hidden">
            Reviewed by a person within 48 hours. No agency created by submitting.
          </p>
        </form>

        <p className="mt-8 text-xs leading-relaxed text-[#8a7f6d] dark:text-[#7d8ba0]">
          Pegasus Dreamscapes Corp. is a real estate investment, development, and strategy company.
          Pegasus Dreamscapes Corp. is not a real estate brokerage. Licensed real estate representation,
          when applicable, is provided by Paolo “Apollo” Duran through Keller Williams East Bay.
          CA DRE #02333658. No agency relationship is created without a written agreement.
        </p>
        </div>

        {/* The desk's promise, kept in view while the visitor works. */}
        <aside className="mt-10 hidden lg:sticky lg:top-28 lg:mt-0 lg:block" aria-label="What happens next">
          <div className="rounded-xl border border-[#d8cdbc] bg-white/60 p-6 dark:border-[#2a3a4e] dark:bg-[#0d1b2a]/60">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#b47645]">What happens next</p>
            <ol className="mt-5 space-y-5">
              {[
                ["Received", "Your submission creates a private record — never a public listing."],
                ["Read", "A person reviews it. Numbers first, adjectives second."],
                ["Routed", "It goes to the right lane: acquisition, development, disposition, asset management, representation, or referral."],
                ["Your call", "We lay out the options; you choose. If there is no fit, we say so plainly."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-px font-serif text-[15px] leading-none text-[#b47645]">{`0${i + 1}`}</span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-[#171f2a] dark:text-[#f4efe6]">{t}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-[#6b5f4d] dark:text-[#b9a888]">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-6 border-t border-[#d8cdbc] pt-5 dark:border-[#2a3a4e]">
              <ul className="space-y-2 text-[12px] leading-relaxed text-[#6b5f4d] dark:text-[#b9a888]">
                <li className="flex gap-2"><span aria-hidden="true" className="mt-1.5 h-1 w-1 rounded-full bg-[#b47645]" />Response within 48 hours</li>
                <li className="flex gap-2"><span aria-hidden="true" className="mt-1.5 h-1 w-1 rounded-full bg-[#b47645]" />No agency created by submitting</li>
                <li className="flex gap-2"><span aria-hidden="true" className="mt-1.5 h-1 w-1 rounded-full bg-[#b47645]" />Nothing shared without written agreement</li>
              </ul>
            </div>
          </div>
        </aside>
        </div>
      </div>
    </main>
  );
}
