import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllDiaries, getDiary, saveDiary, deleteDiary, updateDiaryEmotion } from '../services/db'
import { analyzeDiary, type AnalyzeResponse } from '../services/api'
import type { DiaryEmotion } from '../types/diary'
import type { AIModel } from '../services/api'

export const diaryKeys = {
  all: ['diaries'] as const,
  detail: (date: string) => ['diaries', date] as const,
}

export function useAllDiaries() {
  return useQuery({
    queryKey: diaryKeys.all,
    queryFn: getAllDiaries,
  })
}

export function useDiary(date: string | undefined) {
  return useQuery({
    queryKey: diaryKeys.detail(date!),
    queryFn: () => getDiary(date!),
    enabled: !!date,
  })
}

export function useSaveDiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { date: string; content: string; isRecordOnly: boolean }) =>
      saveDiary(params.date, params.content, params.isRecordOnly),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diaryKeys.all })
    },
  })
}

export function useDeleteDiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (date: string) => deleteDiary(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diaryKeys.all })
    },
  })
}

export function useAnalyzeDiary() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { date: string; content: string; language: string; aiModel: AIModel }) => {
      const result: AnalyzeResponse = await analyzeDiary(params.content, params.language, params.aiModel)

      const emotion: DiaryEmotion = {
        primary: result.primaryEmotion,
        score: result.emotionScore,
        summary: result.summary,
        questions: result.reflectionQuestions,
      }
      await updateDiaryEmotion(params.date, emotion)

      return result
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: diaryKeys.all })
      queryClient.invalidateQueries({ queryKey: diaryKeys.detail(variables.date) })
    },
  })
}
