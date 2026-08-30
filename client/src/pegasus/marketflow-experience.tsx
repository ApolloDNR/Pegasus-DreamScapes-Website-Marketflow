import React from 'react';
import { useLocation } from 'wouter';
import {
  ArrowRight,
  Check,
  CircleDot,
  LockKeyhole,
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
    brief: 'An access request can include source information and authority to share. The intake record is not an NDA, protection agreement, review promise, distribution right, compensation agreement, or introduction.',
    receives: ['Submitted source fields', 'Public criteria and boundaries', 'No promised review or next step'],
    brings: ['Address and situation', 'Basis or asking terms', 'Authority to share'],
  },
  {
    key: 'buyer',
    label: 'Buyer',
    title: 'Define the buyer mandate.',
    brief: 'A buyer can request pilot access and describe geography, asset type, basis, and capacity. Approval, inventory, review, matching, introductions, representation, and transactions are not promised.',
    receives: ['Public criteria and boundaries', 'No promised inventory or match', 'Separate terms for any future relationship'],
    brings: ['Current buy box', 'Capacity and timing', 'Proof of ability when requested'],
  },
  {
    key: 'capital',
    label: 'Capital',
    title: 'State a mandate, not a promise.',
    brief: 'A capital relationship, if separately offered, would be private, project-specific, independently reviewed, and documented. MarketFlow is not a pooled fund or public securities offering.',
    receives: ['Public capital boundaries', 'No promised project or diligence', 'Separate documents for any future transaction'],
    brings: ['Mandate and check size', 'Risk and duration preferences', 'Accreditation context if relevant'],
  },
  {
    key: 'operator',
    label: 'Operator',
    title: 'State the specialty and capacity.',
    brief: 'A contractor, consultant, or specialist can request pilot access and provide trade, geography, license, references, and capacity. Approval, a project, work, revenue, or an introduction is not promised.',
    receives: ['Public vendor criteria', 'No promised project or placement', 'Separate scope for any future work'],
    brings: ['Trade or specialty', 'Service geography', 'License, references, and capacity'],
  },
];

const SEQUENCE = [
  { label: 'Optional self-modeling', copy: 'Strategy Lab can organize user-supplied assumptions without creating a review or recommendation.' },
  { label: 'Access request', copy: 'A request records role and context; it does not promise approval, review, or a response.' },
  { label: 'Authorization check', copy: 'If a record is considered, source authority, permissions, and permitted visibility would need verification.' },
  { label: 'Possible introduction', copy: 'Any future introduction depends on fit, consent, capacity, and separate authorization.' },
  { label: 'Written terms', copy: 'Any actual role, confidentiality, source protection, compensation, or transaction requires its own signed terms.' },
];

const RECORD_ANATOMY = [
  'Property context',
  'Source authority',
  'Review basis',
  'Current permission',
  'Intended recipient',
  'Written terms',
];

export function PremiumMarketFlow({ go }: { go: Nav }) {
  const [, setLocation] = useLocation();
  const [role, setRole] = React.useState<RoleKey>('source');
  const active = ROLES.find((item) => item.key === role) ?? ROLES[0];

  return (
    <div className="px-mf" data-testid="premium-marketflow">
      <section className="px-mf-hero">
        <img src={IMG('pegasus-casestudy.png')} alt="Sunlit kitchen with oak cabinetry and marble counters" />
        <div className="px-mf-hero-scrim" aria-hidden="true" />
        <div className="px-mf-hero-inner">
          <div className="px-mf-pilot"><CircleDot aria-hidden="true" /> Controlled private pilot</div>
          <p className="px-kicker">Pegasus systems · MarketFlow</p>
          <h1>A controlled pilot for bounded relationship records.</h1>
          <p>MarketFlow describes a possible private workspace for authorized opportunity and relationship records. Access, verification, review, inventory, matching, introductions, and transactions are discretionary and not promised.</p>
          <div className="px-mf-hero-actions">
            <button type="button" onClick={() => setLocation('/marketflow/access')}>Request pilot access <ArrowRight aria-hidden="true" /></button>
            <button type="button" onClick={() => setLocation('/marketflow/buyboxes')}>Read public criteria</button>
          </div>
        </div>
      </section>

      <section className="px-mf-role-room" aria-labelledby="marketflow-role-title">
        <header>
          <p className="px-kicker">Choose your relationship</p>
          <h2 id="marketflow-role-title">Four request contexts. Separate permissions and terms.</h2>
          <p>Select the closest role to see what an access request can include and what this controlled pilot does not promise.</p>
        </header>

        <div className="px-mf-role-tabs" role="group" aria-label="MarketFlow relationship roles">
          {ROLES.map((item) => (
            <button key={item.key} type="button" aria-pressed={role === item.key} aria-controls="marketflow-role-panel" onClick={() => setRole(item.key)}>
              {item.label}
            </button>
          ))}
        </div>

        <div id="marketflow-role-panel" aria-live="polite" className="px-mf-role-panel">
          <div className="px-mf-role-statement">
            <span>Current relationship brief</span>
            <h3>{active.title}</h3>
            <p>{active.brief}</p>
            <button type="button" onClick={() => setLocation(`/marketflow/access?role=${active.key}`)}>Request access in this role <ArrowRight aria-hidden="true" /></button>
          </div>
          <div className="px-mf-role-ledgers">
            <section><p>What the public pilot states</p><ul>{active.receives.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul></section>
            <section><p>What Pegasus needs from you</p><ul>{active.brings.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul></section>
          </div>
        </div>
      </section>

      <section className="px-mf-sequence" aria-labelledby="marketflow-sequence-title">
        <div className="px-mf-sequence-intro">
          <p className="px-kicker">The relationship sequence</p>
          <h2 id="marketflow-sequence-title">Nothing enters the room simply because it was submitted.</h2>
          <p>These are proposed controls, not a promise that a submission advances. Access, review, authorization, records, introductions, and written terms remain separate gates.</p>
        </div>
        <ol>{SEQUENCE.map((item) => <li key={item.label}><h3>{item.label}</h3><p>{item.copy}</p></li>)}</ol>
      </section>

      <section className="px-mf-dossier" aria-labelledby="marketflow-dossier-title">
        <div className="px-mf-dossier-image"><img src={IMG('pegasus-craft-blueprint.webp')} alt="Planning documents being reviewed on an architectural worktable" /></div>
        <div className="px-mf-dossier-paper">
          <p className="px-kicker">Field anatomy</p>
          <h2 id="marketflow-dossier-title">A useful record begins with authority, context, and a defined recipient.</h2>
          <p className="px-mf-dossier-lead">If a relationship and record are authorized, visibility should be limited to the information and recipient permitted for that decision. This public page does not establish approval or access.</p>
          <ul className="px-mf-anatomy" aria-label="Fields in a possible authorized MarketFlow record">
            {RECORD_ANATOMY.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div className="px-mf-dossier-note"><LockKeyhole aria-hidden="true" /><p>No live opportunities or inventory, offer, solicitation, or promise of access is published here.</p></div>
        </div>
      </section>

      <section className="px-mf-boundaries">
        <header><p className="px-kicker">What MarketFlow is—and is not</p><h2>A serious network begins with visible boundaries.</h2></header>
        <p className="px-mf-boundary-note">MarketFlow is not a public marketplace or live-inventory feed. It is not a securities or investment platform, and no securities are offered on this surface.</p>
        <div>
          <section><h3>A controlled pilot</h3><p>Access and visibility are discretionary; this page does not promise review, routing, or a recipient.</p></section>
          <section><h3>A possible relationship record</h3><p>Any future introduction depends on consent, fit, capacity, authorization, and separate terms.</p></section>
          <section><h3>Not public inventory</h3><p>No live deals, private terms, or member records are published on this surface.</p></section>
          <section><h3>Not automatic matching</h3><p>No review, match, introduction, buyer, project, inventory, response, or transaction is guaranteed.</p></section>
        </div>
      </section>

      <section className="px-mf-cta">
        <div><p className="px-kicker">Private pilot access</p><h2>State the role, mandate, authority, and context for an access request.</h2></div>
        <div><button type="button" onClick={() => setLocation('/marketflow/access')}>Request MarketFlow access <ArrowRight aria-hidden="true" /></button><button type="button" onClick={() => go('strategylab')}>Start in Strategy Lab</button></div>
      </section>
    </div>
  );
}
