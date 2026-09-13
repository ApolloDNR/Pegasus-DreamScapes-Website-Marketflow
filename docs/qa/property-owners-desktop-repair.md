# Property Owners desktop repair

The owner reported that `/property-owners` broke on a computer after the previous presentation pass. The earlier rendered checks stopped at 1440 pixels and did not catch the layout shrinking its text column on wider screens.

## Cause and correction

The hero combined a capped 1240px wrapper with `padding-right: calc(48% + 3.5rem)`. Percentage padding resolved against the wider containing section. Increasing the viewport therefore consumed the text column. The absolutely positioned photograph stretched vertically with that copy.

The replacement uses two real grid columns inside one capped container. Copy and photograph have explicit, independent geometry; the photograph has a landscape aspect ratio. Tablet and phone layouts stack the same content. The approved navy bookcloth, copper accents, ivory type, actual Nelson photograph, and existing destinations remain.

The repair also reduces the oversized headline, makes actions readable, removes duplicate photo captions, shortens section headings, and gives the process and submission boundaries more consistent spacing. The case-by-case participation statement moves from the hero into the existing submission-boundary section. All nine owner situations, recommendations, intake prefill values, and submission limits remain.

## Review criteria

| Area | Previous observation | Required result |
| --- | --- | --- |
| Opening | About 991px high at a 1363px browser viewport; photograph about 483 by 732px | Contained copy/photo columns, landscape photograph, proportionate opening |
| Wide desktop | Text width decreases beyond the wrapper maximum | Both columns remain at least 420px wide at 1920px and 2560px |
| Text and actions | Hidden hero overflow can conceal the broken layout | Headline, paragraph, and primary action remain inside the copy column and hero |
| Supporting sections | Oversized headings and uneven density | Clear selector, readable recommendation, coherent two-column process |
| Navigation | Owner inquiry context must survive the visual change | Existing nine-situation selection and intake-prefill checks remain intact |

## Verification

Local TypeScript, the production build, bundle budgets, deployment-entry checks, and 64 focused tests across five files passed. The rendered workflow now measures the owner hero at 1920x1080 and 2560x1440 in both themes, including column dimensions, overlap, clipping, opening height, and an actionable primary link. Existing phone/tablet routes and interaction checks remain enabled.

The exact published commit, current workflow result, protected preview, and hosted visual-review evidence are recorded in PR #26. Local checks alone do not certify the hosted result or production activation.
