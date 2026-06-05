import React, { useId, useRef, useState } from 'react';
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
        <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-white flex items-center justify-center mx-auto mb-7"><Check className="w-7 h-7" /></div>
        <h3 className="font-serif-display text-3xl text-[var(--text)] mb-3">Received. Thank you.</h3>
        <p className="text-[var(--muted)] max-w-sm mx-auto leading-relaxed">A person will read your submission and return a plain-language path forward. Most reads come back within two business days.</p>
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
    <section className={`relative overflow-hidden ${navy ? 'py-24 lg:py-28 bg-[var(--navy)] text-[var(--cream)]' : 'pt-32 lg:pt-40 pb-24 lg:pb-28'}`}>
      {navy && <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[70%] text-[var(--accent-2)] opacity-[0.1] float-slow" />}
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        <div className="lg:col-span-5 reveal">
          <div className={`pg-label mb-5 ${ic}`}>{eyebrow}</div>
          <h2 className="font-serif-display font-light text-5xl md:text-6xl leading-[1.0] tracking-[-0.01em] mb-7"
            style={{ color: navy ? 'var(--cream)' : 'var(--text)' }}>{cfg.heading}</h2>
          <p className={`leading-relaxed mb-10 max-w-md ${navy ? 'text-[var(--cream)]/75' : 'text-[var(--muted)]'}`}>{cfg.lead}</p>
          <div className={`space-y-5 pg-label !text-[11px] !tracking-[0.16em] ${navy ? 'text-[var(--cream)]/80' : 'text-[var(--text-2)]'}`}>
            <a href="mailto:apollo@pegasusdreamscapes.com" className="link-underline flex items-center gap-3"><Mail className={`w-4 h-4 ${ic}`} /> apollo@pegasusdreamscapes.com</a>
            <a href="tel:9257448525" className="link-underline flex items-center gap-3"><Phone className={`w-4 h-4 ${ic}`} /> 925-744-8525</a>
            <div className="flex items-center gap-3"><MapPin className={`w-4 h-4 ${ic}`} /> Pleasant Hill · East Bay · California</div>
          </div>
          <p className={`mt-7 text-[0.82rem] !tracking-normal normal-case ${navy ? 'text-[var(--cream)]/55' : 'text-[var(--muted)]'}`}>
            A person reads every submission. We respond within two business days.
          </p>
        </div>
        <div className="lg:col-span-7 reveal delay-100">
          <div className="lead-card p-8 lg:p-11">
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
  { addr: '1428 Walnut Blvd, Concord, CA', acq: 575000, rehab: 85000, arv: 815000, type: 'Single-family', cond: 'Light cosmetic', occ: 'Vacant' },
  { addr: '92 Estate Way, Walnut Creek, CA', acq: 910000, rehab: 180000, arv: 1340000, type: 'Single-family', cond: 'Full gut', occ: 'Probate / estate' },
  { addr: '305 Foothill Ave, Antioch, CA', acq: 430000, rehab: 60000, arv: 615000, type: '2–4 units', cond: 'Heavy cosmetic', occ: 'Tenant-occupied' },
];

const SEL = {
  type: ['Single-family', '2–4 units', 'Small multifamily (5+)', 'Condo / Townhome', 'Land / ADU lot'],
  cond: ['Move-in ready', 'Light cosmetic', 'Heavy cosmetic', 'Full gut', 'Distressed / unknown'],
  occ: ['Owner-occupied', 'Tenant-occupied', 'Vacant', 'Probate / estate'],
  role: ['I own it (Seller)', 'I am buying it (Buyer / Investor)', 'I sourced it (Deal finder)'],
  goal: ['Sell for the most', 'Sell fast, as-is', 'Reposition & lift value', 'Hold & rent', 'Just exploring'],
  exit: ['Resale on the open market', 'Refinance & hold', 'Wholesale / assign', 'Not sure yet'],
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

export function StrategyConsole({ go, model }: { go: Nav; model: StrategyModel }) {
  const { setAcq, setRehab, setArv, hardCost, netProceeds, spread, margin, read } = model;
  const [address, setAddress] = useState('');
  const [pType, setPType] = useState(SEL.type[0]);
  const [cond, setCond] = useState(SEL.cond[1]);
  const [occ, setOcc] = useState(SEL.occ[2]);
  const [role, setRole] = useState(SEL.role[1]);
  const [goal, setGoal] = useState(SEL.goal[2]);
  const [exit, setExit] = useState(SEL.exit[0]);

  const autofill = () => {
    const s = SAMPLE_PROPERTIES[Math.floor(Math.random() * SAMPLE_PROPERTIES.length)];
    setAddress(s.addr); setAcq(s.acq); setRehab(s.rehab); setArv(s.arv);
    setPType(s.type); setCond(s.cond); setOcc(s.occ);
  };

  // Mock Property Fit Score: blends the live margin read with the situation.
  const marginScore = Math.max(0, Math.min(60, (margin / 25) * 60));
  const condBonus = cond === 'Full gut' || cond === 'Distressed / unknown' ? 18 : cond === 'Heavy cosmetic' ? 14 : cond === 'Light cosmetic' ? 10 : 4;
  const occBonus = occ === 'Probate / estate' || occ === 'Vacant' ? 14 : occ === 'Tenant-occupied' ? 9 : 5;
  const goalBonus = goal === 'Reposition & lift value' ? 8 : goal === 'Sell fast, as-is' ? 6 : 4;
  const fit = Math.round(Math.max(8, Math.min(98, marginScore + condBonus + occBonus + goalBonus)));
  const fitBand = fit >= 75 ? 'Strong fit' : fit >= 55 ? 'Worth a review' : fit >= 35 ? 'Possible, needs work' : 'Likely not a fit';

  const lane: { label: string; route: Parameters<Nav>[0] } =
    role.startsWith('I own')
      ? (cond === 'Full gut' || cond === 'Distressed / unknown' || occ === 'Probate / estate'
        ? { label: 'Send for a property review', route: 'sellers' }
        : { label: 'Explore seller representation', route: 'apollo' })
      : role.startsWith('I sourced')
      ? { label: 'Submit the deal to Deal Finders', route: 'dealfinders' }
      : { label: 'Explore the Buyers lane', route: 'buyers' };

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
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {costCards.map((c) => (
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
                  <span className="font-serif-display text-[4.5rem] leading-none text-[var(--accent-bright)]">{fit}</span>
                  <span className="font-serif-display text-2xl text-[var(--cream)]/50">/100</span>
                </div>
                <div className="pg-label !text-[9px] !tracking-[0.16em] text-[var(--cream)] mb-5">{fitBand}</div>
                <div className="h-2 rounded-full bg-[rgba(239,231,218,0.14)] overflow-hidden mb-7">
                  <div className="h-full rounded-full bg-[var(--accent-bright)] transition-[width] duration-700" style={{ width: `${fit}%` }} />
                </div>
                <p className="text-[var(--cream)]/70 text-[0.9rem] leading-relaxed mb-7">
                  {read.note} A real read comes from a person; this score is a mock guide to point you to the right next step.
                </p>
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

  return (
    <section className="relative py-24 lg:py-28 overflow-hidden">
      <div aria-hidden="true" className="section-numeral absolute -top-6 right-4 lg:right-12 text-[var(--line-soft)]">LAB</div>
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
            <div className="rounded-[3px] bg-[var(--navy)] text-[var(--cream)] p-9 lg:p-11 peggy-shadow overflow-hidden relative">
              <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[60%] text-[var(--accent-2)] opacity-[0.1]" />
              <div className="relative">
                <div className="flex items-center gap-2.5 mb-6">
                  <BrandMark boxClassName="w-7 h-7" onDark />
                  <div className="pg-label !text-[9px] text-[var(--accent-bright)]">Instant Strategy Preview</div>
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
                <div className="grid grid-cols-3 gap-4 mt-7 mb-7">
                  <div>
                    <div className="pg-label !text-[8px] !tracking-[0.14em] text-[var(--cream)]/55 mb-2">Net profit</div>
                    <div className="font-serif-display text-[2.4rem] leading-none text-[var(--accent-bright)]">{usd0(spread)}</div>
                  </div>
                  <div>
                    <div className="pg-label !text-[8px] !tracking-[0.14em] text-[var(--cream)]/55 mb-2">Net margin</div>
                    <div className="font-serif-display text-[2.4rem] leading-none text-[var(--accent-bright)]">{margin.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="pg-label !text-[8px] !tracking-[0.14em] text-[var(--cream)]/55 mb-2">Cash on cost</div>
                    <div className="font-serif-display text-[2.4rem] leading-none text-[var(--accent-bright)]">{cashOnCost.toFixed(1)}%</div>
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
        <p className="mt-10 text-[0.82rem] leading-relaxed text-[var(--muted)] max-w-2xl">
          A directional estimate for orientation only. Carry is modeled as a flat annual rate on basis; it simplifies financing structure, draw timing, and contingencies, and excludes transfer taxes. This is not an offer or an underwrite. Every real read is done by a person.
        </p>
      </div>
    </section>
  );
}
