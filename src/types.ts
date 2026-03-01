export type ActivityType = 'singles' | 'doubles' | 'practice'

export type SelfRating = 'bad' | 'neutral' | 'good' // 😤 😐 😊

export type RelativeLevel = 'above' | 'same' | 'below'

export type PracticeTag = 'serve' | 'stroke' | 'volley' | 'footwork' | 'match-play'

export interface Person {
  id: string
  name: string
  relativeLevel?: RelativeLevel
  note?: string
  createdAt: string
  updatedAt: string
}

export interface SetScore {
  myScore: number
  opponentScore: number
}

export interface Match {
  id: string
  type: 'singles' | 'doubles'
  date: string
  sets: SetScore[]
  result: 'win' | 'lose'
  selfRating: SelfRating
  opponentId?: string
  partnerId?: string
  memo?: string
  createdAt: string
  updatedAt: string
}

export interface Practice {
  id: string
  type: 'practice'
  date: string
  tags: PracticeTag[]
  selfRating: SelfRating
  memo?: string
  createdAt: string
  updatedAt: string
}

export type Activity = Match | Practice

export interface UserProfile {
  nickname: string
  experience?: '< 1 year' | '1-3 years' | '3-5 years' | '5+ years'
  onboardingCompleted: boolean
  createdAt: string
}
