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
  primary: "#1a1a1a",
  secondary: "#f5f0eb",
  accent: "#c9a677",
  text: "#1a1a1a",
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
    .fontSize(28)
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .text("DREAMSCAPER DEALFLOW", 50, 35, { align: "left" });

  doc
    .fontSize(10)
    .fillColor(BRAND_COLORS.accent)
    .font("Helvetica")
    .text("Where Capital Meets Chemistry", 50, 65);

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
    .text(
      `Generated on ${new Date().toLocaleDateString()} | Dreamscaper Dealflow - Professional Real Estate Investment Platform`,
      50,
      pageHeight - 40,
      { align: "center", width: doc.page.width - 100 }
    );

  doc
    .fontSize(8)
    .fillColor(BRAND_COLORS.accent)
    .text(
      "Disclaimer: This analysis is for informational purposes only and does not constitute financial advice.",
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
