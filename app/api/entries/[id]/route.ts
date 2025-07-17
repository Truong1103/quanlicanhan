import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// DELETE - Xóa entry
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("finance_entries").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/entries/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
