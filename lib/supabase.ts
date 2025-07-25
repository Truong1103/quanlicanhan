import { createClient } from "@supabase/supabase-js"

export function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export interface FinanceEntry {
  id: string
  sheet_id: string
  date: string
  overview: string
  amount: number
  work: string
}

export interface FinanceSheet {
  id: string
  user_password: string
  name: string
  month: string
  year: string
  entries?: FinanceEntry[]
}
