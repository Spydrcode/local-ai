import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

// Check if Supabase is configured
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

// GET /api/demos - Get all demos/clients
export async function GET() {
  try {
    if (!supabase) {
      // Return empty array if Supabase not configured (demo mode)
      console.warn("Supabase not configured - returning empty client list")
      return NextResponse.json([])
    }

    const { data, error } = await supabase
      .from("demos")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      // Return empty array instead of error for better UX
      return NextResponse.json([])
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error("Failed to fetch demos:", error)
    // Return empty array instead of error
    return NextResponse.json([])
  }
}

// POST /api/demos - Create a new demo/client
export async function POST(req: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured. Please set up Supabase credentials in .env.local" },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { website_url, business_name, industry, intelligence_data } = body

    if (!website_url) {
      return NextResponse.json(
        { error: "website_url is required" },
        { status: 400 }
      )
    }

    // Generate a unique ID for the demo
    const demoId = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Check if demo already exists for this URL
    const { data: existing } = await supabase
      .from("demos")
      .select("id")
      .eq("website_url", website_url)
      .maybeSingle()

    if (existing) {
      console.log("Client already exists for URL:", website_url)
      return NextResponse.json(
        {
          message: "Client already exists",
          id: existing.id,
          existing: true
        },
        { status: 200 }
      )
    }

    // Prepare insert data - only include columns that exist in the table
    const insertData: any = {
      id: demoId,
      website_url,
      business_name: business_name || "Unnamed Business",
      created_at: new Date().toISOString(),
    }

    // Add optional columns if they exist in your schema
    if (industry) insertData.industry = industry
    if (intelligence_data) insertData.intelligence_data = intelligence_data

    console.log("Inserting new client:", insertData)

    // Insert new demo/client
    const { data, error } = await supabase
      .from("demos")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({
        error: error.message,
        details: error.details || "Failed to insert client"
      }, { status: 500 })
    }

    console.log("Client added successfully:", data)
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error("Failed to create demo:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create demo" },
      { status: 500 }
    )
  }
}
