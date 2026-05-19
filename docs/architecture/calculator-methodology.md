# Calculator Methodology — Pegasus Dreamscapes

Authoritative reference for every formula behind the eight `/strategy-lab/classic` calculators and the Strategy Lab engine. Owners of this doc: anyone changing math in `shared/lib/calculator-math.ts`, `shared/strategy-lab/calculator-adapters.ts`, or `shared/strategy-lab/index.ts` must update this file in the same PR.

## Doctrine

1. **No silent fallbacks.** A missing or invalid input either (a) renders a `ValidationNote` and clamps to a clearly-stated safe value, or (b) returns 0 and the verdict surface tells the user the math is empty. `||0` is acceptable for additive expense fields where 0 is a meaningful answer; it is forbidden for divisors, hold horizons, and LTV-style inputs where 0 changes the structural meaning of the deal.
2. **Surface every assumption.** Every calculator carries an `AssumptionsPanel` (collapsible) listing every default the user did not type — vacancy, management, closing reserve, tax rate, insurance, refi LTV, etc. — and a `FormulaReveal` (collapsible) printing the exact arithmetic in plain text.
3. **Conservative scenarios are the default.** The Strategy Lab Base scenario applies the SCENARIO_DELTAS for the Base column; the Quick Read uses Base-equivalent defaults so a user clicking through the funnel sees the same numbers Apollo would underwrite against.

---

## Common building blocks (`shared/lib/calculator-math.ts`)

### `monthlyPayment(principal, annualRatePct, termYears)`
Standard fully-amortizing mortgage payment. `P × r / (1 − (1+r)^-n)`. Returns `principal / termMonths` when rate is 0; returns 0 when principal is 0.

### `interestOnlyMonthly(principal, annualRatePct)`
`principal × annualRatePct / 12 / 100`. Used by hard-money holding cost stacks.

### `amortizationSchedule(...)`
Month-by-month principal/interest split. Used by Own-vs-Rent and ROI exit calculations to derive remaining balance at year N.

### `noiAnnual(grossRentMonthly, monthlyExpenses)`
`(grossRentMonthly − monthlyExpenses) × 12`. Operating-expense-only NOI (debt service excluded by convention).

### `capRate(annualNOI, propertyValue)`
`NOI ÷ value × 100`. Returns 0 when value is 0.

### `cashOnCash(annualCashFlow, totalCashInvested)`
`annualCashFlow ÷ totalCashInvested × 100`. When `totalCashInvested ≤ 0` and `annualCashFlow > 0`, BRRRR/ROI adapters set `infiniteReturn = true` instead of dividing.

---

## Calculator 1 — ARV / 70% Rule (`computeArv` in `calculator-adapters.ts`)

**Purpose:** "Given a purchase price, rehab, and after-repair value, what is the project ROI — and does the deal clear the 70% rule?"

**Inputs:** purchase, rehab, ARV, holding costs, `closingPercent` (% of ARV, default 6%).

**Formula:**
```
closingAmount      = ARV × closingPercent/100
totalInvestment    = purchase + rehab + holding
potentialProfit    = ARV − totalInvestment
netProfit          = potentialProfit − closingAmount
roi                = totalInvestment > 0
                     ? (netProfit ÷ totalInvestment) × 100
                     : 0
seventyPercentRule = ARV × 0.70 − rehab        // benchmark MAO
meetsRule          = purchase ≤ seventyPercentRule
```

**Assumptions surfaced:** Closing costs default to 6% of ARV (agent commissions + title). Holding defaults to 0 — must be entered. 70% rule is shown as a benchmark next to the user's actual purchase price.

**Edge cases:**
- `totalInvestment = 0` → ROI returns 0, not NaN.
- Negative `netProfit` surfaces directly — it tells the user the deal does not pencil at this ARV.
- `meetsRule` is purely informational; the calculator does not block negative-margin scenarios.

---

## Calculator 2 — Fix & Flip ROI / Cash Flow (`computeRoi` in `calculator-adapters.ts`)

**Purpose:** Cash-on-cash and cap rate for a financed rental purchase (despite the historical "ROI" label).

**Inputs:** purchase, `downPaymentPct` (default 25%), rehab, monthly rent, monthly expenses, rate %, term years.

**Formula:**
```
downPaymentAmount = purchase × downPaymentPct/100
loanAmount        = purchase − downPaymentAmount
monthlyMortgage   = loanAmount > 0
                    ? monthlyPayment(loanAmount, ratePct, termYears)
                    : 0
monthlyCashFlow   = monthlyRent − monthlyExpenses − monthlyMortgage
annualCashFlow    = monthlyCashFlow × 12
totalCashInvested = downPaymentAmount + rehab
cashOnCashReturn  = totalCashInvested > 0
                    ? (annualCashFlow ÷ totalCashInvested) × 100
                    : 0
annualNOI         = (monthlyRent − monthlyExpenses) × 12
capRate           = purchase > 0
                    ? (annualNOI ÷ purchase) × 100
                    : 0
```

**Assumptions surfaced:** down payment default 25%, rate default 7.5%, term default 30 yr. Vacancy / management / capex are bundled into the user's `monthlyExpenses` (NOT auto-added by the engine — the AssumptionsPanel makes this explicit).

**Edge cases:**
- 100% down (`downPaymentPct ≥ 100`) → `loanAmount = 0`, `monthlyMortgage = 0`. Cap rate still computes; CoC becomes (annualCashFlow ÷ rehab) or 0 when rehab is also 0. The UI surfaces an info-level ValidationNote in this case.
- `purchase = 0` → both `capRate` and `cashOnCashReturn` floor at 0.
- `totalCashInvested = 0` → CoC returns 0, not Infinity (no infinite-return claim in this adapter; that semantic is reserved for BRRRR).

---

## Calculator 3 — BRRRR

**Purpose:** Buy, Rehab, Rent, Refinance, Repeat — what stays in the deal after refi.

**Inputs:** Purchase, rehab, ARV, monthly rent, monthly opex, refi LTV (default 75%), refi rate (default 7.5%), optional `existingLoanBalance`.

**Formula:**
```
totalCashIn       = purchase + rehab
refinanceValue    = ARV × refiLTV/100
existingLoanPayoff = max(0, existingLoanBalance ?? 0)
cashBack          = max(0, refinanceValue − existingLoanPayoff)
cashLeftInDeal    = max(0, totalCashIn − cashBack)
monthlyMortgage   = monthlyPayment(refinanceValue, refiRate, 30)
monthlyCashFlow   = monthlyRent − monthlyExpenses − monthlyMortgage
cashOnCash        = (monthlyCashFlow × 12) ÷ cashLeftInDeal × 100
infiniteReturn    = cashLeftInDeal ≤ 0 && monthlyCashFlow > 0
```

**Why the `existingLoanPayoff` line exists (regression fix #110):** the previous implementation treated `cashBack = refinanceValue` directly. That overstated returns when the user had financed the acquisition with hard money or a DSCR loan that the refinance must retire. The new line nets the payoff first, defaults to 0 when the user is doing all-cash BRRRR (preserves prior parity tests), and floors at 0 so a thin refinance does not show a negative "cash back."

**Assumptions surfaced:** acquisition method (all-cash unless `existingLoanBalance` is supplied), refi LTV, refi rate/term, refi closing costs not separately modeled.

---

## Calculator 4 — Rental Cash Flow

**Purpose:** Monthly cash flow, NOI, cap rate, expense ratio.

**Inputs:** Gross rent, vacancy % (default 5%), property tax, insurance, maintenance, management % (default 10%), utilities, other, monthly mortgage.

**Formula:**
```
EGI                = grossRent × (1 − vacancyPct/100)
operatingExpenses  = propertyTax + insurance + maintenance
                   + grossRent × managementPct/100
                   + utilities + other
NOI                = EGI − operatingExpenses     (monthly basis)
monthlyCashFlow    = NOI − monthlyMortgage
expenseRatioPct    = operatingExpenses ÷ grossRent × 100
```

**Assumptions surfaced:** vacancy default 5% (B/C markets often need 8–10%), management default 10%, capex reserve not auto-added.

---

## Calculator 5 — Wholesale / MAO

**Purpose:** Maximum allowable offer to seller for an assignment.

**Inputs:** ARV, rehab, buyer profit % (default 25%), closing % (default 6%), holding $, desired assignment fee.

**Formula:**
```
MAO              = ARV − rehab − holding − ARV × closingPct/100 − ARV × buyerProfitPct/100
maxOfferToSeller = max(0, MAO − assignmentFee)
feePctOfMAO      = assignmentFee ÷ MAO × 100
```

**Assumptions surfaced:** buyer profit target 25% (institutional flip benchmark), assignment fee viability bands (`≤40% great · ≤60% good`).

**Edge cases:**
- When rehab + costs exceed ARV after buyer profit, `MAO` and `maxOfferToSeller` floor at 0. Negative MAO is structurally meaningless — it means the deal cannot be wholesaled at this ARV / rehab combination.

---

## Calculator 6 — PITI / 28-36 Affordability

**Purpose:** Maximum house price based on 28% / 36% Front/Back DTI.

**Inputs:** Gross annual income, monthly debts, down payment %, mortgage rate, term, annual property tax %, monthly insurance.

**Formula:**
```
grossMonthlyIncome = grossAnnualIncome ÷ 12
housingCap         = grossMonthlyIncome × 0.28
totalDebtCap       = grossMonthlyIncome × 0.36 − monthlyDebts
bindingCap         = min(housingCap, totalDebtCap)
nonPI              = (price × annualTaxPct/100)/12 + monthlyInsurance
                     — solved iteratively against bindingCap
maxLoan            = (bindingCap − nonPI) × annuityFactor(rate, term)
maxPurchasePrice   = maxLoan ÷ (1 − downPaymentPct/100)
```

**Regression fix #110 (100%-down case):** Previously `maxPurchasePrice = maxLoan ÷ (1 − 1) = ∞`. We now short-circuit: when `downPaymentPct ≥ 100`, both `maxLoan` and `maxPurchasePrice` return 0. The UI also renders a `ValidationNote` explaining that there is no loan to size against, so the 28/36 rule no longer constrains the price — cash on hand is the only constraint.

**Assumptions surfaced:** 28/36 rule definition, fixed-rate term, PMI/HOA not modeled (fold into insurance), tax/insurance defaults.

---

## Calculator 7 — Own vs Rent

**Purpose:** Side-by-side net-worth path for buying vs renting + investing the difference, across three appreciation scenarios.

**Inputs:** Price, down %, rate, term, monthly rent, rent growth %, investment return %, maintenance %, tax %, insurance, HOA, years.

**Formula (per year y, per scenario s ∈ {2%, 4%, 6%}):**
```
ownerNetWorth(y)  = price × (1 + s/100)^y − loanBalance(y)
                  + cumulativePrincipalPaydown(y)
renterNetWorth(y) = downPaymentInvested × (1 + rPct/100)^y
                  + Σ max(0, ownerMonthly − rent(y)) × 12
crossoverYear     = first y where ownerNetWorth ≥ renterNetWorth
```

`ownVsRentScenarios` returns the three series for the chart. Crossover year is `null` if renter wins for the full horizon (rendered as "Renter wins" in the verdict).

**Assumptions surfaced:** three appreciation paths (2/4/6%), rent growth default, investment return default (S&P-ish baseline), maintenance %, tax/insurance/HOA.

---

## Calculator 8 — Hard Money / Holding Cost

**Purpose:** True cost-of-capital stack for short-term hard money, including breakeven sale price and effective APR.

**Inputs:** Purchase, rehab, LTC %, points %, rate %, months held, origination $, annual tax %, monthly insurance, monthly utilities, selling cost % (default 7%).

**Formula:**
```
loanAmount        = (purchase + rehab) × ltcPct/100
cashRequired      = (purchase + rehab) − loanAmount + points × loanAmount/100 + originationFee
monthlyInterest   = interestOnlyMonthly(loanAmount, ratePct)
totalInterest     = monthlyInterest × monthsHeld
totalHoldingCost  = pointsCost + originationFee + totalInterest
                  + (taxMo + insMo + utilMo) × monthsHeld
totalCashIntoDeal = cashRequired + totalHoldingCost
breakevenSale     = (totalCashIntoDeal + loanAmount) ÷ (1 − sellingCostPct/100)
totalFinanceCost  = pointsCost + originationFee + totalInterest
effectiveAPR      = (totalFinanceCost ÷ loanAmount) × (12 ÷ monthsHeld) × 100
```

**Regression fix #110 (zero-months bug):** the previous component used `parseInt(months) || 6`, silently substituting 6 months whenever the user typed `0`. Hard money lenders quote terms by month; "0" is not a meaningful default. We now distinguish three states:

1. **Empty input** → display the placeholder default (6 months), no warning.
2. **Valid integer ≥ 1** → use it.
3. **`0`, negative, or non-integer** → clamp to 1 month for the math AND render a `ValidationNote` telling the user to enter a real hold horizon (typically 3–12 months). The Assumptions panel then labels the hold horizon "Adjusted from your input."

**Assumptions surfaced:** LTC default, points policy (due at close), interest-only payment style, hold horizon (with adjusted-from-input note when clamped), selling costs default 7%.

---

## Strategy Lab engine (`shared/strategy-lab/index.ts`)

`runStrategyLab(property, options)` consumes a `PropertyInput` and returns a `StrategySnapshot` (lane scores, top 3 lanes, capital stack, risk register, decision memo frame).

**`effectivePrice` (regression fix #110):** the engine and `scenarios.ts` use
```
effectivePrice = property.purchasePrice ?? property.askingPrice
```
everywhere price flows into capital stack, closing reserve, tax basis, and cap rate. This lets Full Path users explore "what if I offer $X instead of asking?" without mutating the listing fields. Quick Read does not expose `purchasePrice`, so it falls through to `askingPrice` as before — existing parity tests continue to pass.

**Hidden defaults (now surfaced in Quick Read assumptions panel):**
- Closing reserve: 3% of price
- Vacancy (rental scenarios): 8%
- Property management: 8% of rent
- Property tax: 1.1% per year of price
- Insurance: $150/month
- Acquisition loan: 75% LTV, 7.5%, 30 yr (when scenarios assume financing)

These match Apollo's underwriting baseline for the Northern California submarkets the funnel currently serves. Full Path users can override every one.

---

## Testing

`client/src/__tests__/calculator-math.test.ts` covers:

- `monthlyPayment` — canonical figure (200k @ 7% / 30 yr ≈ $1,330.60), zero-rate, zero-principal.
- `housingAffordability28_36` — 100% down returns 0/0; 20% down produces sane price; max loan ≈ 80% of max price.
- `computeBrrrr` — all-cash (full refi to investor), $150k existing loan (cash back = refi − payoff), thin refi (cash back floors at 0).
- `holdingCostStack` — 1-month clamp produces finite stack and APR.
- `computeArv` / `computeRoi` — guard divisions against NaN, surface `infiniteReturn` flag.
- `computeWholesale` — negative MAO floors at 0.
- `ownVsRentScenarios` — three monotonic appreciation paths.
- Sensitivity matrix, breakeven solvers, exit projection — covered by pre-existing canonical tests.

`client/src/__tests__/calculator-parity.test.ts` locks the adapter outputs against historical fixtures so an engine refactor cannot silently change numbers.

Run with `npm test` (or `npm run test:watch` while iterating).

---

## Citations and source authorities

Every default in this document traces back to a public source. When you change a default, update the corresponding citation in the same PR.

| Formula / Default | Authority |
|---|---|
| 28/36 front-end / back-end DTI rule (PITI calculator) | Fannie Mae Selling Guide, B3-6-02 "Debt-to-Income Ratios" — `https://selling-guide.fanniemae.com/`. Also CFPB consumer guidance on qualified mortgages. |
| Fully-amortizing monthly payment (`P × r / (1 − (1+r)^−n)`) | Standard annuity formula. See *Brealey, Myers & Allen, Principles of Corporate Finance*, ch. 2 (time value of money). |
| 70% rule for fix-and-flip MAO | Long-standing investor heuristic; codified in BiggerPockets' Ultimate Beginner's Guide and J. Scott, *The Book on Flipping Houses* (BiggerPockets, 2019). |
| BRRRR sequence and refinance-mechanics framing | David Greene, *Buy, Rehab, Rent, Refinance, Repeat* (BiggerPockets, 2019). Cash-back-minus-payoff semantics validated against Fannie Mae cash-out refinance guidelines (Selling Guide B2-1.3-03). |
| Vacancy default 8% (Base) / 10% / 12% | NAR / U.S. Census Bureau Housing Vacancy Survey (HVS) — national rental vacancy ranges 6–11% over the last decade; 8% chosen as the Base reflecting CA submarkets the funnel currently serves. |
| Property management 8% of collected rent | National Association of Residential Property Managers (NARPM) member fee surveys consistently report 8–12% of gross rents for single-family residential PM. 8% is the low-end baseline. |
| Closing reserve 3% of price | HUD-1 / Closing Disclosure typical buyer-side closing-cost range of 2–5% (CFPB "Your home loan toolkit"). 3% is a conservative middle-of-the-road default. |
| Selling cost 7% of resale price (Hard Money, Fix & Flip exit) | NAR commission survey + typical state transfer-tax / title-insurance loadings (≈ 6% commission + 1% closing). |
| Property tax 1.1% per year of price | California statewide effective property tax rate (CA Board of Equalization). Conservative midpoint for the Northern California submarkets in scope. |
| Insurance $150 / mo | Insurance Information Institute (III) "Facts + Statistics: Homeowners and renters insurance" — national HO-3 mean premium ≈ $1,400/yr ≈ $117/mo; $150 carries a small loading for CA wildfire risk. |
| Loan default 75% LTV / 7.5% / 30 yr | DSCR / conventional investment-property loan ranges per Fannie Mae Selling Guide B2-1.2-01 (max LTV 75% for 1-unit investment cash-out refinance) and Freddie Mac PMMS weekly rate survey (representative rate at the time of writing). |
| Hard money 90% LTC / 2 points / 12% interest-only | Industry standard for short-term fix-and-flip bridge debt; ranges from Kiavi, Lima One Capital, and RCN Capital published rate sheets. Treated as templates, not endorsements. |
| Buyer-profit target 25% of ARV (Wholesale MAO) | Institutional iBuyer / flip-fund underwriting heuristic; appears in J. Scott (*Flipping Houses*) and BiggerPockets wholesale guides. |
| Own-vs-Rent 2% / 4% / 6% appreciation triplet | FHFA House Price Index long-run national mean ≈ 3.9% nominal CAGR (1991–2024). 4% is the long-run baseline; 2% / 6% bracket cooling and overheated regimes. |
| Renter investment-return default 6% | Long-run real total return of a diversified equity portfolio (Damodaran NYU Stern data set: equity risk premium + risk-free rate). 6% is a real, post-inflation conservative default. |

If you change a number, change the citation. If you cannot cite the source, do not change the number.

