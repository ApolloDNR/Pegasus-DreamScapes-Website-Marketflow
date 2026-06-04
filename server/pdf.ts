import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

interface PDFColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textMuted: string;
  background: string;
}

const BRAND_COLORS: PDFColors = {
  primary: "#0D1B2D",
  secondary: "#F6EFE4",
  accent: "#C77A3A",
  text: "#1E2328",
  textMuted: "#6b6b6b",
  background: "#ffffff",
};

function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "$0";
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}

function formatPercent(value: number | string | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return "0%";
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "0%";
  return `${numValue.toFixed(decimals)}%`;
}

function addHeader(doc: PDFKit.PDFDocument, title: string, subtitle?: string): void {
  doc
    .rect(0, 0, doc.page.width, 100)
    .fill(BRAND_COLORS.primary);

  doc
    .fontSize(22)
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .text("Pegasus Dreamscapes", 50, 30, { align: "left", characterSpacing: 2 });

  doc
    .fontSize(9)
    .fillColor(BRAND_COLORS.accent)
    .font("Helvetica")
    .text("THE DEAL ARCHITECT", 50, 58, { characterSpacing: 3 });

  doc
    .fontSize(8)
    .fillColor("#F6EFE4")
    .text("Where others see impossible, we see a path.", 50, 74);

  // Copper accent stripe under the navy header band
  doc
    .rect(0, 100, doc.page.width, 4)
    .fill(BRAND_COLORS.accent);

  doc
    .fontSize(18)
    .fillColor(BRAND_COLORS.text)
    .font("Helvetica-Bold")
    .text(title, 50, 130);

  if (subtitle) {
    doc
      .fontSize(11)
      .fillColor(BRAND_COLORS.textMuted)
      .font("Helvetica")
      .text(subtitle, 50, 155);
  }
}

function addFooter(doc: PDFKit.PDFDocument): void {
  const pageHeight = doc.page.height;

  doc
    .fontSize(8)
    .fillColor(BRAND_COLORS.textMuted)
    .font("Helvetica")
    .text(
      `Generated ${new Date().toLocaleDateString()}  |  Pegasus Dreamscapes Corp  |  apollo@pegasusdreamscapes.com`,
      50,
      pageHeight - 40,
      { align: "center", width: doc.page.width - 100 }
    );

  doc
    .fontSize(8)
    .fillColor(BRAND_COLORS.accent)
    .font("Helvetica-Oblique")
    .text(
      "Illustrative math only. Not investment advice and not an offer of guaranteed returns or principal protection.",
      50,
      pageHeight - 25,
      { align: "center", width: doc.page.width - 100 }
    );
}

function addMetricRow(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  y: number,
  highlight: boolean = false
): number {
  if (highlight) {
    doc
      .rect(45, y - 5, doc.page.width - 90, 25)
      .fill(BRAND_COLORS.secondary);
  }

  doc
    .fontSize(11)
    .fillColor(BRAND_COLORS.textMuted)
    .font("Helvetica")
    .text(label, 50, y);

  doc
    .fontSize(11)
    .fillColor(highlight ? BRAND_COLORS.accent : BRAND_COLORS.text)
    .font(highlight ? "Helvetica-Bold" : "Helvetica")
    .text(value, 350, y, { align: "right", width: 160 });

  return y + 25;
}

function addSectionTitle(doc: PDFKit.PDFDocument, title: string, y: number): number {
  doc
    .moveTo(50, y)
    .lineTo(doc.page.width - 50, y)
    .strokeColor(BRAND_COLORS.accent)
    .lineWidth(1)
    .stroke();

  doc
    .fontSize(12)
    .fillColor(BRAND_COLORS.primary)
    .font("Helvetica-Bold")
    .text(title, 50, y + 10);

  return y + 35;
}

function addGradeBadge(doc: PDFKit.PDFDocument, grade: string, x: number, y: number): void {
  const gradeColors: Record<string, { bg: string; text: string }> = {
    A: { bg: "#22c55e", text: "#ffffff" },
    B: { bg: "#3b82f6", text: "#ffffff" },
    C: { bg: "#f59e0b", text: "#ffffff" },
    D: { bg: "#f97316", text: "#ffffff" },
    F: { bg: "#ef4444", text: "#ffffff" },
  };

  const colors = gradeColors[grade] || gradeColors.C;

  doc.circle(x + 25, y + 25, 25).fill(colors.bg);

  doc
    .fontSize(20)
    .fillColor(colors.text)
    .font("Helvetica-Bold")
    .text(grade, x + 10, y + 15);
}

interface SavedAnalysisLike {
  name: string;
  calculatorType: string;
  propertyAddress?: string | null;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  primaryMetric?: string | null;
  primaryValue?: string | null;
  secondaryMetric?: string | null;
  secondaryValue?: string | null;
  dealGrade?: string | null;
  scenarioLabel?: string | null;
  notes?: string | null;
  createdAt?: Date | string | null;
}

function toDateOrNull(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

const CHART_KEY_PATTERNS = {
  crossover: /^crossoverYearAt(\d+)$/,
};

function formatValueForKey(key: string, value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    const lower = key.toLowerCase();
    const isPct = /(rate|percent|roi|return|ratio|spread|ltv|vacancy|growth|appreciation|cashoncash|caprate|crossover)/.test(lower)
      && !/year/i.test(lower);
    if (isPct && Math.abs(value) < 200) return formatPercent(value);
    const isCurrency = /(price|cost|rent|mortgage|arv|fee|profit|investment|cashflow|cash|mao|value|amount|payment|rehab|loan|equity|income|expense|tax|insurance)/.test(lower);
    if (isCurrency) return formatCurrency(value);
    return value.toLocaleString();
  }
  return String(value);
}

function humanLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/\bAt\b/gi, "@")
    .trim();
}

function ensureSpace(doc: PDFKit.PDFDocument, y: number, needed: number): number {
  if (y + needed > doc.page.height - 70) {
    doc.addPage();
    return 50;
  }
  return y;
}

/**
 * Draws a simple labeled bar chart using PDFKit primitives.
 * Returns the new y position.
 */
function drawBarChart(
  doc: PDFKit.PDFDocument,
  y: number,
  title: string,
  bars: { label: string; value: number; valueLabel: string }[],
): number {
  if (bars.length === 0) return y;

  const chartHeight = 110;
  const totalNeeded = chartHeight + 60;
  y = ensureSpace(doc, y, totalNeeded);

  doc
    .fontSize(10)
    .fillColor(BRAND_COLORS.primary)
    .font("Helvetica-Bold")
    .text(title.toUpperCase(), 50, y, { characterSpacing: 1 });
  y += 18;

  const left = 60;
  const right = doc.page.width - 60;
  const chartWidth = right - left;
  const baseY = y + chartHeight;
  const maxValue = Math.max(...bars.map((b) => Math.abs(b.value)), 1);
  const barCount = bars.length;
  const barSlot = chartWidth / barCount;
  const barWidth = Math.min(60, barSlot * 0.55);

  // Axis line
  doc
    .moveTo(left, baseY)
    .lineTo(right, baseY)
    .strokeColor(BRAND_COLORS.textMuted)
    .lineWidth(0.5)
    .stroke();

  bars.forEach((bar, i) => {
    const cx = left + barSlot * (i + 0.5);
    const h = (Math.abs(bar.value) / maxValue) * (chartHeight - 20);
    const x = cx - barWidth / 2;
    const yTop = baseY - h;

    doc.rect(x, yTop, barWidth, h).fill(BRAND_COLORS.accent);
    doc
      .fontSize(8)
      .fillColor(BRAND_COLORS.text)
      .font("Helvetica-Bold")
      .text(bar.valueLabel, x - 10, yTop - 12, { width: barWidth + 20, align: "center" });
    doc
      .fontSize(8)
      .fillColor(BRAND_COLORS.textMuted)
      .font("Helvetica")
      .text(bar.label, x - 20, baseY + 6, { width: barWidth + 40, align: "center" });
  });

  return baseY + 28;
}

interface LineChartSeries {
  name: string;
  points: { year: number; value: number }[];
}

const LINE_PALETTE = ["#C77A3A", "#0D1B2D", "#3b82f6", "#22c55e"];

function formatProjectionValue(v: number, format?: string): string {
  if (format === "percent") return `${v.toFixed(1)}%`;
  if (format === "number") return v.toLocaleString();
  // currency default — compact for chart axes
  const abs = Math.abs(v);
  if (abs >= 1000) return `$${Math.round(v / 1000).toLocaleString()}k`;
  return `$${Math.round(v).toLocaleString()}`;
}

function drawLineChart(
  doc: PDFKit.PDFDocument,
  y: number,
  title: string,
  series: LineChartSeries[],
  format?: string,
): number {
  if (series.length === 0 || series.every((s) => s.points.length === 0)) return y;

  const chartHeight = 180;
  const totalNeeded = chartHeight + 80;
  y = ensureSpace(doc, y, totalNeeded);

  doc
    .fontSize(10)
    .fillColor(BRAND_COLORS.primary)
    .font("Helvetica-Bold")
    .text(title.toUpperCase(), 50, y, { characterSpacing: 1 });
  y += 18;

  const left = 80;
  const right = doc.page.width - 60;
  const chartWidth = right - left;
  const bottom = y + chartHeight;

  const allPoints = series.flatMap((s) => s.points);
  const xs = allPoints.map((p) => p.year);
  const ys = allPoints.map((p) => p.value);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  let minY = Math.min(...ys, 0);
  let maxY = Math.max(...ys, 0);
  if (minY === maxY) maxY = minY + 1;
  // pad y range slightly
  const pad = (maxY - minY) * 0.05;
  minY -= pad;
  maxY += pad;

  const xScale = (x: number) =>
    left + ((x - minX) / Math.max(1, maxX - minX)) * chartWidth;
  const yScale = (v: number) =>
    bottom - ((v - minY) / (maxY - minY)) * chartHeight;

  // Y axis grid (4 lines + zero line if applicable)
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const v = minY + ((maxY - minY) * i) / ticks;
    const yy = yScale(v);
    doc
      .moveTo(left, yy)
      .lineTo(right, yy)
      .strokeColor("#e5e5e5")
      .lineWidth(0.5)
      .stroke();
    doc
      .fontSize(7)
      .fillColor(BRAND_COLORS.textMuted)
      .font("Helvetica")
      .text(formatProjectionValue(v, format), left - 60, yy - 4, {
        width: 55,
        align: "right",
      });
  }

  // Zero baseline emphasis
  if (minY < 0 && maxY > 0) {
    const zy = yScale(0);
    doc
      .moveTo(left, zy)
      .lineTo(right, zy)
      .strokeColor(BRAND_COLORS.textMuted)
      .lineWidth(0.75)
      .stroke();
  }

  // X axis labels
  series[0].points.forEach((p) => {
    const x = xScale(p.year);
    doc
      .fontSize(7)
      .fillColor(BRAND_COLORS.textMuted)
      .text(`Yr ${p.year}`, x - 14, bottom + 4, { width: 28, align: "center" });
  });

  // Plot each series
  series.forEach((s, idx) => {
    const color = LINE_PALETTE[idx % LINE_PALETTE.length];
    if (s.points.length === 0) return;
    s.points.forEach((p, i) => {
      const x = xScale(p.year);
      const yy = yScale(p.value);
      if (i === 0) doc.moveTo(x, yy);
      else doc.lineTo(x, yy);
    });
    doc.strokeColor(color).lineWidth(1.6).stroke();
    s.points.forEach((p) => {
      doc.circle(xScale(p.year), yScale(p.value), 1.8).fill(color);
    });
  });

  // Legend
  let legendY = bottom + 22;
  let legendX = left;
  series.forEach((s, idx) => {
    const color = LINE_PALETTE[idx % LINE_PALETTE.length];
    doc.rect(legendX, legendY + 2, 10, 4).fill(color);
    doc
      .fontSize(8)
      .fillColor(BRAND_COLORS.text)
      .font("Helvetica")
      .text(s.name, legendX + 14, legendY, { lineBreak: false });
    legendX += 14 + doc.widthOfString(s.name) + 18;
    if (legendX > right - 60) {
      legendX = left;
      legendY += 12;
    }
  });

  return legendY + 20;
}

interface ProjectionLike {
  title?: string;
  yLabel?: string;
  format?: string;
  series?: { name?: string; points?: { year?: number; value?: number }[] }[];
}

function normalizeProjection(raw: unknown): {
  title: string;
  format?: string;
  series: LineChartSeries[];
} | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as ProjectionLike;
  if (!Array.isArray(p.series)) return null;
  const series: LineChartSeries[] = p.series
    .map((s) => ({
      name: String(s?.name ?? "Series"),
      points: Array.isArray(s?.points)
        ? s!.points!
            .filter(
              (pt) =>
                pt &&
                typeof pt.year === "number" &&
                typeof pt.value === "number" &&
                Number.isFinite(pt.value),
            )
            .map((pt) => ({ year: pt.year as number, value: pt.value as number }))
        : [],
    }))
    .filter((s) => s.points.length > 0);
  if (series.length === 0) return null;
  return {
    title: typeof p.title === "string" ? p.title : "Projection",
    format: typeof p.format === "string" ? p.format : undefined,
    series,
  };
}

/**
 * Detects chart-worthy patterns in the results and draws them.
 */
function drawAnalysisCharts(
  doc: PDFKit.PDFDocument,
  y: number,
  calculatorType: string,
  results: Record<string, unknown>,
): number {
  // 0) Yearly projection (line chart) — produced by BRRRR / Cash Flow /
  //    Own vs Rent / ARV calculators.
  const projection = normalizeProjection(results.__projection);
  if (projection) {
    y = drawLineChart(doc, y + 6, projection.title, projection.series, projection.format);
  }

  // 1) Crossover (own vs rent): crossoverYearAt2 / 4 / 6
  const crossoverBars: { label: string; value: number; valueLabel: string }[] = [];
  for (const [k, v] of Object.entries(results)) {
    const m = k.match(CHART_KEY_PATTERNS.crossover);
    if (m && typeof v === "number" && v > 0) {
      crossoverBars.push({
        label: `${m[1]}% growth`,
        value: v,
        valueLabel: `Yr ${v}`,
      });
    }
  }
  if (crossoverBars.length >= 2) {
    crossoverBars.sort((a, b) => Number(a.label.split("%")[0]) - Number(b.label.split("%")[0]));
    y = drawBarChart(doc, y + 6, "Crossover year by appreciation scenario", crossoverBars);
  }

  // 2) Scenario triplets — keys ending in Conservative / Base / Aggressive (or Low/Mid/High)
  const scenarioGroups = new Map<string, { label: string; value: number }[]>();
  const scenarioRe = /^(.+?)(Conservative|Base|Aggressive|Low|Mid|High|Bear|Bull)$/;
  for (const [k, v] of Object.entries(results)) {
    if (typeof v !== "number") continue;
    const m = k.match(scenarioRe);
    if (!m) continue;
    const group = m[1];
    const label = m[2];
    if (!scenarioGroups.has(group)) scenarioGroups.set(group, []);
    scenarioGroups.get(group)!.push({ label, value: v });
  }
  for (const [group, items] of Array.from(scenarioGroups.entries())) {
    if (items.length < 2) continue;
    const bars = items.map((it: { label: string; value: number }) => ({
      label: it.label,
      value: it.value,
      valueLabel: formatValueForKey(group, it.value),
    }));
    y = drawBarChart(doc, y + 6, `${humanLabel(group)} — scenarios`, bars);
  }

  // 3) Sensitivity: keys like sensitivity_<varName>_<delta>
  const sensitivityGroups = new Map<string, { label: string; value: number }[]>();
  for (const [k, v] of Object.entries(results)) {
    if (typeof v !== "number") continue;
    const m = k.match(/^sensitivity[_-]?(.+?)[_-](-?\d+)$/i);
    if (!m) continue;
    const variable = m[1];
    const delta = Number(m[2]);
    if (!sensitivityGroups.has(variable)) sensitivityGroups.set(variable, []);
    sensitivityGroups.get(variable)!.push({ label: `${delta > 0 ? "+" : ""}${delta}%`, value: v });
  }
  for (const [variable, items] of Array.from(sensitivityGroups.entries())) {
    if (items.length < 2) continue;
    items.sort((a: { label: string; value: number }, b: { label: string; value: number }) => Number(a.label.replace("%", "")) - Number(b.label.replace("%", "")));
    const bars = items.map((it: { label: string; value: number }) => ({
      label: it.label,
      value: it.value,
      valueLabel: formatValueForKey(variable, it.value),
    }));
    y = drawBarChart(doc, y + 6, `Sensitivity: ${humanLabel(variable)}`, bars);
  }

  return y;
}

const CALCULATOR_TITLES: Record<string, string> = {
  arv: "ARV & Flip Analysis",
  roi: "Investment ROI Analysis",
  brrrr: "BRRRR Strategy Analysis",
  cashflow: "Cash Flow Analysis",
  mao: "Wholesale (MAO) Analysis",
  wholesale: "Wholesale Deal Analysis",
  piti: "Mortgage / PITI Analysis",
  ownvsrent: "Own vs Rent Analysis",
  hardmoney: "Hard Money Analysis",
};

/**
 * Branded PDF for a saved analysis (used by /api/pdf/calculator/by-id and
 * /api/pdf/calculator/by-token). Includes a cover header with the analysis
 * name, scenario label, deal grade, primary metric, charts when applicable,
 * and the standard "illustrative only" disclaimer.
 */
export async function generateSavedAnalysisPDF(
  analysis: SavedAnalysisLike,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "LETTER" });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const calcLabel =
      CALCULATOR_TITLES[analysis.calculatorType] ?? "Strategy Analysis";

    addHeader(doc, analysis.name, calcLabel);

    let y = 180;

    // Meta strip: address / scenario / grade / date
    const metaParts: string[] = [];
    if (analysis.propertyAddress) metaParts.push(analysis.propertyAddress);
    if (analysis.scenarioLabel) metaParts.push(`Scenario: ${analysis.scenarioLabel}`);
    if (analysis.dealGrade) metaParts.push(`Grade ${analysis.dealGrade}`);
    const createdAtDate = toDateOrNull(analysis.createdAt);
    if (createdAtDate) {
      metaParts.push(createdAtDate.toLocaleDateString());
    }
    if (metaParts.length > 0) {
      doc
        .fontSize(10)
        .fillColor(BRAND_COLORS.textMuted)
        .font("Helvetica")
        .text(metaParts.join("  ·  "), 50, y);
      y += 22;
    }

    // Headline metric
    if (analysis.primaryMetric && analysis.primaryValue) {
      doc
        .rect(45, y, doc.page.width - 90, 56)
        .fill(BRAND_COLORS.secondary);
      doc
        .fontSize(9)
        .fillColor(BRAND_COLORS.textMuted)
        .font("Helvetica-Bold")
        .text(analysis.primaryMetric.toUpperCase(), 60, y + 12, { characterSpacing: 1.5 });
      doc
        .fontSize(26)
        .fillColor(BRAND_COLORS.accent)
        .font("Helvetica-Bold")
        .text(analysis.primaryValue, 60, y + 24);

      if (analysis.secondaryMetric && analysis.secondaryValue) {
        doc
          .fontSize(9)
          .fillColor(BRAND_COLORS.textMuted)
          .font("Helvetica-Bold")
          .text(analysis.secondaryMetric.toUpperCase(), doc.page.width - 220, y + 12, {
            characterSpacing: 1.5,
            width: 160,
            align: "right",
          });
        doc
          .fontSize(18)
          .fillColor(BRAND_COLORS.primary)
          .font("Helvetica-Bold")
          .text(analysis.secondaryValue, doc.page.width - 220, y + 26, {
            width: 160,
            align: "right",
          });
      }
      y += 72;
    }

    // Notes
    if (analysis.notes) {
      doc
        .fontSize(10)
        .fillColor(BRAND_COLORS.text)
        .font("Helvetica-Oblique")
        .text(`"${analysis.notes}"`, 50, y, { width: doc.page.width - 100 });
      y = doc.y + 12;
    }

    // Inputs
    y = ensureSpace(doc, y, 60);
    y = addSectionTitle(doc, "INPUT PARAMETERS", y);
    for (const [key, value] of Object.entries(analysis.inputs ?? {})) {
      y = ensureSpace(doc, y, 26);
      y = addMetricRow(doc, humanLabel(key), formatValueForKey(key, value), y);
    }

    // Results
    y += 14;
    y = ensureSpace(doc, y, 60);
    y = addSectionTitle(doc, "ANALYSIS RESULTS", y);
    for (const [key, value] of Object.entries(analysis.results ?? {})) {
      // Skip metadata/structured fields (projections render as charts below).
      if (key.startsWith("__")) continue;
      if (value !== null && typeof value === "object") continue;
      y = ensureSpace(doc, y, 26);
      const lower = key.toLowerCase();
      const highlight =
        lower.includes("roi") ||
        lower.includes("return") ||
        lower.includes("profit") ||
        lower.includes("mao") ||
        lower.includes("cashoncash") ||
        lower.includes("caprate") ||
        lower.includes("monthlycashflow");
      y = addMetricRow(doc, humanLabel(key), formatValueForKey(key, value), y, highlight);
    }

    // Charts (where applicable)
    const chartsStartY = y + 14;
    const afterCharts = drawAnalysisCharts(doc, chartsStartY, analysis.calculatorType, analysis.results ?? {});
    if (afterCharts > chartsStartY) {
      // section title for charts (drawn above by drawAnalysisCharts via per-chart titles)
    }

    addFooter(doc);
    doc.end();
  });
}

export async function generateCalculatorPDF(
  calculatorType: string,
  inputs: Record<string, number | string>,
  outputs: Record<string, number | string>
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "LETTER" });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const calculatorTitles: Record<string, string> = {
      arv: "ARV & Flip Analysis",
      roi: "Investment ROI Analysis",
      brrrr: "BRRRR Strategy Analysis",
      cashflow: "Cash Flow Analysis",
      wholesale: "Wholesale Deal Analysis",
    };

    const title = calculatorTitles[calculatorType] || "Deal Analysis";
    addHeader(doc, title, `Prepared for professional review`);

    let y = 180;

    y = addSectionTitle(doc, "INPUT PARAMETERS", y);
    
    for (const [key, value] of Object.entries(inputs)) {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      
      let formattedValue = String(value);
      if (typeof value === "number") {
        if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("percent") || key.toLowerCase().includes("ltv")) {
          formattedValue = formatPercent(value);
        } else if (key.toLowerCase().includes("price") || key.toLowerCase().includes("cost") || key.toLowerCase().includes("rent") || key.toLowerCase().includes("mortgage") || key.toLowerCase().includes("arv") || key.toLowerCase().includes("fee") || key.toLowerCase().includes("profit") || key.toLowerCase().includes("investment") || key.toLowerCase().includes("cashflow") || key.toLowerCase().includes("cash")) {
          formattedValue = formatCurrency(value);
        }
      }
      
      y = addMetricRow(doc, label, formattedValue, y);
    }

    y += 20;
    y = addSectionTitle(doc, "ANALYSIS RESULTS", y);

    for (const [key, value] of Object.entries(outputs)) {
      if (key.startsWith("__")) continue;
      if (value !== null && typeof value === "object") continue;

      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      
      let formattedValue = String(value);
      const isHighlight = 
        key.toLowerCase().includes("roi") || 
        key.toLowerCase().includes("return") || 
        key.toLowerCase().includes("profit") ||
        key.toLowerCase().includes("mao") ||
        key.toLowerCase().includes("cashoncash") ||
        key.toLowerCase().includes("caprate");

      if (typeof value === "number") {
        if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("percent") || key.toLowerCase().includes("roi") || key.toLowerCase().includes("return") || key.toLowerCase().includes("ratio") || key.toLowerCase().includes("spread")) {
          formattedValue = formatPercent(value);
        } else if (key.toLowerCase().includes("price") || key.toLowerCase().includes("cost") || key.toLowerCase().includes("rent") || key.toLowerCase().includes("mortgage") || key.toLowerCase().includes("arv") || key.toLowerCase().includes("fee") || key.toLowerCase().includes("profit") || key.toLowerCase().includes("investment") || key.toLowerCase().includes("cashflow") || key.toLowerCase().includes("cash") || key.toLowerCase().includes("mao") || key.toLowerCase().includes("value") || key.toLowerCase().includes("amount") || key.toLowerCase().includes("payment")) {
          formattedValue = formatCurrency(value);
        }
      } else if (typeof value === "boolean") {
        formattedValue = value ? "Yes" : "No";
      }
      
      y = addMetricRow(doc, label, formattedValue, y, isHighlight);
      
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
    }

    addFooter(doc);
    doc.end();
  });
}

export async function generateTermSheetPDF(deal: {
  type: string;
  title: string;
  propertyAddress?: string;
  purchasePrice?: number;
  askingAmount?: number;
  interestRate?: number;
  equityPercentage?: number;
  termMonths?: number;
  investmentType?: string;
  sellerName?: string;
  operatorName?: string;
  notes?: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "LETTER" });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    addHeader(doc, "TERM SHEET", `${deal.type.toUpperCase()} INVESTMENT`);

    let y = 180;

    y = addSectionTitle(doc, "DEAL SUMMARY", y);
    
    y = addMetricRow(doc, "Deal Title", deal.title, y);
    if (deal.propertyAddress) {
      y = addMetricRow(doc, "Property Address", deal.propertyAddress, y);
    }
    if (deal.operatorName) {
      y = addMetricRow(doc, "Operator/Sponsor", deal.operatorName, y);
    }

    y += 20;
    y = addSectionTitle(doc, "INVESTMENT TERMS", y);

    if (deal.purchasePrice) {
      y = addMetricRow(doc, "Purchase Price", formatCurrency(deal.purchasePrice), y);
    }
    if (deal.askingAmount) {
      y = addMetricRow(doc, "Investment Amount", formatCurrency(deal.askingAmount), y, true);
    }
    if (deal.interestRate) {
      y = addMetricRow(doc, "Interest Rate", formatPercent(deal.interestRate), y, true);
    }
    if (deal.equityPercentage) {
      y = addMetricRow(doc, "Equity Share", formatPercent(deal.equityPercentage), y, true);
    }
    if (deal.termMonths) {
      y = addMetricRow(doc, "Term Length", `${deal.termMonths} months`, y);
    }
    if (deal.investmentType) {
      y = addMetricRow(doc, "Investment Type", deal.investmentType.toUpperCase(), y);
    }

    if (deal.notes) {
      y += 20;
      y = addSectionTitle(doc, "ADDITIONAL NOTES", y);
      doc
        .fontSize(10)
        .fillColor(BRAND_COLORS.text)
        .font("Helvetica")
        .text(deal.notes, 50, y, { width: doc.page.width - 100 });
    }

    y += 80;
    doc
      .moveTo(50, y)
      .lineTo(250, y)
      .strokeColor(BRAND_COLORS.textMuted)
      .stroke();
    doc
      .fontSize(10)
      .fillColor(BRAND_COLORS.textMuted)
      .text("Investor Signature", 50, y + 5);

    doc
      .moveTo(320, y)
      .lineTo(520, y)
      .stroke();
    doc
      .text("Date", 320, y + 5);

    addFooter(doc);
    doc.end();
  });
}

export async function generateDealPacketPDF(deal: {
  title: string;
  type: string;
  propertyAddress: string;
  city?: string;
  state?: string;
  propertyType?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  arv?: number;
  purchasePrice?: number;
  rehabCost?: number;
  holdingCosts?: number;
  assignmentFee?: number;
  mao?: number;
  expectedProfit?: number;
  roi?: number;
  description?: string;
  highlights?: string[];
  timeline?: string;
  operatorName?: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "LETTER" });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    addHeader(doc, deal.title, `${deal.type.toUpperCase()} DEAL PACKET`);

    let y = 180;

    y = addSectionTitle(doc, "PROPERTY DETAILS", y);
    
    y = addMetricRow(doc, "Address", deal.propertyAddress, y);
    if (deal.city && deal.state) {
      y = addMetricRow(doc, "Location", `${deal.city}, ${deal.state}`, y);
    }
    if (deal.propertyType) {
      y = addMetricRow(doc, "Property Type", deal.propertyType, y);
    }
    if (deal.beds !== undefined || deal.baths !== undefined || deal.sqft !== undefined) {
      const specs = [];
      if (deal.beds !== undefined) specs.push(`${deal.beds} BR`);
      if (deal.baths !== undefined) specs.push(`${deal.baths} BA`);
      if (deal.sqft !== undefined) specs.push(`${deal.sqft.toLocaleString()} SF`);
      y = addMetricRow(doc, "Specifications", specs.join(" | "), y);
    }

    y += 20;
    y = addSectionTitle(doc, "FINANCIAL BREAKDOWN", y);

    if (deal.arv) {
      y = addMetricRow(doc, "After Repair Value (ARV)", formatCurrency(deal.arv), y);
    }
    if (deal.purchasePrice) {
      y = addMetricRow(doc, "Contract/Purchase Price", formatCurrency(deal.purchasePrice), y, true);
    }
    if (deal.rehabCost) {
      y = addMetricRow(doc, "Estimated Rehab", formatCurrency(deal.rehabCost), y);
    }
    if (deal.holdingCosts) {
      y = addMetricRow(doc, "Holding Costs", formatCurrency(deal.holdingCosts), y);
    }
    if (deal.assignmentFee) {
      y = addMetricRow(doc, "Assignment Fee", formatCurrency(deal.assignmentFee), y);
    }
    if (deal.mao) {
      y = addMetricRow(doc, "Max Allowable Offer (MAO)", formatCurrency(deal.mao), y, true);
    }
    if (deal.expectedProfit) {
      y = addMetricRow(doc, "Expected Profit", formatCurrency(deal.expectedProfit), y, true);
    }
    if (deal.roi) {
      y = addMetricRow(doc, "Projected ROI", formatPercent(deal.roi), y, true);
    }

    if (deal.description) {
      y += 20;
      y = addSectionTitle(doc, "DEAL DESCRIPTION", y);
      doc
        .fontSize(10)
        .fillColor(BRAND_COLORS.text)
        .font("Helvetica")
        .text(deal.description, 50, y, { width: doc.page.width - 100 });
      y += 60;
    }

    if (deal.highlights && deal.highlights.length > 0) {
      if (y > doc.page.height - 200) {
        doc.addPage();
        y = 50;
      }
      y = addSectionTitle(doc, "DEAL HIGHLIGHTS", y);
      for (const highlight of deal.highlights) {
        doc
          .fontSize(10)
          .fillColor(BRAND_COLORS.accent)
          .text("•", 50, y);
        doc
          .fillColor(BRAND_COLORS.text)
          .text(highlight, 70, y, { width: doc.page.width - 120 });
        y += 20;
      }
    }

    if (deal.timeline) {
      y += 20;
      y = addSectionTitle(doc, "TIMELINE", y);
      doc
        .fontSize(10)
        .fillColor(BRAND_COLORS.text)
        .font("Helvetica")
        .text(deal.timeline, 50, y, { width: doc.page.width - 100 });
    }

    addFooter(doc);
    doc.end();
  });
}

// ============================================================================
// STRATEGY SNAPSHOT PDF v2 (Task #84) — editorial multi-page layout.
// Pages: Cover · Numbers · Risk · Capital Stack · Sensitivity · Memo · Disclosure.
// ============================================================================

interface PropertyAnalysisLike {
  id: number;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  topLane?: string | null;
  topLaneVerdict?: string | null;
  topLaneScore?: number | null;
  visibility?: string | null;
  shareToken?: string | null;
  createdAt?: Date | string | null;
  propertyInput: any;
  snapshot: any;
}

// Brand typography for the v2 Strategy Snapshot PDF. Cormorant Garamond
// (serif, body + italics) and Cinzel (display caps) match the website
// editorial tier. Inter and Montserrat carry kicker labels and footers.
// All four are downloaded into server/fonts/ as TTFs so PDFKit can embed
// them without a network call at render time.
import path from "node:path";
import fs from "node:fs";

const FONT_DIR = path.join(process.cwd(), "server", "fonts");
function fontPath(file: string): string {
  const p = path.join(FONT_DIR, file);
  return fs.existsSync(p) ? p : "";
}

// Brand font aliases — registered lazily on the first PDFDocument that
// needs them. Falls back to PDFKit built-ins if a TTF is missing so the
// renderer never crashes in environments where fonts are pruned.
const BRAND_FONTS = {
  display: { alias: "BrandDisplay", file: "Cinzel-Bold.ttf", fallback: "Helvetica-Bold" },
  serif: { alias: "BrandSerif", file: "CormorantGaramond-Regular.ttf", fallback: "Times-Roman" },
  serifBold: { alias: "BrandSerifBold", file: "CormorantGaramond-SemiBold.ttf", fallback: "Times-Bold" },
  serifItalic: { alias: "BrandSerifItalic", file: "CormorantGaramond-Italic.ttf", fallback: "Times-Italic" },
  sans: { alias: "BrandSans", file: "Inter-Regular.ttf", fallback: "Helvetica" },
  sansBold: { alias: "BrandSansBold", file: "Montserrat-SemiBold.ttf", fallback: "Helvetica-Bold" },
} as const;

function registerBrandFonts(doc: PDFKit.PDFDocument): void {
  for (const f of Object.values(BRAND_FONTS)) {
    const p = fontPath(f.file);
    if (p) {
      try { doc.registerFont(f.alias, p); } catch { /* fall back below */ }
    }
  }
}

function bf(key: keyof typeof BRAND_FONTS): string {
  const f = BRAND_FONTS[key];
  return fontPath(f.file) ? f.alias : f.fallback;
}

const SERIF = "Times-Roman";
const SERIF_BOLD = "Times-Bold";
const SERIF_ITALIC = "Times-Italic";
const SANS = "Helvetica";
const SANS_BOLD = "Helvetica-Bold";

function fmtDollarsShort(n: number | null | undefined): string {
  if (n == null || isNaN(Number(n))) return "—";
  const v = Number(n);
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1000) return `$${Math.round(v / 1000)}K`;
  return `$${Math.round(v)}`;
}

function snapshotCoverPage(doc: PDFKit.PDFDocument, a: PropertyAnalysisLike): void {
  const w = doc.page.width;
  const h = doc.page.height;
  const snap = a.snapshot ?? {};
  const topLane = (snap.lanes ?? []).find((l: any) => l.lane === snap.topLane) ?? (snap.lanes ?? [])[0];

  // Navy field
  doc.rect(0, 0, w, h).fill(BRAND_COLORS.primary);
  // Copper hairline at top
  doc.rect(0, 0, w, 4).fill(BRAND_COLORS.accent);

  // Wordmark in Cinzel (display caps) — matches the website nav.
  doc.fontSize(11).fillColor(BRAND_COLORS.accent).font(bf("display"))
    .text("Pegasus Dreamscapes CORP", 50, 50, { characterSpacing: 3 });
  doc.fontSize(8).fillColor("#F6EFE4").font(bf("sansBold"))
    .text("THE DEAL ARCHITECT", 50, 70, { characterSpacing: 2.5 });

  // Title block (mid-page editorial)
  const titleY = 200;
  doc.fontSize(10).fillColor(BRAND_COLORS.accent).font(bf("sansBold"))
    .text("PROPERTY STRATEGY SNAPSHOT", 50, titleY, { characterSpacing: 3 });
  doc.moveTo(50, titleY + 22).lineTo(150, titleY + 22).strokeColor(BRAND_COLORS.accent).lineWidth(1).stroke();

  const addr = a.address || a.propertyInput?.address || "Property under review";
  const sub = [a.city || a.propertyInput?.city, a.state || a.propertyInput?.state, a.zip || a.propertyInput?.zip]
    .filter(Boolean).join(", ");
  // Headline in Cormorant Garamond Semibold — editorial display tier.
  doc.fontSize(38).fillColor("#F6EFE4").font(bf("serifBold"))
    .text(addr, 50, titleY + 46, { width: w - 100, lineGap: 2 });
  if (sub) {
    doc.fontSize(14).fillColor("#F6EFE4").font(bf("serifItalic")).fillOpacity(0.85)
      .text(sub, 50, doc.y + 6).fillOpacity(1);
  }

  // Verdict band
  const bandY = h - 240;
  doc.rect(0, bandY, w, 1).fill(BRAND_COLORS.accent);
  doc.fontSize(9).fillColor(BRAND_COLORS.accent).font(bf("sansBold"))
    .text("RECOMMENDED PATH", 50, bandY + 18, { characterSpacing: 2.5 });
  doc.fontSize(30).fillColor("#F6EFE4").font(bf("serifBold"))
    .text(topLane?.laneLabel ?? "Strategy review pending", 50, bandY + 38);
  doc.fontSize(12).fillColor("#F6EFE4").fillOpacity(0.85).font(bf("serifItalic"))
    .text(topLane?.headline ?? "", 50, doc.y + 4, { width: w - 100 }).fillOpacity(1);
  doc.fontSize(9).fillColor(BRAND_COLORS.accent).font(bf("sansBold"))
    .text(`VERDICT · ${(topLane?.verdictLabel ?? "—").toUpperCase()}`, 50, bandY + 130, { characterSpacing: 2 });

  // Footer mark
  doc.fontSize(8).fillColor("#F6EFE4").fillOpacity(0.7).font(bf("sans"))
    .text(`Engine v${snap.engineVersion ?? "—"} · Generated ${new Date().toLocaleDateString()}`,
      50, h - 50, { width: w - 100 }).fillOpacity(1);
  doc.fontSize(8).fillColor(BRAND_COLORS.accent).font(bf("sansBold"))
    .text("apollo@pegasusdreamscapes.com · 925-744-8525", 50, h - 35, { width: w - 100, align: "right" });
}

function snapshotPageHeader(doc: PDFKit.PDFDocument, kicker: string, title: string): number {
  doc.rect(0, 0, doc.page.width, 4).fill(BRAND_COLORS.accent);
  // Kicker in Montserrat (sansBold) caps; section title in Cormorant Semibold.
  doc.fontSize(9).fillColor(BRAND_COLORS.accent).font(bf("sansBold"))
    .text(kicker.toUpperCase(), 50, 36, { characterSpacing: 2.5 });
  doc.fontSize(28).fillColor(BRAND_COLORS.primary).font(bf("serifBold"))
    .text(title, 50, 54);
  doc.moveTo(50, 100).lineTo(doc.page.width - 50, 100)
    .strokeColor(BRAND_COLORS.accent).lineWidth(0.5).stroke();
  return 120;
}

// Canonical free-tier footer. Single fixed sentence printed verbatim on
// every page of the Strategy Snapshot PDF so the document is self-disclosing
// even when a single page is shared in isolation.
const SNAPSHOT_FOOTER =
  "Preliminary Strategy Snapshot · Pegasus Dreamscapes · For analysis only. Human review required before any offer or execution decision.";

function snapshotPageFooter(doc: PDFKit.PDFDocument, _legacyLabel?: string): void {
  void _legacyLabel; // legacy per-page label retired — footer is canonical now.
  const y = doc.page.height - 40;
  // Hairline rule above the footer for visual quietness.
  doc.moveTo(50, y - 6).lineTo(doc.page.width - 50, y - 6)
    .strokeColor(BRAND_COLORS.accent).lineWidth(0.4).stroke();
  doc.fontSize(7.5).fillColor(BRAND_COLORS.textMuted).font(bf("sans"))
    .text(SNAPSHOT_FOOTER, 50, y, { width: doc.page.width - 200, align: "left" });
  doc.fontSize(7.5).fillColor(BRAND_COLORS.textMuted).font(bf("sans"))
    .text(new Date().toLocaleDateString(),
      50, y, { width: doc.page.width - 100, align: "right" });
}

function snapshotTwoCol(doc: PDFKit.PDFDocument, rows: [string, string][], y: number): number {
  for (const [k, v] of rows) {
    doc.fontSize(10).fillColor(BRAND_COLORS.textMuted).font(SANS).text(k, 50, y);
    doc.fontSize(11).fillColor(BRAND_COLORS.text).font(SANS_BOLD)
      .text(v, 50, y, { width: doc.page.width - 100, align: "right" });
    y += 22;
    doc.moveTo(50, y - 6).lineTo(doc.page.width - 50, y - 6)
      .strokeColor("#e5e0d6").lineWidth(0.5).stroke();
  }
  return y + 8;
}

export async function generateStrategySnapshotPDF(
  analysis: PropertyAnalysisLike,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "LETTER", autoFirstPage: false });
    registerBrandFonts(doc);
    const buffers: Buffer[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const snap = analysis.snapshot ?? {};
    const prop = analysis.propertyInput ?? {};
    const visibility = analysis.visibility ?? "summary";
    const isFull = visibility === "full";
    const lanes = (snap.lanes ?? []) as any[];
    const topLane = lanes.find((l) => l.lane === snap.topLane) ?? lanes[0];

    // Page 1 — Cover
    doc.addPage();
    snapshotCoverPage(doc, analysis);

    // Page 2 — Numbers (full only) or Verdict expanded (summary)
    doc.addPage();
    if (isFull) {
      let y = snapshotPageHeader(doc, "Section 01", "The Numbers");
      doc.fontSize(10).fillColor(BRAND_COLORS.text).font(bf("serifItalic"))
        .text("Inputs that drive every lane verdict in this snapshot.", 50, y, { width: doc.page.width - 100 });
      y = doc.y + 14;
      y = snapshotTwoCol(doc, [
        ["Asking / target price", fmtDollarsShort(prop.askingPrice)],
        ["After-Repair Value (ARV)", fmtDollarsShort(prop.arvEstimate)],
        ["Rehab budget", fmtDollarsShort(prop.rehabBudget)],
        ["Market rent (mo)", fmtDollarsShort(prop.marketRent)],
        ["Total cash in", fmtDollarsShort(snap.totalCashIn)],
        ["Beds / Baths / Sqft", `${prop.beds ?? "—"} / ${prop.baths ?? "—"} / ${prop.sqft ?? "—"}`],
        ["Condition", String(prop.condition ?? "—").replace(/_/g, " ")],
        ["Days to close", prop.timelineDaysToClose != null ? `${prop.timelineDaysToClose} days` : "—"],
      ], y);

      // Top lane economics
      if (topLane?.economics) {
        doc.fontSize(10).fillColor(BRAND_COLORS.accent).font(bf("sansBold"))
          .text(`${(topLane.laneLabel ?? "").toUpperCase()} · LANE ECONOMICS`, 50, y, { characterSpacing: 2 });
        y += 18;
        const econRows: [string, string][] = [[topLane.economics.primaryMetric, topLane.economics.primaryValue]];
        for (const m of topLane.economics.metrics ?? []) econRows.push([m.label, m.value]);
        y = snapshotTwoCol(doc, econRows, y);
      }
    } else {
      let y = snapshotPageHeader(doc, "Section 01", "The Verdict");
      doc.fontSize(11).fillColor(BRAND_COLORS.text).font(bf("serif"))
        .text(topLane?.headline ?? "Strategy review pending.", 50, y, { width: doc.page.width - 100, lineGap: 4 });
      y = doc.y + 16;
      doc.fontSize(10).fillColor(BRAND_COLORS.textMuted).font(bf("sans"))
        .text("This is a summary view. The full numerical breakdown, risk register, capital stack, and sensitivity grid are available in the full snapshot tier.",
          50, y, { width: doc.page.width - 100, lineGap: 2 });
    }
    snapshotPageFooter(doc, "For analysis only. Human review required.");

    // Page 3 — Risk Register (full only)
    if (isFull) {
      doc.addPage();
      let y = snapshotPageHeader(doc, "Section 02", "Risk Register");
      const risks = (snap.risks ?? []) as any[];
      if (risks.length === 0) {
        doc.fontSize(10).fillColor(BRAND_COLORS.textMuted).font(bf("serifItalic"))
          .text("No risk flags fired with current inputs.", 50, y);
      } else {
        for (const r of risks.slice(0, 14)) {
          if (y > doc.page.height - 100) { doc.addPage(); y = snapshotPageHeader(doc, "Section 02", "Risk Register (continued)"); }
          const colorMap: Record<string, string> = { blocker: "#b91c1c", high: "#b91c1c", watch: BRAND_COLORS.accent, info: BRAND_COLORS.textMuted };
          const c = colorMap[r.severity] ?? BRAND_COLORS.textMuted;
          doc.rect(50, y, 3, 36).fill(c);
          doc.fontSize(9).fillColor(c).font(bf("sansBold"))
            .text(String(r.severity ?? "info").toUpperCase(), 62, y + 2, { characterSpacing: 1.5 });
          doc.fontSize(11).fillColor(BRAND_COLORS.text).font(bf("serifBold")).text(r.title ?? "", 62, y + 14);
          doc.fontSize(10).fillColor(BRAND_COLORS.textMuted).font(bf("sans"))
            .text(r.detail ?? "", 62, doc.y + 2, { width: doc.page.width - 122, lineGap: 1 });
          y = doc.y + 12;
        }
      }
      snapshotPageFooter(doc, "Risk flags are directional, not exhaustive.");

      // Page 4 — Capital Stack
      doc.addPage();
      y = snapshotPageHeader(doc, "Section 03", "Capital Stack");
      const stack = (snap.capitalStack ?? []) as any[];
      if (stack.length === 0) {
        doc.fontSize(10).fillColor(BRAND_COLORS.textMuted).font(bf("serifItalic"))
          .text("Capital stack not yet modeled.", 50, y);
      } else {
        const total = stack.reduce((s, e) => s + (e.amount ?? 0), 0) || 1;
        for (const e of stack) {
          if (y > doc.page.height - 100) { doc.addPage(); y = snapshotPageHeader(doc, "Section 03", "Capital Stack (cont.)"); }
          const pct = ((e.amount ?? 0) / total) * 100;
          doc.fontSize(11).fillColor(BRAND_COLORS.text).font(bf("serifBold"))
            .text(String(e.kind ?? "—").replace(/_/g, " "), 50, y);
          doc.fontSize(11).fillColor(BRAND_COLORS.text).font(bf("sansBold"))
            .text(fmtDollarsShort(e.amount), 50, y, { width: doc.page.width - 100, align: "right" });
          y = doc.y + 4;
          // Bar
          const barW = doc.page.width - 100;
          doc.rect(50, y, barW, 6).fill("#efe9dc");
          doc.rect(50, y, barW * (pct / 100), 6).fill(BRAND_COLORS.accent);
          y += 10;
          doc.fontSize(9).fillColor(BRAND_COLORS.textMuted).font(bf("sans"))
            .text(`${pct.toFixed(0)}% of stack${e.ratePct ? ` · ${e.ratePct}% rate` : ""}${e.note ? ` · ${e.note}` : ""}`,
              50, y, { width: doc.page.width - 100 });
          y += 22;
        }
        doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor(BRAND_COLORS.accent).lineWidth(1).stroke();
        y += 8;
        doc.fontSize(11).fillColor(BRAND_COLORS.primary).font(bf("sansBold"))
          .text("Total cash in", 50, y);
        doc.fontSize(11).fillColor(BRAND_COLORS.accent).font(bf("sansBold"))
          .text(fmtDollarsShort(snap.totalCashIn ?? total), 50, y, { width: doc.page.width - 100, align: "right" });
      }
      snapshotPageFooter(doc, "Stack model is illustrative. Actual terms set by capital partner.");

      // Page 5 — Sensitivity (top grid)
      doc.addPage();
      y = snapshotPageHeader(doc, "Section 04", "Sensitivity");
      const grid = ((snap.sensitivities ?? []) as any[])[0];
      if (!grid) {
        doc.fontSize(10).fillColor(BRAND_COLORS.textMuted).font(bf("serifItalic"))
          .text("Sensitivity grid not generated for current inputs.", 50, y);
      } else {
        doc.fontSize(10).fillColor(BRAND_COLORS.textMuted).font(bf("sans"))
          .text(`${grid.yAxis?.label ?? ""} (rows) × ${grid.xAxis?.label ?? ""} (cols) — cell shows ${grid.metric?.replace(/_/g, " ")}.`,
            50, y, { width: doc.page.width - 100 });
        y = doc.y + 14;
        const xs = grid.xAxis?.values ?? [];
        const ys = grid.yAxis?.values ?? [];
        const cw = Math.min(70, (doc.page.width - 160) / Math.max(xs.length, 1));
        const rh = 24;
        // Header
        doc.fontSize(8).fillColor(BRAND_COLORS.textMuted).font(bf("sansBold"));
        xs.forEach((xv: number, i: number) => {
          doc.text(String(xv), 110 + i * cw, y, { width: cw, align: "center" });
        });
        y += 14;
        ys.forEach((yv: number, ri: number) => {
          doc.fontSize(8).fillColor(BRAND_COLORS.textMuted).font(bf("sansBold"))
            .text(String(yv), 50, y + 6, { width: 56 });
          xs.forEach((_xv: number, ci: number) => {
            const idx = ri * xs.length + ci;
            const v = grid.cells?.[idx] ?? 0;
            const positive = v >= 0;
            const intensity = Math.min(1, Math.abs(v) / Math.max(...grid.cells.map((c: number) => Math.abs(c)), 1));
            const bg = positive
              ? `rgb(${Math.round(246 - 60 * intensity)},${Math.round(239 - 30 * intensity)},${Math.round(228 - 100 * intensity)})`
              : `rgb(${Math.round(246 - 30 * intensity)},${Math.round(220 - 80 * intensity)},${Math.round(220 - 80 * intensity)})`;
            doc.rect(108 + ci * cw, y, cw - 2, rh).fill(bg);
            doc.fontSize(8).fillColor(positive ? BRAND_COLORS.primary : "#7c2d12").font(bf("sans"))
              .text(fmtDollarsShort(v), 108 + ci * cw, y + 8, { width: cw - 2, align: "center" });
          });
          y += rh + 2;
        });
      }
      snapshotPageFooter(doc, "Sensitivity is directional. Stress-test before committing capital.");
    }

    // Page 6 — Decision Memo (always)
    doc.addPage();
    let y = snapshotPageHeader(doc, isFull ? "Section 05" : "Section 02", "Decision Memo");
    doc.fontSize(13).fillColor(BRAND_COLORS.text).font(bf("serif"))
      .text(snap.memo?.paragraph ?? "Memo pending engine output.", 50, y,
        { width: doc.page.width - 100, lineGap: 6 });
    y = doc.y + 18;
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor(BRAND_COLORS.accent).lineWidth(0.5).stroke();
    y += 12;
    doc.fontSize(9).fillColor(BRAND_COLORS.accent).font(bf("sansBold"))
      .text("RECOMMENDED NEXT STEP", 50, y, { characterSpacing: 2 });
    y += 16;
    doc.fontSize(12).fillColor(BRAND_COLORS.text).font(bf("serifItalic"))
      .text(snap.memo?.nextStep ?? "Submit to Pegasus for human review.", 50, y, { width: doc.page.width - 100, lineGap: 4 });
    snapshotPageFooter(doc, "Memo is preliminary. Submit for human review before any binding decision.");

    // Page 7 — Disclosure (always)
    doc.addPage();
    y = snapshotPageHeader(doc, isFull ? "Section 06" : "Section 03", "Disclosure");
    const disclaimer = [
      "This Property Strategy Snapshot is a preliminary, directional read of structural paths and economics. It is not an offer, valuation, appraisal, financing commitment, or guarantee. It is not investment advice and not an offer of guaranteed returns or principal protection.",
      "",
      "Pegasus Dreamscapes Corp reviews every property submitted through the Strategy Lab. Not every property results in an offer. Numbers are illustrative and depend on the inputs you provided. Comp bands, ARV, and rent estimates are indicative only and require human verification.",
      "",
      "No lead dies. Every property gets a serious review. Not every property gets an offer.",
    ];
    for (const para of disclaimer) {
      if (para === "") { y += 6; continue; }
      doc.fontSize(10).fillColor(BRAND_COLORS.text).font(bf("serif"))
        .text(para, 50, y, { width: doc.page.width - 100, lineGap: 4 });
      y = doc.y + 4;
    }
    y = doc.page.height - 140;
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor(BRAND_COLORS.accent).lineWidth(1).stroke();
    y += 14;
    doc.fontSize(10).fillColor(BRAND_COLORS.primary).font(bf("sansBold"))
      .text("Pegasus Dreamscapes Corp · The Deal Architect", 50, y);
    y += 14;
    doc.fontSize(9).fillColor(BRAND_COLORS.textMuted).font(bf("sans"))
      .text("apollo@pegasusdreamscapes.com  ·  925-744-8525  ·  pegasusdreamscapes.com", 50, y);
    snapshotPageFooter(doc, "For analysis only. Human review required before any offer or execution decision.");

    doc.end();
  });
}
