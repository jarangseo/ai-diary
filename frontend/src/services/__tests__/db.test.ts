import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()

vi.mock('../../lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

describe('db service', () => {
  const testUserId = 'test-user-123'
  const testDate = '2025-01-15'

  beforeEach(() => {
    vi.clearAllMocks()

    // Set up auth storage to return a valid user ID
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === 'auth-storage') {
        return JSON.stringify({ state: { user: { id: testUserId } } })
      }
      return null
    })
  })

  describe('getDiary', () => {
    it('returns diary data for a valid date', async () => {
      const { getDiary } = await import('../db')

      const mockRow = {
        id: '1',
        user_id: testUserId,
        date: testDate,
        content: 'Test diary content',
        is_record_only: false,
        emotion_primary: 'happy',
        emotion_score: 0.8,
        emotion_summary: 'A great day',
        emotion_questions: ['What made you happy?'],
        created_at: '2025-01-15T00:00:00Z',
        updated_at: '2025-01-15T00:00:00Z',
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockRow, error: null })
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await getDiary(testDate)

      expect(mockFrom).toHaveBeenCalledWith('diaries')
      expect(result).toBeDefined()
      expect(result?.date).toBe(testDate)
      expect(result?.content).toBe('Test diary content')
      expect(result?.emotion?.primary).toBe('happy')
      expect(result?.emotion?.score).toBe(0.8)
    })

    it('returns undefined when no diary exists', async () => {
      const { getDiary } = await import('../db')

      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await getDiary('2025-12-31')

      expect(result).toBeUndefined()
    })

    it('returns undefined when user is not authenticated', async () => {
      const { getDiary } = await import('../db')

      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

      const result = await getDiary(testDate)

      expect(result).toBeUndefined()
      expect(mockFrom).not.toHaveBeenCalled()
    })
  })

  describe('getAllDiaries', () => {
    it('returns all diaries for the user', async () => {
      const { getAllDiaries } = await import('../db')

      const mockRows = [
        {
          id: '1',
          user_id: testUserId,
          date: '2025-01-15',
          content: 'Day 1',
          is_record_only: false,
          emotion_primary: 'happy',
          emotion_score: 0.8,
          emotion_summary: 'Good day',
          emotion_questions: [],
          created_at: '2025-01-15T00:00:00Z',
          updated_at: '2025-01-15T00:00:00Z',
        },
        {
          id: '2',
          user_id: testUserId,
          date: '2025-01-16',
          content: 'Day 2',
          is_record_only: true,
          emotion_primary: null,
          emotion_score: null,
          emotion_summary: null,
          emotion_questions: null,
          created_at: '2025-01-16T00:00:00Z',
          updated_at: '2025-01-16T00:00:00Z',
        },
      ]

      const mockOrder = vi.fn().mockResolvedValue({ data: mockRows, error: null })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      mockFrom.mockReturnValue({ select: mockSelect })

      const result = await getAllDiaries()

      expect(result).toHaveLength(2)
      expect(result[0].date).toBe('2025-01-15')
      expect(result[1].date).toBe('2025-01-16')
      expect(result[1].emotion).toBeUndefined()
    })

    it('returns empty array when not authenticated', async () => {
      const { getAllDiaries } = await import('../db')

      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

      const result = await getAllDiaries()

      expect(result).toEqual([])
    })
  })

  describe('deleteDiary', () => {
    it('calls supabase delete with correct parameters', async () => {
      const { deleteDiary } = await import('../db')

      const mockEq2 = vi.fn().mockResolvedValue({ error: null })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 })
      mockFrom.mockReturnValue({ delete: mockDelete })

      await deleteDiary(testDate)

      expect(mockFrom).toHaveBeenCalledWith('diaries')
      expect(mockDelete).toHaveBeenCalled()
    })

    it('does nothing when not authenticated', async () => {
      const { deleteDiary } = await import('../db')

      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

      await deleteDiary(testDate)

      expect(mockFrom).not.toHaveBeenCalled()
    })
  })

  describe('saveDiary', () => {
    it('throws when not authenticated', async () => {
      const { saveDiary } = await import('../db')

      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

      await expect(saveDiary(testDate, 'content', false)).rejects.toThrow('Not authenticated')
    })
  })
})
