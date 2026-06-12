import React, { useId, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Check, ChevronDown, Mail, Phone, MapPin, ConciergeBell, AlertCircle, Loader2, Bookmark, BookmarkCheck } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Nav, FormCfg, PeggyHandoff } from './theme';
import { usd0, SectionHead, ContourLines, BrandMark } from './primitives';
import { addStrategy, type StrategyPreview } from './savedStore';

function SaveStrategyButton({ snapshot, title }: { snapshot: StrategyPreview; title: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button type="button" disabled={saved}
      onClick={() => { addStrategy(title, snapshot); setSaved(true); }}
      className="btn-line-light px-7 py-4 pg-label !text-[10px] inline-flex items-center gap-2.5 disabled:opacity-60">
      {saved ? (
        <><BookmarkCheck className="w-3.5 h-3.5" strokeWidth={1.8} /> Saved to your workspace</>
      ) : (
        <><Bookmark className="w-3.5 h-3.5" strokeWidth={1.8} /> Save this model</>
      )}
    </button>
  );
}

/* ----------------------------------------------------------------
   Reusable form configs
---------------------------------------------------------------- */
const ROLE_OPTIONS = [
  'I have a property (Seller)',
  'Homebuyer / Buyer',
  'Deal finder / Wholesaler',
  'Capital partner',
  'Operator / Vendor',
  'Referral partner',
];

export const CONTACT_FORM: FormCfg = {
  role: 'I have a property (Seller)',
  intent: 'property-review',
  heading: <>Start a <span className="italic text-[var(--accent)]">Property Review.</span></>,
  lead: 'Off-market, inherited, distressed, or simply complicated? Send it over. A person reads every submission and returns a clear, written path forward, usually within two business days.',
  submit: 'Request My Review',
  third: { label: 'Property address or area', placeholder: 'Street, city, or neighborhood' },
  messageLabel: 'The situation',
  messagePlaceholder: 'Tell us what is going on. The more context, the better.',
};

export const DEVELOPMENT_FORM: FormCfg = {
  role: 'I have a property (Seller)',
  intent: 'development',
  heading: <>Start a <span className="italic text-[var(--accent-bright)]">build conversation.</span></>,
  lead: 'A lot, a tired property, an ADU idea, or a ground-up vision? Tell us the scope. We underwrite before we build, and we will tell you straight whether it pencils.',
  submit: 'Send the build scope',
  third: { label: 'Property or lot address', placeholder: 'Street, city, or neighborhood' },
  messageLabel: 'The build scope',
  messagePlaceholder: 'What you want to build and where: lot details, condition, and any constraints you know about.',
};

export const STRATEGYLAB_FORM: FormCfg = {
  role: 'I have a property (Seller)',
  intent: 'strategy-snapshot',
  heading: <>Get a <span className="italic text-[var(--accent-bright)]">Strategy Snapshot.</span></>,
  lead: 'Run the numbers above for an Instant Strategy Preview, then send the situation for a human-written Strategy Snapshot: a short, candid read returned, in most cases, within two business days.',
  submit: 'Request a Strategy Snapshot',
  third: { label: 'Property address or area', placeholder: 'Street, city, or neighborhood' },
  messageLabel: 'The situation',
  messagePlaceholder: 'Acquisition price, scope of work, and what you are weighing. The more context, the better.',
};

export const APOLLO_FORM: FormCfg = {
  role: 'List my property (Seller representation)',
  roleOptions: [
    'List my property (Seller representation)',
    'Buy a home (Buyer representation)',
  ],
  intent: 'representation',
  heading: <>Work with <span className="italic text-[var(--accent)]">Apollo.</span></>,
  lead: 'Tell us whether you are looking to sell or buy. Apollo represents clients as a licensed agent through Keller Williams Realty East Bay, and will follow up to discuss representation. Submitting this is not a listing or buyer agreement.',
  submit: 'Request representation',
  third: { label: 'Property address or target area', placeholder: 'Street, city, or neighborhood' },
  messageLabel: 'What you are looking to do',
  messagePlaceholder: 'Selling a home, buying in a certain area, timeline, and anything else we should know.',
};

export const INVESTMENTS_FORM: FormCfg = {
  role: 'Capital partner',
  intent: 'investment',
  heading: <>Explore an <span className="italic text-[var(--accent-bright)]">investment.</span></>,
  lead: 'Tell us how you think about deploying capital, or send a property you want underwritten. We bring specific projects on defined terms: never a pooled fund, never a promised return.',
  submit: 'Start the Conversation',
  third: { label: 'Capital range or property', placeholder: 'Optional' },
  messageLabel: 'What you are exploring',
  messagePlaceholder: 'Project types, risk tolerance, timeline, or a specific deal...',
};

/* ----------------------------------------------------------------
   Lead form
---------------------------------------------------------------- */
export function LeadForm({ cfg, showRole = false, onNavy = false, handoff = null, strategy = null }:
  { cfg: FormCfg; showRole?: boolean; onNavy?: boolean; handoff?: PeggyHandoff | null; strategy?: StrategyPreview | null }) {
  const uid = useId();
  const [submitted, setSubmitted] = useState(false);
  const startedAt = useRef(Date.now());
  const [hpCompany, setHpCompany] = useState('');
  const createLead = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await apiRequest('POST', '/api/leads', payload);
      return res.json();
    },
  });
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: handoff?.role ?? cfg.role,
    third: handoff?.third ?? '',
    message: handoff?.message ?? '',
  });
  const onField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // The PeggyAI transcript travels with the captured lead so the human reading
  // the submission has the full conversation as context.
  const transcript = handoff?.transcript ?? [];
  const source = strategy ? 'strategy-lab' : transcript.length > 0 ? 'peggy' : 'form';
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = form.name.trim();
    const [firstName, ...rest] = fullName.split(/\s+/);
    const lastName = rest.join(' ');
    const elapsed = Date.now() - startedAt.current;
    createLead.mutate(
      {
        leadType: 'submit',
        source,
        firstName: firstName || fullName,
        lastName: lastName || undefined,
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        hp_company: hpCompany,
        ts_elapsed_ms: elapsed,
        leadData: {
          lane: form.role,
          intent: cfg.intent,
          area: form.third.trim() || undefined,
          message: form.message.trim() || undefined,
          hp_company: hpCompany,
          ts_elapsed_ms: elapsed,
          ...(strategy ? { strategy } : {}),
          ...(transcript.length > 0 ? { transcript } : {}),
        },
      },
      { onSuccess: () => setSubmitted(true) },
    );
  };

  if (submitted) {
    return (
      <div className="py-16 text-center">
        <div className="relative w-20 h-20 mx-auto mb-7 flex items-center justify-center rounded-full bg-[var(--cream)] ring-1 ring-[var(--line)]">
          <BrandMark boxClassName="w-11 h-11" />
          <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center ring-2 ring-[var(--bg)]"><Check className="w-4 h-4" /></span>
        </div>
        <h3 className="font-serif-display text-3xl text-[var(--text)] mb-3">Received. Thank you.</h3>
        <p className="text-[var(--muted)] max-w-sm mx-auto leading-relaxed">Apollo and the team will read your submission personally and return a plain-language path forward. Most reads come back within two business days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
      <input
        type="text"
        name="hp_company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={hpCompany}
        onChange={(e) => setHpCompany(e.target.value)}
        className="absolute left-[-9999px] top-[-9999px] h-0 w-0 opacity-0"
      />
      {transcript.length > 0 && (
        <div className={`sm:col-span-2 flex items-start gap-3 rounded-[4px] px-4 py-3 text-[0.82rem] leading-relaxed ${onNavy ? 'bg-[rgba(239,231,218,0.08)] text-[var(--cream)]/80' : 'bg-[var(--accent)]/8 text-[var(--text-2)]'}`}>
          <ConciergeBell className={`w-4 h-4 mt-0.5 shrink-0 ${onNavy ? 'text-[var(--accent-bright)]' : 'text-[var(--accent)]'}`} strokeWidth={1.7} />
          <span>PeggyAI prefilled this from your conversation, and your full chat will travel with the submission. Edit anything before you send.</span>
        </div>
      )}
      <div className="sm:col-span-1">
        <label htmlFor={`${uid}-name`} className="pg-field-label block mb-2">Name</label>
        <input id={`${uid}-name`} className="pg-field" required value={form.name} onChange={onField('name')} placeholder="Your name" />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor={`${uid}-email`} className="pg-field-label block mb-2">Email</label>
        <input id={`${uid}-email`} type="email" className="pg-field" required value={form.email} onChange={onField('email')} placeholder="you@email.com" />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor={`${uid}-phone`} className="pg-field-label block mb-2">Phone</label>
        <input id={`${uid}-phone`} className="pg-field" value={form.phone} onChange={onField('phone')} placeholder="Optional" />
      </div>
      {showRole ? (
        <div className="sm:col-span-1">
          <label htmlFor={`${uid}-role`} className="pg-field-label block mb-2">I am a…</label>
          <div className="relative">
            <select id={`${uid}-role`} className="pg-field pr-8" value={form.role} onChange={onField('role')}>
              {(cfg.roleOptions ?? ROLE_OPTIONS).map((o) => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-1 top-3.5 text-[var(--muted)] pointer-events-none" />
          </div>
        </div>
      ) : cfg.third ? (
        <div className="sm:col-span-1">
          <label htmlFor={`${uid}-third`} className="pg-field-label block mb-2">{cfg.third.label}</label>
          <input id={`${uid}-third`} className="pg-field" value={form.third} onChange={onField('third')} placeholder={cfg.third.placeholder} />
        </div>
      ) : null}
      {showRole && cfg.third && (
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-third`} className="pg-field-label block mb-2">{cfg.third.label}</label>
          <input id={`${uid}-third`} className="pg-field" value={form.third} onChange={onField('third')} placeholder={cfg.third.placeholder} />
        </div>
      )}
      <div className="sm:col-span-2">
        <label htmlFor={`${uid}-message`} className="pg-field-label block mb-2">{cfg.messageLabel}</label>
        <textarea id={`${uid}-message`} className="pg-field resize-none" rows={3} value={form.message} onChange={onField('message')} placeholder={cfg.messagePlaceholder} />
      </div>
      {createLead.isError && (
        <div className={`sm:col-span-2 flex items-start gap-3 rounded-[4px] px-4 py-3 text-[0.82rem] leading-relaxed ${onNavy ? 'bg-[rgba(220,80,60,0.16)] text-[var(--cream)]' : 'bg-[rgba(154,58,42,0.08)] text-[#9a3a2a]'}`}>
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.8} />
          <span>Something went wrong sending your submission. Please try again, or email apollo@pegasusdreamscapes.com directly.</span>
        </div>
      )}
      <div className="sm:col-span-2 mt-2">
        <button type="submit" disabled={createLead.isPending}
          className={`${onNavy ? 'btn-solid-light' : 'btn-primary'} w-full sm:w-auto px-10 py-4 pg-label !text-[10px] inline-flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed`}>
          {createLead.isPending ? (
            <>Sending… <Loader2 className="w-3.5 h-3.5 animate-spin" /></>
          ) : (
            <>{cfg.submit} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></>
          )}
        </button>
      </div>
    </form>
  );
}

export function LeadSection({ cfg, eyebrow, showRole = false, tone = 'page', handoff = null, strategy = null }:
  { cfg: FormCfg; eyebrow: string; showRole?: boolean; tone?: 'page' | 'navy'; handoff?: PeggyHandoff | null; strategy?: StrategyPreview | null }) {
  const navy = tone === 'navy';
  const ic = navy ? 'text-[var(--accent-bright)]' : 'text-[var(--accent)]';
  return (
    <section className={`relative overflow-hidden ${navy ? 'py-24 lg:py-28 bg-[var(--navy)] text-[var(--cream)]' : 'pt-28 lg:pt-40 pb-24 lg:pb-28'}`}>
      {navy && <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[70%] text-[var(--accent-2)] opacity-[0.1] float-slow" />}
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        <div className="lg:col-span-5 reveal">
          <div className={`pg-label mb-5 ${ic}`}>{eyebrow}</div>
          <h2 className="font-serif-display font-light text-4xl sm:text-5xl md:text-6xl leading-[1.04] sm:leading-[1.0] tracking-[-0.01em] mb-7"
            style={{ color: navy ? 'var(--cream)' : 'var(--text)' }}>{cfg.heading}</h2>
          <p className={`leading-relaxed mb-10 max-w-md ${navy ? 'text-[var(--cream)]/75' : 'text-[var(--muted)]'}`}>{cfg.lead}</p>
          <div className={`space-y-5 pg-label !text-[11px] !tracking-[0.16em] ${navy ? 'text-[var(--cream)]/80' : 'text-[var(--text-2)]'}`}>
            <a href="mailto:apollo@pegasusdreamscapes.com" className="link-underline flex items-center gap-3"><Mail className={`w-4 h-4 ${ic}`} /> apollo@pegasusdreamscapes.com</a>
            <a href="tel:9257448525" className="link-underline flex items-center gap-3"><Phone className={`w-4 h-4 ${ic}`} /> 925-744-8525</a>
            <div className="flex items-center gap-3"><MapPin className={`w-4 h-4 ${ic}`} /> East Bay · California</div>
          </div>
          <p className={`mt-7 text-[0.82rem] !tracking-normal normal-case ${navy ? 'text-[var(--cream)]/55' : 'text-[var(--muted)]'}`}>
            A person reads every submission. We respond within two business days.
          </p>
        </div>
        <div className="lg:col-span-7 reveal delay-100">
          <div className="lead-card p-6 sm:p-8 lg:p-11">
            <LeadForm cfg={cfg} showRole={showRole} onNavy={navy} handoff={handoff} strategy={strategy} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Strategy Lab underwriting workshop → Instant Strategy Preview
---------------------------------------------------------------- */
function fmtValue(v: number, format: 'usd' | 'pct' | 'months'): string {
  if (format === 'pct') return `${v}%`;
  if (format === 'months') return `${v} mo`;
  return usd0(v);
}

function CalcField({ label, hint, value, min, max, step, onChange, format = 'usd' }:
  { label: string; hint: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format?: 'usd' | 'pct' | 'months' }) {
  const id = 'calc-' + label.toLowerCase().replace(/[^a-z]+/g, '-');
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div className="mb-7">
      <div className="flex items-end justify-between mb-2.5 gap-4">
        <label htmlFor={id} className="pg-field-label">{label}</label>
        <div className="flex items-end gap-1">
          {format === 'usd' && <span className="font-serif-display text-[1.2rem] text-[var(--muted)] leading-none pb-px">$</span>}
          <input id={`${id}-num`} type="number" inputMode="decimal" min={min} max={max} step={step} value={value}
            onChange={(e) => { const n = Number(e.target.value); if (!Number.isNaN(n)) onChange(Math.max(min, Math.min(max, n))); }}
            aria-label={`${label} exact value`}
            className={`calc-num font-serif-display text-[1.75rem] text-[var(--text)] leading-none bg-transparent text-right focus:outline-none focus:text-[var(--accent)] ${format === 'usd' ? 'w-[7ch]' : 'w-[3.5ch]'}`} />
          {format === 'pct' && <span className="font-serif-display text-[1.2rem] text-[var(--muted)] leading-none pb-px">%</span>}
          {format === 'months' && <span className="font-serif-display text-[1.05rem] text-[var(--muted)] leading-none pb-px">mo</span>}
        </div>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="pg-range w-full cursor-pointer"
        style={{ accentColor: 'var(--accent)', ['--pg-range-pct' as string]: `${pct}%` }} />
      <div className="flex items-center justify-between pg-label !text-[8px] !tracking-[0.16em] text-[var(--muted)] mt-2">
        <span>{fmtValue(min, format)}</span><span className="normal-case !tracking-normal text-[0.72rem]">{hint}</span><span>{fmtValue(max, format)}</span>
      </div>
    </div>
  );
}

export type StrategyModel = {
  acq: number; setAcq: (v: number) => void;
  rehab: number; setRehab: (v: number) => void;
  arv: number; setArv: (v: number) => void;
  holdMonths: number; setHoldMonths: (v: number) => void;
  carryRate: number; setCarryRate: (v: number) => void;
  exitRate: number; setExitRate: (v: number) => void;
  hardCost: number; carry: number; exitCosts: number; netProceeds: number;
  totalCost: number; spread: number; margin: number; cashOnCost: number; seventy: number;
  read: { label: string; note: string; lane: string; tier: 'strong' | 'workable' | 'tight' | 'under' };
  snapshot: StrategyPreview;
};

// Lives in a hook so the Strategy Lab page can share the live underwriting state
// with the lead form, letting the Instant Strategy Preview travel with the lead.
export function useStrategyModel(): StrategyModel {
  const [acq, setAcq] = useState(600000);
  const [rehab, setRehab] = useState(95000);
  const [arv, setArv] = useState(840000);
  const [holdMonths, setHoldMonths] = useState(6);
  const [carryRate, setCarryRate] = useState(9);
  const [exitRate, setExitRate] = useState(7);

  const hardCost = acq + rehab; // basis-in: what is invested in the property
  const carry = hardCost * (carryRate / 100) * (holdMonths / 12);
  const exitCosts = arv * (exitRate / 100);
  const netProceeds = arv - exitCosts;
  const totalCost = hardCost + carry + exitCosts;
  const spread = netProceeds - hardCost - carry; // projected net profit
  const margin = totalCost > 0 ? (spread / totalCost) * 100 : 0; // net margin on cost
  const cashOnCost = hardCost + carry > 0 ? (spread / (hardCost + carry)) * 100 : 0;
  const seventy = arv * 0.7 - rehab; // 70% rule guide max offer

  const read =
    margin >= 15
      ? { label: 'Strong value-add candidate', note: 'After carry and exit, the deal still clears a real margin. This is the kind of situation our value-add lane is built for.', lane: 'Investments / Value-add', tier: 'strong' as const }
      : margin >= 8
      ? { label: 'Workable, structure decides it', note: 'There is profit here, but the cushion is moderate once carry and selling costs come out. The terms and the timeline will carry it.', lane: 'Strategy Review', tier: 'workable' as const }
      : margin >= 0
      ? { label: 'Tight, proceed with discipline', note: 'The net margin is slim. It can still work with the right basis and a faster timeline, but the number alone will not make the deal.', lane: 'Strategy Review', tier: 'tight' as const }
      : { label: 'Underwater on these inputs', note: 'As entered, total cost to deliver and sell exceeds net proceeds. We would re-examine the basis and the scope before anything else.', lane: 'Re-examine basis', tier: 'under' as const };

  const snapshot: StrategyPreview = {
    acquisition: acq, rehab, arv, allIn: hardCost, spread, margin, lane: read.lane,
    holdMonths, carry, exitCosts, netProceeds, cashOnCost,
  };

  return {
    acq, setAcq, rehab, setRehab, arv, setArv, holdMonths, setHoldMonths, carryRate, setCarryRate, exitRate, setExitRate,
    hardCost, carry, exitCosts, netProceeds, totalCost, spread, margin, cashOnCost, seventy, read, snapshot,
  };
}

function WaterfallRow({ label, value, sign, strong = false }:
  { label: string; value: string; sign?: '+' | '-'; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between py-2.5 ${strong ? 'border-t border-[rgba(239,231,218,0.28)] mt-1 pt-3.5' : 'border-b border-[rgba(239,231,218,0.12)]'}`}>
      <span className={`pg-label !text-[9px] !tracking-[0.16em] ${strong ? 'text-[var(--cream)]' : 'text-[var(--cream)]/65'}`}>{label}</span>
      <span className={`font-serif-display leading-none ${strong ? 'text-[1.5rem] text-[var(--cream)]' : 'text-[1.15rem] text-[var(--cream)]/90'}`}>
        {sign && <span className="text-[var(--cream)]/40 mr-0.5">{sign}</span>}{value}
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------
   Strategy Lab · Property console (qualitative inputs + Fit Score)
   Front-end only. Mock autofill seeds the shared underwriting model.
---------------------------------------------------------------- */
const SAMPLE_PROPERTIES = [
  { addr: '1428 Walnut Blvd, Concord, CA', zip: '94521', acq: 575000, rehab: 85000, arv: 815000, type: 'Single-family (SFR)', cond: 'Good', occ: 'Vacant', beds: 3, baths: 2, sqft: 1620, rent: 3200 },
  { addr: '92 Estate Way, Walnut Creek, CA', zip: '94598', acq: 910000, rehab: 180000, arv: 1340000, type: 'Single-family (SFR)', cond: 'Poor', occ: 'Probate / estate', beds: 4, baths: 3, sqft: 2480, rent: 4800 },
  { addr: '305 Foothill Ave, Antioch, CA', zip: '94509', acq: 430000, rehab: 60000, arv: 615000, type: 'Triplex / Fourplex', cond: 'Fair', occ: 'Tenant-occupied', beds: 6, baths: 4, sqft: 2900, rent: 5400 },
];

const SEL = {
  type: ['Single-family (SFR)', 'Condo / Townhome / TIC', 'Duplex', 'Triplex / Fourplex', 'Small multifamily (5+)', 'Commercial / Mixed-use', 'Land / Lot', 'ADU / JADU'],
  cond: ['Excellent', 'Good', 'Fair', 'Poor', 'Distressed'],
  occ: ['Owner-occupied', 'Tenant-occupied', 'Vacant', 'Probate / estate'],
  role: ['Owner / Seller', 'Buyer / Investor', 'Deal Finder / Wholesaler', 'Capital Partner', 'Agent / Referral'],
  goal: ['Sell fast', 'Maximize value', 'Buy / acquire', 'Understand options', 'Find JV / capital partner'],
  exit: ['Retail Listing', 'Value-Add Rehab → Retail', 'ADU Addition', 'Hold / Rent', 'As-Is Acquisition', 'JV / Partner', 'MarketFlow Disposition'],
  fin: ['All cash', 'Conventional financing', 'Hard money / bridge', 'Subject-to existing loan', 'Seller financing'],
  motiv: ['Just curious', 'Open to the right offer', 'Motivated', 'Time-sensitive / urgent'],
  repairConf: ['Rough estimate', 'Contractor walk-through done', 'Detailed bid in hand', 'Unknown / sight unseen'],
  timeline: ['Flexible / no rush', 'Within 3 months', 'Within 30 days', 'ASAP / urgent'],
};

function ConsoleSelect({ label, value, opts, onChange }:
  { label: string; value: string; opts: string[]; onChange: (v: string) => void }) {
  const uid = useId();
  return (
    <div>
      <label htmlFor={uid} className="pg-field-label block mb-2">{label}</label>
      <div className="relative">
        <select id={uid} className="pg-field pr-8" value={value} onChange={(e) => onChange(e.target.value)}>
          {opts.map((o) => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-1 top-3.5 text-[var(--muted)] pointer-events-none" />
      </div>
    </div>
  );
}

function ConsoleInput({ label, value, onChange, placeholder, type = 'text', testid }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: 'text' | 'number'; testid?: string }) {
  const uid = useId();
  return (
    <div>
      <label htmlFor={uid} className="pg-field-label block mb-2">{label}</label>
      <input id={uid} type={type} inputMode={type === 'number' ? 'decimal' : undefined} className="pg-field"
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} data-testid={testid} />
    </div>
  );
}

export function StrategyConsole({ go, model }: { go: Nav; model: StrategyModel }) {
  const { setAcq, setRehab, setArv, rehab, hardCost, netProceeds, spread, margin, read } = model;
  const [address, setAddress] = useState('');
  const [pType, setPType] = useState(SEL.type[0]);
  const [cond, setCond] = useState(SEL.cond[1]);
  const [occ, setOcc] = useState(SEL.occ[2]);
  const [role, setRole] = useState(SEL.role[1]);
  const [goal, setGoal] = useState(SEL.goal[2]);
  const [exit, setExit] = useState(SEL.exit[0]);
  const [fin, setFin] = useState(SEL.fin[0]);
  const [motiv, setMotiv] = useState(SEL.motiv[1]);
  const [repairConf, setRepairConf] = useState(SEL.repairConf[0]);
  const [zip, setZip] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [sqft, setSqft] = useState('');
  const [timeline, setTimeline] = useState(SEL.timeline[0]);
  const [rent, setRent] = useState('');

  const autofill = () => {
    const s = SAMPLE_PROPERTIES[Math.floor(Math.random() * SAMPLE_PROPERTIES.length)];
    setAddress(s.addr); setAcq(s.acq); setRehab(s.rehab); setArv(s.arv);
    setPType(s.type); setCond(s.cond); setOcc(s.occ);
    setZip(s.zip); setBeds(String(s.beds)); setBaths(String(s.baths)); setSqft(String(s.sqft)); setRent(String(s.rent));
  };

  // Mock Property Fit Score: blends the live margin read with the situation.
  const marginScore = Math.max(0, Math.min(50, (margin / 25) * 50));
  const condBonus = cond === 'Distressed' || cond === 'Poor' ? 16 : cond === 'Fair' ? 12 : cond === 'Good' ? 9 : 4;
  const occBonus = occ === 'Probate / estate' || occ === 'Vacant' ? 12 : occ === 'Tenant-occupied' ? 8 : 4;
  const goalBonus = goal === 'Maximize value' ? 7 : goal === 'Sell fast' ? 5 : 3;
  const motivBonus = motiv === 'Time-sensitive / urgent' ? 12 : motiv === 'Motivated' ? 8 : motiv === 'Open to the right offer' ? 4 : 1;
  const fit = Math.round(Math.max(8, Math.min(98, marginScore + condBonus + occBonus + goalBonus + motivBonus)));
  const fitBand = fit >= 75 ? 'Strong fit' : fit >= 55 ? 'Worth a review' : fit >= 35 ? 'Possible, needs work' : 'Likely not a fit';

  // Confidence reflects how complete the inputs are, not how good the deal is.
  // The more the visitor tells us, the more we trust the preview.
  const inputsFilled = [
    address.trim() !== '',
    zip.trim() !== '',
    beds.trim() !== '',
    baths.trim() !== '',
    sqft.trim() !== '',
    rent.trim() !== '',
    repairConf === 'Contractor walk-through done' || repairConf === 'Detailed bid in hand',
  ].filter(Boolean).length;
  const confidence = inputsFilled >= 6 ? 'High' : inputsFilled >= 3 ? 'Medium' : 'Low';

  // Mock capital-needed: cash deals carry the full basis; leverage assumes ~20% in.
  const capitalNeeded = fin === 'All cash' ? hardCost : Math.round(hardCost * 0.2 + rehab);
  const exitDetail =
    exit === 'Value-Add Rehab → Retail' ? 'Value-add rehab to retail — basis plus scope, then sold on the open market after the lift.'
    : exit === 'ADU Addition' ? 'ADU addition — added unit value and rent; plan for permits, timeline, and feasibility.'
    : exit === 'Hold / Rent' ? 'Hold and rent — plan for rent coverage and a stabilized debt position.'
    : exit === 'As-Is Acquisition' ? 'As-is acquisition — bought at a basis that works without a full renovation.'
    : exit === 'JV / Partner' ? 'JV / partner — structured with a partner; a written agreement governs the split.'
    : exit === 'MarketFlow Disposition' ? 'MarketFlow disposition — placed through the MarketFlow network to a vetted buyer.'
    : 'Retail listing on the open market — net proceeds shown after exit costs.';
  const riskFlags: string[] = [
    ...(margin < 8 ? ['Thin margin once carry and exit costs come out'] : []),
    ...(repairConf === 'Unknown / sight unseen' || repairConf === 'Rough estimate' ? ['Repair budget is a rough estimate, not a verified scope'] : []),
    ...(occ === 'Tenant-occupied' ? ['Tenant-occupied — possession and relocation may apply'] : []),
    ...(occ === 'Probate / estate' ? ['Probate / estate — court timing and authority to sell to confirm'] : []),
    ...(fin === 'Subject-to existing loan' ? ['Subject-to carries due-on-sale and disclosure exposure'] : []),
  ];

  const lane: { label: string; route: Parameters<Nav>[0] } =
    role === 'Owner / Seller'
      ? (cond === 'Distressed' || cond === 'Poor' || occ === 'Probate / estate'
        ? { label: 'Send for a property review', route: 'sellers' }
        : { label: 'See seller representation', route: 'apollo' })
      : role === 'Deal Finder / Wholesaler'
      ? { label: 'Submit the deal to Deal Finders', route: 'dealfinders' }
      : role === 'Capital Partner'
      ? { label: 'See the Capital lane', route: 'capital' }
      : role === 'Agent / Referral'
      ? { label: 'Partner with Apollo', route: 'apollo' }
      : { label: 'See the Buyers lane', route: 'buyers' };

  const costCards = [
    { label: 'Estimated all-in basis', value: usd0(hardCost) },
    { label: 'Projected net at sale', value: usd0(netProceeds) },
    { label: 'Projected net position', value: usd0(spread) },
  ];

  return (
    <section className="py-24 lg:py-28 bg-[var(--bg-2)] border-b border-[var(--line)]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead eyebrow="Strategy Lab · Property console"
          title={<>Start with the property,<br />get a read on the fit.</>}
          copy="Tell us about the property and what you want to do. We will frame a mock Property Fit Score and point you to the lane that fits. This is directional orientation only, not an offer or an underwrite." />
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-7 reveal">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-7">
              <div className="flex-1">
                <label htmlFor="console-addr" className="pg-field-label block mb-2">Property address</label>
                <input id="console-addr" type="text" className="pg-field" value={address}
                  onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, state"
                  data-testid="input-console-address" />
              </div>
              <button type="button" onClick={autofill}
                className="btn-line px-6 py-3.5 pg-label !text-[10px] whitespace-nowrap" data-testid="button-console-autofill">
                Use a sample property
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <ConsoleSelect label="Property type" value={pType} opts={SEL.type} onChange={setPType} />
              <ConsoleSelect label="Condition" value={cond} opts={SEL.cond} onChange={setCond} />
              <ConsoleSelect label="Occupancy" value={occ} opts={SEL.occ} onChange={setOcc} />
              <ConsoleSelect label="Your role" value={role} opts={SEL.role} onChange={setRole} />
              <ConsoleSelect label="Your goal" value={goal} opts={SEL.goal} onChange={setGoal} />
              <ConsoleSelect label="Likely exit" value={exit} opts={SEL.exit} onChange={setExit} />
              <ConsoleSelect label="Financing / position" value={fin} opts={SEL.fin} onChange={setFin} />
              <ConsoleSelect label="Seller motivation" value={motiv} opts={SEL.motiv} onChange={setMotiv} />
              <ConsoleSelect label="Repair budget confidence" value={repairConf} opts={SEL.repairConf} onChange={setRepairConf} />
            </div>

            <div className="mt-8">
              <div className="pg-label !text-[9px] !tracking-[0.18em] text-[var(--accent)] mb-4">Property details · optional, sharpens the read</div>
              <div className="grid sm:grid-cols-2 gap-5">
                <ConsoleInput label="ZIP / neighborhood" value={zip} onChange={setZip} placeholder="94521 or area" testid="input-console-zip" />
                <ConsoleSelect label="Timeline" value={timeline} opts={SEL.timeline} onChange={setTimeline} />
                <ConsoleInput label="Beds" value={beds} onChange={setBeds} placeholder="3" type="number" testid="input-console-beds" />
                <ConsoleInput label="Baths" value={baths} onChange={setBaths} placeholder="2" type="number" testid="input-console-baths" />
                <ConsoleInput label="Living area (sq ft)" value={sqft} onChange={setSqft} placeholder="1,600" type="number" testid="input-console-sqft" />
                <ConsoleInput label="Expected monthly rent" value={rent} onChange={setRent} placeholder="3,200" type="number" testid="input-console-rent" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[...costCards, { label: 'Est. capital needed in', value: usd0(capitalNeeded) }].map((c) => (
                <div key={c.label} className="surface-card p-5">
                  <div className="pg-label !text-[8px] text-[var(--accent)] mb-2">{c.label}</div>
                  <div className="font-serif-display text-2xl text-[var(--text)] leading-none">{c.value}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[0.78rem] text-[var(--muted)]">
              Figures are seeded from the underwriting workshop below and from mock sample data. Adjust the sliders to refine them. Nothing here is an offer or a valuation.
            </p>
          </div>

          <div className="lg:col-span-5 reveal delay-100 lg:sticky lg:top-28">
            <div className="rounded-[3px] bg-[var(--navy)] text-[var(--cream)] p-8 lg:p-10 peggy-shadow overflow-hidden relative">
              <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[55%] text-[var(--accent-2)] opacity-[0.1]" />
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-7">
                  <BrandMark boxClassName="w-7 h-7" onDark />
                  <div className="pg-label !text-[9px] text-[var(--accent-bright)]">Property Fit Score</div>
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-serif-display text-[4.5rem] leading-none text-[var(--accent-bright)]" data-testid="text-console-fit-score">{fit}</span>
                  <span className="font-serif-display text-2xl text-[var(--cream)]/50">/100</span>
                </div>
                <div className="pg-label !text-[9px] !tracking-[0.16em] text-[var(--cream)] mb-3" data-testid="text-console-fit-band">{fitBand}</div>
                <div className="flex items-center gap-2.5 mb-5" data-testid="text-console-confidence">
                  <span className="pg-label !text-[8px] !tracking-[0.16em] text-[var(--cream)]/55">Input confidence</span>
                  <span className={`pg-label !text-[8px] !tracking-[0.16em] px-2 py-0.5 rounded-full border ${
                    confidence === 'High' ? 'text-[var(--accent-bright)] border-[var(--accent-bright)]/50'
                    : confidence === 'Medium' ? 'text-[var(--cream)] border-[var(--cream)]/35'
                    : 'text-[var(--cream)]/60 border-[var(--cream)]/20'}`}>{confidence}</span>
                </div>
                <div className="h-2 rounded-full bg-[rgba(239,231,218,0.14)] overflow-hidden mb-7">
                  <div className="h-full rounded-full bg-[var(--accent-bright)] transition-[width] duration-700" style={{ width: `${fit}%` }} />
                </div>
                <p className="text-[var(--cream)]/70 text-[0.9rem] leading-relaxed mb-6">
                  {read.note} A real read comes from a person; this score is a mock guide to point you to the right next step.
                </p>
                <div className="border-t border-[rgba(239,231,218,0.16)] pt-5 mb-6">
                  <div className="pg-label !text-[8px] !tracking-[0.16em] text-[var(--accent-bright)] mb-2">Exit path</div>
                  <p className="text-[var(--cream)]/80 text-[0.85rem] leading-relaxed">{exitDetail}</p>
                </div>
                <div className="border-t border-[rgba(239,231,218,0.16)] pt-5 mb-7">
                  <div className="pg-label !text-[8px] !tracking-[0.16em] text-[var(--accent-bright)] mb-3">Risk flags</div>
                  {riskFlags.length === 0 ? (
                    <p className="text-[var(--cream)]/70 text-[0.85rem] leading-relaxed">No major flags on these inputs. Diligence still applies.</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {riskFlags.map((f) => (
                        <li key={f} className="flex gap-2.5 text-[var(--cream)]/80 text-[0.83rem] leading-relaxed">
                          <AlertCircle className="w-3.5 h-3.5 text-[var(--accent-bright)] mt-0.5 shrink-0" strokeWidth={1.8} /><span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button type="button" onClick={() => go(lane.route)}
                  className="btn-primary w-full justify-center px-7 py-4 pg-label !text-[10px] inline-flex items-center gap-2.5 group mb-3"
                  data-testid="button-console-lane">
                  {lane.label} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.8} />
                </button>
                <button type="button" onClick={() => go('contact')}
                  className="btn-line-light w-full justify-center px-7 py-3.5 pg-label !text-[10px] inline-flex items-center gap-2.5"
                  data-testid="button-console-review">
                  Ask for a human review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StrategyCalculator({ go, model }: { go: Nav; model: StrategyModel }) {
  const {
    acq, setAcq, rehab, setRehab, arv, setArv, holdMonths, setHoldMonths, carryRate, setCarryRate, exitRate, setExitRate,
    hardCost, carry, exitCosts, netProceeds, totalCost, spread, margin, cashOnCost, seventy, read,
  } = model;

  const meter = Math.max(0, Math.min(100, (margin / 25) * 100));
  const meterColor = read.tier === 'strong' ? 'var(--accent-bright)' : read.tier === 'under' ? '#d97a5e' : 'var(--accent)';

  // Every preview is framed against the same set of Pegasus lanes; the margin
  // read highlights the one the numbers point to. Front-end only.
  const LANES = [
    'Retail Listing', 'As-Is Acquisition Review', 'Value-Add Rehab', 'ADU / Development Screen',
    'Partner / JV Review', 'Investor-Buyer Acquisition', 'MarketFlow Disposition', 'Deal Blueprint',
  ];
  const suggestedLane =
    margin >= 15 ? 'Value-Add Rehab'
    : margin >= 8 ? 'As-Is Acquisition Review'
    : margin >= 0 ? 'Retail Listing'
    : 'Deal Blueprint';
  const ASSUMPTIONS = [
    { label: 'ARV', value: arv, set: setArv, step: 5000 },
    { label: 'Repair budget', value: rehab, set: setRehab, step: 2500 },
    { label: 'Hold (mo)', value: holdMonths, set: setHoldMonths, step: 1 },
  ] as const;

  return (
    <section className="relative py-24 lg:py-28 overflow-hidden">
      <div aria-hidden="true" className="section-numeral absolute top-0 right-4 lg:right-12 text-[var(--line-soft)]">LAB</div>
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead eyebrow="Strategy Lab · Underwriting workshop"
          title={<>Underwrite the deal,<br />before you make the offer.</>}
          copy="Set the basis, the scope, and the exit assumptions. The Instant Strategy Preview models carry and selling costs into a projected net margin, live. Directional orientation, not an underwrite." />
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-6 reveal">
            <div className="pg-label !text-[9px] text-[var(--accent)] mb-5">Basis &amp; scope</div>
            <CalcField label="Acquisition price" hint="Your basis going in" value={acq} min={150000} max={2500000} step={5000} onChange={setAcq} />
            <CalcField label="Value-add budget" hint="Disciplined scope of work" value={rehab} min={0} max={750000} step={2500} onChange={setRehab} />
            <CalcField label="Projected delivered value" hint="After-repair market value (ARV)" value={arv} min={150000} max={3500000} step={5000} onChange={setArv} />
            <div className="pg-label !text-[9px] text-[var(--accent)] mb-5 mt-11">Hold &amp; exit assumptions</div>
            <CalcField label="Hold period" hint="Acquire to sale" value={holdMonths} min={2} max={36} step={1} onChange={setHoldMonths} format="months" />
            <CalcField label="Annual carry rate" hint="Financing, taxes, insurance, utilities" value={carryRate} min={0} max={18} step={0.5} onChange={setCarryRate} format="pct" />
            <CalcField label="Exit cost rate" hint="Commissions and closing at sale" value={exitRate} min={0} max={12} step={0.5} onChange={setExitRate} format="pct" />
          </div>
          <div className="lg:col-span-6 reveal delay-100 lg:sticky lg:top-28">
            <div className="rounded-[3px] bg-[var(--navy)] text-[var(--cream)] p-6 sm:p-9 lg:p-11 peggy-shadow overflow-hidden relative">
              <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[60%] text-[var(--accent-2)] opacity-[0.1]" />
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-6">
                  <BrandMark boxClassName="w-7 h-7" onDark />
                  <div>
                    <div className="pg-label !text-[9px] text-[var(--accent-bright)]">Instant Strategy Preview</div>
                    <div className="pg-label !text-[7px] !tracking-[0.18em] text-[var(--cream)]/45 mt-1">Preliminary · Automated · Subject to Human Review</div>
                  </div>
                </div>
                <WaterfallRow label="Acquisition basis" value={usd0(acq)} />
                <WaterfallRow label="Value-add budget" value={usd0(rehab)} sign="+" />
                <WaterfallRow label={`Carry · ${holdMonths} mo`} value={usd0(carry)} sign="+" />
                <WaterfallRow label="Exit costs" value={usd0(exitCosts)} sign="+" />
                <WaterfallRow label="Total cost to deliver" value={usd0(totalCost)} strong />
                <div className="flex items-baseline justify-between py-2.5 mt-1">
                  <span className="pg-label !text-[9px] !tracking-[0.16em] text-[var(--cream)]/65">Net proceeds at sale</span>
                  <span className="font-serif-display text-[1.15rem] text-[var(--cream)]/90">{usd0(netProceeds)}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-5 mt-7 mb-7">
                  <div className="flex items-baseline justify-between sm:block">
                    <div className="pg-label !text-[8px] !tracking-[0.14em] text-[var(--cream)]/55 sm:mb-2">Net profit</div>
                    <div className="font-serif-display text-[2rem] sm:text-[2.4rem] leading-none text-[var(--accent-bright)]">{usd0(spread)}</div>
                  </div>
                  <div className="flex items-baseline justify-between sm:block">
                    <div className="pg-label !text-[8px] !tracking-[0.14em] text-[var(--cream)]/55 sm:mb-2">Net margin</div>
                    <div className="font-serif-display text-[2rem] sm:text-[2.4rem] leading-none text-[var(--accent-bright)]">{margin.toFixed(1)}%</div>
                  </div>
                  <div className="flex items-baseline justify-between sm:block">
                    <div className="pg-label !text-[8px] !tracking-[0.14em] text-[var(--cream)]/55 sm:mb-2">Cash on cost</div>
                    <div className="font-serif-display text-[2rem] sm:text-[2.4rem] leading-none text-[var(--accent-bright)]">{cashOnCost.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="h-1.5 rounded-full bg-[rgba(239,231,218,0.14)] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${meter}%`, background: meterColor }} />
                  </div>
                  <div className="flex items-center justify-between pg-label !text-[8px] !tracking-[0.16em] text-[var(--cream)]/45 mt-2">
                    <span>Tight</span><span className="normal-case !tracking-normal text-[var(--cream)]/55">Net margin meter</span><span>Strong</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(239,231,218,0.12)]">
                    <span className="pg-label !text-[8px] !tracking-[0.14em] normal-case text-[var(--cream)]/45">70% rule guide max offer</span>
                    <span className="font-serif-display text-[1.05rem] text-[var(--cream)]/85 leading-none">{usd0(Math.max(0, seventy))}</span>
                  </div>
                </div>
                <div className="border-t border-[rgba(239,231,218,0.16)] pt-6 mb-6">
                  <div className="pg-label !text-[8px] !tracking-[0.18em] text-[var(--accent-bright)] mb-3">Adjust assumptions</div>
                  <div className="grid grid-cols-3 gap-3">
                    {ASSUMPTIONS.map((a) => (
                      <div key={a.label} className="rounded-[3px] bg-[rgba(239,231,218,0.06)] border border-[rgba(239,231,218,0.14)] px-3 py-2.5">
                        <label className="pg-label !text-[7px] !tracking-[0.12em] text-[var(--cream)]/55 block mb-1">{a.label}</label>
                        <input type="number" inputMode="decimal" value={a.value} step={a.step}
                          onChange={(e) => { const n = Number(e.target.value); if (!Number.isNaN(n)) a.set(Math.max(0, n)); }}
                          aria-label={`${a.label} assumption`}
                          data-testid={`input-assumption-${a.label.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                          className="w-full bg-transparent font-serif-display text-[0.95rem] sm:text-[1.1rem] text-[var(--cream)] leading-none focus:outline-none focus:text-[var(--accent-bright)]" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[rgba(239,231,218,0.16)] pt-6 mb-6">
                  <div className="pg-label !text-[8px] !tracking-[0.18em] text-[var(--accent-bright)] mb-3">Lanes considered</div>
                  <div className="flex flex-wrap gap-2" data-testid="list-output-lanes">
                    {LANES.map((l) => {
                      const active = l === suggestedLane;
                      return (
                        <span key={l} data-testid={`lane-${l.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                          className={`pg-label !text-[8px] !tracking-[0.1em] px-3 py-1.5 rounded-full border ${
                            active
                              ? 'bg-[var(--accent-bright)] text-[var(--navy)] border-[var(--accent-bright)]'
                              : 'text-[var(--cream)]/60 border-[rgba(239,231,218,0.2)]'}`}>
                          {l}{active && ' ·'}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-[rgba(239,231,218,0.16)] pt-6">
                  <div className="pg-label !text-[8px] !tracking-[0.18em] text-[var(--cream)]/55 mb-2">Suggested lane · {read.lane}</div>
                  <div className="font-serif-display text-2xl text-[var(--cream)] mb-2">{read.label}</div>
                  <p className="text-[var(--cream)]/70 text-[0.92rem] leading-relaxed mb-7">{read.note}</p>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    <button type="button" onClick={() => go('contact')}
                      className="btn-solid-light px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
                      Send it for a written read <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <SaveStrategyButton snapshot={model.snapshot}
                      title={`${usd0(arv)} ARV · ${margin.toFixed(1)}% margin`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 max-w-2xl rounded-[3px] border border-[var(--line)] bg-[var(--bg-2)] p-6" data-testid="text-strategy-disclaimer">
          <div className="pg-label !text-[8px] !tracking-[0.18em] text-[var(--accent)] mb-3">Disclaimer</div>
          <p className="text-[0.85rem] leading-relaxed text-[var(--text-2)]">
            Strategy Lab outputs are preliminary and automated. They are not legal, tax, lending, accounting, appraisal, engineering, securities, or construction advice. All outputs are subject to human review, market conditions, property condition, title, occupancy, and written agreements.
          </p>
          <p className="mt-3 text-[0.78rem] leading-relaxed text-[var(--muted)]">
            Carry is modeled as a flat annual rate on basis; it simplifies financing structure, draw timing, and contingencies, and excludes transfer taxes. Every real read is done by a person.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   Strategy Lab · Tier strip — the three levels of depth, clearly
   priced and routed. Front-end only; routes to the canonical /submit.
---------------------------------------------------------------- */
export function StrategyTierStrip() {
  const [, setLocation] = useLocation();
  const goSubmit = (intent?: string) => {
    setLocation(intent ? `/submit?intent=${intent}` : '/submit');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  const tiers = [
    {
      key: 'preview', name: 'Instant Strategy Preview', price: 'Free · Automated',
      desc: 'Run the numbers above for a directional read on margin, lane, and risk flags — instantly, no contact needed.',
      cta: 'You are using it above', action: null as null | (() => void), emphasis: false,
    },
    {
      key: 'snapshot', name: 'Strategy Snapshot', price: 'Human-Reviewed',
      desc: 'Send the situation and a person returns a short, candid written read — usually within two business days.',
      cta: 'Request a Snapshot', action: () => goSubmit(), emphasis: true,
    },
    {
      key: 'blueprint', name: 'Deal Blueprint', price: 'By Review',
      desc: 'A full tactical plan: underwriting, scope, exit options, and a sequenced path. Commissioned by engagement after a Strategy Review, not bought off the shelf.',
      cta: 'Start a Deal Blueprint', action: () => goSubmit('blueprint'), emphasis: false,
    },
  ];
  return (
    <section className="py-20 lg:py-24 bg-[var(--bg-2)] border-b border-[var(--line)]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
        <SectionHead eyebrow="Strategy Lab · Levels of depth"
          title={<>Go as far as the deal deserves.</>}
          copy="Three tiers, increasing depth. Start free and self-serve, escalate to a human-written read, and engage the full Blueprint when the deal is worth a plan." />
        <div className="grid md:grid-cols-3 gap-5" data-testid="strategy-tier-strip">
          {tiers.map((t) => (
            <div key={t.key}
              data-testid={`tier-${t.key}`}
              className={`surface-card p-7 flex flex-col ${t.emphasis ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/30' : ''}`}>
              <div className="pg-label !text-[8px] !tracking-[0.16em] text-[var(--accent)] mb-2">{t.price}</div>
              <h3 className="font-serif-display text-2xl text-[var(--text)] mb-3 leading-tight">{t.name}</h3>
              <p className="text-[var(--muted)] text-[0.88rem] leading-relaxed mb-6 flex-1">{t.desc}</p>
              {t.action ? (
                <button type="button" onClick={t.action}
                  data-testid={`button-tier-${t.key}`}
                  className={`${t.emphasis ? 'btn-primary' : 'btn-line'} w-full justify-center px-6 py-3.5 pg-label !text-[10px] inline-flex items-center gap-2.5 group`}>
                  {t.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.8} />
                </button>
              ) : (
                <div className="w-full text-center px-6 py-3.5 pg-label !text-[10px] text-[var(--muted)] border border-dashed border-[var(--line)] rounded-[3px]">
                  {t.cta}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
