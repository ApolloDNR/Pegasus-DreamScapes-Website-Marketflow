/* ----------------------------------------------------------------
   Strategy-tier ranges (illustrative · education only)

   The Strategy Lab never returns a number or a verdict on a visitor's
   specific property. Instead it frames the strategy the inputs point
   toward and shows an ILLUSTRATIVE range typically seen across
   comparable East Bay cycles for that strategy. These ranges are NOT
   computed from the visitor's inputs, are NOT a track-record claim, and
   are NOT a prediction, valuation, appraisal, CMA, or BPO of any
   specific property. A real, property-specific read comes from a written
   Property Read after a submission.

   Resolver accepts either a shared-engine lane key (flip, brrrr,
   rental_hold, …) or a human label ("Value-Add Rehab → Retail") and
   matches by keyword, so it works for both the pegasus prototype surfaces
   and the classic working tool.
---------------------------------------------------------------- */

export const NOT_A_VALUATION_DISCLOSURE =
  "Illustrative ranges only. Not a valuation, appraisal, CMA, or BPO of any specific property.";

export interface TierRange {
  /** Display name of the strategy the range illustrates. */
  strategy: string;
  /** Illustrative figure or band (e.g. "$80K–$160K", "5%–8%"). */
  range: string;
  /** What the range measures and where it is drawn from. */
  basis: string;
}

const TABLE: { match: RegExp; value: TierRange }[] = [
  {
    match: /brrrr/i,
    value: { strategy: "BRRRR", range: "$40K–$90K", basis: "equity captured at refinance across comparable cycles" },
  },
  {
    match: /ground[_\s-]?up|new[_\s-]?construction/i,
    value: { strategy: "Ground-Up Development", range: "$150K–$350K", basis: "value created across comparable ground-up builds" },
  },
  {
    match: /adu|development/i,
    value: { strategy: "ADU / Development", range: "$120K–$250K", basis: "added value across comparable ADU builds" },
  },
  {
    match: /wholetail/i,
    value: { strategy: "Wholetail", range: "$30K–$80K", basis: "spread on a light-lift resale across comparable cycles" },
  },
  {
    match: /flip|value[-\s]?add|rehab/i,
    value: { strategy: "Value-Add Rehab → Retail", range: "$80K–$160K", basis: "gross spread across comparable East Bay cycles" },
  },
  {
    match: /wholesale|assign|deal[_\s-]?finder/i,
    value: { strategy: "Wholesale / Assignment", range: "$15K–$45K", basis: "assignment spread across comparable cycles" },
  },
  {
    match: /multifamily|small[_\s-]?multi/i,
    value: { strategy: "Small Multifamily", range: "6%–9%", basis: "stabilized yield across comparable cycles" },
  },
  {
    match: /rental|hold|rent|buy[_\s-]?hold/i,
    value: { strategy: "Hold / Rent", range: "5%–8%", basis: "cash-on-cash yield across comparable cycles" },
  },
  {
    match: /jv|partner|capital/i,
    value: { strategy: "Partner / JV", range: "structure-dependent", basis: "split set by a written agreement, not a fixed figure" },
  },
  {
    match: /marketflow|disposition/i,
    value: { strategy: "MarketFlow Disposition", range: "network-dependent", basis: "routing depends on authorization, fit, and real participant availability" },
  },
  {
    match: /retail|listing|referral/i,
    value: { strategy: "Retail Listing", range: "market-rate", basis: "net after standard exit costs" },
  },
  {
    match: /as[_\s-]?is|acquisition/i,
    value: { strategy: "As-Is Acquisition", range: "$30K–$80K", basis: "basis advantage at acquisition across comparable cycles" },
  },
];

const FALLBACK: TierRange = {
  strategy: "Strategy review",
  range: "varies by submarket tier",
  basis: "depends on basis, scope, and exit; any later Property Read is conditional on fit and capacity",
};

/** Resolve an illustrative tier range from a lane key or strategy label. */
export function tierRangeFor(input: string | null | undefined): TierRange {
  if (!input) return FALLBACK;
  const found = TABLE.find((row) => row.match.test(input));
  return found ? found.value : FALLBACK;
}
