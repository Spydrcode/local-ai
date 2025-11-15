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

// DELETE /api/demos?id=xxx - Delete a specific client
// DELETE /api/demos?cleanup=unnamed - Delete all "Unnamed Business" clients
export async function DELETE(req: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('id')
    const cleanup = searchParams.get('cleanup')

    // Cleanup operation - delete all "Unnamed Business" entries
    if (cleanup === 'unnamed') {
      const { data, error } = await supabase
        .from('demos')
        .delete()
        .eq('business_name', 'Unnamed Business')
        .select()

      if (error) {
        console.error('Cleanup error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      console.log(`Cleaned up ${data?.length || 0} unnamed clients`)
      return NextResponse.json({
        message: `Deleted ${data?.length || 0} unnamed clients`,
        count: data?.length || 0
      })
    }

    // Delete specific client by ID
    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required (use ?id=xxx or ?cleanup=unnamed)" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('demos')
      .delete()
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    console.log('Client deleted:', clientId)
    return NextResponse.json({ message: "Client deleted successfully", id: clientId })
  } catch (error: any) {
    console.error("Failed to delete client:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete client" },
      { status: 500 }
    )
  }
}
