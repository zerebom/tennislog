import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Session, Set } from '@/types'

function calcResult(sets: Set[]): 'win' | 'lose' {
  let myWins = 0
  let oppWins = 0
  for (const s of sets) {
    if (s.myScore > s.opponentScore) myWins++
    else oppWins++
  }
  return myWins > oppWins ? 'win' : 'lose'
}

interface SessionState {
  sessions: Session[]
  addSession: (session: Omit<Session, 'id' | 'createdAt' | 'result'>) => Session
  updateSession: (id: string, data: Partial<Session>) => void
  deleteSession: (id: string) => void
  getSessionsByPerson: (personId: string) => Session[]
  clearAll: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (input) => {
        const now = new Date().toISOString()
        const session: Session = {
          ...input,
          id: nanoid(),
          createdAt: now,
          result: input.sets && input.sets.length > 0 ? calcResult(input.sets) : undefined,
        }
        set((state) => ({ sessions: [...state.sessions, session] }))
        return session
      },

      updateSession: (id, data) => {
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== id) return s
            const updated = { ...s, ...data }
            if (updated.sets && updated.sets.length > 0) {
              updated.result = calcResult(updated.sets)
            }
            return updated
          }),
        }))
      },

      deleteSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        }))
      },

      getSessionsByPerson: (personId) => {
        return get().sessions.filter(
          (s) => s.opponentId === personId || s.partnerId === personId
        )
      },

      clearAll: () => set({ sessions: [] }),
    }),
    { name: 'sessions-storage' }
  )
)
