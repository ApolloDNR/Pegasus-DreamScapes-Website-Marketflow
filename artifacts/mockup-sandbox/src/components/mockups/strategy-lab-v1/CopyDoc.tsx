import { T, FONT_LINK } from "./_tokens";

export default function CopyDoc() {
  return (
    <div
      style={{
        backgroundColor: T.cream,
        color: T.midnight,
        fontFamily: T.sans,
        minHeight: "100vh",
        padding: "48px 56px",
      }}
    >
      {FONT_LINK}
      <div className="max-w-3xl">
        <div className="text-[10px] uppercase tracking-[0.32em] font-semibold" style={{ color: T.copper }}>
          Copy reference · Strategy Lab v1 mockup
        </div>
        <h1
          className="mt-2 text-[36px] leading-tight font-semibold"
          style={{ fontFamily: T.serif, letterSpacing: "-0.02em" }}
        >
          Locked labels &amp; verbatim lines
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed" style={{ color: T.muted }}>
          Everything below appears in one of the four mockup frames. Review wording here without
          zooming. If a line below is wrong, change it before approving the mockup — the build task
          will treat these as locked strings.
        </p>

        <Block n="01" title="Hero (Entry frame)">
          <Line label="Kicker">Strategy Lab · v1</Line>
          <Line label="H1">One address in. Every angle out.</Line>
          <Line label="Subhead">
            Submit a property address and the situation around it. Pegasus runs it through fourteen
            strategic paths and shows you which ones actually fit — with the math, the risks, and the
            two or three lines that would kill the deal.
          </Line>
          <Line label="Primary CTA">Run Analysis →</Line>
          <Line label="CTA caption">~14 seconds. No account required.</Line>
        </Block>

        <Block n="02" title="Privacy disclosure — Brief §6.7 (Entry frame, right rail)">
          <Line label="Verbatim">
            This analysis is private. Pegasus does not list your address publicly, does not sell your
            information, and does not contact the homeowner of record without your written permission.
            The address you enter is used to pull public data and run the math — nothing more. If you
            ask for a human review, only Apollo and the Pegasus team see what you submitted.
          </Line>
        </Block>

        <Block n="03" title="Loading frame">
          <Line label="Headline">Pegasus is running this through fourteen strategic paths…</Line>
          <Line label="Subhead">
            Pulling public records, scoring each path on fit, stressing the numbers, and surfacing the
            two or three risks that could flip the verdict.
          </Line>
          <Line label="Progress band">
            Pulling parcel + permit data · Scoring strategies · 9 of 14 · Risk pass
          </Line>
          <Line label="Footer line">Most analyses finish in 12–18 seconds. Hang tight.</Line>
        </Block>

        <Block n="04" title="Result — subject summary">
          <Line label="Kicker">Strategy Snapshot · Run #PD-26-0418</Line>
          <Line label="Summary read">
            Three paths fit. BRRRR leads at 88, with Light Flip and Value-Add Flip both above 75. Six
            paths are viable. Five are weak. The deal hinges on rehab discipline and rate drift.
          </Line>
        </Block>

        <Block n="05" title="Result — strategy cards (illustrative example data)">
          <Line label="Best Fit pill">◆ Best Fit</Line>
          <Line label="Scenario triplet">Base · Stressed · Worst (always visible by default)</Line>
          <Line label="Low-fit toggle">▾ Show 5 low-fit paths (score &lt; 20)</Line>
          <Line label="Low-fit caption">
            Collapsed by default. Pegasus reviewed them and ruled them out — the why is visible when
            you expand.
          </Line>
        </Block>

        <Block n="06" title="What kills this deal? — brand-differentiator panel">
          <Line label="Kicker">Sensitivity · Brand-differentiator</Line>
          <Line label="H2">What kills this deal?</Line>
          <Line label="Subhead">
            Two or three numbers move the verdict from Yes to No. Watch these.
          </Line>
          <Line label="Driver 01">
            If renovation costs exceed $78k — BRRRR drops below break-even on refi. Top three collapse
            to one. Most likely cause: hidden electrical or sewer line work in the 1985 build.
          </Line>
          <Line label="Driver 02">
            If rates drift +75 bps before refi — DSCR falls under 1.10. BRRRR becomes a "left $90k+ in"
            deal. Light Flip and Value-Add Flip stay intact — but cashflow plays weaken.
          </Line>
          <Line label="Driver 03">
            If ARV comes in under $590k — Three of the four scored comps are within 0.4 mi, so this is
            the tightest number. A $590k ARV trims net flip margin by ~$22k.
          </Line>
        </Block>

        <Block n="07" title="How Pegasus could participate — Brief §6.4">
          <Line label="Kicker">Disclosure · How Pegasus could participate</Line>
          <Line label="H2">On the record, before you decide.</Line>
          <Line label="Body">
            The strategy recommendation above is independent of how Pegasus could earn on this
            property. We disclose every lane up front so you can weigh the advice on its merits.
          </Line>
          <Line label="Lane 1 · Acquisition">
            Target spread: $35k–$70k net at exit · paid only if we close and execute the path.
          </Line>
          <Line label="Lane 4 · GC / Build">
            GC fee: 12–18% of hard costs · only paid if you hire us; you may use any contractor.
          </Line>
          <Line label="Lane 5 · Agent">
            Standard commission: 2.5–3.0% · paid by the seller of record at close.
          </Line>
          <Line label="Footer">
            The recommendation above does not change based on which lane(s) Pegasus is in.
            Conversations, not pitches. Written agreement on every deal.
          </Line>
        </Block>

        <Block n="08" title="Primary CTA + secondary affordances">
          <Line label="Primary CTA headline (verbatim)">
            Want a human to review this? Submit for a free Strategy Snapshot. Most Strategy Snapshots
            are reviewed within 5 business days.
          </Line>
          <Line label="Primary CTA button">Request a Strategy Review →</Line>
          <Line label="Secondary affordances (verbatim)">
            Save this analysis · Share via link · Export as PDF
          </Line>
          <Line label="Account-wall note">
            All three open the account wall — Pegasus needs a verified email to store, share, or
            export your analysis.
          </Line>
        </Block>

        <Block n="09" title="PDF export — locked sections">
          <Line label="Cover headline">Strategy Snapshot · Run #PD-26-0418</Line>
          <Line label="Cover quote">
            "Every property gets a path. Not every property gets an offer."
          </Line>
          <Line label="Standard disclosure (footer of every page)">
            Pegasus DreamScapes · The Deal Architect · Illustrative — not an offer · Not investment
            advice · Page X / 4
          </Line>
          <Line label="Final disclosure block">
            Paolo "Apollo" Duran — Founder &amp; Principal, Pegasus DreamScapes Corp. California real
            estate license DRE #02333658, Keller Williams East Bay. Each office is independently
            owned and operated. Equal Housing Opportunity. Nothing in this document is an offer of
            guaranteed returns or principal-protected investment products. Strategy outputs are
            illustrative until founder-reviewed.
          </Line>
        </Block>

        <div
          className="mt-10 p-6"
          style={{
            backgroundColor: T.midnight,
            color: T.cream,
            borderRadius: 2,
          }}
        >
          <div className="text-[10px] uppercase tracking-[0.32em] font-semibold mb-2" style={{ color: T.copper }}>
            Mockup status
          </div>
          <div className="text-[15px] leading-snug" style={{ fontFamily: T.serif }}>
            This is a mockup only. No backend, schema, or refactor work has started. The
            implementation plan will be drafted only after you approve this direction.
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div
      className="mt-8 p-6"
      style={{ backgroundColor: T.creamSoft, border: `1px solid ${T.rule}`, borderRadius: 2 }}
    >
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[18px] font-semibold tabular-nums" style={{ fontFamily: T.serif, color: T.copper }}>
          {n}
        </span>
        <h2 className="text-[18px] font-semibold" style={{ fontFamily: T.serif, letterSpacing: "-0.01em" }}>
          {title}
        </h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 text-[12.5px] leading-relaxed border-t pt-3" style={{ borderColor: T.rule }}>
      <div className="text-[10px] uppercase tracking-[0.22em] font-semibold pt-0.5" style={{ color: T.muted }}>
        {label}
      </div>
      <div style={{ fontFamily: T.serif, color: T.midnight }}>{children}</div>
    </div>
  );
}
