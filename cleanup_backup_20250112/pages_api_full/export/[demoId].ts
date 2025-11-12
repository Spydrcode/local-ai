import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";
import { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";
import pptxgen from "pptxgenjs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate PDF Report
async function generatePDF(demo: any, analysis: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc
        .fontSize(24)
        .fillColor("#10b981")
        .text("We Build Apps", { align: "center" });
      doc
        .fontSize(14)
        .fillColor("#666")
        .text("Strategic Analysis Report", { align: "center" });
      doc.moveDown();

      // Business Name
      doc
        .fontSize(20)
        .fillColor("#000")
        .text(demo.business_name || "Business Analysis", { align: "center" });
      doc
        .fontSize(10)
        .fillColor("#666")
        .text(demo.website_url || "", { align: "center" });
      doc.moveDown(2);

      // Executive Summary
      doc.fontSize(16).fillColor("#000").text("Executive Summary");
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .fillColor("#333")
        .text(demo.summary || "No summary available", { align: "justify" });
      doc.moveDown(2);

      // Website Grade
      if (analysis.websiteGrade) {
        doc.fontSize(16).fillColor("#000").text("Website Performance");
        doc.moveDown(0.5);
        doc
          .fontSize(14)
          .fillColor("#10b981")
          .text(`Grade: ${analysis.websiteGrade.score}/100`);
        doc
          .fontSize(10)
          .fillColor("#333")
          .text(analysis.websiteGrade.roiProjection || "");
        doc.moveDown(1);

        if (analysis.websiteGrade.improvements?.length > 0) {
          doc.fontSize(12).fillColor("#000").text("Key Improvements:");
          analysis.websiteGrade.improvements.forEach(
            (improvement: string, i: number) => {
              doc
                .fontSize(10)
                .fillColor("#333")
                .text(`${i + 1}. ${improvement}`, { indent: 20 });
            }
          );
        }
        doc.moveDown(2);
      }

      // Profit Insights
      if (demo.profit_insights?.length > 0) {
        doc.addPage();
        doc
          .fontSize(16)
          .fillColor("#000")
          .text("Strategic Insights & Action Items");
        doc.moveDown(1);

        demo.profit_insights.forEach((insight: any, i: number) => {
          if (i > 0) doc.moveDown(1.5);
          doc
            .fontSize(12)
            .fillColor("#10b981")
            .text(`${i + 1}. ${insight.title}`);
          doc
            .fontSize(10)
            .fillColor("#333")
            .text(insight.description, { indent: 20 });
          doc
            .fontSize(10)
            .fillColor("#666")
            .text(`Action: ${insight.actionItem}`, {
              indent: 20,
              oblique: true,
            });
        });
      }

      // Competitor Analysis
      if (analysis.competitorAnalysis?.competitors?.length > 0) {
        doc.addPage();
        doc.fontSize(16).fillColor("#000").text("Competitive Landscape");
        doc.moveDown(1);

        analysis.competitorAnalysis.competitors.forEach(
          (comp: any, i: number) => {
            if (i > 0) doc.moveDown(1.5);
            doc.fontSize(12).fillColor("#000").text(comp.name);
            doc
              .fontSize(10)
              .fillColor("#666")
              .text(comp.url || "", { link: comp.url });

            if (comp.strengths?.length > 0) {
              doc
                .fontSize(10)
                .fillColor("#10b981")
                .text("Strengths:", { indent: 20 });
              comp.strengths.forEach((s: string) => {
                doc
                  .fontSize(9)
                  .fillColor("#333")
                  .text(`• ${s}`, { indent: 40 });
              });
            }

            if (comp.weaknesses?.length > 0) {
              doc
                .fontSize(10)
                .fillColor("#ef4444")
                .text("Weaknesses:", { indent: 20 });
              comp.weaknesses.forEach((w: string) => {
                doc
                  .fontSize(9)
                  .fillColor("#333")
                  .text(`• ${w}`, { indent: 40 });
              });
            }
          }
        );
      }

      // Footer on last page
      const pageCount = (doc as any).bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .fillColor("#999")
          .text(
            `Page ${i + 1} of ${pageCount} | Generated by We Build Apps | ${new Date().toLocaleDateString()}`,
            50,
            doc.page.height - 50,
            { align: "center" }
          );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Generate Excel Spreadsheet
async function generateExcel(
  demo: any,
  roiData: any,
  roadmapData: any
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // Financial Projections Sheet
  const financeSheet = workbook.addWorksheet("Financial Projections");

  financeSheet.columns = [
    { header: "Category", key: "category", width: 25 },
    { header: "Value", key: "value", width: 20 },
    { header: "Notes", key: "notes", width: 40 },
  ];

  // Style header
  financeSheet.getRow(1).font = { bold: true, size: 12 };
  financeSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF10b981" },
  };

  if (roiData?.roadmap) {
    financeSheet.addRow({
      category: "INITIAL INVESTMENT",
      value: "",
      notes: "",
    });
    financeSheet.addRow({
      category: "Total Investment",
      value: roiData.roadmap.initialInvestment?.total || "N/A",
      notes: "",
    });

    roiData.roadmap.initialInvestment?.breakdown?.forEach((item: any) => {
      financeSheet.addRow({
        category: `  ${item.item}`,
        value: item.cost,
        notes: "",
      });
    });

    financeSheet.addRow({ category: "", value: "", notes: "" });
    financeSheet.addRow({
      category: "REVENUE PROJECTIONS",
      value: "",
      notes: "",
    });

    if (roiData.roadmap.projectedRevenue) {
      financeSheet.addRow({
        category: "3 Month",
        value: roiData.roadmap.projectedRevenue.month3?.revenue || "N/A",
        notes: roiData.roadmap.projectedRevenue.month3?.description || "",
      });
      financeSheet.addRow({
        category: "6 Month",
        value: roiData.roadmap.projectedRevenue.month6?.revenue || "N/A",
        notes: roiData.roadmap.projectedRevenue.month6?.description || "",
      });
      financeSheet.addRow({
        category: "12 Month",
        value: roiData.roadmap.projectedRevenue.month12?.revenue || "N/A",
        notes: roiData.roadmap.projectedRevenue.month12?.description || "",
      });
    }

    financeSheet.addRow({ category: "", value: "", notes: "" });
    financeSheet.addRow({ category: "ROI METRICS", value: "", notes: "" });

    if (roiData.roadmap.metrics) {
      financeSheet.addRow({
        category: "Break-Even Point",
        value: `${roiData.roadmap.metrics.breakEvenMonths} months`,
        notes: "",
      });
      financeSheet.addRow({
        category: "3-Month ROI",
        value: `${roiData.roadmap.metrics.roi3Month}%`,
        notes: "",
      });
      financeSheet.addRow({
        category: "6-Month ROI",
        value: `${roiData.roadmap.metrics.roi6Month}%`,
        notes: "",
      });
      financeSheet.addRow({
        category: "12-Month ROI",
        value: `${roiData.roadmap.metrics.roi12Month}%`,
        notes: "",
      });
    }
  }

  // Action Items Tracker Sheet
  const actionSheet = workbook.addWorksheet("Action Items Tracker");

  actionSheet.columns = [
    { header: "Month", key: "month", width: 15 },
    { header: "Action Item", key: "title", width: 30 },
    { header: "Priority", key: "priority", width: 12 },
    { header: "Difficulty", key: "difficulty", width: 12 },
    { header: "Est. Cost", key: "cost", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Notes", key: "notes", width: 30 },
  ];

  actionSheet.getRow(1).font = { bold: true, size: 12 };
  actionSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF6366f1" },
  };

  if (roadmapData?.roadmap) {
    roadmapData.roadmap.forEach((month: any) => {
      month.items?.forEach((item: any) => {
        actionSheet.addRow({
          month: month.month,
          title: item.title,
          priority: item.priority,
          difficulty: item.difficulty,
          cost: item.estimatedCost,
          status: "Not Started",
          notes: "",
        });
      });
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// Generate PowerPoint Presentation
async function generatePowerPoint(demo: any, analysis: any): Promise<Buffer> {
  const pres = new pptxgen();

  // Set presentation properties
  pres.author = "We Build Apps";
  pres.company = "We Build Apps";
  pres.title = `${demo.business_name} - Strategic Analysis`;

  // Slide 1: Title Slide
  const slide1 = pres.addSlide();
  slide1.background = { color: "10b981" };
  slide1.addText("We Build Apps", {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: "FFFFFF",
    align: "center",
  });
  slide1.addText("Strategic Analysis Report", {
    x: 0.5,
    y: 2.2,
    w: 9,
    h: 0.4,
    fontSize: 18,
    color: "FFFFFF",
    align: "center",
  });
  slide1.addText(demo.business_name || "Business Analysis", {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: "FFFFFF",
    align: "center",
  });
  slide1.addText(new Date().toLocaleDateString(), {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 0.3,
    fontSize: 14,
    color: "E0E0E0",
    align: "center",
  });

  // Slide 2: Executive Summary
  const slide2 = pres.addSlide();
  slide2.addText("Executive Summary", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 24,
    bold: true,
    color: "000000",
  });
  slide2.addText(demo.summary || "No summary available", {
    x: 0.5,
    y: 1.2,
    w: 9,
    h: 3.5,
    fontSize: 14,
    color: "333333",
    valign: "top",
  });

  // Slide 3: Website Grade
  if (analysis.websiteGrade) {
    const slide3 = pres.addSlide();
    slide3.addText("Website Performance", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: "000000",
    });
    slide3.addText(`Grade: ${analysis.websiteGrade.score}/100`, {
      x: 0.5,
      y: 1.5,
      w: 4,
      h: 1,
      fontSize: 48,
      bold: true,
      color: "10b981",
      align: "center",
    });
    slide3.addText(analysis.websiteGrade.roiProjection || "", {
      x: 0.5,
      y: 2.7,
      w: 9,
      h: 0.5,
      fontSize: 14,
      color: "666666",
      align: "center",
    });
  }

  // Slide 4: Key Insights
  if (demo.profit_insights?.length > 0) {
    const slide4 = pres.addSlide();
    slide4.addText("Strategic Insights", {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: "000000",
    });

    const insights = demo.profit_insights
      .slice(0, 4)
      .map((insight: any, i: number) => ({
        text: `${i + 1}. ${insight.title}`,
        options: { bullet: true, fontSize: 14, color: "333333" },
      }));

    slide4.addText(insights, { x: 0.5, y: 1.2, w: 9, h: 3.5 });
  }

  // Slide 5: Next Steps
  const slide5 = pres.addSlide();
  slide5.addText("Next Steps", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 24,
    bold: true,
    color: "000000",
  });
  slide5.addText(
    [
      {
        text: "Review 90-day implementation roadmap",
        options: { bullet: true, fontSize: 16 },
      },
      {
        text: "Prioritize high-impact action items",
        options: { bullet: true, fontSize: 16 },
      },
      {
        text: "Track progress with monthly check-ins",
        options: { bullet: true, fontSize: 16 },
      },
      {
        text: "Schedule quarterly strategic re-analysis",
        options: { bullet: true, fontSize: 16 },
      },
    ],
    { x: 0.5, y: 1.5, w: 9, h: 3 }
  );

  return pres.write({ outputType: "nodebuffer" }) as Promise<Buffer>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { demoId, format } = req.query;

    if (!demoId || typeof demoId !== "string") {
      return res.status(400).json({ error: "Invalid demo ID" });
    }

    if (
      !format ||
      typeof format !== "string" ||
      !["pdf", "excel", "pptx"].includes(format)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid format. Use: pdf, excel, or pptx" });
    }

    console.log(`📄 Generating ${format} export for demo ${demoId}...`);

    // Fetch demo data
    const { data: demo, error: demoError } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (demoError || !demo) {
      console.error("Error fetching demo:", demoError);
      return res.status(404).json({ error: "Demo not found" });
    }

    // Fetch comprehensive analysis
    const analysisResponse = await fetch(
      `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/comprehensive-analysis/${demoId}`
    );
    const analysis = analysisResponse.ok ? await analysisResponse.json() : {};

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    if (format === "pdf") {
      buffer = await generatePDF(demo, analysis);
      contentType = "application/pdf";
      filename = `${demo.business_name?.replace(/[^a-z0-9]/gi, "_") || "analysis"}_report.pdf`;
    } else if (format === "excel") {
      // Fetch ROI and roadmap data
      const roiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/roi-calculator/${demoId}`
      );
      const roiData = roiResponse.ok ? await roiResponse.json() : {};

      const roadmapResponse = await fetch(
        `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/implementation-roadmap/${demoId}`
      );
      const roadmapData = roadmapResponse.ok
        ? await roadmapResponse.json()
        : {};

      buffer = await generateExcel(demo, roiData, roadmapData);
      contentType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      filename = `${demo.business_name?.replace(/[^a-z0-9]/gi, "_") || "analysis"}_tracker.xlsx`;
    } else {
      buffer = await generatePowerPoint(demo, analysis);
      contentType =
        "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      filename = `${demo.business_name?.replace(/[^a-z0-9]/gi, "_") || "analysis"}_presentation.pptx`;
    }

    console.log(`✅ ${format.toUpperCase()} export generated successfully`);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error("Error generating export:", error);
    return res.status(500).json({
      error: "Failed to generate export",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
