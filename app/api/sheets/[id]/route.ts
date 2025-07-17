import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// DELETE - Xóa sheet
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const password = searchParams.get("password")

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 })
    }

    // Xóa sheet (entries sẽ tự động xóa do CASCADE)
    const { error } = await supabase.from("finance_sheets").delete().eq("id", params.id).eq("user_password", password)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/sheets/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
