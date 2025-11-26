import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Helper to get Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

// GET /api/demos - Get all demos/clients
export async function GET() {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      // Return empty array if Supabase not configured (demo mode)
      console.warn("Supabase not configured - returning empty client list");
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from("demos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      // Return empty array instead of error for better UX
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Failed to fetch demos:", error);
    // Return empty array instead of error
    return NextResponse.json([]);
  }
}

// POST /api/demos - Create a new demo/client
// ONLY for agency portal manual client additions
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        {
          error:
            "Database not configured. Please set up Supabase credentials in .env.local",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      website_url,
      business_name,
      industry,
      intelligence_data,
      created_by_email,
    } = body;

    if (!website_url) {
      return NextResponse.json(
        { error: "website_url is required" },
        { status: 400 }
      );
    }

    // Prevent creation of contractor mode entries or test data
    if (website_url === "contractor-setup" || body.contractor_mode === true) {
      return NextResponse.json(
        {
          error: "Cannot create contractor mode clients through this endpoint",
        },
        { status: 400 }
      );
    }

    // Validate that this is a real website URL
    try {
      const url = new URL(
        website_url.startsWith("http") ? website_url : `https://${website_url}`
      );
      if (!url.hostname.includes(".")) {
        throw new Error("Invalid hostname");
      }
    } catch {
      return NextResponse.json(
        {
          error: "Invalid website URL. Please provide a real website address.",
        },
        { status: 400 }
      );
    }

    // Generate a unique ID for the demo
    const demoId = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Check if demo already exists for this URL
    const { data: existing } = await supabase
      .from("demos")
      .select("id")
      .eq("website_url", website_url)
      .maybeSingle();

    if (existing) {
      console.log("Client already exists for URL:", website_url);
      return NextResponse.json(
        {
          message: "Client already exists",
          id: existing.id,
          existing: true,
        },
        { status: 200 }
      );
    }

    // Prepare insert data - only include columns that exist in the table
    const insertData: any = {
      id: demoId,
      website_url,
      business_name: business_name || "Unnamed Business",
      created_at: new Date().toISOString(),
    };

    // Add optional columns if they exist in your schema
    if (industry) insertData.industry = industry;
    if (intelligence_data) insertData.intelligence_data = intelligence_data;
    if (created_by_email) insertData.created_by_email = created_by_email;

    // Explicitly set contractor_mode to false for agency clients
    insertData.contractor_mode = false;

    console.log("Inserting new agency client:", {
      business_name: insertData.business_name,
      website_url: insertData.website_url,
      created_by: created_by_email || "unknown",
    });

    // Insert new demo/client
    const { data, error } = await supabase
      .from("demos")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        {
          error: error.message,
          details: error.details || "Failed to insert client",
        },
        { status: 500 }
      );
    }

    console.log("Client added successfully:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create demo:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create demo" },
      { status: 500 }
    );
  }
}

// DELETE /api/demos?id=xxx - Delete a specific client
// DELETE /api/demos?cleanup=unnamed - Delete all "Unnamed Business" clients
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("id");
    const cleanup = searchParams.get("cleanup");

    // Cleanup operation - delete all "Unnamed Business" entries AND contractor entries
    if (cleanup === "unnamed") {
      // Delete all problematic entries in one query
      const { data, error } = await supabase
        .from("demos")
        .delete()
        .or(
          'business_name.eq.Unnamed Business,business_name.eq.Contractor Business,website_url.eq.contractor-setup,contractor_mode.eq.true'
        )
        .select();

      if (error) {
        console.error("Cleanup error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log(`Cleaned up ${data?.length || 0} unwanted clients`);
      return NextResponse.json({
        message: `Deleted ${data?.length || 0} unwanted clients (Unnamed Business, Contractor Business, and test entries)`,
        count: data?.length || 0,
      });
    }

    // Delete specific client by ID
    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required (use ?id=xxx or ?cleanup=unnamed)" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("demos")
      .delete()
      .eq("id", clientId)
      .select()
      .single();

    if (error) {
      console.error("Delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    console.log("Client deleted:", clientId);
    return NextResponse.json({
      message: "Client deleted successfully",
      id: clientId,
    });
  } catch (error: any) {
    console.error("Failed to delete client:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete client" },
      { status: 500 }
    );
  }
}
