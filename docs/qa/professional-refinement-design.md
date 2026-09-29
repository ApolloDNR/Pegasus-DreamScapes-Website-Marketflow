# Professional refinement: September 29, 2026

Apollo asked for a more sophisticated, premium and professional feel while retaining the playful classical identity. This refines the existing public interface; the business story, routes, six Home sections, approved headline, original hero/founder/Nelson images, company logo and functional contracts remain.

## Design decision

The earlier large tree illustration and repeated ornamental marks compete with the choices. Use a composed editorial directory: one restrained three-threshold vignette above three open direct links. Peggy remains a recognizable companion, with a compact personal header and a clearly typed context note. Larger empty space alone is not the objective; choices, context and actions must read in order.

Selected concepts, generated with the built-in Image Gen from fresh current-source screenshots:

- Directory: `exec-b9df774d-d0e7-45ce-88ff-dd9fa5c35487.png`, 1536 x 1024.
- Peggy detail: `exec-bc33301f-2740-43ce-8e46-7e303cbe33a8.png`, an enlarged isolated presentation of the existing 440px panel.
- Rejected first concepts: `exec-ceac8f90-484d-49eb-bb55-930075935f06.png` and `exec-030ce15f-73b1-4823-b2ec-f9ae94aa0389.png`. These retained oversized decoration or introduced boxed secondary actions.

## Implementation inventory and sizing constraints

| Surface | Production specification |
| --- | --- |
| Palette | Existing cream #f5efe4, navy #0b1d29, copper #8e5030 and #c9bba8 rules. Existing dark-theme semantic equivalents. No new image overlay, glow or gradient. |
| Type | Existing Playfair Display and Inter. Directory heading 36–48px, destination headings 24–28px, notes 14px/1.7, numerals 11px. Peggy greeting 27px desktop / 26px phone, context title 15px Inter, controls 14px. No negative tracking. |
| Directory | 1280px existing container. Horizontal title and 320px-wide existing engraving, three equal open link columns, 40px internal spacing, shared lower rule and compact Peggy invitation. At <=767px, choices become direct rows and the art becomes 234px wide. No card backgrounds or extra selection gate. |
| Allegory | Reuse the original 149,210-byte transparent threshold WebP. Remove the large converging tree and duplicate numbers; three short rules preserve hover/focus feedback. Decorative material remains outside Peggy's page context. |
| Peggy | Existing 440px responsive panel, smaller 44px personal seal, original winged-P, navy header, visible AI disclosure, one small breadcrumb compass. Remove the redundant company kicker and large welcome compass. Open context note and secondary action rows; explicit context checkbox and full privacy notice remain. |
| Shared journey | Smaller compass at onward headings, clear numbered rows without the decorative connected circles; one quiet personal seal in invitations. Existing context preparation, tour, draft and focus behavior remain. |
| Navigation | Original company mark, wordmark, labels, routes, header height and primary CTA. Smaller 11px division caption and 14px desktop navigation, restrained active underline. |
| Interaction | Existing direct destinations and local tour outline. Fine hover/focus feedback, no motion when reduced motion is requested, no additional network request or persistent tracking. |

The supplied raster concepts are enlarged visual references. The numeric production sizes above govern actual interface legibility and avoid copying enlarged callout text into the working panel. Keep the original exact logos and illustration rather than generated approximations. Preserve the actual six-section page outline and real destination copy. No generated photograph is used.

Allowed first-viewport copy remains the exact current Home headline, geography, introduction, two arrival actions, image disclosure, corporate wordmark/divisions and navigation labels. The only removed visible copy is the redundant company-name kicker within Peggy; her own name, guide subtitle and AI disclosure remain. No new claim, offering, proof point or page section is added.

## Checklist

- [x] S1: editorial directory with restrained existing illustration.
- [x] S2: more compact, professional Peggy presentation.
- [x] S3: consistent shared navigation, invitations and onward links.
- [x] S4: current-source responsive, accessibility, functional and visual verification.
- [ ] S5: existing draft PR, exact-source CI and persistent owner report. Publication receipts will be recorded on PR #26 and in the owner report after this source commit exists.

## Verification and fidelity ledger

The built-in browser returned `net::ERR_BLOCKED_BY_CLIENT` for the local preview. Final review used isolated Playwright Chromium against the actual production build, with remote services blocked. The guide and chat matrices use explicit synthetic API fixtures; there were no live submissions.

- TypeScript, production build, bundle budget and all four deployment-entry runtime cases pass. Initial JavaScript is 429,201 bytes raw / 128,641 bytes gzip, below the existing 475,000 / 145,000 limits and slightly below the parent. No dependency or production asset was added.
- The final journey suite passes 90 rendered states at 320, 390, 768 and 1536px in both themes, plus enlarged-text states. It checks actual direct links, tour keyboard navigation, guide/context preparation, draft preservation, onward routes and the Tools finder. No detected WCAG A/AA violations, horizontal page overflow or unexpected service writes. New desktop assertions keep description tops and arrow bottoms aligned within 2px.
- Final guide and chat suites pass 64 and 46 states respectively, including context on/off, selected text, source pinning, private-route exclusion, explicit sending, waiting/stop/failure recovery, local save/reset, mobile composer and close/focus behavior.
- The final local regression run passes all 227 files / 2,583 tests with two workers. Exact-source CI receipts are recorded on PR #26 and the owner report. An initial local run passed 2,582 tests and failed one stderr assertion because the environment injected the experimental `UNDICI-EHPA` proxy warning. The rerun suppresses only that warning, preserving all existing Node options. No assertion or application behavior was changed to hide it.

Both adopted concept files and the final actual screens were opened with `view_image` in the final review pass. The directory was rendered at the native 1536 x 1024 concept viewport. The Peggy callout was also checked at its native 952 x 1652 viewport; the working panel correctly remains 440px wide (about 821px tall), rather than stretching to the enlarged illustration. Screens at 320, 390 and 768px, both themes, the onward section and the actual page tour were also inspected.

| Comparison point | Final fidelity and corrections |
| --- | --- |
| Composition | Adopted the horizontal title/art relationship, equal open columns, fine dividers and single invitation below. The existing fixed header and wayfinding strip remain. |
| Scale | The production directory uses a 48px maximum heading, 28px destinations and 320px illustration. The raster concept's larger type and art were intentionally reduced as specified before implementation. |
| Alignment and spacing | Corrected an empty second heading line on wide screens with progressive subgrid alignment. At 768px, naturally wrapped titles share aligned description and arrow rows. Phone rows reset that layout explicitly. |
| Identity and artwork | Reused the exact Pegasus wordmark, winged-P and original three-threshold WebP. Removed the large converging tree, duplicate numerals, oversized welcome compass and double seal rings. Three small local focus/hover marks retain playful feedback. |
| Type and hierarchy | Retained Playfair/Inter. Peggy's 27px greeting and 15px sans-serif context title distinguish welcome, current source and action. Header name and personal icon are smaller. |
| Surfaces and color | Existing cream/navy/copper and fine rules; softer panel shadow and lighter composer. Reviewed light and dark renderings. No additional gradient, glow or card stack. |
| Controls and copy | Kept direct destinations, real tour stops, explicit context checkbox and complete privacy notice. Corrected the compact invitation avatar selector so it actually renders at 32px. No fake readiness indicator or automatic message. |
| Responsive behavior | Phone choices become three readable rows; Peggy keeps the reachable composer and privacy text. At 320px her body remains scrollable for lower secondary details. Tablet columns align, and enlarged text passes the rendered gate. |

Exact first-viewport copy diff: zero changes to the approved Home headline, geography, introduction, two arrival actions, image disclosure, corporate wordmark/divisions or navigation labels. `home-v51.tsx`, `public-content.ts` and `nav.tsx` are unchanged against the parent. The removed company kicker inside Peggy is the only copy deletion in the implementation. Generated approximations of existing icons, enlarged callout dimensions and any omitted disclosure were not adopted.

Core flow verification used real links and actual local UI state. Service responses are controlled fixtures, so these checks establish frontend behavior, not live Peggy answer quality, actual delivery, physical-device usability or universal accessibility. No unresolved material mismatch remains in the inspected states relative to the production specification and recorded concept adaptations.

Protected preview delivery (E8c), configured Peggy conversations (E5b), actual intake/HQ/email/authentication receipts and physical-device/user acceptance (E9) remain separate dependencies. No merge, production, DNS or indexability change is included.
