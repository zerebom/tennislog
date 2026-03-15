import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScoreInput } from '@/components/ScoreInput'
import { PersonPicker } from '@/components/PersonPicker'
import { useSessionStore } from '@/stores/useSessionStore'
import { useCoachingStore } from '@/stores/useCoachingStore'
import { useProfileStore } from '@/stores/useProfileStore'
import { generateCoaching } from '@/lib/api'
import type { Set } from '@/types'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export function RecordDoublesPage() {
  const navigate = useNavigate()
  const { addSession, sessions } = useSessionStore()
  const { addCoachingResponse, getBySessionId } = useCoachingStore()
  const { profile } = useProfileStore()
  const [sets, setSets] = useState<Set[]>([{ myScore: 6, opponentScore: 4 }])
  const [partnerId, setPartnerId] = useState<string | undefined>()
  const [memo, setMemo] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const canSubmit = status === 'idle'

  const runCoaching = async (sessionId: string) => {
    const newSession = sessions.find((s) => s.id === sessionId)
      ?? { id: sessionId, type: 'doubles' as const, date, sets, memo: memo.trim(), createdAt: new Date().toISOString() }

    const recentPast = [...sessions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .map((s) => ({ session: s, coaching: getBySessionId(s.id) ?? null }))

    const coaching = await generateCoaching(newSession, recentPast, profile ?? undefined)
    addCoachingResponse(coaching)
    return coaching
  }

  const handleSubmit = async () => {
    setStatus('loading')
    setErrorMsg('')
    try {
      const session = addSession({ type: 'doubles', date, sets, memo: memo.trim(), partnerId })
      await runCoaching(session.id)
      navigate(`/sessions/${session.id}`)
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'コーチングの取得に失敗しました')
      setStatus('error')
    }
  }

  const handleSkip = () => {
    const latest = [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    if (latest) {
      navigate(`/sessions/${latest.id}`)
    } else {
      navigate('/')
    }
  }

  const handleRetry = async () => {
    setStatus('loading')
    setErrorMsg('')
    try {
      const latest = [...sessions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
      if (latest) {
        await runCoaching(latest.id)
        navigate(`/sessions/${latest.id}`)
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'コーチングの取得に失敗しました')
      setStatus('error')
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="text-base font-medium">AIコーチが分析中...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <p className="text-sm text-muted-foreground">{errorMsg || 'コーチングの取得に失敗しました'}</p>
          <Button onClick={handleRetry} className="w-full">もう一度試す</Button>
          <Button variant="outline" onClick={handleSkip} className="w-full">スキップ</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-5 pt-[48px]">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[28px] font-extrabold leading-[1.3] tracking-[-0.02em]">ダブルスを記録</h1>
      </div>

      <div className="space-y-8">
        <div>
          <label className="mb-2 block text-[14px] font-medium">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 w-full rounded-[12px] border-[1.5px] border-border bg-background px-5 text-base"
          />
        </div>

        <ScoreInput sets={sets} onChange={setSets} />
        <PersonPicker value={partnerId} onChange={setPartnerId} label="パートナー" />

        <div>
          <label className="mb-2 block text-[14px] font-medium">メモ（任意）</label>
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="今日のテニスで気づいたことを書いてください"
            rows={2}
          />
        </div>

        <Button onClick={handleSubmit} disabled={!canSubmit} size="lg" className="w-full">
          記録する
        </Button>
      </div>
    </div>
  )
}
