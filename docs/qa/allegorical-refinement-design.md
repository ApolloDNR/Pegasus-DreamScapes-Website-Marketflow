# A place taking shape: September 29 refinement

Apollo asked to keep the playfulness and seriousness, with a stronger allegorical feel. This is a controlled refinement of the existing public experience, on the same branch and draft PR. No new business claims, routes, backend behavior or automatic submissions.

## Design inventory before implementation

- Path-choice concept: `exec-2e4d5b32-15d2-45c3-af7a-93ce00a029b2.png`, 1536 × 1024. Three engraved thresholds connect to one origin, beside the three existing direct audience links. Generated standalone art: `exec-363d2837-4846-4a11-a7ef-8ecbdcaebf21.png`. An olive branch, horizon and cypress are symbolic, not property evidence.
- Peggy concept: `exec-7ce59a11-9e2e-486e-b462-c1fd8f1167bb.png`, 1536 × 1024. A personal seal, compass, open field note and actual numbered tour progression. Earlier `exec-cd4910db-c34c-450c-bf9e-7000974ba571.png` was rejected for inventing tour labels, a landscape and a second composer.
- Continuation extends the same thin route-line/compass vocabulary through the existing two real destination rows. No new page section or interaction category.

Color lock: #f5efe4 paper, #eee5d6 limestone, #0b1d29 ink, #8e5030 copper, #c9bba8 rules. Existing dark equivalents remain. Playfair Display headings, Inter body and UI. Retain the 1280px content container, 24/40/64px gutters, 44px targets, 2–8px control radii. Pathway heading 48–56px desktop, 32px phone; row titles 26–30px desktop, 23px phone; body 15–16px. Separate title/art and open link rows with one vertical rule on desktop. Stack on phones and keep the illustration compact. No forced scroll, autoplay, persistent browsing history or extra form step.

Allowed copy is the current approved copy: Home headline, six sections, three HOME_PATHS labels/descriptions, GuideInvite, Peggy welcome/actions/context/privacy text, actual section titles and two curated continuation links. New visible numerals indicate actual link order or actual tour section position only. No added marketing claims or hero labels.

Intentional adaptations fixed before coding: retain the original approved hero and Nelson kitchen photographs instead of the concept's invented photographs; retain Peggy's existing optical winged-P instead of a newly generated approximation; retain the explicit page-context checkbox and all privacy/disclosure text omitted by the concept. Fit the actual 440px companion and 420px tour, with responsive type rather than scaling the concept's oversized mockup chrome. Keep the entire existing selection/draft/Send behavior. Tour progress is based on the real page outline, never hardcoded to six. Progress buttons must name the real destination, remain keyboard operable, and create no service request.

## Work checklist

- [x] A1: Engraved, responsive audience pathways with real direct links and local hover/focus response.
- [x] A2: Peggy seal, compass and clearer open field-note context.
- [x] A3: Real, accessible tour trail with direct section navigation and stable focus.
- [x] A4: Consistent continuation, guide invitations and restrained motion.
- [ ] A5: Actual rendered review, behavior/accessibility checks, source publication and owner report.

## Verification ledger

Browser/IAB was attempted first for the local production build and returned `net::ERR_BLOCKED_BY_CLIENT`. Fallback: the repository's isolated Playwright Chromium, with external requests blocked and fixture responses only. Both adopted concepts and final rendered screenshots were inspected with `view_image` at the native 1536 × 1024 concept size. Responsive checks include 320, 390 and 768px, both themes and enlarged text.

| Comparison | Rendered result / correction |
| --- | --- |
| Path anatomy | Same left title/thresholds, three direct open link rows, fine divider and Peggy invitation. Real labels/descriptions preserved exactly. Existing 1280px container and type scale deliberately retained. |
| Allegorical art | Matching standalone generated arches on a transparent ground, with code-native numerals and three actual hover/focus paths. Checked in both themes; no opaque rectangle, clipping or invented project evidence. |
| Peggy identity | Existing winged-P placed in one restrained personal seal, distinct from the company horse. Compact form factors match the working 440px panel and 420px tour. |
| Context / hierarchy | Replaced the filled context box with an open note and thin route rule. Real section/selection, consent checkbox, editable draft and privacy notice remain. |
| Tour progress | Actual outline drives the numbered trail, including pages with more than six sections. Click, arrows, Home and End change the true section. Current step and keyboard focus remain explicit. No message is sent. |
| Typography / palette | Playfair and Inter, cream/navy/copper, controlled type and target sizes. No hero tint or new marketing copy. Fixed the 320px welcome's unnecessary third line by omitting the decorative compass at that width. |
| Continuation | Existing real destinations share the compass and route line. Corrected numbered labels to align with destination titles. The same two links stack cleanly on phones. |
| Motion / mobile | No autoplay or forced scene transition. Short local path-color response honors reduced motion. Mobile art is compact; links remain direct and do not require a preview tap. |

Above-the-fold copy diff: Home hero headline, geography, introduction, two primary/secondary arrival actions and disclosure remain unchanged. All six Home sections, original hero/founder/Nelson photographs, real link labels and public facts are preserved. Generated context pictures, altered logo, omitted consent checkbox and invented tour content were explicitly rejected before implementation.

The implemented composition was faithfully verified against the adopted concepts and recorded adaptations. No unresolved material visual mismatch was found in the inspected states. This is a source-design result, not a claim that live services or the hosted preview have passed.

Local evidence: TypeScript, 227 test files / 2,583 tests, production build and all four deployment-entry runtime cases passed. Final shared journey gate: 90 rendered checks. Guide/chat suites: 64 and 46 checks on the implementation before the final narrow-screen typography-only adjustment; the final journey gate covers that adjustment and CI repeats all suites. No detected automated WCAG A/AA violations, horizontal page overflow or unexpected service writes in those checks. Initial JS: 429,757 bytes raw / 128,814 bytes gzip, within 475,000 / 145,000. No new dependency.

A5 local verification is complete. Publication, exact-source CI and the protected-preview attempt are recorded on existing draft PR #26 and the persistent owner report after this commit. E5b (configured Peggy), E8c (protected-preview delivery) and E9 (actual service/phone/participant acceptance) remain distinct.
