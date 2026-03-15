import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '@/types'

interface ProfileState {
  profile: UserProfile | null
  setProfile: (profile: Partial<UserProfile>) => void
  completeOnboarding: () => void
  isOnboarded: () => boolean
  resetProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,

      setProfile: (data) => {
        const existing = get().profile
        if (existing) {
          set({ profile: { ...existing, ...data } })
        } else {
          set({
            profile: {
              nickname: '',
              onboardingCompleted: false,
              createdAt: new Date().toISOString(),
              ...data,
            },
          })
        }
      },

      completeOnboarding: () => {
        const existing = get().profile
        if (existing) {
          set({ profile: { ...existing, onboardingCompleted: true } })
        }
      },

      isOnboarded: () => get().profile?.onboardingCompleted ?? false,

      resetProfile: () => set({ profile: null }),
    }),
    { name: 'tennislog-profile' }
  )
)
