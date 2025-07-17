import { type NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

// GET - Lấy tất cả sheets của user
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url)
    const password = searchParams.get("password")

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 })
    }

    // Lấy sheets
    const { data: sheets, error: sheetsError } = await supabase
      .from("finance_sheets")
      .select("*")
      .eq("user_password", password)
      .order("created_at", { ascending: true })

    if (sheetsError) {
      return NextResponse.json({ error: sheetsError.message }, { status: 500 })
    }

    // Lấy entries cho mỗi sheet
    const sheetsWithEntries = await Promise.all(
      sheets.map(async (sheet) => {
        const { data: entries, error: entriesError } = await supabase
          .from("finance_entries")
          .select("*")
          .eq("sheet_id", sheet.id)
          .order("date", { ascending: true })

        if (entriesError) {
          console.error("Error fetching entries:", entriesError)
          return { ...sheet, entries: [] }
        }

        return { ...sheet, entries: entries || [] }
      }),
    )

    return NextResponse.json(sheetsWithEntries)
  } catch (error) {
    console.error("Error in GET /api/sheets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Tạo sheet mới
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json()
    const { password, name, month, year, entries } = body

    if (!password || !name || !month || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Tạo sheet
    const { data: sheet, error: sheetError } = await supabase
      .from("finance_sheets")
      .insert({
        user_password: password,
        name,
        month,
        year,
      })
      .select()
      .single()

    if (sheetError) {
      return NextResponse.json({ error: sheetError.message }, { status: 500 })
    }

    // Tạo entries
    if (entries && entries.length > 0) {
      const entriesWithSheetId = entries.map((entry: any) => ({
        sheet_id: sheet.id,
        date: entry.date,
        overview: entry.overview || "",
        amount: entry.amount || 0,
        work: entry.work || "",
      }))

      const { error: entriesError } = await supabase.from("finance_entries").insert(entriesWithSheetId)

      if (entriesError) {
        console.error("Error creating entries:", entriesError)
      }
    }

    return NextResponse.json(sheet)
  } catch (error) {
    console.error("Error in POST /api/sheets:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
