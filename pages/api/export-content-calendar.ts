import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { contentCalendar, businessName } = req.body;

  if (!contentCalendar || !Array.isArray(contentCalendar)) {
    return res.status(400).json({ error: "contentCalendar is required" });
  }

  try {
    // Generate CSV content
    const headers = ["Day", "Platform", "Content", "Hashtags"];
    const rows = contentCalendar.map((item: any) => [
      item.day || "",
      item.platform || "",
      item.content || "",
      item.hashtags ? item.hashtags.join(" ") : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Return CSV data
    return res.status(200).json({
      success: true,
      csv: csvContent,
      filename: `${businessName || "Business"}_Content_Calendar.csv`,
    });
  } catch (error) {
    console.error("Export calendar error:", error);
    return res.status(500).json({ error: "Failed to export calendar" });
  }
}
