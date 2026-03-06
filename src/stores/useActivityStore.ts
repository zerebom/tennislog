import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Activity, Match, Practice, SetScore, SelfRating, PracticeTag } from '@/types'

interface AddMatchInput {
  type: 'singles' | 'doubles'
  date: string
  sets: SetScore[]
  selfRating: SelfRating
  opponentId?: string
  partnerId?: string
  memo?: string
}

interface AddPracticeInput {
  date: string
  tags: PracticeTag[]
  selfRating: SelfRating
  memo?: string
}

function calcResult(sets: SetScore[]): 'win' | 'lose' {
  let myWins = 0
  let oppWins = 0
  for (const s of sets) {
    if (s.myScore > s.opponentScore) myWins++
    else oppWins++
  }
  return myWins > oppWins ? 'win' : 'lose'
}

interface ActivityState {
  activities: Activity[]
  addMatch: (input: AddMatchInput) => Match
  addPractice: (input: AddPracticeInput) => Practice
  addBatchMatches: (matches: Omit<AddMatchInput, 'selfRating'>[], selfRating: SelfRating) => Match[]
  updateActivity: (id: string, data: Partial<Omit<Activity, 'id' | 'createdAt'>>) => void
  deleteActivity: (id: string) => void
  getActivitiesByMonth: (year: number, month: number) => Activity[]
  getMatchesByPerson: (personId: string) => Match[]
  getWinRate: (personId?: string) => number | null
  getMonthlyStats: (year: number, month: number) => {
    matchCount: number
    winRate: number | null
    practiceCount: number
    currentStreak: number
  }
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],

      addMatch: (input) => {
        const now = new Date().toISOString()
        const match: Match = {
          id: nanoid(),
          ...input,
          result: calcResult(input.sets),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ activities: [...state.activities, match] }))
        return match
      },

      addPractice: (input) => {
        const now = new Date().toISOString()
        const practice: Practice = {
          id: nanoid(),
          type: 'practice',
          ...input,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ activities: [...state.activities, practice] }))
        return practice
      },

      addBatchMatches: (matches, selfRating) => {
        const now = new Date().toISOString()
        const newMatches: Match[] = matches.map((m) => ({
          id: nanoid(),
          ...m,
          selfRating,
          result: calcResult(m.sets),
          createdAt: now,
          updatedAt: now,
        }))
        set((state) => ({ activities: [...state.activities, ...newMatches] }))
        return newMatches
      },

      updateActivity: (id, data) => {
        set((state) => ({
          activities: state.activities.map((a) => {
            if (a.id !== id) return a
            const updated = { ...a, ...data, updatedAt: new Date().toISOString() }
            // Recalculate result if sets changed on a match
            if ('sets' in updated && updated.type !== 'practice') {
              (updated as Match).result = calcResult((updated as Match).sets)
            }
            return updated
          }),
        }))
      },

      deleteActivity: (id) => {
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
        }))
      },

      getActivitiesByMonth: (year, month) => {
        return get().activities.filter((a) => {
          const d = new Date(a.date)
          return d.getFullYear() === year && d.getMonth() === month - 1
        })
      },

      getMatchesByPerson: (personId) => {
        return get().activities.filter(
          (a): a is Match =>
            a.type !== 'practice' &&
            (a.opponentId === personId || a.partnerId === personId)
        )
      },

      getWinRate: (personId) => {
        const matches = personId
          ? get().getMatchesByPerson(personId)
          : get().activities.filter((a): a is Match => a.type !== 'practice')
        if (matches.length === 0) return null
        const wins = matches.filter((m) => m.result === 'win').length
        return Math.round((wins / matches.length) * 100)
      },

      getMonthlyStats: (year, month) => {
        const monthActivities = get().getActivitiesByMonth(year, month)
        const matches = monthActivities.filter((a): a is Match => a.type !== 'practice')
        const practices = monthActivities.filter((a) => a.type === 'practice')
        const wins = matches.filter((m) => m.result === 'win').length
        const winRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : null

        // Calculate current win streak
        const allMatches = get()
          .activities.filter((a): a is Match => a.type !== 'practice')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        let streak = 0
        for (const m of allMatches) {
          if (m.result === 'win') streak++
          else break
        }

        return {
          matchCount: matches.length,
          winRate,
          practiceCount: practices.length,
          currentStreak: streak,
        }
      },
    }),
    { name: 'tennislog-activities' }
  )
)
