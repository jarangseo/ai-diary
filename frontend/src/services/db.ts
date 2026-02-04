import { openDB, type IDBPDatabase } from 'idb'
import type { Diary } from '../types/diary'

const DB_NAME = 'ai-diary'
const DB_VERSION = 1
const STORE_NAME = 'diaries'

type DiaryDB = IDBPDatabase<{
  diaries: {
    key: string
    value: Diary
    indexes: { updatedAt: number }
  }
}>

let dbPromise: Promise<DiaryDB> | null = null

function getDB(): Promise<DiaryDB> {
  if (!dbPromise) {
    dbPromise = openDB<{
      diaries: {
        key: string
        value: Diary
        indexes: { updatedAt: number }
      }
    }>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'date' })
          store.createIndex('updatedAt', 'updatedAt')
        }
      },
    })
  }
  return dbPromise
}

export async function saveDiary(
  date: string,
  content: string,
  isRecordOnly: boolean
): Promise<Diary> {
  const db = await getDB()
  const existing = await db.get(STORE_NAME, date)
  const now = Date.now()

  const diary: Diary = {
    date,
    content,
    isRecordOnly,
    emotion: existing?.emotion,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }

  await db.put(STORE_NAME, diary)
  return diary
}

export async function getDiary(date: string): Promise<Diary | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, date)
}

export async function getAllDiaries(): Promise<Diary[]> {
  const db = await getDB()
  return db.getAllFromIndex(STORE_NAME, 'updatedAt')
}

export async function deleteDiary(date: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, date)
}

export async function updateDiaryEmotion(
  date: string,
  emotion: Diary['emotion']
): Promise<Diary | undefined> {
  const db = await getDB()
  const diary = await db.get(STORE_NAME, date)

  if (!diary) return undefined

  const updated: Diary = {
    ...diary,
    emotion,
    updatedAt: Date.now(),
  }

  await db.put(STORE_NAME, updated)
  return updated
}
