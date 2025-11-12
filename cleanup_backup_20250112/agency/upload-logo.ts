import { supabaseAdmin } from "@/server/supabaseAdmin";
import formidable from "formidable";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!supabaseAdmin) {
    return res.status(503).json({
      error: "Service unavailable",
      details:
        "Database not configured. Agency features require Supabase setup.",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({ maxFileSize: 5 * 1024 * 1024 });

    const [fields, files] = await form.parse(req);

    const agencyId = fields.agencyId?.[0];
    const logoFile = files.logo?.[0];

    if (!agencyId || !logoFile) {
      return res.status(400).json({ error: "Missing agency ID or logo file" });
    }

    // Validate file type
    if (
      !["image/png", "image/jpeg", "image/svg+xml"].includes(
        logoFile.mimetype || ""
      )
    ) {
      return res
        .status(400)
        .json({ error: "Invalid file type. Only PNG, JPG, and SVG allowed." });
    }

    // Read file
    const fileBuffer = fs.readFileSync(logoFile.filepath);
    const fileName = `${agencyId}-${Date.now()}.${logoFile.mimetype?.split("/")[1] || "png"}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("agency-logos")
      .upload(fileName, fileBuffer, {
        contentType: logoFile.mimetype || "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload logo" });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("agency-logos")
      .getPublicUrl(fileName);

    const logoUrl = urlData.publicUrl;

    // Update agency with new logo URL
    const { error: updateError } = await supabaseAdmin
      .from("agencies")
      .update({ logo_url: logoUrl })
      .eq("id", agencyId);

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ error: "Failed to update agency logo" });
    }

    // Clean up temp file
    fs.unlinkSync(logoFile.filepath);

    return res.status(200).json({ logoUrl });
  } catch (error) {
    console.error("Logo upload error:", error);
    return res.status(500).json({
      error: "Failed to upload logo",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
