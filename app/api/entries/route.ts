import { type NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

// POST - Tạo entry mới
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json()
    const { sheet_id, date, overview, amount, work } = body

    const { data, error } = await supabase
      .from("finance_entries")
      .insert({
        sheet_id,
        date,
        overview: overview || "",
        amount: amount || 0,
        work: work || "",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /api/entries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Cập nhật entry
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json()
    const { id, overview, amount, work } = body

    const { data, error } = await supabase
      .from("finance_entries")
      .update({
        overview: overview || "",
        amount: amount || 0,
        work: work || "",
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in PUT /api/entries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
