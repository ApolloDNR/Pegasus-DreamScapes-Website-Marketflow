import PDFDocument from "pdfkit";
import { CapitalProject, User } from "@shared/schema";

interface InvestmentDetails {
  investmentAmount: number;
  structureType: "equity" | "debt" | "hybrid";
  role: string;
  equityPercent?: string;
  profitSplit?: string;
  interestRate?: string;
  loanDuration?: string;
  isAcceptingOperatorTerms: boolean;
}

interface GeneratedTermSheet {
  buffer: Buffer;
  filename: string;
}

export function generateTermSheetPDF(
  project: CapitalProject,
  investor: { firstName?: string | null; lastName?: string | null; email?: string | null },
  investment: InvestmentDetails
): Promise<GeneratedTermSheet> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margin: 50,
        info: {
          Title: `Investor Term Sheet - ${project.title}`,
          Author: "Pegasus Dreamscapes Corp",
        }
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const filename = `term-sheet-${project.id}-${Date.now()}.pdf`;
        resolve({ buffer, filename });
      });
      doc.on("error", reject);

      const primaryColor = "#C87533";
      const accentColor = "#8B6914";
      const textColor = "#1a1a1a";
      const mutedColor = "#666666";

      const formatCurrency = (amount: number | null | undefined): string => {
        if (!amount) return "$0";
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
      };

      const formatDate = (date: Date | null | undefined): string => {
        if (!date) return "TBD";
        return new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      };

      doc.rect(0, 0, doc.page.width, 100).fill(primaryColor);

      doc.fontSize(28).font("Helvetica-Bold").fillColor("#ffffff");
      doc.text("Pegasus Dreamscapes", 50, 35, { align: "left" });
      doc.fontSize(12).font("Helvetica").fillColor("#ffffff");
      doc.text("Investor Term Sheet", 50, 70);

      doc.moveDown(3);

      doc.fontSize(18).font("Helvetica-Bold").fillColor(textColor);
      doc.text(project.title || "Investment Opportunity", 50, 130);
      doc.fontSize(11).font("Helvetica").fillColor(mutedColor);
      doc.text(project.location || "Location TBD", 50, 155);
      doc.text(`Generated: ${formatDate(new Date())}`, 50, 170);

      doc.moveTo(50, 195).lineTo(562, 195).stroke(primaryColor);

      let yPos = 215;

      doc.fontSize(14).font("Helvetica-Bold").fillColor(primaryColor);
      doc.text("SECTION 1 — DEAL OVERVIEW", 50, yPos);
      yPos += 25;

      const dealDetails = [
        ["Project Name", project.title],
        ["Location", project.location],
        ["Operator", "Pegasus Dreamscapes Corp"],
        ["Raise Type", project.structure],
        ["Raise Goal", formatCurrency(project.fundingGoal)],
        ["Term Length", project.holdPeriod],
        ["Target Return", project.projectedReturn],
      ];

      doc.fontSize(10).font("Helvetica");
      dealDetails.forEach(([label, value]) => {
        doc.fillColor(mutedColor).text(label as string, 50, yPos, { width: 150 });
        doc.fillColor(textColor).text((value as string) || "N/A", 200, yPos);
        yPos += 18;
      });

      yPos += 15;
      doc.moveTo(50, yPos).lineTo(562, yPos).stroke("#e0e0e0");
      yPos += 20;

      doc.fontSize(14).font("Helvetica-Bold").fillColor(primaryColor);
      doc.text("SECTION 2 — INVESTOR COMMITMENT", 50, yPos);
      yPos += 25;

      const investorName = [investor.firstName, investor.lastName].filter(Boolean).join(" ") || "Investor";
      const investorDetails = [
        ["Investor Name", investorName],
        ["Investor Email", investor.email || "N/A"],
        ["Investment Role", investment.role],
        ["Investment Amount", formatCurrency(investment.investmentAmount)],
        ["Investment Date", formatDate(new Date())],
        ["Terms Accepted", investment.isAcceptingOperatorTerms ? "Operator's Terms" : "Counter-Offer"],
      ];

      doc.fontSize(10).font("Helvetica");
      investorDetails.forEach(([label, value]) => {
        doc.fillColor(mutedColor).text(label as string, 50, yPos, { width: 150 });
        doc.fillColor(textColor).text((value as string) || "N/A", 200, yPos);
        yPos += 18;
      });

      yPos += 15;
      doc.moveTo(50, yPos).lineTo(562, yPos).stroke("#e0e0e0");
      yPos += 20;

      doc.fontSize(14).font("Helvetica-Bold").fillColor(primaryColor);
      doc.text("SECTION 3 — RETURN STRUCTURE", 50, yPos);
      yPos += 25;

      if (investment.structureType === "debt" || investment.structureType === "hybrid") {
        doc.fontSize(11).font("Helvetica-Bold").fillColor(textColor);
        doc.text("Debt Component", 50, yPos);
        yPos += 18;

        const rate = parseFloat((investment.interestRate || project.askingInterestRate || "0").replace(/[^0-9.]/g, "")) / 100;
        const durationMatch = (investment.loanDuration || project.askingLoanDuration || "12").match(/(\d+)/);
        const termMonths = durationMatch ? parseInt(durationMatch[1]) : 12;
        const termYears = termMonths / 12;
        
        const interestEarned = investment.investmentAmount * rate * termYears;
        const totalPayout = investment.investmentAmount + interestEarned;
        const monthlyEquiv = interestEarned / termMonths;

        const debtDetails = [
          ["Principal", formatCurrency(investment.investmentAmount)],
          ["Annual Rate", investment.interestRate || project.askingInterestRate || "N/A"],
          ["Term", investment.loanDuration || project.askingLoanDuration || "N/A"],
          ["Interest Earned", formatCurrency(interestEarned)],
          ["Total Payout", formatCurrency(totalPayout)],
          ["Monthly Equivalent", formatCurrency(monthlyEquiv)],
        ];

        doc.fontSize(10).font("Helvetica");
        debtDetails.forEach(([label, value]) => {
          doc.fillColor(mutedColor).text(label as string, 70, yPos, { width: 150 });
          doc.fillColor(textColor).text(value as string, 220, yPos);
          yPos += 16;
        });
        yPos += 10;
      }

      if (investment.structureType === "equity" || investment.structureType === "hybrid") {
        doc.fontSize(11).font("Helvetica-Bold").fillColor(textColor);
        doc.text("Equity Component", 50, yPos);
        yPos += 18;

        const profitLow = project.projectedProfitLow || 0;
        const profitBase = project.projectedProfit || 0;
        const profitHigh = project.projectedProfitHigh || 0;
        
        const profitSplit = investment.profitSplit || project.askingProfitSplit || "70/30";
        const investorSplitPercent = parseInt(profitSplit.split("/")[0]) || 70;
        const investorShareOfRaise = investment.investmentAmount / (project.fundingGoal || 1);

        const shareLow = profitLow * (investorSplitPercent / 100) * investorShareOfRaise;
        const shareBase = profitBase * (investorSplitPercent / 100) * investorShareOfRaise;
        const shareHigh = profitHigh * (investorSplitPercent / 100) * investorShareOfRaise;

        doc.fontSize(10).font("Helvetica");
        doc.fillColor(mutedColor).text("Equity %", 70, yPos, { width: 130 });
        doc.fillColor(textColor).text(`${investment.equityPercent || project.askingEquityPercent || "N/A"}%`, 220, yPos);
        yPos += 16;
        
        doc.fillColor(mutedColor).text("Profit Split", 70, yPos, { width: 130 });
        doc.fillColor(textColor).text(profitSplit, 220, yPos);
        yPos += 20;

        doc.font("Helvetica-Bold").fillColor(textColor);
        doc.text("Scenario Analysis", 70, yPos);
        yPos += 16;

        const tableHeaders = ["Scenario", "Project Profit", "Your Share", "Multiple"];
        const tableData = [
          ["Low Case", formatCurrency(profitLow), formatCurrency(shareLow), shareLow > 0 ? `${((investment.investmentAmount + shareLow) / investment.investmentAmount).toFixed(2)}x` : "N/A"],
          ["Base Case", formatCurrency(profitBase), formatCurrency(shareBase), shareBase > 0 ? `${((investment.investmentAmount + shareBase) / investment.investmentAmount).toFixed(2)}x` : "N/A"],
          ["High Case", formatCurrency(profitHigh), formatCurrency(shareHigh), shareHigh > 0 ? `${((investment.investmentAmount + shareHigh) / investment.investmentAmount).toFixed(2)}x` : "N/A"],
        ];

        doc.fontSize(9).font("Helvetica-Bold").fillColor(mutedColor);
        tableHeaders.forEach((header, i) => {
          doc.text(header, 70 + i * 120, yPos, { width: 110 });
        });
        yPos += 14;

        doc.font("Helvetica").fillColor(textColor);
        tableData.forEach((row) => {
          row.forEach((cell, i) => {
            doc.text(cell, 70 + i * 120, yPos, { width: 110 });
          });
          yPos += 14;
        });
        yPos += 10;
      }

      if (yPos > 600) {
        doc.addPage();
        yPos = 50;
      }

      yPos += 15;
      doc.moveTo(50, yPos).lineTo(562, yPos).stroke("#e0e0e0");
      yPos += 20;

      doc.fontSize(14).font("Helvetica-Bold").fillColor(primaryColor);
      doc.text("SECTION 4 — CAPITAL STACK", 50, yPos);
      yPos += 25;

      const totalCost = (project.purchasePrice || 0) + (project.rehabBudget || 0) + 
                        (project.softCosts || 0) + (project.contingency || 0);

      const capitalStack = [
        ["Purchase Price", formatCurrency(project.purchasePrice), "—"],
        ["Construction/Rehab", formatCurrency(project.rehabBudget), "—"],
        ["Soft Costs", formatCurrency(project.softCosts), "—"],
        ["Contingency", formatCurrency(project.contingency), "—"],
        ["Total Project Cost", formatCurrency(totalCost), "100%"],
        ["", "", ""],
        ["Senior Loan", formatCurrency(project.seniorLoan), totalCost > 0 ? `${Math.round(((project.seniorLoan || 0) / totalCost) * 100)}%` : "—"],
        ["Investor Capital", formatCurrency(project.fundingGoal), totalCost > 0 ? `${Math.round(((project.fundingGoal || 0) / totalCost) * 100)}%` : "—"],
        ["Operator Equity", formatCurrency(project.operatorEquity), totalCost > 0 ? `${Math.round(((project.operatorEquity || 0) / totalCost) * 100)}%` : "—"],
      ];

      doc.fontSize(9).font("Helvetica-Bold").fillColor(mutedColor);
      doc.text("Component", 50, yPos, { width: 180 });
      doc.text("Amount", 230, yPos, { width: 120 });
      doc.text("Percentage", 350, yPos, { width: 80 });
      yPos += 14;

      doc.font("Helvetica").fillColor(textColor);
      capitalStack.forEach(([component, amount, percentage]) => {
        if (component === "") {
          yPos += 6;
          return;
        }
        const isBold = component.includes("Total");
        doc.font(isBold ? "Helvetica-Bold" : "Helvetica");
        doc.text(component, 50, yPos, { width: 180 });
        doc.text(amount, 230, yPos, { width: 120 });
        doc.text(percentage, 350, yPos, { width: 80 });
        yPos += 14;
      });

      if (yPos > 600) {
        doc.addPage();
        yPos = 50;
      }

      yPos += 15;
      doc.moveTo(50, yPos).lineTo(562, yPos).stroke("#e0e0e0");
      yPos += 20;

      doc.fontSize(14).font("Helvetica-Bold").fillColor(primaryColor);
      doc.text("SECTION 5 — PROJECT TIMELINE", 50, yPos);
      yPos += 25;

      const timeline = [
        ["Acquisition", formatDate(project.acquisitionDate || project.startDate)],
        ["Construction Start", formatDate(project.constructionStart)],
        ["Construction End", formatDate(project.constructionEnd)],
        ["Stabilization", formatDate(project.stabilizationDate)],
        ["Target Exit", formatDate(project.exitDate || project.estimatedCompletion)],
      ];

      doc.fontSize(10).font("Helvetica");
      timeline.forEach(([phase, date]) => {
        doc.fillColor(mutedColor).text("→ " + (phase as string), 50, yPos, { width: 180 });
        doc.fillColor(textColor).text(date as string, 230, yPos);
        yPos += 16;
      });

      if (yPos > 550) {
        doc.addPage();
        yPos = 50;
      }

      yPos += 15;
      doc.moveTo(50, yPos).lineTo(562, yPos).stroke("#e0e0e0");
      yPos += 20;

      doc.fontSize(14).font("Helvetica-Bold").fillColor(primaryColor);
      doc.text("SECTION 6 — RISKS & DISCLOSURES", 50, yPos);
      yPos += 20;

      doc.fontSize(9).font("Helvetica").fillColor(mutedColor);
      const disclaimers = [
        "• This term sheet is for informational purposes only and does not constitute a binding legal agreement.",
        "• Investment in real estate involves substantial risk including the potential loss of principal.",
        "• Past performance does not guarantee future results. Projected returns are estimates only.",
        "• Debt investments carry fixed interest obligations; equity investments depend on project performance.",
        "• The investor acknowledges receipt and review of all offering documents and project materials.",
        "• Consult with qualified legal, tax, and financial advisors before making investment decisions.",
      ];

      disclaimers.forEach((disclaimer) => {
        doc.text(disclaimer, 50, yPos, { width: 512 });
        yPos += 12;
      });

      if (yPos > 650) {
        doc.addPage();
        yPos = 50;
      }

      yPos += 20;
      doc.moveTo(50, yPos).lineTo(562, yPos).stroke("#e0e0e0");
      yPos += 20;

      doc.fontSize(14).font("Helvetica-Bold").fillColor(primaryColor);
      doc.text("SECTION 7 — OPERATOR INFORMATION", 50, yPos);
      yPos += 25;

      doc.fontSize(10).font("Helvetica");
      doc.fillColor(mutedColor).text("Company", 50, yPos, { width: 120 });
      doc.fillColor(textColor).text("Pegasus Dreamscapes Corp", 170, yPos);
      yPos += 16;
      doc.fillColor(mutedColor).text("Principal", 50, yPos, { width: 120 });
      doc.fillColor(textColor).text("Apollo Duran", 170, yPos);
      yPos += 16;
      doc.fillColor(mutedColor).text("Tagline", 50, yPos, { width: 120 });
      doc.fillColor(textColor).text('"Where Designed Profits Are Crafted"', 170, yPos);
      yPos += 30;

      doc.moveTo(50, yPos).lineTo(562, yPos).stroke("#e0e0e0");
      yPos += 20;

      doc.fontSize(14).font("Helvetica-Bold").fillColor(primaryColor);
      doc.text("SECTION 8 — SIGNATURE BLOCKS", 50, yPos);
      yPos += 30;

      doc.fontSize(10).font("Helvetica").fillColor(textColor);
      doc.text("Investor Signature: _________________________________", 50, yPos);
      doc.text("Date: _______________", 400, yPos);
      yPos += 40;

      doc.text("Operator Signature: _________________________________", 50, yPos);
      doc.text("Date: _______________", 400, yPos);

      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).fillColor(mutedColor);
        doc.text(
          `Pegasus Dreamscapes Corp | Confidential | Page ${i + 1} of ${pageCount}`,
          50,
          doc.page.height - 30,
          { align: "center", width: doc.page.width - 100 }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
