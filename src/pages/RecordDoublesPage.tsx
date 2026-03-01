import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScoreInput } from '@/components/ScoreInput'
import { SelfRatingPicker } from '@/components/SelfRatingPicker'
import { PersonPicker } from '@/components/PersonPicker'
import { InsightCard } from '@/components/InsightCard'
import { useActivityStore } from '@/stores/useActivityStore'
import { usePersonStore } from '@/stores/usePersonStore'
import { generateInsight } from '@/stores/useInsightStore'
import type { SelfRating, SetScore } from '@/types'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

export function RecordDoublesPage() {
  const navigate = useNavigate()
  const { addMatch, activities } = useActivityStore()
  const { getPerson } = usePersonStore()
  const [sets, setSets] = useState<SetScore[]>([{ myScore: 6, opponentScore: 4 }])
  const [selfRating, setSelfRating] = useState<SelfRating | null>(null)
  const [partnerId, setPartnerId] = useState<string | undefined>()
  const [memo, setMemo] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [completed, setCompleted] = useState(false)
  const [insight, setInsight] = useState<ReturnType<typeof generateInsight> | null>(null)

  const canSubmit = selfRating !== null

  const handleSubmit = () => {
    if (!selfRating) return
    const match = addMatch({
      type: 'doubles',
      date,
      sets,
      selfRating,
      partnerId,
      memo: memo.trim() || undefined,
    })
    const allActivities = [...activities, match]
    setInsight(generateInsight(allActivities, match, (id) => getPerson(id)?.name))
    setCompleted(true)
  }

  if (completed && insight) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 text-5xl">✅</div>
          <h2 className="mb-6 text-xl font-bold">記録しました!</h2>
          <InsightCard insight={insight} />
          <Button onClick={() => navigate('/')} size="lg" className="mt-6 w-full">
            ホームへ
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">🎾🎾 ダブルスを記録</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium">日付</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-card px-3"
          />
        </div>

        <ScoreInput sets={sets} onChange={setSets} />
        <SelfRatingPicker value={selfRating} onChange={setSelfRating} />
        <PersonPicker value={partnerId} onChange={setPartnerId} label="パートナー" />

        <div>
          <label className="mb-1 block text-sm font-medium">メモ（任意）</label>
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="例: ボレーが決まった"
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
