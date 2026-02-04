import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Cloud sync will be disabled.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface DiaryRow {
  id: string
  user_id: string
  date: string
  content: string
  is_record_only: boolean
  emotion_primary: string | null
  emotion_score: number | null
  emotion_summary: string | null
  emotion_questions: string[] | null
  created_at: string
  updated_at: string
}
