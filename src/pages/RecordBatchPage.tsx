import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SelfRatingPicker } from '@/components/SelfRatingPicker'
import { useActivityStore } from '@/stores/useActivityStore'
import { usePersonStore } from '@/stores/usePersonStore'
import { generateInsight } from '@/stores/useInsightStore'
import { InsightCard } from '@/components/InsightCard'
import type { SelfRating, SetScore } from '@/types'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { format } from 'date-fns'

interface BatchMatch {
  sets: SetScore[]
  result: 'win' | 'lose'
}

const scores = [0, 1, 2, 3, 4, 5, 6, 7]

export function RecordBatchPage() {
  const navigate = useNavigate()
  const { addBatchMatches, activities } = useActivityStore()
  const { getPerson } = usePersonStore()
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [matches, setMatches] = useState<BatchMatch[]>([
    { sets: [{ myScore: 6, opponentScore: 4 }], result: 'win' },
    { sets: [{ myScore: 3, opponentScore: 6 }], result: 'lose' },
  ])
  const [selfRating, setSelfRating] = useState<SelfRating | null>(null)
  const [completed, setCompleted] = useState(false)
  const [insight, setInsight] = useState<ReturnType<typeof generateInsight> | null>(null)

  const addMatch = () => {
    setMatches([...matches, { sets: [{ myScore: 0, opponentScore: 0 }], result: 'win' }])
  }

  const removeMatch = (index: number) => {
    if (matches.length > 1) {
      setMatches(matches.filter((_, i) => i !== index))
    }
  }

  const updateMatch = (index: number, field: keyof BatchMatch, value: unknown) => {
    const newMatches = [...matches]
    newMatches[index] = { ...newMatches[index], [field]: value }
    setMatches(newMatches)
  }

  const updateSetScore = (matchIndex: number, field: 'myScore' | 'opponentScore', value: number) => {
    const newMatches = [...matches]
    const newSets = [...newMatches[matchIndex].sets]
    newSets[0] = { ...newSets[0], [field]: value }
    newMatches[matchIndex] = { ...newMatches[matchIndex], sets: newSets }
    // Auto-determine result
    if (newSets[0].myScore > newSets[0].opponentScore) {
      newMatches[matchIndex].result = 'win'
    } else if (newSets[0].myScore < newSets[0].opponentScore) {
      newMatches[matchIndex].result = 'lose'
    }
    setMatches(newMatches)
  }

  const canSubmit = selfRating !== null && matches.length > 0

  const handleSubmit = () => {
    if (!selfRating) return
    const batchInput = matches.map((m) => ({
      type: 'singles' as const,
      date,
      sets: m.sets,
    }))
    const created = addBatchMatches(batchInput, selfRating)
    const allActivities = [...activities, ...created]
    setInsight(
      generateInsight(allActivities, created[created.length - 1], (id) => getPerson(id)?.name)
    )
    setCompleted(true)
  }

  if (completed && insight) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 text-5xl">✅</div>
          <h2 className="mb-6 text-xl font-bold">{matches.length}試合を一括記録!</h2>
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
        <h1 className="text-lg font-bold">📋 まとめ記録</h1>
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

        <div className="space-y-3">
          {matches.map((match, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
              <span className="text-sm text-muted-foreground w-12">試合{i + 1}</span>
              <select
                value={match.result}
                onChange={(e) => updateMatch(i, 'result', e.target.value)}
                className={`h-8 rounded-md border px-2 text-sm font-medium ${
                  match.result === 'win'
                    ? 'border-win/30 bg-win/10 text-win'
                    : 'border-lose/30 bg-lose/10 text-lose'
                }`}
              >
                <option value="win">勝ち</option>
                <option value="lose">負け</option>
              </select>
              <select
                value={match.sets[0].myScore}
                onChange={(e) => updateSetScore(i, 'myScore', Number(e.target.value))}
                className="h-8 w-12 rounded border border-border bg-card text-center text-sm"
              >
                {scores.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="text-xs text-muted-foreground">-</span>
              <select
                value={match.sets[0].opponentScore}
                onChange={(e) => updateSetScore(i, 'opponentScore', Number(e.target.value))}
                className="h-8 w-12 rounded border border-border bg-card text-center text-sm"
              >
                {scores.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {matches.length > 1 && (
                <button onClick={() => removeMatch(i)} className="ml-auto text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addMatch}
            className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground"
          >
            <Plus className="h-4 w-4" />
            試合を追加
          </button>
        </div>

        <SelfRatingPicker value={selfRating} onChange={setSelfRating} />

        <Button onClick={handleSubmit} disabled={!canSubmit} size="lg" className="w-full">
          {matches.length}試合を一括記録
        </Button>
      </div>
    </div>
  )
}
