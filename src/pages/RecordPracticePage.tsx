import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SelfRatingPicker } from '@/components/SelfRatingPicker'
import { InsightCard } from '@/components/InsightCard'
import { useActivityStore } from '@/stores/useActivityStore'
import { usePersonStore } from '@/stores/usePersonStore'
import { generateInsight } from '@/stores/useInsightStore'
import type { SelfRating, PracticeTag } from '@/types'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

const practiceTagOptions: { value: PracticeTag; label: string }[] = [
  { value: 'serve', label: 'サーブ' },
  { value: 'stroke', label: 'ストローク' },
  { value: 'volley', label: 'ボレー' },
  { value: 'footwork', label: 'フットワーク' },
  { value: 'match-play', label: '試合形式' },
]

export function RecordPracticePage() {
  const navigate = useNavigate()
  const { addPractice, activities } = useActivityStore()
  const { getPerson } = usePersonStore()
  const [tags, setTags] = useState<PracticeTag[]>([])
  const [selfRating, setSelfRating] = useState<SelfRating | null>(null)
  const [memo, setMemo] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [completed, setCompleted] = useState(false)
  const [insight, setInsight] = useState<ReturnType<typeof generateInsight> | null>(null)

  const toggleTag = (tag: PracticeTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const canSubmit = selfRating !== null && tags.length > 0

  const handleSubmit = () => {
    if (!selfRating || tags.length === 0) return
    const practice = addPractice({
      date,
      tags,
      selfRating,
      memo: memo.trim() || undefined,
    })
    const allActivities = [...activities, practice]
    setInsight(generateInsight(allActivities, practice, (id) => getPerson(id)?.name))
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
        <h1 className="text-lg font-bold">🏋️ 練習を記録</h1>
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

        <div>
          <label className="mb-2 block text-sm font-medium">何に取り組んだ？（複数可）</label>
          <div className="flex flex-wrap gap-2">
            {practiceTagOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleTag(value)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  tags.includes(value)
                    ? 'border-practice bg-practice/10 text-practice'
                    : 'border-border bg-card'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <SelfRatingPicker value={selfRating} onChange={setSelfRating} />

        <div>
          <label className="mb-1 block text-sm font-medium">メモ（任意）</label>
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="例: スライスサーブのトスを前に"
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
