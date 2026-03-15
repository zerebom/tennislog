import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CoachingResponse } from '@/types'

interface CoachingState {
  coachingResponses: CoachingResponse[]
  addCoachingResponse: (response: CoachingResponse) => void
  getBySessionId: (sessionId: string) => CoachingResponse | undefined
}

export const useCoachingStore = create<CoachingState>()(
  persist(
    (set, get) => ({
      coachingResponses: [],

      addCoachingResponse: (response) => {
        set((state) => ({
          coachingResponses: [...state.coachingResponses, response],
        }))
      },

      getBySessionId: (sessionId) => {
        return get().coachingResponses.find((r) => r.sessionId === sessionId)
      },
    }),
    { name: 'coaching-storage' }
  )
)
