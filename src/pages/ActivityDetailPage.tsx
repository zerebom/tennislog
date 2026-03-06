import { useParams, useNavigate } from 'react-router-dom'
import { useActivityStore } from '@/stores/useActivityStore'
import { usePersonStore } from '@/stores/usePersonStore'
import type { Match, Practice } from '@/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const ratingEmoji: Record<string, string> = { bad: '😤', neutral: '😐', good: '😊' }
const ratingLabel: Record<string, string> = { bad: '悪かった', neutral: 'ふつう', good: '良かった' }

const practiceTagLabels: Record<string, string> = {
  serve: 'サーブ',
  stroke: 'ストローク',
  volley: 'ボレー',
  footwork: 'フットワーク',
  'match-play': '試合形式',
}

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { activities, deleteActivity } = useActivityStore()
  const { getPerson } = usePersonStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const activity = activities.find((a) => a.id === id)

  if (!activity) {
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> 戻る
        </button>
        <div className="text-center py-12 text-muted-foreground">記録が見つかりません</div>
      </div>
    )
  }

  const isMatch = activity.type !== 'practice'
  const match = isMatch ? (activity as Match) : null
  const practice = !isMatch ? (activity as Practice) : null

  const typeLabel = activity.type === 'practice' ? '練習・レッスン' : activity.type === 'doubles' ? 'ダブルス' : 'シングルス'
  const typeIcon = activity.type === 'practice' ? '🏋️' : activity.type === 'doubles' ? '🎾🎾' : '🎾'

  const opponentName = match?.opponentId ? getPerson(match.opponentId)?.name : undefined
  const partnerName = match?.partnerId ? getPerson(match.partnerId)?.name : undefined

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    deleteActivity(activity.id)
    navigate(-1)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      {/* Header */}
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> 戻る
      </button>

      <div className="space-y-4">
        {/* Type & Date */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{typeIcon}</span>
              <span className="text-lg font-bold">{typeLabel}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {format(new Date(activity.date), 'yyyy年M月d日（E）', { locale: ja })}
            </span>
          </div>

          {/* Match: Score */}
          {match && (
            <div className="mt-4">
              <div className={`text-center text-2xl font-bold ${
                match.result === 'win' ? 'text-win' : 'text-lose'
              }`}>
                {match.result === 'win' ? '勝ち 🎉' : '負け'}
              </div>
              <div className="mt-3 flex justify-center gap-3">
                {match.sets.map((s, i) => (
                  <div key={i} className="rounded-lg border border-border bg-background px-4 py-2 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Set {i + 1}</div>
                    <div className="text-xl font-bold">
                      <span className={s.myScore > s.opponentScore ? 'text-win' : 'text-lose'}>{s.myScore}</span>
                      <span className="text-muted-foreground mx-1">-</span>
                      <span className={s.opponentScore > s.myScore ? 'text-win' : 'text-lose'}>{s.opponentScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practice: Tags */}
          {practice && (
            <div className="mt-2 flex flex-wrap gap-2">
              {practice.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-practice/10 px-3 py-1 text-sm font-medium text-practice"
                >
                  {practiceTagLabels[tag] || tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Self Rating */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">自己評価</h3>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{ratingEmoji[activity.selfRating]}</span>
            <span className="text-base font-medium">{ratingLabel[activity.selfRating]}</span>
          </div>
        </div>

        {/* Opponent / Partner */}
        {match && (opponentName || partnerName) && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">対戦情報</h3>
            <div className="space-y-2">
              {opponentName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">vs</span>
                  <button
                    onClick={() => navigate(`/persons/${match.opponentId}`)}
                    className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {opponentName}
                  </button>
                </div>
              )}
              {partnerName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">w/</span>
                  <button
                    onClick={() => navigate(`/persons/${match.partnerId}`)}
                    className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {partnerName}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Memo */}
        {activity.memo && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">メモ</h3>
            <p className="text-sm whitespace-pre-wrap">{activity.memo}</p>
          </div>
        )}

        {/* Delete */}
        <div className="pt-4">
          <Button
            variant="ghost"
            className={`w-full ${
              confirmDelete ? 'text-destructive hover:text-destructive' : 'text-muted-foreground'
            }`}
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {confirmDelete ? '本当に削除しますか？' : 'この記録を削除'}
          </Button>
        </div>
      </div>
    </div>
  )
}
