import { T } from "./_tokens";

export function BrandBar({ dark = false }: { dark?: boolean }) {
  const fg = dark ? T.cream : T.midnight;
  const muted = dark ? T.mutedDark : T.muted;
  const rule = dark ? T.ruleDark : T.rule;
  return (
    <div
      className="flex items-center justify-between px-10 h-14 border-b"
      style={{
        borderColor: rule,
        backgroundColor: dark ? T.midnight : "transparent",
        fontFamily: T.sans,
      }}
    >
      <div className="flex items-center gap-4">
        <div className="w-2 h-2 rotate-45" style={{ backgroundColor: T.copper }} />
        <div
          className="text-[13px] font-semibold tracking-[0.02em]"
          style={{ fontFamily: T.serif, color: fg }}
        >
          Pegasus DreamScapes
        </div>
        <div
          className="text-[10px] uppercase tracking-[0.28em] pl-4 ml-1 border-l"
          style={{ borderColor: rule, color: muted, fontWeight: 600 }}
        >
          The Deal Architect
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: muted, fontWeight: 600 }}>
          Strategy Lab
        </div>
        <a
          className="text-[11px] uppercase tracking-[0.18em] font-semibold px-5 h-9 inline-flex items-center"
          style={{ backgroundColor: T.copper, color: T.cream }}
        >
          Submit a Property
        </a>
      </div>
    </div>
  );
}

export function FooterDisclosure({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  const fg = dark ? T.cream : T.midnight;
  const muted = dark ? T.mutedDark : T.muted;
  const rule = dark ? T.ruleDark : T.rule;
  return (
    <div
      className="px-10 py-7 border-t"
      style={{
        borderColor: rule,
        backgroundColor: dark ? T.midnight : "transparent",
        fontFamily: T.sans,
        color: muted,
      }}
    >
      <div className="text-[10px] uppercase tracking-[0.28em] font-semibold mb-3" style={{ color: fg }}>
        Disclosures
      </div>
      <div className="text-[11px] leading-relaxed max-w-4xl">
        Paolo "Apollo" Duran — Founder &amp; Principal. DRE #02333658, Keller Williams East Bay. Each
        office is independently owned and operated. Pegasus DreamScapes Corp is a real estate operating
        company. Nothing on this page is an offer, a solicitation of securities, an appraisal, a budget,
        or a guarantee of returns or principal protection. Strategy outputs are illustrative until
        founder-reviewed.
      </div>
      {!compact && (
        <div className="mt-4 text-[10px] tracking-[0.04em]" style={{ color: muted }}>
          © Pegasus DreamScapes Corp · Empire Doctrine v1.0.1 · Pleasant Hill, CA · apollo@pegasusdreamscapes.com · 925-744-8525
        </div>
      )}
    </div>
  );
}

export function Kicker({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      className="text-[10px] uppercase font-semibold"
      style={{
        fontFamily: T.sans,
        letterSpacing: "0.32em",
        color: T.copper,
        opacity: dark ? 0.95 : 1,
      }}
    >
      {children}
    </div>
  );
}
