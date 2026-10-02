/**
 * Canonical public facts for the Nelson Drive case study.
 *
 * Keep all public surfaces aligned to this record. The gross spread is simple
 * arithmetic, not profit, return, or proof of who performed each project role.
 */
export const NELSON_FACTS = Object.freeze({
  slug: "nelson-dr",
  name: "Nelson Dr",
  address: "4369 Nelson Drive",
  city: "Richmond",
  state: "CA",
  postalCode: "94803",
  areaLabel: "Richmond / El Sobrante Area",
  acquired: 600_000,
  improvementBudget: 105_000,
  totalBasisBeforeOtherCosts: 705_000,
  salePrice: 840_000,
  grossSpreadBeforeOtherCosts: 135_000,
  settled: "September 2025",
});

export const NELSON_PUBLIC_DESCRIPTION =
  "A completed East Bay residential transformation documented at an approximate $600K acquisition, $105K improvement budget, and $840K sale.";

export const NELSON_PUBLIC_HIGHLIGHTS = [
  "Acquisition ≈ $600K",
  "Improvement budget ≈ $105K",
  "Sale ≈ $840K",
] as const;

export const NELSON_COST_DISCLOSURE =
  "The $135K gross spread is $840K less the $600K acquisition and $105K improvement budget. It is not net profit or return and excludes financing, holding, transaction, tax, commission, insurance, legal, and other project-specific costs.";

export const NELSON_EXECUTION_DISCLOSURE =
  "The limited public record does not identify every contractor, license, permit, vendor, financing, brokerage, or project-management role. The case study therefore does not assign those services to Pegasus or any individual without separate evidence.";
