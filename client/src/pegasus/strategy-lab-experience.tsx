import React from 'react';
import type { Nav } from './theme';
import { IntelligenceDesk } from './intelligence-desk/Desk';
import './experience-page.css';
import './intelligence-desk/styles.css';

export function PremiumStrategyLab({ openPeggy }: { go: Nav; openPeggy: (role?: string, prompt?: string) => void }) {
  return <div className="experience-page intelligence-desk-page">
    <IntelligenceDesk openPeggy={openPeggy} />
    <section className="id-boundary" data-testid="text-strategy-disclaimer">
      <h2>The Lab organizes a decision. It does not replace diligence.</h2>
      <p>Strategy Lab outputs come from visitor-entered, unverified assumptions and an automated model. They are preliminary and directional, not legal, tax, lending, accounting, appraisal, engineering, securities, construction, or investment advice. Carrying a brief into intake does not guarantee review, response, routing, an offer, or a timeline.</p>
    </section>
  </div>;
}
