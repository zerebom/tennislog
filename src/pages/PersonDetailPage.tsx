import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePersonStore } from '@/stores/usePersonStore'
import { useActivityStore } from '@/stores/useActivityStore'
import type { Match, RelativeLevel } from '@/types'
import { format } from 'date-fns'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const ratingEmoji = { bad: '😤', neutral: '😐', good: '😊' }
const levelLabels: Record<RelativeLevel, string> = {
  above: '自分より上',
  same: '同じくらい',
  below: '自分より下',
}

export function PersonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getPerson, setRelativeLevel, deletePerson } = usePersonStore()
  const { activities } = useActivityStore()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = () => {
    if (!id) return
    deletePerson(id)
    navigate('/persons', { replace: true })
  }

  const person = id ? getPerson(id) : undefined
  if (!person) {
    return (
      <div className="mx-auto max-w-md px-4 py-6 text-center">
        <p className="text-muted-foreground">仲間が見つかりません</p>
      </div>
    )
  }

  const matches = activities.filter(
    (a): a is Match =>
      a.type !== 'practice' &&
      (a.opponentId === person.id || a.partnerId === person.id)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const wins = matches.filter((m) => m.result === 'win').length
  const losses = matches.length - wins
  const winRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : null

  // Determine if this person is primarily opponent or partner
  const asOpponent = matches.filter((m) => m.opponentId === person.id)
  const asPartner = matches.filter((m) => m.partnerId === person.id)
  const role = asPartner.length > asOpponent.length ? 'partner' : 'opponent'

  // Show level suggestion if 2+ matches and no level set
  const showLevelSuggestion = matches.length >= 2 && !person.relativeLevel

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <div className="mb-4 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">{person.name}</h1>
        {role === 'partner' && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">パートナー</span>
        )}
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="ml-auto text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Overall stats */}
      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-win">{wins}</div>
            <div className="text-xs text-muted-foreground">勝ち</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-lose">{losses}</div>
            <div className="text-xs text-muted-foreground">負け</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{winRate !== null ? `${winRate}%` : '-'}</div>
            <div className="text-xs text-muted-foreground">勝率</div>
          </div>
        </div>
        {person.relativeLevel && (
          <div className="mt-3 text-center text-xs text-muted-foreground">
            レベル: {levelLabels[person.relativeLevel]}
          </div>
        )}
      </div>

      {/* Level suggestion */}
      {showLevelSuggestion && (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="mb-3 text-sm">
            {person.name}さんとは {wins}勝{losses}敗。
            <br />
            相手のレベルはどのくらい？
          </p>
          <div className="flex gap-2">
            {(['above', 'same', 'below'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setRelativeLevel(person.id, level)}
                className="flex-1 rounded-lg border border-border bg-card px-2 py-2 text-xs transition-colors active:bg-accent"
              >
                {levelLabels[level]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Match history */}
      <h3 className="mb-2 text-sm font-medium">対戦履歴</h3>
      <div className="space-y-2">
        {matches.map((match) => {
          const score = match.sets.map((s) => `${s.myScore}-${s.opponentScore}`).join(', ')
          return (
            <div
              key={match.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <span className={`text-sm font-bold ${match.result === 'win' ? 'text-win' : 'text-lose'}`}>
                {match.result === 'win' ? 'W' : 'L'}
              </span>
              <span className="text-sm font-medium">{score}</span>
              <span className="text-lg">{ratingEmoji[match.selfRating]}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {format(new Date(match.date), 'yyyy/M/d')}
              </span>
            </div>
          )
        })}
        {matches.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">まだ対戦記録がありません</p>
        )}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{person.name}を削除しますか？</DialogTitle>
            <DialogDescription>
              この仲間を削除します。対戦履歴は残りますが、名前の表示は消えます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
