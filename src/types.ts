// セッション（試合・練習を統合。v2 の Match / Practice を置き換え）
export interface Session {
  id: string
  type: 'singles' | 'doubles' | 'practice'
  date: string             // YYYY-MM-DD
  memo: string             // フリーテキスト
  sets?: Set[]             // 試合のみ
  result?: 'win' | 'lose'  // sets から自動算出
  opponentId?: string      // シングルス時の相手（任意）
  partnerId?: string       // ダブルス時のパートナー（任意）
  coachingResponseId?: string
  createdAt: string
}

export interface Set {
  myScore: number
  opponentScore: number
}

// 対戦相手 / パートナー（name だけで登録可能）
export interface Person {
  id: string
  name: string
  createdAt: string
}

// ユーザープロフィール
export interface UserProfile {
  nickname: string
  diagnosis?: {
    experience: string       // "1-3年" | "3-5年" | "5-10年" | "10年以上"
    strength: string         // "サーブ" | "フォア" | "バック" | "ボレー" | "全部微妙…"
    lossPattern: string      // "ストロークのミス" | "サーブが入らない" | "ネットプレーで決められない" | "よく分からない"
    playStyle: string        // "スクール週1" | "仲間と月数回" | "スクール+試合" | "ほぼ毎日"
    goal: string             // "安定感" | "攻撃力" | "ネットプレー" | "メンタル" | "全部"
  }
  diagnosisResult?: string
  onboardingCompleted: boolean
  createdAt: string
}

// AIコーチング応答（この Step ではまだ使わないが、型だけ定義しておく）
export interface CoachingResponse {
  id: string
  sessionId: string
  summary: string
  analysis: string
  suggestions: string[]
  videoSuggestions: VideoSuggestion[]
  patternInsights?: string[]
  createdAt: string
}

export interface VideoSuggestion {
  title: string
  url: string
  duration: string
  relevance: string
}
