import { supabase, type DiaryRow } from '../lib/supabase'
import type { Diary, DiaryEmotion } from '../types/diary'

// Get current user ID from auth store
function getUserId(): string | null {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed?.state?.user?.id ?? null
    }
  } catch {
    // ignore
  }
  return null
}

// Helper to convert Supabase row to Diary
function rowToDiary(row: DiaryRow): Diary {
  return {
    date: row.date,
    content: row.content,
    isRecordOnly: row.is_record_only,
    emotion: row.emotion_primary ? {
      primary: row.emotion_primary,
      score: row.emotion_score ?? 0,
      summary: row.emotion_summary ?? '',
      questions: row.emotion_questions ?? [],
    } : undefined,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

// Helper to convert Diary to Supabase row (partial)
function diaryToRow(diary: Diary, userId: string): Omit<DiaryRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    date: diary.date,
    content: diary.content,
    is_record_only: diary.isRecordOnly,
    emotion_primary: diary.emotion?.primary ?? null,
    emotion_score: diary.emotion?.score ?? null,
    emotion_summary: diary.emotion?.summary ?? null,
    emotion_questions: diary.emotion?.questions ?? null,
  }
}

export async function saveDiary(
  date: string,
  content: string,
  isRecordOnly: boolean
): Promise<Diary> {
  const userId = getUserId()
  if (!supabase || !userId) {
    throw new Error('Not authenticated')
  }

  const now = Date.now()

  // Check if diary exists
  const existing = await getDiary(date)

  const diary: Diary = {
    date,
    content,
    isRecordOnly,
    emotion: existing?.emotion,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  const { error } = await supabase
    .from('diaries')
    .upsert(diaryToRow(diary, userId), { onConflict: 'user_id,date' })

  if (error) {
    console.error('Failed to save diary:', error)
    throw error
  }

  return diary
}

export async function getDiary(date: string): Promise<Diary | undefined> {
  const userId = getUserId()
  if (!supabase || !userId) return undefined

  const { data, error } = await supabase
    .from('diaries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single()

  if (error || !data) return undefined

  return rowToDiary(data as DiaryRow)
}

export async function getAllDiaries(): Promise<Diary[]> {
  const userId = getUserId()
  if (!supabase || !userId) return []

  const { data, error } = await supabase
    .from('diaries')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error || !data) return []

  return (data as DiaryRow[]).map(rowToDiary)
}

export async function deleteDiary(date: string): Promise<void> {
  const userId = getUserId()
  if (!supabase || !userId) return

  const { error } = await supabase
    .from('diaries')
    .delete()
    .eq('user_id', userId)
    .eq('date', date)

  if (error) {
    console.error('Failed to delete diary:', error)
    throw error
  }
}

export async function updateDiaryEmotion(
  date: string,
  emotion: DiaryEmotion
): Promise<Diary | undefined> {
  const userId = getUserId()
  if (!supabase || !userId) return undefined

  const diary = await getDiary(date)
  if (!diary) return undefined

  const updated: Diary = {
    ...diary,
    emotion,
    updatedAt: Date.now(),
  }

  const { error } = await supabase
    .from('diaries')
    .upsert(diaryToRow(updated, userId), { onConflict: 'user_id,date' })

  if (error) {
    console.error('Failed to update emotion:', error)
    throw error
  }

  return updated
}
