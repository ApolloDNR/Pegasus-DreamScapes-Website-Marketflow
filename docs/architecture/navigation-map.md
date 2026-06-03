# Navigation Map

Status: current public launch surface as of 2026-06-03.

This document mirrors the route model in `client/src/config/navigation.ts`,
`client/src/components/navigation.tsx`, and `client/src/components/footer.tsx`.
The website should route visitors by intent without reviving the retired
`/sell`, `/invest`, `/resources`, or `/dealflow` public IA.

## Header Primary

| Label | Route | Job |
|---|---|---|
| Deal Architecture | `/deal-architecture` | Explain how Pegasus reads and structures complex property situations. |
| Development | `/development` | Show ADU, rehab, value-add, and build strategy. |
| Strategy Lab | `/strategy-lab` | Give a preliminary property read before human review. |
| Work With Apollo | `/work-with-apollo` | Separate licensed KW representation from Pegasus operating-company work. |
| MarketFlow | `/marketflow` | Introduce the private reviewed-opportunity network. |

Primary CTA: `Submit a Property` -> `/submit`.

## More Menu

| Label | Route | Job |
|---|---|---|
| Connect | `/connect` | QR/card routing into the correct Pegasus door. |
| About Pegasus | `/about` | Founder and company context. |
| Pegasus Ecosystem | `/ecosystem` | Explain website, HQ, Peggy, MarketFlow, and future systems. |
| Dreamscaper Standard | `/dreamscaper-standard` | State the operating standard and public trust posture. |
| Peggy AI | `/peggy-ai` | Explain Peggy as guided intake, not a decision-maker. |
| Vendor Network | `/vendor-network` | Route operators and vendors into qualification. |
| Contact | `/contact` | General routed contact path. |
| Disclosures | `/disclosures` | Compliance, brokerage, AI, securities, and Equal Housing disclosures. |

## Footer Extras

| Label | Route | Notes |
|---|---|---|
| Projects | `/projects` | Proof and case-study surface. |
| Capital & Partnerships | `/capital` | Private relationship conversations with securities-safe language. |
| Strategy Library | `/library` | Canonical educational/library route. |
| Login | `/login` | Auth entry. |
| Privacy | `/privacy` | Legal. |
| Terms | `/terms` | Legal. |

## Canonical Public Doors

The launch website should make these doors obvious:

| Door | Route | Audience |
|---|---|---|
| Submit | `/submit` | Owners, agents, wholesalers, operators, referral partners, property situations. |
| Connect | `/connect` | QR/card scans and direct introductions. |
| Strategy Lab | `/strategy-lab` | Users who want a preliminary self-serve read. |
| Work With Apollo | `/work-with-apollo` | Sellers and buyers who may need licensed representation. |
| Development | `/development` | ADU, rehab, value-add, infill, and project conversations. |
| Capital | `/capital` | Private capital and partnership relationships only. |
| MarketFlow | `/marketflow` | Private reviewed-opportunity network access. |
| Peggy AI | `/peggy-ai` | Guided intake and routing support. |

## Legacy Redirects

Legacy routes remain in `client/src/App.tsx` so old links do not break, but
they should not be used in new public copy or navigation:

- `/sell` -> `/submit?intent=sell`
- `/submit-deal` -> `/submit?intent=deal-jv`
- `/submit-property` -> `/submit?intent=property`
- `/resources` -> `/library`
- `/invest` and `/partner` -> `/capital`
- `/services` -> `/development`
- `/buy`, `/dealflow`, `/portal`, `/marketplace`, and marketplace descendants -> MarketFlow equivalents.

## Update Rule

When changing public navigation, update these in the same pass:

1. `client/src/config/navigation.ts`
2. `client/src/components/navigation.tsx` metadata for More menu items
3. `client/src/components/footer.tsx` if footer-only links change
4. Route tests covering nav parity, public voice, and keyboard traversal
5. This file
