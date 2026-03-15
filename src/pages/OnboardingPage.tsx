import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { useProfileStore } from '@/stores/useProfileStore'
import { generateDiagnosis } from '@/lib/api'
import { Zap, Target, Lightbulb } from 'lucide-react'

type Step = 'welcome' | 'profile' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'diagnosing' | 'result' | 'invite'

interface DiagnosisOutputApi {
  type_name: string
  summary: string
  strengths: string
  challenge: string
  first_suggestion: string
}

interface Answers {
  experience: string
  strength: string
  lossPattern: string
  playStyle: string
  goal: string
}

const QUESTIONS = [
  {
    id: 'experience' as keyof Answers,
    step: 'q1' as Step,
    questionNumber: 1,
    question: 'テニス歴は？',
    options: ['〜1年', '1〜3年', '3〜5年', '5〜10年', '10年以上'],
  },
  {
    id: 'strength' as keyof Answers,
    step: 'q2' as Step,
    questionNumber: 2,
    question: '一番得意なショットは？',
    options: ['フォアハンド', 'バックハンド', 'サーブ', 'ボレー', 'まだわからない'],
  },
  {
    id: 'lossPattern' as keyof Answers,
    step: 'q3' as Step,
    questionNumber: 3,
    question: '試合で一番多い負けパターンは？',
    options: ['ストロークのミスが多い', 'サーブ・リターンが不安定', 'ネット前で決められる', '試合経験が少ない'],
  },
  {
    id: 'playStyle' as keyof Answers,
    step: 'q4' as Step,
    questionNumber: 4,
    question: 'テニスの頻度は？',
    options: ['月1〜2回', '週1回', '週2〜3回', '週4回以上'],
  },
  {
    id: 'goal' as keyof Answers,
    step: 'q5' as Step,
    questionNumber: 5,
    question: '一番伸ばしたいのは？',
    options: ['ショットの安定感', '攻撃力・決定力', 'ネットプレー', '試合運び・メンタル'],
  },
] as const

const QUESTION_STEPS: Step[] = ['q1', 'q2', 'q3', 'q4', 'q5']

function getQuestionIndex(step: Step): number {
  return QUESTION_STEPS.indexOf(step)
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-1 rounded-sm"
          style={{
            backgroundColor: i < current ? '#1B6B4A' : '#DDD9D2',
          }}
        />
      ))}
    </div>
  )
}

export function OnboardingPage() {
  const [searchParams] = useSearchParams()
  const startFrom = searchParams.get('startFrom')
  const [step, setStep] = useState<Step>(() => {
    if (startFrom === 'diagnosis') return 'q1'
    return 'welcome'
  })
  const { profile, setProfile, completeOnboarding } = useProfileStore()
  const [nickname, setNickname] = useState(profile?.nickname ?? 'テニス')
  const [answers, setAnswers] = useState<Answers>({
    experience: '',
    strength: '',
    lossPattern: '',
    playStyle: '',
    goal: '',
  })
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisOutputApi | null>(null)
  const [diagnosisError, setDiagnosisError] = useState(false)
  const navigate = useNavigate()

  const handleAnswerSelect = async (questionId: keyof Answers, value: string, currentStep: Step) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    const currentIndex = getQuestionIndex(currentStep)

    if (currentIndex < QUESTION_STEPS.length - 1) {
      // 次の問へ
      setStep(QUESTION_STEPS[currentIndex + 1])
    } else {
      // 5問目が終わり → 診断中へ
      setStep('diagnosing')
      setDiagnosisError(false)
      try {
        const result = await generateDiagnosis({
          experience: newAnswers.experience,
          strength: newAnswers.strength,
          lossPattern: newAnswers.lossPattern,
          playStyle: newAnswers.playStyle,
          goal: newAnswers.goal,
        })
        setDiagnosisResult(result)
        setProfile({
          nickname,
          diagnosis: {
            experience: newAnswers.experience,
            strength: newAnswers.strength,
            lossPattern: newAnswers.lossPattern,
            playStyle: newAnswers.playStyle,
            goal: newAnswers.goal,
          },
          diagnosisResult: JSON.stringify(result),
        })
        setStep('result')
      } catch {
        setDiagnosisError(true)
        setStep('diagnosing')
      }
    }
  }

  // Step 1: ウェルカム
  if (step === 'welcome') {
    return (
      <div
        className="flex min-h-dvh flex-col justify-center px-5"
        style={{ backgroundColor: '#F3F1EC' }}
      >
        <div className="w-full max-w-sm">
          <div className="mb-6 text-5xl">🎾</div>
          <h1
            className="mb-4"
            style={{
              fontSize: '24px',
              fontWeight: 800,
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: '#1A2B1F',
            }}
          >
            あなたのテニスを
            <br />
            AIコーチが分析します
          </h1>
          <div
            className="mb-10 space-y-1"
            style={{ fontSize: '15px', fontWeight: 400, lineHeight: 1.85, color: '#4A5550' }}
          >
            <p>メモを書くだけ</p>
            <p>AIが原因分析＆提案</p>
            <p>蓄積でパターンを発見</p>
          </div>
          <button
            onClick={() => setStep('profile')}
            className="w-full transition-transform active:scale-[0.98]"
            style={{
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#1B6B4A',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            はじめる
          </button>
        </div>
      </div>
    )
  }

  // Step 2: ニックネーム入力
  if (step === 'profile') {
    return (
      <div
        className="flex min-h-dvh flex-col justify-center px-5"
        style={{ backgroundColor: '#F3F1EC' }}
      >
        <div className="w-full max-w-sm">
          <h2
            className="mb-6"
            style={{
              fontSize: '24px',
              fontWeight: 800,
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: '#1A2B1F',
            }}
          >
            プロフィール設定
          </h2>
          <div className="space-y-4">
            <div>
              <label
                className="mb-1 block"
                style={{ fontSize: '14px', fontWeight: 500, color: '#4A5550' }}
              >
                ニックネーム
              </label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="例: テニス太郎"
                style={{ borderColor: '#DDD9D2' }}
              />
            </div>
            <button
              onClick={() => {
                setProfile({ nickname, onboardingCompleted: false })
                setStep('q1')
              }}
              disabled={!nickname.trim()}
              className="w-full transition-transform active:scale-[0.98]"
              style={{
                height: '48px',
                borderRadius: '16px',
                backgroundColor: '#1B6B4A',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                border: 'none',
                cursor: nickname.trim() ? 'pointer' : 'not-allowed',
                opacity: nickname.trim() ? 1 : 0.4,
              }}
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: 診断中（エラー時）
  if (step === 'diagnosing' && diagnosisError) {
    return (
      <div
        className="flex min-h-dvh flex-col justify-center px-5"
        style={{ backgroundColor: '#F3F1EC' }}
      >
        <div className="w-full max-w-sm">
          <h2
            className="mb-4"
            style={{
              fontSize: '24px',
              fontWeight: 800,
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: '#1A2B1F',
            }}
          >
            診断の取得に失敗しました
          </h2>
          <p
            className="mb-8"
            style={{ fontSize: '15px', color: '#4A5550', lineHeight: 1.7 }}
          >
            ネットワークの状態を確認してください。
          </p>
          <button
            onClick={() => {
              setDiagnosisError(false)
              setProfile({ nickname })
              completeOnboarding()
              navigate('/')
            }}
            className="w-full transition-transform active:scale-[0.98]"
            style={{
              height: '40px',
              borderRadius: '16px',
              backgroundColor: 'transparent',
              color: '#1B6B4A',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            スキップ
          </button>
        </div>
      </div>
    )
  }

  // Step 3: 診断中（ローディング）
  if (step === 'diagnosing') {
    return (
      <div
        className="flex min-h-dvh flex-col justify-center px-5"
        style={{ backgroundColor: '#F3F1EC' }}
      >
        <div className="w-full max-w-sm">
          <h2
            className="mb-6"
            style={{
              fontSize: '24px',
              fontWeight: 800,
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: '#1A2B1F',
            }}
          >
            あなたのテニスタイプを
            <br />
            診断しています...
          </h2>
          <div className="space-y-3">
            {[80, 60, 90].map((width, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{ height: '56px', backgroundColor: '#DDD9D2' }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${width}%`,
                    backgroundColor: '#C8C4BC',
                    animation: 'shimmer 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes shimmer {
            0% { opacity: 0.4; }
            50% { opacity: 0.8; }
            100% { opacity: 0.4; }
          }
        `}</style>
      </div>
    )
  }

  // Step 4: 診断結果表示
  if (step === 'result' && diagnosisResult) {
    return (
      <div
        className="min-h-dvh px-5 py-10"
        style={{ backgroundColor: '#F3F1EC' }}
      >
        <div className="w-full max-w-sm mx-auto">
          <p
            className="mb-2"
            style={{ fontSize: '15px', fontWeight: 400, color: '#4A5550' }}
          >
            あなたは...
          </p>
          <div
            className="mb-8 p-6"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
              animation: 'fadeSlideIn 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            <p
              className="mb-3"
              style={{
                fontSize: '24px',
                fontWeight: 800,
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
                color: '#1B6B4A',
              }}
            >
              {diagnosisResult.type_name}
            </p>
            <p
              className="mb-4"
              style={{ fontSize: '15px', fontWeight: 400, lineHeight: 1.7, color: '#1A2B1F' }}
            >
              {diagnosisResult.summary}
            </p>

            <div
              className="my-4"
              style={{ height: '1px', backgroundColor: '#DDD9D2' }}
            />

            <div className="mb-4">
              <div
                className="flex items-center gap-2 mb-2"
                style={{ color: '#4A5550' }}
              >
                <Zap size={14} />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>強み</span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 400, lineHeight: 1.7, color: '#1A2B1F' }}>
                {diagnosisResult.strengths}
              </p>
            </div>

            <div
              className="my-4"
              style={{ height: '1px', backgroundColor: '#DDD9D2' }}
            />

            <div className="mb-4">
              <div
                className="flex items-center gap-2 mb-2"
                style={{ color: '#4A5550' }}
              >
                <Target size={14} />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>伸びしろ</span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 400, lineHeight: 1.7, color: '#1A2B1F' }}>
                {diagnosisResult.challenge}
              </p>
            </div>

            <div
              className="my-4"
              style={{ height: '1px', backgroundColor: '#DDD9D2' }}
            />

            <div>
              <div
                className="flex items-center gap-2 mb-2"
                style={{ color: '#4A5550' }}
              >
                <Lightbulb size={14} />
                <span style={{ fontSize: '14px', fontWeight: 600 }}>最初に意識すること</span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 400, lineHeight: 1.7, color: '#1B6B4A' }}>
                {diagnosisResult.first_suggestion}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (startFrom === 'diagnosis') {
                navigate('/settings')
              } else {
                setStep('invite')
              }
            }}
            className="w-full transition-transform active:scale-[0.98]"
            style={{
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#1B6B4A',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            次へ
          </button>
        </div>
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  // Step 3: テニスタイプ診断（5問）
  const questionIndex = getQuestionIndex(step)
  if (questionIndex >= 0) {
    const q = QUESTIONS[questionIndex]
    return (
      <div
        className="flex min-h-dvh flex-col px-5 pt-10 pb-6"
        style={{ backgroundColor: '#F3F1EC' }}
      >
        <div className="w-full max-w-sm mx-auto flex flex-col flex-1">
          <ProgressBar current={q.questionNumber} total={5} />
          <p
            className="mb-2"
            style={{ fontSize: '13px', fontWeight: 500, color: '#4A5550' }}
          >
            {q.questionNumber} / 5
          </p>
          <h2
            className="mb-6"
            style={{
              fontSize: '24px',
              fontWeight: 800,
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: '#1A2B1F',
              animation: 'fadeSlideIn 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            {q.question}
          </h2>
          <div className="space-y-3" style={{ animation: 'fadeSlideIn 200ms cubic-bezier(0.16, 1, 0.3, 1) both' }}>
            {q.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerSelect(q.id, option, step)}
                className="w-full text-left transition-all"
                style={{
                  backgroundColor: answers[q.id] === option ? '#E8F0EB' : '#FFFFFF',
                  borderRadius: '16px',
                  border: `1.5px solid ${answers[q.id] === option ? '#1B6B4A' : '#DDD9D2'}`,
                  boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                  padding: '16px 20px',
                  minHeight: '48px',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#1A2B1F',
                  cursor: 'pointer',
                }}
                onMouseDown={(e) => {
                  const target = e.currentTarget
                  target.style.transform = 'scale(0.98)'
                  target.style.backgroundColor = '#E8F0EB'
                }}
                onMouseUp={(e) => {
                  const target = e.currentTarget
                  target.style.transform = 'scale(1)'
                }}
                onTouchStart={(e) => {
                  const target = e.currentTarget
                  target.style.transform = 'scale(0.98)'
                  target.style.backgroundColor = '#E8F0EB'
                }}
                onTouchEnd={(e) => {
                  const target = e.currentTarget
                  target.style.transform = 'scale(1)'
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  // Step 5: invite
  return (
    <div
      className="flex min-h-dvh flex-col justify-center px-5"
      style={{ backgroundColor: '#F3F1EC' }}
    >
      <div className="w-full max-w-sm">
        <h2
          className="mb-2"
          style={{
            fontSize: '24px',
            fontWeight: 800,
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            color: '#1A2B1F',
          }}
        >
          最近テニスしましたか？
        </h2>
        <p
          className="mb-8"
          style={{ fontSize: '15px', fontWeight: 400, lineHeight: 1.7, color: '#4A5550' }}
        >
          最初の記録を書いてみよう
        </p>
        <div className="space-y-3">
          {([
            { label: '練習・レッスン', path: '/record/practice' },
            { label: 'シングルス', path: '/record/singles' },
            { label: 'ダブルス', path: '/record/doubles' },
          ] as const).map(({ label, path }) => (
            <button
              key={path}
              onClick={() => {
                completeOnboarding()
                navigate(path)
              }}
              className="flex w-full items-center text-left transition-all active:scale-[0.98]"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px solid #DDD9D2',
                boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                padding: '16px 20px',
                minHeight: '48px',
                fontSize: '16px',
                fontWeight: 500,
                color: '#1A2B1F',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => {
              completeOnboarding()
              navigate('/import?from=onboarding')
            }}
            className="w-full transition-transform active:scale-[0.98]"
            style={{
              height: '40px',
              backgroundColor: 'transparent',
              color: '#1B6B4A',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            過去のメモをまとめてインポートする
          </button>
          <button
            onClick={() => {
              completeOnboarding()
              navigate('/')
            }}
            className="w-full transition-transform active:scale-[0.98]"
            style={{
              height: '40px',
              backgroundColor: 'transparent',
              color: '#4A5550',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            あとで
          </button>
        </div>
      </div>
    </div>
  )
}
