import {
  LANE_LABELS,
  LANE_VERDICT_LABELS,
  STRATEGY_LANES,
  type LaneFitVerdict,
  type StrategyLane,
} from "@shared/strategy-lab/types";

type UnknownRecord = Record<string, unknown>;

const MAX_FINANCIAL_VALUE = 1_000_000_000_000;
const MAX_MODEL_VALUE = 1_000_000_000_000_000;
const STRATEGY_LANE_SET = new Set<string>(STRATEGY_LANES);
const VERDICT_SET = new Set<string>([
  "strong", "possible", "weak", "needs_more_data", "not_recommended",
]);
const RISK_CATEGORY_SET = new Set<string>([
  "title", "permit", "construction", "valuation", "financing",
  "timeline", "exit", "occupancy", "market",
]);
const RISK_SEVERITY_SET = new Set<string>(["info", "watch", "high", "blocker"]);
const CAPITAL_SOURCE_SET = new Set<string>([
  "down_payment", "rehab_cash", "hard_money", "private_money",
  "conventional", "dscr_refi", "seller_carry", "jv_equity", "closing_reserve",
]);

export const PUBLIC_ANALYSIS_OUTPUT_CONTEXT = Object.freeze({
  source: "user_entered_inputs_and_automated_model" as const,
  verifiedByPegasus: false as const,
  label: "Generated from user-entered, unverified inputs and automated model assumptions.",
  disclaimer:
    "This shared output does not represent a Pegasus review or recommendation, offer, valuation, appraisal, financing commitment, or guarantee.",
});

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as UnknownRecord;
}

export function sanitizePublicText(value: unknown, maxLength = 240): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value
    .normalize("NFKC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, "")
    .trim();
  return clean ? clean.slice(0, maxLength) : undefined;
}

function sanitizeIsoDate(value: unknown): string | undefined {
  const date = value instanceof Date
    ? value
    : typeof value === "string" || typeof value === "number"
      ? new Date(value)
      : null;
  return date && Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

function sanitizeNumber(
  value: unknown,
  min = -MAX_MODEL_VALUE,
  max = MAX_MODEL_VALUE,
): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    return undefined;
  }
  return value;
}

function sanitizeInteger(value: unknown, min: number, max: number): number | undefined {
  const clean = sanitizeNumber(value, min, max);
  return clean === undefined ? undefined : Math.trunc(clean);
}

function sanitizeBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function sanitizeEnum(value: unknown, allowed: ReadonlySet<string>): string | undefined {
  return typeof value === "string" && allowed.has(value) ? value : undefined;
}

function prefixModelNarrative(value: unknown, prefix: string, maxLength = 1200): string {
  const clean = neutralizeUnverifiedAttribution(
    sanitizePublicText(value, maxLength) ?? "No model narrative was provided.",
  );
  if (clean.startsWith(prefix)) return clean;
  return `${prefix}${clean}`.slice(0, maxLength + prefix.length);
}

function neutralizeUnverifiedAttribution(value: string): string {
  return value
    .replace(
      /\bPegasus(?:\s+DreamScapes(?:\s+Corp\.?)?)?\s+(?:has\s+)?reviewed?\b/gi,
      "the automated model processed",
    )
    .replace(
      /\bPegasus(?:\s+DreamScapes(?:\s+Corp\.?)?)?\s+(?:recommends?|recommendation)\b/gi,
      "automated model consideration",
    )
    .replace(/\brecommends?\b/gi, "indicates")
    .replace(/\bno lead dies\b/gi, "No follow-up or outcome is promised")
    .replace(
      /\bevery (?:submission|property)[^.]{0,100}\b(?:reviewed|review)\b/gi,
      "A separate human review may be requested",
    );
}

function sanitizeStringArray(
  value: unknown,
  maxItems: number,
  maxLength: number,
  prefix?: string,
): string[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maxItems).flatMap((item) => {
    const clean = sanitizePublicText(item, maxLength);
    if (!clean) return [];
    return [prefix ? prefixModelNarrative(clean, prefix, maxLength) : clean];
  });
}

function assignIfDefined(target: UnknownRecord, key: string, value: unknown): void {
  if (value !== undefined) target[key] = value;
}

function sanitizePropertyInput(value: unknown, full: boolean): UnknownRecord {
  const input = asRecord(value) ?? {};
  const output: UnknownRecord = {};
  assignIfDefined(output, "address", sanitizePublicText(input.address, 240));
  assignIfDefined(output, "city", sanitizePublicText(input.city, 120));
  assignIfDefined(output, "state", sanitizePublicText(input.state, 8));
  assignIfDefined(output, "zip", sanitizePublicText(input.zip, 12));
  if (!full) return output;

  for (const field of [
    "askingPrice", "purchasePrice", "asIsValueEstimate", "rehabBudget",
    "arvEstimate", "marketRent", "existingMortgageBalance", "monthlyHoa",
    "monthlyInsurance",
  ] as const) {
    assignIfDefined(output, field, sanitizeNumber(input[field], 0, MAX_FINANCIAL_VALUE));
  }
  assignIfDefined(output, "monthlyTaxAnnualPct", sanitizeNumber(input.monthlyTaxAnnualPct, 0, 100));
  assignIfDefined(output, "sqft", sanitizeNumber(input.sqft, 0, 100_000_000));
  assignIfDefined(output, "lotSqft", sanitizeNumber(input.lotSqft, 0, 1_000_000_000));
  assignIfDefined(output, "beds", sanitizeNumber(input.beds, 0, 100));
  assignIfDefined(output, "baths", sanitizeNumber(input.baths, 0, 100));
  assignIfDefined(output, "yearBuilt", sanitizeInteger(input.yearBuilt, 1600, 2200));
  assignIfDefined(
    output,
    "condition",
    sanitizeEnum(input.condition, new Set(["turnkey", "light", "moderate", "heavy", "gut"])),
  );
  output.knownIssues = sanitizeStringArray(input.knownIssues, 20, 240);
  for (const field of [
    "titleClouded", "permitConcerns", "financingCommitted",
    "developmentPotential", "zoningAllowsAdu",
  ] as const) {
    assignIfDefined(output, field, sanitizeBoolean(input[field]));
  }
  assignIfDefined(output, "timelineDaysToClose", sanitizeInteger(input.timelineDaysToClose, 0, 36_500));
  assignIfDefined(
    output,
    "occupancyStatus",
    sanitizeEnum(input.occupancyStatus, new Set(["vacant", "owner_occupied", "tenant_occupied", "unknown"])),
  );
  assignIfDefined(output, "tenantLeaseMonthsRemaining", sanitizeInteger(input.tenantLeaseMonthsRemaining, 0, 1_200));
  assignIfDefined(
    output,
    "submitterRole",
    sanitizeEnum(input.submitterRole, new Set([
      "owner_seller", "wholesaler", "investor_buyer", "agent", "capital_partner", "unknown",
    ])),
  );
  assignIfDefined(
    output,
    "dealStatus",
    sanitizeEnum(input.dealStatus, new Set([
      "listed", "off_market", "pending", "wholesale", "pocket", "owner_submitted", "unknown",
    ])),
  );
  return output;
}

function sanitizeLane(value: unknown): UnknownRecord | null {
  const lane = asRecord(value);
  if (!lane) return null;
  const laneId = sanitizeEnum(lane.lane, STRATEGY_LANE_SET) as StrategyLane | undefined;
  if (!laneId) return null;
  const verdict = (sanitizeEnum(lane.verdict, VERDICT_SET) ?? "needs_more_data") as LaneFitVerdict;
  const confidence = asRecord(lane.confidence) ?? {};
  const economics = asRecord(lane.economics) ?? {};
  const metrics = Array.isArray(economics.metrics)
    ? economics.metrics.slice(0, 20).flatMap((metric) => {
        const record = asRecord(metric);
        if (!record) return [];
        const label = sanitizePublicText(record.label, 80);
        const metricValue = sanitizePublicText(record.value, 120);
        return label && metricValue ? [{ label, value: metricValue }] : [];
      })
    : [];
  const rawVerdictLabel = sanitizePublicText(lane.verdictLabel, 80) ?? LANE_VERDICT_LABELS[verdict];

  return {
    lane: laneId,
    laneLabel: sanitizePublicText(lane.laneLabel, 100) ?? LANE_LABELS[laneId],
    verdict,
    verdictLabel: prefixModelNarrative(rawVerdictLabel, "Automated model fit: ", 120),
    headline: prefixModelNarrative(
      lane.headline,
      "Based on user-entered, unverified inputs, the automated model indicates: ",
      400,
    ),
    confidence: {
      score: sanitizeNumber(confidence.score, 0, 100) ?? 0,
      supportingFactors: sanitizeStringArray(confidence.supportingFactors, 20, 240, "Automated model factor: "),
      sensitiveFactors: sanitizeStringArray(confidence.sensitiveFactors, 20, 240, "Automated sensitivity factor: "),
      missingInputs: sanitizeStringArray(confidence.missingInputs, 20, 240, "Model input still needed: "),
    },
    economics: {
      primaryMetric: sanitizePublicText(economics.primaryMetric, 80) ?? "Automated estimate",
      primaryValue: sanitizePublicText(economics.primaryValue, 120) ?? "—",
      metrics,
    },
    laneRisks: sanitizeStringArray(lane.laneRisks, 20, 240, "Automated model risk factor: "),
  };
}

function sanitizeRisk(value: unknown): UnknownRecord | null {
  const risk = asRecord(value);
  if (!risk) return null;
  const title = sanitizePublicText(risk.title, 160);
  const detail = sanitizePublicText(risk.detail, 600);
  if (!title && !detail) return null;
  const affects = Array.isArray(risk.affects)
    ? risk.affects.slice(0, STRATEGY_LANES.length).filter(
        (item): item is StrategyLane => typeof item === "string" && STRATEGY_LANE_SET.has(item),
      )
    : [];
  return {
    id: sanitizePublicText(risk.id, 80) ?? "model-risk",
    category: sanitizeEnum(risk.category, RISK_CATEGORY_SET) ?? "market",
    severity: sanitizeEnum(risk.severity, RISK_SEVERITY_SET) ?? "info",
    title: prefixModelNarrative(title, "Automated model flag: ", 220),
    detail: prefixModelNarrative(detail, "Automated model flag based on unverified inputs: ", 700),
    affects,
  };
}

function sanitizeCapitalEntry(value: unknown): UnknownRecord | null {
  const entry = asRecord(value);
  if (!entry) return null;
  const source = sanitizeEnum(entry.source, CAPITAL_SOURCE_SET);
  const amount = sanitizeNumber(entry.amount, 0, MAX_FINANCIAL_VALUE);
  if (!source || amount === undefined) return null;
  const output: UnknownRecord = {
    source,
    label: sanitizePublicText(entry.label, 100) ?? source.replace(/_/g, " "),
    amount,
  };
  assignIfDefined(output, "ratePct", sanitizeNumber(entry.ratePct, 0, 100));
  assignIfDefined(output, "termDays", sanitizeInteger(entry.termDays, 0, 36_500));
  const note = sanitizePublicText(entry.note, 300);
  if (note) output.note = prefixModelNarrative(note, "User/model assumption: ", 340);
  return output;
}

function sanitizeComp(value: unknown): UnknownRecord | null {
  const comp = asRecord(value);
  if (!comp || (comp.type !== "sale" && comp.type !== "rent")) return null;
  const pricePerSqft = sanitizeNumber(comp.pricePerSqft, 0, 1_000_000);
  if (pricePerSqft === undefined) return null;
  const output: UnknownRecord = { type: comp.type, pricePerSqft };
  assignIfDefined(output, "address", sanitizePublicText(comp.address, 240));
  assignIfDefined(output, "sqft", sanitizeNumber(comp.sqft, 0, 100_000_000));
  assignIfDefined(output, "beds", sanitizeNumber(comp.beds, 0, 100));
  assignIfDefined(output, "baths", sanitizeNumber(comp.baths, 0, 100));
  assignIfDefined(output, "distanceMiles", sanitizeNumber(comp.distanceMiles, 0, 10_000));
  assignIfDefined(output, "conditionDelta", sanitizeInteger(comp.conditionDelta, -2, 2));
  assignIfDefined(output, "weight", sanitizeNumber(comp.weight, 0, 100));
  return output;
}

function sanitizeCompBand(value: unknown): UnknownRecord | undefined {
  const band = asRecord(value);
  if (!band) return undefined;
  const output: UnknownRecord = {};
  for (const field of ["low", "median", "high", "impliedLow", "impliedMedian", "impliedHigh"] as const) {
    assignIfDefined(output, field, sanitizeNumber(band[field], 0, MAX_FINANCIAL_VALUE));
  }
  assignIfDefined(output, "count", sanitizeInteger(band.count, 0, 100_000));
  assignIfDefined(output, "thin", sanitizeBoolean(band.thin));
  return Object.keys(output).length ? output : undefined;
}

function sanitizeScenarios(value: unknown): UnknownRecord {
  const scenarios = asRecord(value) ?? {};
  const output: UnknownRecord = {};
  for (const label of ["base", "stressed", "worst"] as const) {
    const scenario = asRecord(scenarios[label]);
    if (!scenario) continue;
    const clean: UnknownRecord = { label };
    for (const field of [
      "effectiveRent", "effectiveVacancyPct", "effectiveRepairsPct", "effectiveCapexPct",
      "effectiveTaxInsMult", "effectiveHoaMult", "effectiveGrossIncome", "operatingExpenses",
      "noiAnnual", "capRatePct", "annualDebtService", "annualCashFlow", "cashOnCashPct", "dscr",
    ] as const) {
      assignIfDefined(clean, field, sanitizeNumber(scenario[field]));
    }
    output[label] = clean;
  }
  return output;
}

function sanitizeSensitivity(value: unknown): UnknownRecord | null {
  const grid = asRecord(value);
  if (!grid) return null;
  const lane = sanitizeEnum(grid.lane, STRATEGY_LANE_SET);
  const xAxis = asRecord(grid.xAxis);
  const yAxis = asRecord(grid.yAxis);
  const metric = sanitizeEnum(grid.metric, new Set(["monthly_cash_flow", "net_profit", "cash_left_in"]));
  if (!lane || !xAxis || !yAxis || !metric) return null;
  const sanitizeAxis = (axis: UnknownRecord) => {
    const unit = sanitizeEnum(axis.unit, new Set(["currency", "percent", "dollar_per_sqft"]));
    const values = Array.isArray(axis.values)
      ? axis.values.slice(0, 12).flatMap((item) => {
          const clean = sanitizeNumber(item);
          return clean === undefined ? [] : [clean];
        })
      : [];
    return unit && values.length
      ? { label: sanitizePublicText(axis.label, 80) ?? "Model variable", unit, values }
      : null;
  };
  const safeX = sanitizeAxis(xAxis);
  const safeY = sanitizeAxis(yAxis);
  if (!safeX || !safeY) return null;
  const expectedCells = Math.min(safeX.values.length * safeY.values.length, 144);
  if (!Array.isArray(grid.cells) || grid.cells.length < expectedCells) return null;
  return {
    lane,
    xAxis: safeX,
    yAxis: safeY,
    cells: grid.cells.slice(0, expectedCells).map((cell) => sanitizeNumber(cell) ?? 0),
    metric,
    baseFails: sanitizeBoolean(grid.baseFails) ?? false,
  };
}

function sanitizeBreakevens(value: unknown): UnknownRecord {
  const input = asRecord(value) ?? {};
  const output: UnknownRecord = {};
  for (const field of [
    "breakevenRentMonthly", "breakevenPriceForCap5", "breakevenPriceForCap6",
    "breakevenMortgageRatePct", "breakevenRehabCap", "breakevenArvFloor", "breakevenHoldMonths",
  ] as const) {
    assignIfDefined(output, field, sanitizeNumber(input[field]));
  }
  return output;
}

function sanitizeReverseSolver(value: unknown): UnknownRecord | null {
  const solver = asRecord(value);
  if (!solver) return null;
  const lane = sanitizeEnum(solver.lane, STRATEGY_LANE_SET);
  return lane
    ? { lane, required: sanitizeStringArray(solver.required, 20, 300, "Automated model condition: ") }
    : null;
}

function sanitizeSnapshot(value: unknown, propertyInput: UnknownRecord, full: boolean): UnknownRecord {
  const snapshot = asRecord(value) ?? {};
  const sanitizedLanes = Array.isArray(snapshot.lanes)
    ? snapshot.lanes.slice(0, STRATEGY_LANES.length).flatMap((lane) => {
        const clean = sanitizeLane(lane);
        return clean ? [clean] : [];
      })
    : [];
  const requestedTopLane = sanitizeEnum(snapshot.topLane, STRATEGY_LANE_SET);
  const topLane = sanitizedLanes.find((lane) => lane.lane === requestedTopLane) ?? sanitizedLanes[0];
  const memo = asRecord(snapshot.memo);
  const output: UnknownRecord = {
    engineVersion: sanitizePublicText(snapshot.engineVersion, 32) ?? "unknown",
    topLane: topLane?.lane,
    lanes: full ? sanitizedLanes : topLane ? [topLane] : [],
    memo: memo
      ? {
          paragraph: prefixModelNarrative(
            memo.paragraph,
            "Automated model summary based on user-entered, unverified inputs: ",
            1_400,
          ),
          nextStep: prefixModelNarrative(
            memo.nextStep,
            "Automated model consideration (not a Pegasus recommendation): ",
            700,
          ),
          hasCompOverrideWarning: sanitizeBoolean(memo.hasCompOverrideWarning) ?? false,
        }
      : null,
  };
  assignIfDefined(output, "generatedAt", sanitizeIsoDate(snapshot.generatedAt));
  if (!full) {
    Object.assign(output, {
      risks: [], capitalStack: [], sensitivities: [], reverseSolvers: [],
      breakevens: {}, compsUsed: [],
    });
    return output;
  }

  output.property = sanitizePropertyInput(snapshot.property ?? propertyInput, true);
  output.compsUsed = Array.isArray(snapshot.compsUsed)
    ? snapshot.compsUsed.slice(0, 25).flatMap((comp) => {
        const clean = sanitizeComp(comp);
        return clean ? [clean] : [];
      })
    : [];
  assignIfDefined(output, "arvBand", sanitizeCompBand(snapshot.arvBand));
  assignIfDefined(output, "rentBand", sanitizeCompBand(snapshot.rentBand));
  output.scenarios = sanitizeScenarios(snapshot.scenarios);
  output.sensitivities = Array.isArray(snapshot.sensitivities)
    ? snapshot.sensitivities.slice(0, 3).flatMap((grid) => {
        const clean = sanitizeSensitivity(grid);
        return clean ? [clean] : [];
      })
    : [];
  output.breakevens = sanitizeBreakevens(snapshot.breakevens);
  output.reverseSolvers = Array.isArray(snapshot.reverseSolvers)
    ? snapshot.reverseSolvers.slice(0, STRATEGY_LANES.length).flatMap((solver) => {
        const clean = sanitizeReverseSolver(solver);
        return clean ? [clean] : [];
      })
    : [];
  output.capitalStack = Array.isArray(snapshot.capitalStack)
    ? snapshot.capitalStack.slice(0, 20).flatMap((entry) => {
        const clean = sanitizeCapitalEntry(entry);
        return clean ? [clean] : [];
      })
    : [];
  assignIfDefined(output, "totalCashIn", sanitizeNumber(snapshot.totalCashIn, 0, MAX_FINANCIAL_VALUE));
  output.risks = Array.isArray(snapshot.risks)
    ? snapshot.risks.slice(0, 20).flatMap((risk) => {
        const clean = sanitizeRisk(risk);
        return clean ? [clean] : [];
      })
    : [];
  return output;
}

export interface PublicPropertyAnalysis {
  id?: number;
  visibility: "summary" | "full";
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  createdAt?: string;
  propertyInput: UnknownRecord;
  snapshot: UnknownRecord;
  outputContext: typeof PUBLIC_ANALYSIS_OUTPUT_CONTEXT;
}

export function projectPublicPropertyAnalysis(value: unknown): PublicPropertyAnalysis | null {
  const row = asRecord(value);
  if (!row) return null;
  const visibility = row.visibility === "full" ? "full" : "summary";
  const propertyInput = sanitizePropertyInput(row.propertyInput, visibility === "full");
  const output: PublicPropertyAnalysis = {
    visibility,
    propertyInput,
    snapshot: sanitizeSnapshot(row.snapshot, propertyInput, visibility === "full"),
    outputContext: PUBLIC_ANALYSIS_OUTPUT_CONTEXT,
  };
  const target = output as unknown as UnknownRecord;
  assignIfDefined(target, "id", sanitizeInteger(row.id, 1, Number.MAX_SAFE_INTEGER));
  assignIfDefined(target, "address", sanitizePublicText(row.address, 240));
  assignIfDefined(target, "city", sanitizePublicText(row.city, 120));
  assignIfDefined(target, "state", sanitizePublicText(row.state, 8));
  assignIfDefined(target, "zip", sanitizePublicText(row.zip, 12));
  assignIfDefined(target, "createdAt", sanitizeIsoDate(row.createdAt));
  return output;
}

function sanitizeCalculatorKey(value: unknown): string | undefined {
  const clean = sanitizePublicText(value, 80);
  if (!clean || clean === "__proto__" || clean === "prototype" || clean === "constructor") return undefined;
  if (clean.startsWith("__") && clean !== "__projection") return undefined;
  return clean.replace(/[^A-Za-z0-9_ ./%()@#:+-]/g, "").slice(0, 80) || undefined;
}

function sanitizeCalculatorScalar(value: unknown): string | number | boolean | null | undefined {
  if (value === null) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return sanitizeNumber(value);
  return sanitizePublicText(value, 240);
}

function sanitizeProjection(value: unknown): UnknownRecord | undefined {
  const projection = asRecord(value);
  if (!projection || !Array.isArray(projection.series)) return undefined;
  const series = projection.series.slice(0, 8).flatMap((candidate) => {
    const record = asRecord(candidate);
    if (!record || !Array.isArray(record.points)) return [];
    const name = sanitizePublicText(record.name, 80);
    const points = record.points.slice(0, 60).flatMap((candidatePoint) => {
      const point = asRecord(candidatePoint);
      if (!point) return [];
      const year = sanitizeNumber(point.year, -1_000, 10_000);
      const pointValue = sanitizeNumber(point.value);
      return year === undefined || pointValue === undefined ? [] : [{ year, value: pointValue }];
    });
    return name && points.length ? [{ name, points }] : [];
  });
  if (!series.length) return undefined;
  const output: UnknownRecord = {
    title: sanitizePublicText(projection.title, 120) ?? "Automated projection",
    series,
  };
  assignIfDefined(output, "yLabel", sanitizePublicText(projection.yLabel, 80));
  assignIfDefined(output, "format", sanitizeEnum(projection.format, new Set(["currency", "percent", "number"])));
  return output;
}

export function sanitizeCalculatorRecord(value: unknown, allowProjection = false): UnknownRecord {
  const record = asRecord(value) ?? {};
  const output: UnknownRecord = {};
  for (const [rawKey, rawValue] of Object.entries(record).slice(0, 100)) {
    const key = sanitizeCalculatorKey(rawKey);
    if (!key) continue;
    if (key === "__projection") {
      if (allowProjection) assignIfDefined(output, key, sanitizeProjection(rawValue));
      continue;
    }
    assignIfDefined(output, key, sanitizeCalculatorScalar(rawValue));
  }
  return output;
}

export interface PublicSavedAnalysis {
  id?: number;
  name: string;
  calculatorType: string;
  propertyAddress?: string;
  inputs: UnknownRecord;
  results: UnknownRecord;
  primaryMetric?: string;
  primaryValue?: string;
  secondaryMetric?: string;
  secondaryValue?: string;
  dealGrade?: string;
  scenarioLabel?: string;
  notes?: string;
  sharedAt?: string;
  createdAt?: string;
  viewCount?: number;
  outputContext: typeof PUBLIC_ANALYSIS_OUTPUT_CONTEXT;
}

export function projectPublicSavedAnalysis(value: unknown): PublicSavedAnalysis | null {
  const row = asRecord(value);
  if (!row) return null;
  const output: PublicSavedAnalysis = {
    name: sanitizePublicText(row.name, 255) ?? "Shared calculator analysis",
    calculatorType: sanitizePublicText(row.calculatorType, 50) ?? "analysis",
    inputs: sanitizeCalculatorRecord(row.inputs),
    results: sanitizeCalculatorRecord(row.results, true),
    outputContext: PUBLIC_ANALYSIS_OUTPUT_CONTEXT,
  };
  const target = output as unknown as UnknownRecord;
  assignIfDefined(target, "id", sanitizeInteger(row.id, 1, Number.MAX_SAFE_INTEGER));
  assignIfDefined(target, "propertyAddress", sanitizePublicText(row.propertyAddress, 240));
  assignIfDefined(target, "primaryMetric", sanitizePublicText(row.primaryMetric, 80));
  assignIfDefined(target, "primaryValue", sanitizePublicText(row.primaryValue, 120));
  assignIfDefined(target, "secondaryMetric", sanitizePublicText(row.secondaryMetric, 80));
  assignIfDefined(target, "secondaryValue", sanitizePublicText(row.secondaryValue, 120));
  const grade = sanitizePublicText(row.dealGrade, 10)?.toUpperCase();
  if (grade && /^[A-F]$/.test(grade)) output.dealGrade = grade;
  assignIfDefined(target, "scenarioLabel", sanitizePublicText(row.scenarioLabel, 100));
  assignIfDefined(target, "notes", sanitizePublicText(row.notes, 2_000));
  assignIfDefined(target, "sharedAt", sanitizeIsoDate(row.sharedAt));
  assignIfDefined(target, "createdAt", sanitizeIsoDate(row.createdAt));
  assignIfDefined(target, "viewCount", sanitizeInteger(row.viewCount, 0, 1_000_000_000));
  return output;
}
