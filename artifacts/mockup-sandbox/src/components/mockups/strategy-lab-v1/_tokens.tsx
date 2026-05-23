export const T = {
  midnight: "#1A2332",
  navy: "#243044",
  copper: "#C87A3A",
  copperSoft: "#E0B98F",
  cream: "#D4CFC4",
  creamSoft: "#ECE8DF",
  rule: "rgba(26,35,50,0.14)",
  ruleDark: "rgba(255,255,255,0.14)",
  muted: "rgba(26,35,50,0.62)",
  mutedDark: "rgba(212,207,196,0.7)",
  serif: '"Playfair Display", Georgia, serif',
  sans: '"Inter", system-ui, sans-serif',
};

export const FONT_LINK = (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');`}</style>
);

export const STRATEGIES_14 = [
  { name: "Wholesale Assignment", score: 18, why: "Spread is too thin once title clears.", base: "$3k–$6k assignment fee", stressed: "Breakeven", worst: "Negative after escrow." },
  { name: "Light Cosmetic Flip", score: 84, why: "Cosmetic-only scope; broad retail buyer pool.", base: "$58k net at $610k ARV", stressed: "$32k net", worst: "$4k net if rates drift +75bps." },
  { name: "Value-Add Flip", score: 79, why: "Kitchen + bath unlock a clear $80k ARV bump.", base: "$72k net", stressed: "$41k net", worst: "$9k net if rehab overruns 18%." },
  { name: "BRRRR (Refi & Hold)", score: 88, why: "Refi pulls 92% of capital back at $610k ARV.", base: "$42k left in · $310/mo cashflow", stressed: "$58k left in · $190/mo", worst: "$110k stuck · $40/mo." },
  { name: "Buy & Hold (Long-Term Rental)", score: 71, why: "Rent supports DSCR at 1.18x in base case.", base: "$340/mo cashflow · 6.8% CoC", stressed: "$140/mo · 2.9% CoC", worst: "−$80/mo if vacancy >9%." },
  { name: "Mid-Term Rental", score: 64, why: "30–90 day demand from regional medical traffic.", base: "$680/mo cashflow", stressed: "$320/mo", worst: "−$90/mo at 60% occupancy." },
  { name: "Section 8 Hold", score: 58, why: "Voucher rate near market; modest premium.", base: "$390/mo cashflow", stressed: "$210/mo", worst: "−$30/mo on heavy turn." },
  { name: "ADU Add", score: 76, why: "Lot supports detached ADU; zoning permissive.", base: "Adds $72k ARV / $1.6k rent", stressed: "Adds $48k ARV / $1.2k rent", worst: "Adds $22k ARV if permits slip." },
  { name: "Lot Split / Subdivide", score: 42, why: "Lot meets minimum but front access is tight.", base: "+$85k uplift if approved", stressed: "+$30k", worst: "Sunk $14k in soft costs." },
  { name: "Owner-Finance Hold", score: 49, why: "Owner open to terms; carryback at 6.25%.", base: "$420/mo + $40k DP", stressed: "$280/mo + $25k DP", worst: "Default at month 18." },
  { name: "Subject-To Acquisition", score: 38, why: "Existing loan is 3.1%; due-on-sale risk live.", base: "$95k equity captured", stressed: "$58k equity", worst: "Loan called within 6 mo." },
  { name: "Master Lease + Sublet", score: 22, why: "Owner not motivated for sandwich structure.", base: "$180/mo spread", stressed: "$60/mo", worst: "Owner exits at month 12." },
  { name: "Land Bank / Hold Vacant", score: 14, why: "Carry costs outpace appreciation in this submarket.", base: "Flat", stressed: "−$2k/yr", worst: "−$6k/yr after tax reset." },
  { name: "Development Entitlement", score: 11, why: "Parcel too small; doctrine Phase 2 capability.", base: "N/A — out of current scope", stressed: "—", worst: "—" },
];
