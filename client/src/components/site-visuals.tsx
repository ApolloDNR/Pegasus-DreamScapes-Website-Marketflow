import { Link } from "wouter";
import { ArrowRight, CheckCircle2, ShieldCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type VisualKind =
  | "connect"
  | "submit"
  | "capital"
  | "apollo"
  | "network"
  | "development"
  | "standard"
  | "ecosystem"
  | "architecture"
  | "peggy";

type PlateLabel = {
  label: string;
  value: string;
};

type SplitHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  body?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  visual: VisualKind;
  visualTitle: string;
  visualCaption: string;
  labels?: PlateLabel[];
};

type SectionIntroProps = {
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  light?: boolean;
  centered?: boolean;
};

export function SiteEyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="h-px w-10 flex-shrink-0 bg-primary" aria-hidden="true" />
      <p
        className={`min-w-0 text-xs font-semibold uppercase leading-tight text-primary ${
          light ? "text-primary" : ""
        }`}
      >
        {children}
      </p>
    </div>
  );
}

export function SectionIntro({ eyebrow, title, body, light = false, centered = false }: SectionIntroProps) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <SiteEyebrow light={light}>{eyebrow}</SiteEyebrow>
      <h2
        className={`mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl ${
          light ? "text-white" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {body ? (
        <p
          className={`mt-5 text-base leading-relaxed sm:text-lg ${
            light ? "text-cream/75" : "text-muted-foreground"
          }`}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

export function SplitHero({
  eyebrow,
  title,
  subtitle,
  body,
  primaryCta,
  secondaryCta,
  visual,
  visualTitle,
  visualCaption,
  labels,
}: SplitHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--navy))] text-cream">
      <div className="absolute inset-x-0 bottom-0 h-px bg-primary/40" aria-hidden="true" />
      <div className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-12 px-6 pb-16 pt-32 lg:grid-cols-12 lg:px-12 lg:pt-40">
        <div className="min-w-0 max-w-[22rem] sm:max-w-none lg:col-span-7">
          <SiteEyebrow light>{eyebrow}</SiteEyebrow>
          <h1 className="mt-6 max-w-[22rem] font-serif text-4xl font-semibold leading-[1.02] text-white sm:max-w-5xl sm:text-6xl sm:leading-[0.98] lg:text-7xl">
            {title}
          </h1>
          <p className="mt-7 max-w-[22rem] font-serif text-lg leading-relaxed text-white/90 sm:max-w-2xl sm:text-2xl">
            {subtitle}
          </p>
          {body ? <p className="mt-5 max-w-[22rem] text-base leading-relaxed text-cream/75 sm:max-w-2xl">{body}</p> : null}
          {(primaryCta || secondaryCta) ? (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {primaryCta ? (
                <Link href={primaryCta.href}>
                  <Button className="h-14 w-full max-w-[22rem] rounded-sm bg-primary px-7 text-xs font-semibold uppercase text-white hover:bg-primary/90 sm:w-auto sm:max-w-none">
                    {primaryCta.label}
                    <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link href={secondaryCta.href}>
                  <Button
                    variant="outline"
                    className="h-14 w-full max-w-[22rem] rounded-sm border-white/40 bg-white/5 px-7 text-xs font-semibold uppercase text-white hover:bg-white/10 sm:w-auto sm:max-w-none"
                  >
                    {secondaryCta.label}
                  </Button>
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="min-w-0 lg:col-span-5">
          <VisualPlate kind={visual} title={visualTitle} caption={visualCaption} labels={labels} />
        </div>
      </div>
      <div className="brand-stripe" aria-hidden="true" />
    </section>
  );
}

export function VisualPlate({
  kind,
  title,
  caption,
  labels = [],
}: {
  kind: VisualKind;
  title: string;
  caption: string;
  labels?: PlateLabel[];
}) {
  return (
    <figure className="relative overflow-hidden rounded-md border border-white/20 bg-[rgba(8,15,25,0.66)] p-5 shadow-[0_28px_80px_-52px_rgba(0,0,0,0.85)]">
      <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">Operating plate</p>
          <figcaption className="mt-2 font-serif text-2xl font-semibold leading-tight text-white">{title}</figcaption>
        </div>
        <span className="rounded-sm border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-primary">
          Pegasus
        </span>
      </div>
      <div className="mt-5 overflow-hidden border border-white/10 bg-white/[0.035]">
        <PlateDrawing kind={kind} />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-cream/70">{caption}</p>
      {labels.length ? (
        <dl className="mt-5 grid gap-2 sm:grid-cols-3">
          {labels.map((item) => (
            <div key={item.label} className="border border-white/10 bg-white/[0.035] p-3">
              <dt className="text-[10px] font-semibold uppercase text-primary">{item.label}</dt>
              <dd className="mt-1 font-serif text-base leading-tight text-white">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </figure>
  );
}

export function ProcessRail({
  items,
  dark = false,
}: {
  items: { label: string; title: string; body: string; icon?: LucideIcon }[];
  dark?: boolean;
}) {
  return (
    <div className={`divide-y ${dark ? "divide-white/10 border-white/20 bg-white/[0.035]" : "divide-border border-border bg-card"} border`}>
      {items.map((item, index) => {
        const Icon = item.icon ?? CheckCircle2;
        return (
          <article key={item.title} className="grid gap-5 p-6 sm:grid-cols-[5rem_1fr] lg:grid-cols-[5rem_1fr_1.5fr] lg:items-start">
            <div>
              <p className="font-serif text-3xl text-primary/70">{String(index + 1).padStart(2, "0")}</p>
              <Icon className="mt-4 h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-primary">{item.label}</p>
              <h3 className={`mt-2 font-serif text-2xl font-semibold ${dark ? "text-white" : "text-foreground"}`}>{item.title}</h3>
            </div>
            <p className={`text-sm leading-relaxed ${dark ? "text-cream/75" : "text-muted-foreground"}`}>{item.body}</p>
          </article>
        );
      })}
    </div>
  );
}

export function ComplianceNote({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <aside
      className={`rounded-md border p-5 ${
        dark
          ? "border-primary/30 bg-primary/10 text-cream"
          : "border-primary/25 bg-primary/5 text-muted-foreground"
      }`}
    >
      <div className="flex items-start gap-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
        <p className="text-sm leading-relaxed">{children}</p>
      </div>
    </aside>
  );
}

export function FinalBand({
  eyebrow,
  title,
  body,
  cta,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
}) {
  return (
    <section className="bg-[hsl(var(--navy))] py-20 text-cream lg:py-24">
      <div className="mx-auto max-w-5xl px-6 text-center lg:px-12">
        <div className="mx-auto flex justify-center">
          <SiteEyebrow light>{eyebrow}</SiteEyebrow>
        </div>
        <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">{title}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-cream/75">{body}</p>
        <Link href={cta.href}>
          <Button className="mt-9 h-12 rounded-sm bg-primary px-8 text-xs font-semibold uppercase text-white hover:bg-primary/90">
            {cta.label}
            <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function PlateDrawing({ kind }: { kind: VisualKind }) {
  if (kind === "connect") return <ConnectDrawing />;
  if (kind === "submit") return <SubmitDrawing />;
  if (kind === "capital") return <CapitalDrawing />;
  if (kind === "apollo") return <ApolloDrawing />;
  if (kind === "network") return <NetworkDrawing />;
  if (kind === "development") return <DevelopmentDrawing />;
  if (kind === "standard") return <StandardDrawing />;
  if (kind === "ecosystem") return <EcosystemDrawing />;
  if (kind === "peggy") return <PeggyDrawing />;
  return <ArchitectureDrawing />;
}

function ConnectDrawing() {
  return (
    <svg viewBox="0 0 520 360" className="h-full min-h-[300px] w-full" fill="none" role="img" aria-label="QR card route map">
      <BasePlate />
      <rect x="46" y="46" width="162" height="232" stroke="rgba(246,239,228,.36)" fill="rgba(246,239,228,.04)" />
      <path d="M70 88h88M70 112h62M70 230h95" stroke="rgba(246,239,228,.54)" />
      <path d="M78 148h36v36H78zM124 148h36v36h-36zM78 194h36v36H78zM124 194h36v36h-36z" stroke="rgba(200,122,58,.72)" />
      <path d="M208 162 C270 162 288 90 356 90" stroke="rgba(200,122,58,.72)" strokeWidth="2" />
      <path d="M208 176 C278 176 292 178 358 178" stroke="rgba(246,239,228,.42)" />
      <path d="M208 190 C270 190 292 268 356 268" stroke="rgba(200,122,58,.42)" />
      {[
        ["Property", 356, 64],
        ["Build", 368, 132],
        ["Capital", 368, 200],
        ["Apollo", 348, 268],
      ].map(([label, x, y]) => (
        <g key={label}>
          <rect x={Number(x)} y={Number(y)} width="112" height="42" stroke="rgba(246,239,228,.25)" fill="rgba(8,15,25,.68)" />
          <text x={Number(x) + 14} y={Number(y) + 26} fill="rgba(246,239,228,.82)" fontSize="13">{label}</text>
        </g>
      ))}
      <circle cx="208" cy="176" r="5" fill="rgb(200,122,58)" />
    </svg>
  );
}

function SubmitDrawing() {
  return (
    <svg viewBox="0 0 520 360" className="h-full min-h-[300px] w-full" fill="none" role="img" aria-label="Property intake packet">
      <BasePlate />
      <rect x="54" y="42" width="246" height="276" stroke="rgba(246,239,228,.32)" fill="rgba(246,239,228,.045)" />
      <rect x="78" y="70" width="92" height="12" fill="rgba(200,122,58,.72)" />
      <path d="M78 112h174M78 146h174M78 180h126M78 214h150M78 248h104" stroke="rgba(246,239,228,.42)" />
      <rect x="332" y="76" width="118" height="46" stroke="rgba(200,122,58,.72)" fill="rgba(200,122,58,.10)" />
      <rect x="332" y="156" width="118" height="46" stroke="rgba(246,239,228,.25)" fill="rgba(8,15,25,.72)" />
      <rect x="332" y="236" width="118" height="46" stroke="rgba(246,239,228,.25)" fill="rgba(8,15,25,.72)" />
      <path d="M300 99h32M300 179h32M300 259h32" stroke="rgba(200,122,58,.58)" />
      <text x="350" y="104" fill="rgba(246,239,228,.86)" fontSize="13">Intake</text>
      <text x="350" y="184" fill="rgba(246,239,228,.72)" fontSize="13">Review</text>
      <text x="350" y="264" fill="rgba(246,239,228,.72)" fontSize="13">Route</text>
    </svg>
  );
}

function CapitalDrawing() {
  return (
    <svg viewBox="0 0 520 360" className="h-full min-h-[300px] w-full" fill="none" role="img" aria-label="Private capital ledger">
      <BasePlate />
      <rect x="64" y="58" width="392" height="244" stroke="rgba(246,239,228,.28)" fill="rgba(246,239,228,.04)" />
      <path d="M64 118h392M64 178h392M64 238h392M188 58v244M326 58v244" stroke="rgba(246,239,228,.16)" />
      <path d="M92 91h68M92 151h48M92 211h76M92 271h52" stroke="rgba(200,122,58,.68)" />
      <path d="M214 91h72M214 151h52M214 211h66M214 271h44M352 91h62M352 151h40M352 211h56M352 271h50" stroke="rgba(246,239,228,.45)" />
      <rect x="218" y="140" width="84" height="78" stroke="rgba(200,122,58,.72)" fill="rgba(8,15,25,.74)" />
      <path d="M238 140v-18c0-14 10-24 22-24s22 10 22 24v18" stroke="rgba(200,122,58,.72)" />
      <circle cx="260" cy="178" r="7" fill="rgba(200,122,58,.72)" />
      <path d="M260 185v14" stroke="rgba(200,122,58,.72)" />
    </svg>
  );
}

function ApolloDrawing() {
  return (
    <svg viewBox="0 0 520 360" className="h-full min-h-[300px] w-full" fill="none" role="img" aria-label="Pegasus and Keller Williams lane separation">
      <BasePlate />
      <rect x="58" y="68" width="178" height="224" stroke="rgba(200,122,58,.72)" fill="rgba(200,122,58,.08)" />
      <rect x="284" y="68" width="178" height="224" stroke="rgba(246,239,228,.30)" fill="rgba(246,239,228,.04)" />
      <path d="M260 54v252" stroke="rgba(246,239,228,.20)" strokeDasharray="6 8" />
      <text x="84" y="112" fill="rgba(246,239,228,.90)" fontSize="17">Pegasus</text>
      <text x="308" y="112" fill="rgba(246,239,228,.90)" fontSize="17">KW Lane</text>
      <path d="M86 150h112M86 180h82M86 210h104M312 150h102M312 180h74M312 210h98" stroke="rgba(246,239,228,.44)" />
      <path d="M147 260 C186 244 208 230 236 206" stroke="rgba(200,122,58,.62)" />
      <path d="M373 260 C338 244 314 230 284 206" stroke="rgba(246,239,228,.38)" />
    </svg>
  );
}

function NetworkDrawing() {
  return (
    <svg viewBox="0 0 520 360" className="h-full min-h-[300px] w-full" fill="none" role="img" aria-label="Role gated MarketFlow network">
      <BasePlate />
      <circle cx="260" cy="180" r="54" stroke="rgba(200,122,58,.72)" fill="rgba(200,122,58,.08)" />
      <text x="226" y="185" fill="rgba(246,239,228,.92)" fontSize="14">HQ Review</text>
      {[
        ["Owners", 92, 82],
        ["Operators", 360, 82],
        ["Buyers", 92, 246],
        ["Capital", 360, 246],
      ].map(([label, x, y]) => (
        <g key={label}>
          <rect x={Number(x)} y={Number(y)} width="106" height="50" stroke="rgba(246,239,228,.28)" fill="rgba(8,15,25,.72)" />
          <text x={Number(x) + 16} y={Number(y) + 31} fill="rgba(246,239,228,.78)" fontSize="13">{label}</text>
        </g>
      ))}
      <path d="M198 107 L214 144M360 107 L306 144M198 271 L214 216M360 271 L306 216" stroke="rgba(200,122,58,.56)" />
    </svg>
  );
}

function DevelopmentDrawing() {
  return (
    <svg viewBox="0 0 520 360" className="h-full min-h-[300px] w-full" fill="none" role="img" aria-label="Development phase rail">
      <BasePlate />
      <path d="M76 278h368" stroke="rgba(246,239,228,.28)" />
      {[76, 196, 316, 436].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="278" r="6" fill={i === 0 ? "rgb(200,122,58)" : "rgba(246,239,228,.46)"} />
          <rect x={x - 42} y={198 - i * 34} width="84" height={80 + i * 34} stroke="rgba(246,239,228,.24)" fill={i === 0 ? "rgba(200,122,58,.10)" : "rgba(246,239,228,.035)"} />
          <path d={`M${x - 24} ${238 - i * 34}h48M${x - 24} ${258 - i * 34}h32`} stroke="rgba(246,239,228,.42)" />
          <text x={x - 18} y="314" fill="rgba(246,239,228,.68)" fontSize="12">{`0${i + 1}`}</text>
        </g>
      ))}
    </svg>
  );
}

function StandardDrawing() {
  return (
    <svg viewBox="0 0 520 360" className="h-full min-h-[300px] w-full" fill="none" role="img" aria-label="Dreamscaper Standard commitments">
      <BasePlate />
      <path d="M260 60l142 56v76c0 76-56 126-142 152-86-26-142-76-142-152v-76l142-56z" stroke="rgba(200,122,58,.72)" fill="rgba(200,122,58,.07)" />
      {["Discipline", "Transparency", "Innovation", "Integrity", "Excellence", "Efficiency"].map((label, i) => {
        const y = 128 + i * 28;
        return (
          <g key={label}>
            <path d={`M204 ${y}h112`} stroke="rgba(246,239,228,.22)" />
            <circle cx="184" cy={y - 4} r="4" fill="rgba(200,122,58,.72)" />
            <text x="204" y={y} fill="rgba(246,239,228,.76)" fontSize="12">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function EcosystemDrawing() {
  return (
    <svg viewBox="0 0 520 360" className="h-full min-h-[300px] w-full" fill="none" role="img" aria-label="Pegasus ecosystem operating map">
      <BasePlate />
      <rect x="208" y="136" width="104" height="88" stroke="rgba(200,122,58,.72)" fill="rgba(200,122,58,.08)" />
      <text x="238" y="184" fill="rgba(246,239,228,.88)" fontSize="14">HQ</text>
      {[
        ["Website", 60, 70],
        ["Lab", 356, 70],
        ["Peggy", 60, 240],
        ["Flow", 356, 240],
      ].map(([label, x, y]) => (
        <g key={label}>
          <rect x={Number(x)} y={Number(y)} width="104" height="58" stroke="rgba(246,239,228,.28)" fill="rgba(8,15,25,.72)" />
          <text x={Number(x) + 24} y={Number(y) + 35} fill="rgba(246,239,228,.74)" fontSize="13">{label}</text>
        </g>
      ))}
      <path d="M164 99 L208 155M356 99 L312 155M164 269 L208 205M356 269 L312 205" stroke="rgba(200,122,58,.56)" />
    </svg>
  );
}

function PeggyDrawing() {
  return (
    <svg viewBox="0 0 520 360" className="h-full min-h-[300px] w-full" fill="none" role="img" aria-label="Peggy guided intake conversation map">
      <BasePlate />
      <rect x="58" y="62" width="150" height="70" stroke="rgba(246,239,228,.26)" fill="rgba(8,15,25,.72)" />
      <rect x="58" y="154" width="150" height="70" stroke="rgba(246,239,228,.26)" fill="rgba(8,15,25,.72)" />
      <rect x="58" y="246" width="150" height="70" stroke="rgba(246,239,228,.26)" fill="rgba(8,15,25,.72)" />
      <circle cx="302" cy="180" r="62" stroke="rgba(200,122,58,.74)" fill="rgba(200,122,58,.08)" />
      <circle cx="278" cy="166" r="7" fill="rgba(246,239,228,.82)" />
      <circle cx="326" cy="166" r="7" fill="rgba(246,239,228,.82)" />
      <path d="M278 204 C292 218 316 218 330 204" stroke="rgba(246,239,228,.62)" strokeWidth="2" />
      <path d="M208 97 C244 102 260 128 274 146M208 189h32c24 0 34-8 52-22M208 281 C244 258 260 232 282 212" stroke="rgba(200,122,58,.58)" />
      <rect x="368" y="78" width="96" height="50" stroke="rgba(200,122,58,.68)" fill="rgba(200,122,58,.09)" />
      <rect x="368" y="155" width="96" height="50" stroke="rgba(246,239,228,.26)" fill="rgba(8,15,25,.72)" />
      <rect x="368" y="232" width="96" height="50" stroke="rgba(246,239,228,.26)" fill="rgba(8,15,25,.72)" />
      <path d="M342 156 C360 142 372 124 392 104M364 180h4M342 204 C360 218 372 236 392 256" stroke="rgba(200,122,58,.5)" />
      <text x="82" y="102" fill="rgba(246,239,228,.78)" fontSize="13">Chat</text>
      <text x="82" y="194" fill="rgba(246,239,228,.78)" fontSize="13">Phone</text>
      <text x="82" y="286" fill="rgba(246,239,228,.78)" fontSize="13">Form</text>
      <text x="390" y="109" fill="rgba(246,239,228,.86)" fontSize="13">Ask</text>
      <text x="390" y="186" fill="rgba(246,239,228,.72)" fontSize="13">Sort</text>
      <text x="390" y="263" fill="rgba(246,239,228,.72)" fontSize="13">Route</text>
    </svg>
  );
}

function ArchitectureDrawing() {
  return (
    <svg viewBox="0 0 520 360" className="h-full min-h-[300px] w-full" fill="none" role="img" aria-label="Property to path architecture diagram">
      <BasePlate />
      <path d="M74 220l74-58 74 58v70H74v-70z" stroke="rgba(200,122,58,.72)" fill="rgba(200,122,58,.06)" />
      <path d="M102 290v-42h38v42M168 290v-58h30v58" stroke="rgba(246,239,228,.34)" />
      <circle cx="222" cy="220" r="5" fill="rgb(200,122,58)" />
      <path d="M222 220 C284 220 298 86 398 86M222 220 C294 220 308 180 408 180M222 220 C294 220 310 276 408 276" stroke="rgba(200,122,58,.62)" />
      {[
        ["Acquire", 398, 64],
        ["Develop", 408, 158],
        ["Route", 408, 254],
      ].map(([label, x, y]) => (
        <g key={label}>
          <rect x={Number(x)} y={Number(y)} width="86" height="44" stroke="rgba(246,239,228,.26)" fill="rgba(8,15,25,.72)" />
          <text x={Number(x) + 14} y={Number(y) + 27} fill="rgba(246,239,228,.78)" fontSize="13">{label}</text>
        </g>
      ))}
    </svg>
  );
}

function BasePlate() {
  return (
    <>
      <rect width="520" height="360" fill="rgba(8,15,25,.78)" />
      <rect x="28" y="28" width="464" height="304" stroke="rgba(246,239,228,.11)" />
      <rect x="42" y="42" width="436" height="276" stroke="rgba(200,122,58,.16)" />
      <path d="M68 76h92M360 76h92M68 284h92M360 284h92" stroke="rgba(246,239,228,.10)" />
      <path d="M84 84v64M436 84v64M84 212v64M436 212v64" stroke="rgba(246,239,228,.08)" />
      <path d="M102 260 C178 216 244 198 322 210 C376 218 420 198 452 172" stroke="rgba(200,122,58,.10)" />
      <path d="M112 112 C176 88 264 84 332 104 C388 120 428 112 452 94" stroke="rgba(246,239,228,.06)" />
    </>
  );
}
