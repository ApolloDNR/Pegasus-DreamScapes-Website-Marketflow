# Doctrine Plates — Day/Night Pair Manifest (v9)

One classical world, photographed twice: every plate exists as a **night** and a **day**
version of the *same architecture* (day versions generated with the night plate as the
reference image, so the building never changes — only the light). The site's theme toggle
swaps the entire visual world. All plates are 2K; generated imagery is atmosphere-only
per the locked media policy; case evidence (Nelson Drive) is real photography.

| Pair | Night job | Day job | Used in |
|---|---|---|---|
| The Temple | `670bdc4c-b2f3-4c06-9dbd-63c1db909763` | `f743f896-153d-4ee9-acc8-cfae5a638d42` | Hero |
| The Colonnade | `e13964d0` (2K up of `c7898eff`) | `ef99df86-5fc2-4677-9306-eb17e23c8fb4` | "Door is open" chapter |
| The Doorway | `f9edcb0b-5118-4096-b256-3161c0f1b0c2` | `1a78f2e3-e59c-48e4-996b-5311e652a85c` | Who We Serve |
| The East Bay | `04b667fd-09a2-44fc-bffc-3b0121041527` | `68efe569-aa30-48c0-9d9f-639dc3bf6744` | Operator |
| The Carved Record | `064bcda5-bc72-4f74-a86a-d5a1a9ecaf85` | `c1534da8-70fe-45c3-89aa-c7c87e24b085` | Nelson Ledger slab |

## The Passage footage (scroll-scrubbed)

Two Seedance 2.0 walks through the same colonnade, both upscaled to 2K
(ByteDance video upscale, aigc preset) before frame extraction, so the
scrub is sharp — frames are cut at 1600px wide, 6 fps (48 frames per set):

- Night walk: `f1c73b33-552b-4618-a6f9-86141d3ae04f` → 2K master `f02d662e-0904-432a-993f-04d3e709b2f1` → `plates/walk-night/`
- Day walk: `7d243ed9-3fa1-4887-9d50-7b0f1df4ee95` (start frame = day colonnade) → 2K master `608c1245-b5db-4d2c-b2bb-378a8681b7ad` → `plates/walk-day/`
- `plates/passage-walk.mp4` (720p night walk) remains as the ambient chapter video.

All fetching and extraction is done by `.github/workflows/fetch-doctrine-plates.yml`
on push (GitHub runners fetch the generation CDN; this build container cannot).
CDN base: `https://d8j0ntlcm91z4.cloudfront.net/user_3EqMQTGQ3AQXoXTWf2covcEGyhp/`

## Standing placeholders

- KW corporate license number — pending.
- Intake form is front-end gated (nothing transmitted) until the RLS hotfix clears.
- Nelson Drive figures are real, from the closing statement and project records, rounded.
