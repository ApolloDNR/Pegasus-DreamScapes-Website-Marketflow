import { T, FONT_LINK, STRATEGIES_14 } from "./_tokens";

const sorted = [...STRATEGIES_14].sort((a, b) => b.score - a.score);
const top = sorted.slice(0, 3);

export default function PDFExport() {
  return (
    <div style={{ backgroundColor: "#3a3f48", fontFamily: T.sans, minHeight: "100vh", padding: "40px 32px" }}>
      {FONT_LINK}
      <div className="mx-auto" style={{ maxWidth: 720 }}>
        <div className="mb-6 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: T.cream }}>
          <div>PDF Export · 4-page layout</div>
          <div style={{ color: T.copper }}>Strategy Snapshot · Confidential</div>
        </div>

        <PageCover />
        <PageStrategies />
        <PageKillsAndParticipation />
        <PageDisclosures />
      </div>
    </div>
  );
}

function PageShell({ children, pageNum, total = 4 }: { children: React.ReactNode; pageNum: number; total?: number }) {
  return (
    <div
      className="mb-8"
      style={{
        backgroundColor: "#fff",
        boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
        width: "100%",
        aspectRatio: "8.5 / 11",
        position: "relative",
        color: T.midnight,
        overflow: "hidden",
      }}
    >
      {children}
      <div
        className="absolute bottom-0 left-0 right-0 px-10 py-3 flex items-center justify-between text-[8px] uppercase tracking-[0.22em] font-semibold border-t"
        style={{ borderColor: T.rule, color: T.muted, backgroundColor: "#fff" }}
      >
        <span>Pegasus DreamScapes · The Deal Architect</span>
        <span>Illustrative — not an offer · Not investment advice</span>
        <span>{pageNum} / {total}</span>
      </div>
    </div>
  );
}

function PageCover() {
  return (
    <PageShell pageNum={1}>
      {/* Top copper strip */}
      <div style={{ height: 6, backgroundColor: T.copper }} />
      {/* Navy block */}
      <div style={{ backgroundColor: T.midnight, color: T.cream, padding: "44px 48px 36px" }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rotate-45" style={{ backgroundColor: T.copper }} />
          <div className="text-[14px] font-semibold" style={{ fontFamily: T.serif }}>
            Pegasus DreamScapes
          </div>
          <div className="text-[9px] uppercase tracking-[0.28em] pl-3 ml-1 border-l font-semibold" style={{ borderColor: T.ruleDark, color: T.mutedDark }}>
            The Deal Architect
          </div>
        </div>
      </div>

      <div style={{ padding: "60px 48px 0" }}>
        <div className="text-[10px] uppercase tracking-[0.32em] font-semibold" style={{ color: T.copper }}>
          Strategy Snapshot · Run #PD-26-0418 · April 18, 2026
        </div>

        <h1
          className="mt-6 text-[44px] leading-[1.05] font-semibold"
          style={{ fontFamily: T.serif, letterSpacing: "-0.02em", color: T.midnight }}
        >
          1247 Aberdeen Way
          <div className="text-[20px] font-normal mt-2" style={{ color: T.muted }}>
            Concord, CA 94521 · 3 bd / 2 ba · 1,850 sqft · Built 1985
          </div>
        </h1>

        <div className="mt-10 grid grid-cols-2 gap-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] font-semibold mb-2" style={{ color: T.muted }}>
              Reviewed for
            </div>
            <div className="text-[14px]" style={{ fontFamily: T.serif }}>
              Submitter: M. Alvarez (owner of record's daughter)
            </div>
            <div className="text-[14px]" style={{ fontFamily: T.serif }}>
              Goal: Sell as-is to a serious operator · 30–60 days
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] font-semibold mb-2" style={{ color: T.muted }}>
              Reviewed by
            </div>
            <div className="text-[14px]" style={{ fontFamily: T.serif }}>
              Paolo "Apollo" Duran — Founder &amp; Principal
            </div>
            <div className="text-[12px]" style={{ color: T.muted }}>
              DRE #02333658 · Keller Williams East Bay
            </div>
          </div>
        </div>

        <div
          className="mt-12 p-6"
          style={{ backgroundColor: T.creamSoft, borderLeft: `4px solid ${T.copper}` }}
        >
          <div className="text-[10px] uppercase tracking-[0.28em] font-semibold mb-2" style={{ color: T.copper }}>
            Headline read
          </div>
          <div className="text-[18px] leading-snug" style={{ fontFamily: T.serif, color: T.midnight }}>
            Three paths fit. <strong>BRRRR leads at 88.</strong> Light Flip (84) and Value-Add Flip (79)
            are close behind. The deal hinges on rehab discipline and rate drift before refi.
          </div>
        </div>

        <div className="mt-10 text-[11px] italic" style={{ color: T.muted, fontFamily: T.serif }}>
          "Every property gets a path. Not every property gets an offer."
        </div>
      </div>
    </PageShell>
  );
}

function PageStrategies() {
  return (
    <PageShell pageNum={2}>
      <div style={{ height: 6, backgroundColor: T.copper }} />
      <div style={{ padding: "40px 48px 0" }}>
        <div className="text-[10px] uppercase tracking-[0.32em] font-semibold" style={{ color: T.copper }}>
          Top Strategies · 3 of 14
        </div>
        <h2 className="mt-2 text-[26px] font-semibold" style={{ fontFamily: T.serif, letterSpacing: "-0.015em" }}>
          Paths Pegasus would actually pursue
        </h2>

        <div className="mt-6 space-y-4">
          {top.map((s) => (
            <div key={s.name} style={{ border: `1px solid ${T.rule}`, borderLeft: `4px solid ${T.copper}`, padding: "14px 18px" }}>
              <div className="flex items-baseline justify-between">
                <div className="text-[17px] font-semibold" style={{ fontFamily: T.serif, color: T.midnight }}>
                  {s.name}
                </div>
                <div className="text-[22px] tabular-nums font-semibold" style={{ fontFamily: T.serif, color: T.copper }}>
                  {s.score}
                </div>
              </div>
              <div className="mt-1 text-[11px]" style={{ color: T.muted }}>
                {s.why}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-[10px]">
                <Sc tag="Base" v={s.base} hi />
                <Sc tag="Stressed" v={s.stressed} />
                <Sc tag="Worst" v={s.worst} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="text-[10px] uppercase tracking-[0.22em] font-semibold mb-2" style={{ color: T.muted }}>
            Other paths scored
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10.5px]">
            {sorted.slice(3).map((s) => (
              <div key={s.name} className="flex items-center justify-between border-b py-1" style={{ borderColor: T.rule, color: T.muted }}>
                <span>{s.name}</span>
                <span className="tabular-nums font-semibold" style={{ color: s.score < 20 ? T.muted : T.midnight }}>
                  {s.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Sc({ tag, v, hi = false }: { tag: string; v: string; hi?: boolean }) {
  return (
    <div style={{ backgroundColor: hi ? "rgba(200,122,58,0.08)" : "rgba(26,35,50,0.03)", borderLeft: `2px solid ${hi ? T.copper : T.rule}`, padding: "6px 8px" }}>
      <div className="text-[8px] uppercase tracking-[0.22em] font-semibold mb-0.5" style={{ color: hi ? T.copper : T.muted }}>
        {tag}
      </div>
      <div style={{ fontFamily: T.serif, color: T.midnight }}>{v}</div>
    </div>
  );
}

function PageKillsAndParticipation() {
  return (
    <PageShell pageNum={3}>
      <div style={{ height: 6, backgroundColor: T.copper }} />
      <div style={{ padding: "40px 48px 0" }}>
        <div className="text-[10px] uppercase tracking-[0.32em] font-semibold" style={{ color: T.copper }}>
          Sensitivity
        </div>
        <h2 className="text-[26px] font-semibold mt-2" style={{ fontFamily: T.serif, letterSpacing: "-0.015em" }}>
          What kills this deal?
        </h2>
        <div style={{ backgroundColor: T.creamSoft, borderLeft: `4px solid ${T.copper}`, padding: "16px 18px", marginTop: 12 }}>
          {[
            ["01", "If renovation costs exceed $78k", "BRRRR drops below break-even on refi. Top three collapse to one."],
            ["02", "If rates drift +75 bps before refi", "DSCR falls under 1.10. BRRRR becomes a 'left $90k+ in' deal."],
            ["03", "If ARV comes in under $590k", "Tightest number — three of four comps within 0.4 mi."],
          ].map(([n, h, b]) => (
            <div key={n} className="py-2.5 border-b last:border-b-0" style={{ borderColor: T.rule }}>
              <div className="flex items-baseline gap-3">
                <span className="text-[16px] font-semibold tabular-nums" style={{ fontFamily: T.serif, color: T.copper }}>{n}</span>
                <span className="text-[12px] font-semibold" style={{ color: T.midnight }}>{h}</span>
              </div>
              <div className="text-[10.5px] mt-1 ml-7" style={{ color: T.muted }}>{b}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-[10px] uppercase tracking-[0.32em] font-semibold" style={{ color: T.copper }}>
          How Pegasus could participate
        </div>
        <h2 className="text-[22px] font-semibold mt-2" style={{ fontFamily: T.serif, letterSpacing: "-0.015em" }}>
          On the record, before you decide.
        </h2>
        <div className="text-[11px] mt-1" style={{ color: T.muted }}>
          The strategy recommendation above is independent of how Pegasus could earn on this property.
        </div>

        <div className="mt-3 space-y-2">
          {[
            { tag: "Lane 1 · Acquisition", t: "Pegasus buys at a Pegasus number.", r: "Target spread: $35k–$70k net at exit. Paid only if we close and execute." },
            { tag: "Lane 4 · GC / Build", t: "Pegasus runs the rehab as GC.", r: "GC fee: 12–18% of hard costs. You may use any contractor." },
            { tag: "Lane 5 · Agent", t: "Apollo lists or buy-side via KW East Bay.", r: "Standard commission: 2.5–3.0% paid by the seller of record at close." },
          ].map((l) => (
            <div key={l.tag} style={{ border: `1px solid ${T.rule}`, padding: "10px 14px" }}>
              <div className="text-[9px] uppercase tracking-[0.22em] font-semibold" style={{ color: T.copper }}>
                {l.tag}
              </div>
              <div className="text-[12px] font-semibold mt-0.5" style={{ fontFamily: T.serif, color: T.midnight }}>
                {l.t}
              </div>
              <div className="text-[10.5px] mt-1" style={{ color: T.muted }}>{l.r}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function PageDisclosures() {
  return (
    <PageShell pageNum={4}>
      <div style={{ height: 6, backgroundColor: T.copper }} />
      <div style={{ padding: "40px 48px 0" }}>
        <div className="text-[10px] uppercase tracking-[0.32em] font-semibold" style={{ color: T.copper }}>
          Disclosures &amp; Limits of this Snapshot
        </div>
        <h2 className="mt-2 text-[26px] font-semibold" style={{ fontFamily: T.serif, letterSpacing: "-0.015em" }}>
          What this is, and what it is not.
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-6 text-[11px] leading-relaxed">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] font-semibold mb-2" style={{ color: T.midnight }}>
              This Snapshot is
            </div>
            <ul className="space-y-1.5" style={{ color: T.muted }}>
              <li>· A preliminary strategy read on a single property.</li>
              <li>· Powered by the Pegasus v1 engine, built on public data and your inputs.</li>
              <li>· Reviewed by Apollo before any human follow-up.</li>
              <li>· Honest — every property gets a path, not every property gets an offer.</li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] font-semibold mb-2" style={{ color: T.midnight }}>
              This Snapshot is not
            </div>
            <ul className="space-y-1.5" style={{ color: T.muted }}>
              <li>· An offer to buy.</li>
              <li>· An appraisal, a budget, or a guarantee of returns.</li>
              <li>· A solicitation of securities or an investment product.</li>
              <li>· Legal, tax, permit, or engineering advice.</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-5" style={{ backgroundColor: T.creamSoft, borderLeft: `4px solid ${T.copper}` }}>
          <div className="text-[10px] uppercase tracking-[0.22em] font-semibold mb-2" style={{ color: T.copper }}>
            Standard Disclosure
          </div>
          <div className="text-[10.5px] leading-relaxed" style={{ color: T.midnight }}>
            Paolo "Apollo" Duran — Founder &amp; Principal, Pegasus DreamScapes Corp. California real
            estate license DRE #02333658, Keller Williams East Bay. Each office is independently
            owned and operated. Equal Housing Opportunity. Nothing in this document is an offer of
            guaranteed returns or principal-protected investment products. Strategy outputs are
            illustrative until founder-reviewed; numbers shown are based on public data, comp ranges,
            and the inputs you submitted.
          </div>
        </div>

        <div className="mt-10 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] font-semibold mb-1" style={{ color: T.muted }}>
              Reviewed by
            </div>
            <div className="text-[15px]" style={{ fontFamily: T.serif, color: T.midnight }}>
              Paolo "Apollo" Duran
            </div>
            <div className="text-[10px]" style={{ color: T.muted }}>
              apollo@pegasusdreamscapes.com · 925-744-8525
            </div>
          </div>
          <div className="text-right text-[10px]" style={{ color: T.muted }}>
            Empire Doctrine v1.0.1<br />
            Pleasant Hill, CA · April 18, 2026
          </div>
        </div>
      </div>
    </PageShell>
  );
}
