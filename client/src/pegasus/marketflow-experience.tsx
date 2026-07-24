import React from 'react';
import { useLocation } from 'wouter';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CircleDot,
  FileCheck2,
  Handshake,
  Landmark,
  LockKeyhole,
  Route,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { Nav } from './theme';
import { IMG } from './primitives';

type RoleKey = 'source' | 'buyer' | 'capital' | 'operator';

const ROLES: Array<{
  key: RoleKey;
  label: string;
  title: string;
  brief: string;
  receives: string[];
  brings: string[];
}> = [
  {
    key: 'source',
    label: 'Deal source',
    title: 'Bring a real opportunity once.',
    brief: 'Pegasus records source attribution, reviews the opportunity, and agrees any distribution or compensation terms in writing before an introduction.',
    receives: ['A straight fit read', 'Documented source record', 'A defined next step'],
    brings: ['Address and situation', 'Basis or asking terms', 'Authority to share'],
  },
  {
    key: 'buyer',
    label: 'Buyer',
    title: 'See only what fits your mandate.',
    brief: 'Approved buyers are considered for reviewed opportunities that match their geography, asset type, basis, and execution ability.',
    receives: ['Reviewed record, not a blast', 'Clear source and terms', 'Introductions by fit'],
    brings: ['Current buy box', 'Capacity and timing', 'Proof of ability when requested'],
  },
  {
    key: 'capital',
    label: 'Capital',
    title: 'Review projects, not promises.',
    brief: 'Capital relationships are private, project-specific, and documented separately. MarketFlow is not a pooled fund or public securities offering.',
    receives: ['Project-specific context', 'Defined diligence path', 'Risk kept visible'],
    brings: ['Mandate and check size', 'Risk and duration preferences', 'Accreditation context if relevant'],
  },
  {
    key: 'operator',
    label: 'Operator',
    title: 'Enter where execution needs you.',
    brief: 'Approved contractors, consultants, and specialists are considered when a reviewed project needs their trade, geography, license, or capacity.',
    receives: ['Scoped project context', 'Clear role and terms', 'Relevant introductions'],
    brings: ['Trade or specialty', 'Service geography', 'License, references, and capacity'],
  },
];

const SEQUENCE = [
  { num: '01', label: 'Strategy Lab', copy: 'The property and assumptions are organized before anything is distributed.', icon: Landmark },
  { num: '02', label: 'Pegasus review', copy: 'A person checks fit, source, facts, and which lane—if any—should open.', icon: FileCheck2 },
  { num: '03', label: 'Approved record', copy: 'Only the information appropriate for that relationship is prepared for review.', icon: BadgeCheck },
  { num: '04', label: 'Considered introduction', copy: 'The right parties are introduced deliberately, never sprayed into a public marketplace.', icon: Handshake },
  { num: '05', label: 'Written terms', copy: 'Roles, source attribution, compensation, and next actions are documented before execution.', icon: ShieldCheck },
];

export function PremiumMarketFlow({ go }: { go: Nav }) {
  const [, setLocation] = useLocation();
  const [role, setRole] = React.useState<RoleKey>('source');
  const active = ROLES.find((item) => item.key === role) ?? ROLES[0];

  return (
    <div className="px-mf" data-testid="premium-marketflow">
      <section className="px-mf-hero">
        <img src={IMG('pegasus-casestudy.png')} alt="Pegasus planning table with reviewed property records" />
        <div className="px-mf-hero-scrim" aria-hidden="true" />
        <div className="px-mf-hero-inner">
          <div className="px-mf-pilot"><CircleDot aria-hidden="true" /> Controlled private pilot</div>
          <p className="px-kicker">Pegasus systems · MarketFlow</p>
          <h1>The relationship layer after a property earns a serious review.</h1>
          <p>MarketFlow is the private operating room where reviewed opportunities, credible parties, and written terms can meet. It is deliberately not a public marketplace.</p>
          <div className="px-mf-hero-actions">
            <button type="button" onClick={() => setLocation('/marketflow/access')}>Request reviewed access <ArrowRight aria-hidden="true" /></button>
            <button type="button" onClick={() => setLocation('/marketflow/buyboxes')}>Read public criteria</button>
          </div>
        </div>
        <div className="px-mf-hero-index" aria-label="MarketFlow operating principles">
          <div><span>01</span><strong>Reviewed</strong><small>Before distribution</small></div>
          <div><span>02</span><strong>Permissioned</strong><small>Role-appropriate access</small></div>
          <div><span>03</span><strong>Documented</strong><small>Terms before movement</small></div>
        </div>
      </section>

      <section className="px-mf-role-room" aria-labelledby="marketflow-role-title">
        <header>
          <p className="px-kicker">Choose your relationship</p>
          <h2 id="marketflow-role-title">One network. Different permissions, obligations, and value.</h2>
          <p>MarketFlow does not flatten professionals into generic users. Select the role you actually fill to see how the relationship is designed.</p>
        </header>

        <div className="px-mf-role-tabs" role="tablist" aria-label="MarketFlow relationship roles">
          {ROLES.map((item) => (
            <button key={item.key} type="button" role="tab" aria-selected={role === item.key} aria-controls="marketflow-role-panel" id={`marketflow-tab-${item.key}`} onClick={() => setRole(item.key)}>
              {item.label}
            </button>
          ))}
        </div>

        <div id="marketflow-role-panel" role="tabpanel" aria-labelledby={`marketflow-tab-${active.key}`} className="px-mf-role-panel">
          <div className="px-mf-role-statement">
            <span>Current relationship brief</span>
            <h3>{active.title}</h3>
            <p>{active.brief}</p>
            <button type="button" onClick={() => setLocation(`/marketflow/access?role=${active.key}`)}>Request access in this role <ArrowRight aria-hidden="true" /></button>
          </div>
          <div className="px-mf-role-ledgers">
            <section><p>What the relationship may provide</p><ul>{active.receives.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul></section>
            <section><p>What Pegasus needs from you</p><ul>{active.brings.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul></section>
          </div>
        </div>
      </section>

      <section className="px-mf-sequence" aria-labelledby="marketflow-sequence-title">
        <div className="px-mf-sequence-intro">
          <p className="px-kicker">The relationship sequence</p>
          <h2 id="marketflow-sequence-title">Nothing enters the room simply because it was submitted.</h2>
          <p>The product is built around gates. Each gate protects the property owner, the source, the receiving party, and Pegasus.</p>
        </div>
        <ol>
          {SEQUENCE.map((item) => {
            const Icon = item.icon;
            return <li key={item.num}><span>{item.num}</span><Icon aria-hidden="true" /><h3>{item.label}</h3><p>{item.copy}</p></li>;
          })}
        </ol>
      </section>

      <section className="px-mf-dossier" aria-labelledby="marketflow-dossier-title">
        <div className="px-mf-dossier-image"><img src={IMG('pegasus-process.png')} alt="A private Pegasus project record arranged for professional review" /></div>
        <div className="px-mf-dossier-paper">
          <div className="px-mf-dossier-head"><span>Illustrative opportunity record</span><strong>MF · 0007</strong></div>
          <p className="px-kicker">Fictionalized product preview</p>
          <h2 id="marketflow-dossier-title">A record built for a decision, not a listing card.</h2>
          <p className="px-mf-dossier-lead">An approved dossier gives the receiving party enough context to decide whether to enter diligence—while keeping sensitive facts, identity, and live terms behind appropriate permissions.</p>
          <dl>
            <div><dt>Situation</dt><dd>East Bay value-add residence</dd></div>
            <div><dt>Current gate</dt><dd>Pegasus fit review</dd></div>
            <div><dt>Possible relationship</dt><dd>Buyer or operating partner</dd></div>
            <div><dt>Source status</dt><dd>Recorded; terms required before distribution</dd></div>
          </dl>
          <div className="px-mf-dossier-note"><LockKeyhole aria-hidden="true" /><p>Illustrative and anonymized. No live inventory, offer, solicitation, or promise of access appears on this public page.</p></div>
        </div>
      </section>

      <section className="px-mf-boundaries">
        <header><p className="px-kicker">What MarketFlow is—and is not</p><h2>A serious network begins with visible boundaries.</h2></header>
        <div>
          <section><Route aria-hidden="true" /><h3>A permissioned routing layer</h3><p>Reviewed information moves to appropriate parties after fit and authority are checked.</p></section>
          <section><Users aria-hidden="true" /><h3>A relationship system</h3><p>People are introduced around a specific need, not treated as anonymous marketplace traffic.</p></section>
          <section><LockKeyhole aria-hidden="true" /><h3>Not public inventory</h3><p>No live deals, private terms, or member records are published on this surface.</p></section>
          <section><Building2 aria-hidden="true" /><h3>Not automatic matching</h3><p>Pegasus reviews fit and decides whether an introduction is responsible. Access does not guarantee inventory.</p></section>
        </div>
      </section>

      <section className="px-mf-cta">
        <div><p className="px-kicker">Private pilot access</p><h2>Bring a clear role, a credible mandate, and enough context for a real review.</h2></div>
        <div><button type="button" onClick={() => setLocation('/marketflow/access')}>Request MarketFlow access <ArrowRight aria-hidden="true" /></button><button type="button" onClick={() => go('strategylab')}>Start in Strategy Lab</button></div>
      </section>
    </div>
  );
}
