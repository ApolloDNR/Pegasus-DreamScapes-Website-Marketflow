# Guided website refinement, September 29, 2026

The owner reopened the full public experience and explicitly requested Peggy's own recognizable icon. This pass extends the existing approved site rather than changing the company story, routes, intake contracts, original photographs or calculation model.

## Checklist

- J1: Peggy's winged P, distinct from the company emblem.
- J2: Shared section wayfinding after the introduction, using the existing public-page observer.
- J3: Local tour invitations and contextual explanations, preserving unsent drafts.
- J4: Relevant continuation links and an optional explanation of the intake sequence.
- J5: Tools finder with three actual tasks and eight real calculator destinations.
- J6: Shared responsive, focus and motion treatment; authored section tour summaries.
- J7: Behavior, accessibility, responsive and visual verification; source and evidence delivery.

## Design system and concept inventory

Concepts: `exec-76c81f0e-1225-4a50-bafd-98621e676f39.png` (opening and wayfinding), `exec-a7168d3e-dbf9-4f69-88e8-75b0c553a1dd.png` (closing and continuation), `exec-b7168781-e939-4e14-8e07-84f05a6eaca7.png` (Tools). Each is 1536 by 1024. Peggy mark: `exec-63f55937-3c64-4245-8e5a-a61085d339fb.png`.

Color lock: cream #f5efe4, limestone #eee5d6, navy #132a38, copper #8e5030, rule #c9bba8. Preserve existing dark theme equivalents. Playfair Display headings, Inter controls; heading range 32–68px, body 16–18px, control 13–15px. Existing maximum content width 1280px, 24px minimum gutters, 48px primary control height, 44px minimum secondary targets. Open ruled lists, two-column editorial splits, no new card grid. Fixed wayfinding is below the existing navigation and appears only after the introduction. Mobile uses one column and a compact section strip. Motion is limited to short directional feedback and native scrolling with reduced-motion support.

Allowed new visible copy: “A little guidance?”, “Peggy can walk you through this page.”, “Show me around”, “Explore this with Peggy”, “Ask Peggy”, “Keep exploring.”, “A useful next step, at your pace.”, “Want help choosing? Ask Peggy.”, “What happens next”, “Share the basics”, “Review your summary”, “Choose to submit”, “You can review your information before sending it.” Tools uses the existing headline and factual scope, plus “Understand a property”, “Check a number”, “Continue my work”, “See how the pieces fit.”, “Prefer a second set of eyes?” and real destination descriptions.

Implementation adaptations recorded before coding: preserve actual existing property and founder photographs rather than generated approximations; preserve existing header, approved page copy and legal notices rather than the concept's paraphrases. Use Peggy's separately generated winged-P identity instead of the company marks incorrectly repeated in two UI concepts. Render that personal UI icon as a small optical SVG, with three wing feathers and a copper northpoint. Reuse the existing accurate schematic PropertySketch instead of introducing the concept's unrelated building drawing. Keep the established 1280px container and proportional typography, including the 320px phone layout. Concepts illustrate new component composition; they do not authorize rewriting approved page facts or exact financial/intake copy.

## Interaction contract

Invitations and tours are local actions. They never create conversations or send text. Only Send contacts Peggy. Context uses the existing bounded public-heading reader, never form values or saved/private work. A new explanation must not replace an unsent draft without a visible choice. While a response is pending, queue the proposed question for review without changing the in-flight request. Wayfinding is whitelisted to editorial public pages, excluding intake, private workspaces and tools with their own navigation. Continuation links are curated per route and retain normal browser navigation.

## Verification and ideas

Verification evidence and the completed checklist will be recorded in the release report after rendering. Future live-provider quality, actual receipts, protected-host delivery and physical-device acceptance remain separate evidence gates. Voice, autonomous submission and invented personalization are not part of this source pass.

## Fidelity review

Cloud Browser was attempted first and returned `net::ERR_BLOCKED_BY_CLIENT` for the local preview. The fallback uses isolated Playwright Chromium against the production Express build, with remote requests and service writes blocked. Concepts and actual renders were inspected with `view_image`; the primary comparison viewport is the concepts' native 1536×1024. Responsive review also covers 320, 390 and 768px in both themes.

| Comparison | Concept evidence | Render evidence and resolution |
| --- | --- | --- |
| Opening hierarchy | Opening concept: serif title, primary action, personal guide invitation, real project image | `1536-light-opening.png`: same composition using approved owner text and original photo. Corrected inherited paragraph spacing inside the invitation. |
| Peggy identity | Separate winged-P asset, cream feathers and copper northpoint | Launcher, tour, invitation, chat header and wayfinder share one optically simplified SVG. The corporate horse remains in company chrome. |
| Palette and actions | All three concepts: warm cream, navy, restrained copper primary control | Replaced inconsistent public primary-button fills with the same copper treatment; dark theme uses the existing accessible lighter copper. No photo tint or new background effect. |
| Tools anatomy | Tools concept: three numbered task rows, adjacent explanation, subordinate illustration, review below | `1536-light-tools.png`: same open two-column system. Reused the existing schematic rather than introducing an unrelated house drawing. All eight real calculator destinations work. |
| Continuation | Closing concept: navy invitation, optional sequence, cream onward links with fine rules | `1536-light-continuation.png`: same editorial transition; preserves the full approved notices and the route-specific primary action, which takes more height than the concept paraphrase. |
| Type and containers | Playfair/Inter, restrained thin rules, no nested card grid | Existing responsive type scale and 1280px container retained. Control sizes are explicit; link text reflows into one column on phones. |
| Wayfinding | Opening component detail: index, current section, chevron, Ask Peggy | `320-dark-page-outline.png`: real public section list, keyboard dismissal and heading focus. Header measurement prevents overlap with enlarged text; sticky answers clear the strip. Enlarged navigation wraps the menu onto its own row when needed instead of colliding with the wordmark. |
| Mobile guide | Existing approved companion panel system | `390-light-guided-owner.png` and `320-light-preserved-draft.png`: bounded panel, visible controls, original draft retained, proposed question explicitly reviewed. |

Above-the-fold copy audit: original Home headline, introduction, geography, image notice, two arrival actions and six sections preserved. Existing owner and Tools headlines and factual copy retained; the new invitation and task controls are in the allowed inventory. Concept paraphrases of approved copy were deliberately not adopted. The documented adaptations account for all material differences; the implemented component composition, palette, type family, primary action and responsive hierarchy were visually verified against this specification. No unresolved visible mismatch was found in the inspected states.

## Prioritized follow-through

1. Complete protected-preview delivery and inspect this exact source before calling it hosted.
2. Evaluate real Peggy answers against representative owner, partner and tool questions. Score usefulness, source grounding, uncertainty and next-step relevance.
3. Observe people finding the correct path, explaining a section, comparing a model and reviewing an inquiry. Use task completion and confusion, not decorative novelty, to decide the next changes.
4. Verify physical iOS/Android keyboard, text-selection handles, enlarged text, focus and Back behavior on the deployed site.
5. If observation finds people losing their place, consider an explicitly saved journey summary. Do not silently persist browsing history.
6. If the documented project record grows, add more actual project walkthroughs using original photos and sourced facts. Avoid fabricated proof.
7. Consider user-controlled spoken explanations only after a real voice service, accessibility behavior and consent model are specified. No decorative microphone or simulated live availability.
8. Consider a unified evidence list for property questions only after the real data sources and correction flow exist. Current Peggy context remains bounded public page content.

No new model, dependency, production service, third-party message, hosting project or analytics tracker is part of this refinement.
