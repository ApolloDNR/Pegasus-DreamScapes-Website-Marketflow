import { useState } from 'react';
import type { Nav } from './theme';
import { PageAction, PageOpening, PageClosing, ProjectEvidence } from './experience-page';

type Stage = {
  num: string;
  name: string;
  claim: string;
  detail: string;
  decided: string[];
};

const STAGES: Stage[] = [
  {
    num: '01', name: 'Originate',
    claim: 'Start with the property, source, and objective.',
    detail: 'Owners, deal sources, and prospective partners bring opportunities with different constraints. Identify the property facts, who controls the next decision, and the outcome being considered. Submission records context; a review or response is not guaranteed.',
    decided: ['Source information to verify', 'Known parties and permissions', 'Property facts and constraints'],
  },
  {
    num: '02', name: 'Structure',
    claim: 'Compare possible roles, strategies, and required terms.',
    detail: 'The framework asks what could happen to the property, which roles would be required, how control and capital might work, and what must be verified. Any actual role, payment, duty, or transaction requires separate diligence and written agreements.',
    decided: ['Possible role and its limits', 'Illustrative business plan', 'Required control and transaction terms'],
  },
  {
    num: '03', name: 'Operate',
    claim: 'Carry out the agreed project role.',
    detail: 'For an accepted project, execution follows the agreed scope, authority, budget, schedule, and reporting. Acquisition, renovation, development, and property operations each require qualified providers and project-specific agreements. The role map does not imply a standing team or available capacity.',
    decided: ['Capabilities the scenario would require', 'Budget and schedule assumptions', 'Roles requiring qualified providers'],
  },
  {
    num: '04', name: 'Realize',
    claim: 'Work toward the agreed sale, hold, or refinance.',
    detail: 'The property strategy sets the intended exit and the conditions for changing course. On an accepted project, the responsible parties act within their agreed authority and required approvals. Costs, market conditions, and financing can change the outcome.',
    decided: ['Exit assumptions to test', 'Economics to verify', 'Approvals and agreements required'],
  },
  {
    num: '05', name: 'Learn',
    claim: 'Compare documented actuals with prior assumptions.',
    detail: 'When verified project records are available, actual acquisition, scope, carry, disposition, and timeline data can be compared with the original model. One case study does not establish volume or predict another outcome.',
    decided: ['Actuals versus assumptions', 'Evidence worth retaining', 'Limits on future inference'],
  },
];

const ROLES: Array<[string, string]> = [
  ['Possible principal', 'A direct acquisition would require diligence, capacity, and accepted written purchase terms.'],
  ['Possible joint venture', 'Roles, control, economics, risks, and remedies would require a signed JV agreement.'],
  ['Possible co-GP', 'Any sponsor role and responsibility would be defined for the specific project.'],
  ['Possible operating role', 'Scope, authority, reporting, compensation, and performance duties would be written separately.'],
  ['Possible development role', 'Property scope, providers, permits, budget, schedule, and completion duties would require project documents.'],
  ['Licensed representation request', 'Availability is separate from Pegasus. CA DRE #02333658 is listed under Duran Ramirez, Paolo Ariel; responsible broker BMP Realty Inc DBA Keller Williams Realty-East Bay. Verify current status; agency requires a separate written agreement.'],
  ['Possible introduction', 'No referral, buyer, route, compensation, or service is promised; permission and separate written terms control.'],
];

export function HowWeOperatePage({ go: _go }: { go: Nav }) {
  const [stageIdx, setStageIdx] = useState(0);
  const stage = STAGES[stageIdx];
  return <article className="experience-page">
    <PageOpening title="From property to plan to execution." action={{ href: '/bring-an-opportunity', label: 'Bring an Opportunity' }}><p>Understand the property, establish the role and terms, then organize the work an accepted project requires.</p></PageOpening>
    <section className="ep-section" id="operating-sequence" data-testid="lifecycle-rail"><div className="experience-wrap">
      <h2>Five stages. One connected process.</h2>
      <div className="ep-stage-rail" role="group" aria-label="The five operating stages">{STAGES.map((item,index) => <button type="button" key={item.num} aria-pressed={index === stageIdx} aria-controls="operating-stage" onClick={() => setStageIdx(index)}><span>{item.num}</span><strong>{item.name}</strong></button>)}</div>
      <div className="ep-split ep-rule" id="operating-stage" aria-live="polite" aria-atomic="true"><div><h3>{stage.claim}</h3><p>{stage.detail}</p></div><div><h3>Questions to resolve</h3><ul className="ep-rows">{stage.decided.map(item => <li key={item}>{item}</li>)}</ul></div></div>
    </div></section>
    <section className="ep-section ep-dark" id="operating-roles"><div className="experience-wrap ep-split"><div><h2>Agree the role before the work.</h2><p>A direct acquisition, joint venture, or defined operating role creates different responsibilities. Any Pegasus participation depends on fit, diligence, availability, qualification, and a separate written agreement.</p></div><dl className="ep-rows">{ROLES.map(([name,description]) => <div key={name}><dt>{name}</dt><dd>{description}</dd></div>)}</dl></div></section>
    <section className="ep-section" id="strategy-structure"><div className="experience-wrap ep-split"><div><h2>The property plan.</h2><p>Renovate and sell. Rent and hold. Add a unit. List it as-is. Pass. The strategy begins with the property’s facts, constraints, and economics.</p></div><div><h2>The transaction terms.</h2><p>Keep four decisions explicit: Pegasus’s role, the agreement that controls the property, the source and terms of funding, and each party’s compensation. A purchase, option, joint venture, or separately licensed listing needs its own authority and written terms.</p></div></div></section>
    <ProjectEvidence title="A project you can examine." />
    <PageClosing title="Start with the property and your objective." />
  </article>;
}
