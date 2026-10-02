import { useState } from 'react';
import type { Nav } from './theme';
import { PageAction, PageOpening, PageClosing } from './experience-page';

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

export function PremiumMarketFlow({ go: _go }: { go: Nav }) {
  const [role, setRole] = useState<RoleKey>('source');
  const active = ROLES.find(item => item.key === role) ?? ROLES[0];
  return <article className="experience-page" data-testid="premium-marketflow">
    <PageOpening title="A private operating network." action={{ href: '/marketflow/access', label: 'Request Access' }}><p>MarketFlow is Pegasus’s controlled private pilot for opportunity and relationship records. Access is reviewed and discretionary.</p><p className="ep-notice">No live opportunities or inventory, offer, solicitation, or promise of access is published here.</p></PageOpening>
    <section className="ep-section" aria-labelledby="marketflow-role-title"><div className="experience-wrap"><h2 id="marketflow-role-title">Start with your role.</h2><div className="ep-stage-rail ep-four-stages" role="group" aria-label="MarketFlow relationship roles">{ROLES.map(item => <button type="button" key={item.key} aria-pressed={role === item.key} aria-controls="marketflow-role-panel" onClick={() => setRole(item.key)}><strong>{item.label}</strong></button>)}</div>
      <div id="marketflow-role-panel" className="ep-split" aria-live="polite" aria-atomic="true"><div><h3>{active.title}</h3><p>{active.brief}</p><PageAction href={`/marketflow/access?role=${active.key}`}>Request access in this role</PageAction></div><div><h3>What to include</h3><ul className="ep-rows">{active.brings.map(item => <li key={item}>{item}</li>)}</ul><p className="ep-notice ep-rule">{active.receives.join('. ')}.</p></div></div>
    </div></section>
    <section className="ep-section ep-warm"><div className="experience-wrap ep-split"><h2>Permission comes before access.</h2><div><p>An access request records role and context; it does not promise approval, review, or a response. Source authority and permitted visibility would need verification before a record is shared.</p><p>Any future introduction depends on consent, fit, capacity, authorization, and separate terms. Any actual role, confidentiality, source protection, compensation, or transaction requires its own signed terms.</p><div className="experience-actions"><PageAction href="/marketflow/buyboxes" secondary>Read public criteria</PageAction><PageAction href="/strategy-lab" secondary>Start in Strategy Lab</PageAction></div></div></div></section>
    <PageClosing title="Request private pilot access." href="/marketflow/access" label="Request Access"><p className="ep-notice">MarketFlow is not a public marketplace or live-inventory feed. It is not a securities or investment platform, and no securities are offered on this surface. No review, match, introduction, buyer, project, inventory, response, or transaction is guaranteed.</p></PageClosing>
  </article>;
}
