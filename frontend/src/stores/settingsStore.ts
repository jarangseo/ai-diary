import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AIModel = 'openai' | 'gemini'

interface SettingsState {
  aiModel: AIModel
  setAIModel: (model: AIModel) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      aiModel: 'openai',
      setAIModel: (aiModel) => set({ aiModel }),
    }),
    {
      name: 'settings-storage',
    }
  )
)
