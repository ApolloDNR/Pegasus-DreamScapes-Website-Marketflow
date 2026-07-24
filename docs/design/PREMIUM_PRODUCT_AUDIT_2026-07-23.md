# Pegasus Premium Product Audit — 2026-07-23

## Mandate

Preserve the approved architectural/editorial homepage while making the wider Pegasus product feel established, reachable, exact, and professionally governed. The owner specifically asked for a mature site directory, a first-class Strategy Lab, a visible MarketFlow product, and a level of polish capable of impressing experienced real-estate professionals.

## Executive verdict

The approved public design language is strong and should remain the system of record: deep navy, limestone, restrained bronze, editorial serif typography, documentary proof, architectural imagery, square dossier panels, and deliberate negative space.

The weakness before this pass was product choreography rather than the homepage. Strategy Lab and MarketFlow were difficult to find; Strategy Lab mixed several generations of interface; MarketFlow’s public story, access desk, and member routes did not feel like one governed product. Some operator links advertised routes that were only dashboard aliases, and an authentication boundary trusted identity metadata too broadly.

This pass turns the public spine into a coherent operating system and replaces those claims with visible, testable product behavior.

## Product inventory after this pass

| Surface | Status | Design role |
|---|---|---|
| Homepage | Retained and re-verified | Architectural editorial arrival and primary opportunity router |
| How We Operate | Retained | Pegasus operating method |
| Property Owners | Retained | Owner-specific situation and options path |
| Deal Partners | Retained | Partner capability and relationship path |
| Our Work | Retained | Documentary Nelson Drive proof |
| About | Retained | Founder and firm trust |
| Global navigation | Rebuilt | First-class Strategy Lab, MarketFlow, and accessible More directory |
| Strategy Lab | Rebuilt | Private underwriting desk using the canonical nine-path engine |
| MarketFlow public page | Rebuilt | Permissioned relationship-layer explanation |
| MarketFlow access | Rebuilt | Private access dossier and reviewed-fit request |
| Bring an Opportunity | Integrated | Canonical intake with a bounded Strategy Lab handoff |
| MarketFlow role dashboards | Hardened | Honest controlled-pilot navigation and authenticated statistics |
| Secondary public pages | Reachable | Organized in the More directory; some still need bespoke page-level art direction |
| MarketFlow member/admin system | In progress | Functional foundation remains; full premium product-design audit is a separate phase |

## Findings and resolutions

### 1. Product depth was hidden

**Finding:** Strategy Lab and MarketFlow existed but were not obvious destinations. The prior header understated the real breadth of Pegasus.

**Resolution:** Both products are persistent primary-navigation items at appropriate desktop widths. The new More directory groups Company & Proof, Operating Lanes, and Network & Resources. Mobile uses the same source of truth rather than a separate, drifting menu.

### 2. Strategy Lab read like an older AI prototype

**Finding:** The entrance was attractive, but the working experience expanded into a long stack of competing summaries, dense inputs, calculators, and generic score-like output.

**Resolution:** Strategy Lab is now one four-step private working desk:

1. Property record
2. Basis ledger
3. Nine-path comparison
4. Decision brief

The primary interface uses the real versioned underwriting engine, never a decorative score. It shows the leading three routes with evidence and sensitivities, while “View all nine paths” exposes the complete comparison. The instrument library remains available behind a deliberate second door.

### 3. The Lab could imply a conclusion without a decision basis

**Finding:** An empty desk or invalid percentages could still cause the underlying engine to emit a weak-fit lane and $0 economics.

**Resolution:** No path, memo, stress table, Peggy explanation, or intake brief is emitted until a positive basis plus ARV or rent exists and every numeric field is valid. Invalid values are bounded before they reach visible economics. The interface gives a specific “decision record held” state and routes the user back to the missing basis.

### 4. Underwriting assumptions were not fully visible

**Finding:** The interface claimed material assumptions were visible but omitted the 30-year term, repairs, capital reserves, tax, insurance, and stress behavior used by rental scenarios.

**Resolution:** The basis ledger now states the 30-year amortization, 3% closing reserve, 8% management, 8% repairs, 5% capital reserve, 1.1% tax, $150 monthly insurance, and the exact stressed/downside changes. The conclusion remains directional and subject to a written Pegasus review.

### 5. The decision brief was polished but not scannable enough

**Finding:** Recommendation, economics, risk, and next action were combined in one long paragraph. A prominent software version also made the method feel newly launched.

**Resolution:** The brief is split into Recommendation, Evidence, Unresolved Risk, and Next Action. The full rationale is still available as a subordinate methodology disclosure. The masthead now leads with “Pegasus underwriting,” while the engine version is provenance rather than the product identity.

### 6. Strategy Lab handoff could become stale

**Finding:** A visitor could change property facts in intake while retaining a conclusion derived from the old facts.

**Resolution:** The handoff is versioned, bounded, short-lived, and stored only in the browser. If decision-driving facts change in intake, the modeled path, verdict, metric, and prior memo are removed and the record explicitly requires Pegasus to rerun the comparison.

### 7. Peggy received Lab data but did not use it

**Finding:** The client passed the memo and inputs, but Peggy’s server prompt did not incorporate the structured Lab context.

**Resolution:** Peggy now receives bounded, labeled data for the leading lane, verdict, primary metric, top routes, risks, memo, next step, and whitelisted inputs. The values are treated as untrusted data, not instructions.

### 8. MarketFlow’s mobile relationship selector hid a role

**Finding:** The fourth relationship type sat off-canvas without a clear scroll cue, and the hero proof rail clipped “Documented.”

**Resolution:** Mobile uses a complete 2 × 2 selector, and the proof rail is reflowed so all three operating promises remain visible.

### 9. MarketFlow contained a synthetic-image credibility tell

**Finding:** A floor plan contained malformed pseudo-labels—the exact kind of artifact professionals notice immediately.

**Resolution:** The image was removed from public and operator-facing use and replaced with a clean planning-table photograph whose content survives close inspection.

### 10. MarketFlow access broke the premium journey

**Finding:** The public landing flowed into a narrow generic beta form with large unused space.

**Resolution:** Access is now a two-part private dossier: a relationship protocol and review ledger on one side, and a warm limestone applicant record on the other. Role context survives from the public MarketFlow page. Consent and the controlled-pilot boundary remain explicit.

### 11. Member navigation advertised products that did not exist

**Finding:** Several wholesaler, operator, and investor links were wildcard aliases back to a dashboard. Buyer saved/offers views referenced non-existent API paths.

**Resolution:** Wildcard aliases were removed. Navigation now points only to real shared product routes; controlled-pilot capabilities are labeled as such and are not presented as live links. Buyer saved/offers use real endpoints.

### 12. MarketFlow identity and statistics were not safe for Supabase-only sessions

**Finding:** User-controlled metadata could overwrite verified identity claims, and role-dashboard statistics used cookie-only requests even when the user authenticated with a Supabase bearer token.

**Resolution:** Verified subject and email now override metadata, self-provisioning prefers the verified Supabase user ID, only approved self-service roles may be created, and existing roles cannot be silently changed. Role statistics use bearer-aware requests while preserving cookie authentication.

### 13. Authenticated MarketFlow data shared an endpoint-only browser cache

**Finding:** Two different people using the same browser could address the same private endpoint while React Query still held the previous person’s fresh response.

**Resolution:** Every private query cache key now includes the verified Supabase subject, and sign-out removes authenticated cache entries. The regression suite explicitly switches from one account to another while the first response is still fresh and requires a second bearer-authenticated request.

## Visual system decisions

- Keep the approved homepage as the governing reference; do not redesign it into a generic SaaS landing page.
- Keep editorial serif display type for strategic statements and compact sans-serif labels for records and controls.
- Use navy for protected operating environments, limestone for review surfaces, and bronze only for hierarchy and state.
- Prefer documentary photography, genuine planning artifacts, and architectural worktables over synthetic diagrams with visible text.
- Keep square or near-square dossier geometry; avoid soft, rounded consumer-app cards.
- Use light sections intentionally to pace long navy product stories on mobile.
- Keep disclosures adjacent to the claim or output they qualify.

## Verification contract

Before publication, the exact release tree must pass:

- Exact Node 20 TypeScript
- Full unit/integration test suite
- Client and server production builds
- Launch-manifest smoke check
- Desktop and mobile route matrix
- Light and dark product states
- Keyboard and focus transitions
- Reduced-motion state
- 200% zoom/reflow
- Serious/critical accessibility scan
- Broken-image and horizontal-overflow scan
- Independent diff and visual jury review

The release handoff records the final counts and commit. Screenshots are evidence of visual quality, not a substitute for these gates.

## Remaining product debt

The public Pegasus spine, Strategy Lab, MarketFlow story, and MarketFlow access journey now form one premium product. The remaining work is concentrated behind authentication:

1. Sweep every non-stat MarketFlow query and mutation for bearer-token parity.
2. Redesign the authenticated role dashboards around the same dossier and decision-record language.
3. Audit deal records, offer studio, messaging, source history, permissions, and administrative review end to end.
4. Give the remaining secondary public pages one clear job and one signature visual moment each.
5. Replace “controlled pilot” labels only when the corresponding workflow is genuinely implemented, permissioned, and tested.

That debt should not be hidden behind decorative links or described as finished.
