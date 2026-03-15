import { nanoid } from 'nanoid'
import type { Session, CoachingResponse, UserProfile } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_TOKEN = import.meta.env.VITE_API_TOKEN || ''

// API用の型（snake_case）
interface SessionInputApi {
  session_type: string
  date: string
  memo: string
  score: string | null
  result: string | null
  opponent: string | null
  partner: string | null
}

interface CoachingOutputApi {
  summary: string
  analysis: string
  suggestions: string[]
  video_suggestions: { title: string; url: string; duration: string; relevance: string }[]
  pattern_insights: string[] | null
}

interface PastContextApi {
  session: SessionInputApi
  coaching: CoachingOutputApi | null
}

interface DiagnosisInputApi {
  experience: string
  strength: string
  loss_pattern: string
  play_style: string
  goal: string
}

interface DiagnosisOutputApi {
  type_name: string
  summary: string
  strengths: string
  challenge: string
  first_suggestion: string
}

// Session（フロント内部型）→ SessionInputApi への変換
export function toSessionInput(session: Session): SessionInputApi {
  // セット情報をスコア文字列に変換（例: "6-4, 7-5"）
  const score =
    session.sets && session.sets.length > 0
      ? session.sets.map((s) => `${s.myScore}-${s.opponentScore}`).join(', ')
      : null

  return {
    session_type: session.type,
    date: session.date,
    memo: session.memo || '',
    score,
    result: session.result ?? null,
    opponent: null,  // Person名は呼び出し側で解決して渡す
    partner: null,
  }
}

// CoachingOutputApi（snake_case）→ CoachingResponse（camelCase）への変換
function toCoachingResponse(
  api: CoachingOutputApi,
  sessionId: string
): CoachingResponse {
  return {
    id: nanoid(),
    sessionId,
    summary: api.summary,
    analysis: api.analysis,
    suggestions: api.suggestions,
    videoSuggestions: api.video_suggestions.map((v) => ({
      title: v.title,
      url: v.url,
      duration: v.duration,
      relevance: v.relevance,
    })),
    patternInsights: api.pattern_insights ?? undefined,
    createdAt: new Date().toISOString(),
  }
}

// UserProfile の diagnosis → DiagnosisInputApi への変換
function toDiagnosisInput(
  diagnosis: NonNullable<UserProfile['diagnosis']>
): DiagnosisInputApi {
  return {
    experience: diagnosis.experience,
    strength: diagnosis.strength,
    loss_pattern: diagnosis.lossPattern,
    play_style: diagnosis.playStyle,
    goal: diagnosis.goal,
  }
}

export async function generateCoaching(
  session: Session,
  pastSessions: Array<{ session: Session; coaching: CoachingResponse | null }>,
  userProfile?: UserProfile
): Promise<CoachingResponse> {
  const sessionInput = toSessionInput(session)

  const pastContexts: PastContextApi[] = pastSessions.map(({ session: s, coaching: c }) => ({
    session: toSessionInput(s),
    coaching: c
      ? {
          summary: c.summary,
          analysis: c.analysis,
          suggestions: c.suggestions,
          video_suggestions: c.videoSuggestions.map((v) => ({
            title: v.title,
            url: v.url,
            duration: v.duration,
            relevance: v.relevance,
          })),
          pattern_insights: c.patternInsights ?? null,
        }
      : null,
  }))

  const userProfilePayload =
    userProfile?.diagnosis
      ? { diagnosis: toDiagnosisInput(userProfile.diagnosis) }
      : undefined

  const res = await fetch(`${API_BASE}/api/coaching`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify({
      session: sessionInput,
      past_sessions: pastContexts,
      user_profile: userProfilePayload,
    }),
  })

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  return toCoachingResponse(data.coaching as CoachingOutputApi, session.id)
}

export async function generateDiagnosis(
  diagnosis: NonNullable<UserProfile['diagnosis']>
): Promise<DiagnosisOutputApi> {
  const res = await fetch(`${API_BASE}/api/diagnosis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify({ diagnosis: toDiagnosisInput(diagnosis) }),
  })

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  return data.result as DiagnosisOutputApi
}
