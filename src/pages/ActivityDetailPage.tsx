import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useActivityStore } from '@/stores/useActivityStore'
import { usePersonStore } from '@/stores/usePersonStore'
import type { Match, Practice, SelfRating, SetScore, PracticeTag } from '@/types'
import { format } from 'date-fns'
import { ArrowLeft, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScoreInput } from '@/components/ScoreInput'
import { SelfRatingPicker } from '@/components/SelfRatingPicker'
import { PersonPicker } from '@/components/PersonPicker'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const ratingEmoji = { bad: '😤', neutral: '😐', good: '😊' }
const practiceTagLabels: Record<string, string> = {
  serve: 'サーブ',
  stroke: 'ストローク',
  volley: 'ボレー',
  footwork: 'フットワーク',
  'match-play': '試合形式',
}

const practiceTagOptions: { value: PracticeTag; label: string }[] = [
  { value: 'serve', label: 'サーブ' },
  { value: 'stroke', label: 'ストローク' },
  { value: 'volley', label: 'ボレー' },
  { value: 'footwork', label: 'フットワーク' },
  { value: 'match-play', label: '試合形式' },
]

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { activities, deleteActivity, updateActivity } = useActivityStore()
  const { getPerson } = usePersonStore()

  const activity = activities.find((a) => a.id === id)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editing, setEditing] = useState(false)

  // Edit state
  const [editDate, setEditDate] = useState('')
  const [editSets, setEditSets] = useState<SetScore[]>([])
  const [editRating, setEditRating] = useState<SelfRating | null>(null)
  const [editMemo, setEditMemo] = useState('')
  const [editOpponentId, setEditOpponentId] = useState<string | undefined>()
  const [editPartnerId, setEditPartnerId] = useState<string | undefined>()
  const [editTags, setEditTags] = useState<PracticeTag[]>([])

  if (!activity) {
    return (
      <div className="mx-auto max-w-md px-4 py-6 text-center">
        <p className="text-muted-foreground">記録が見つかりません</p>
      </div>
    )
  }

  const isMatch = activity.type !== 'practice'
  const match = isMatch ? (activity as Match) : null
  const practice = !isMatch ? (activity as Practice) : null

  const startEditing = () => {
    setEditDate(activity.date)
    setEditRating(activity.selfRating)
    setEditMemo(activity.memo || '')
    if (match) {
      setEditSets([...match.sets])
      setEditOpponentId(match.opponentId)
      setEditPartnerId(match.partnerId)
    }
    if (practice) {
      setEditTags([...practice.tags])
    }
    setEditing(true)
  }

  const handleSave = () => {
    if (!editRating || !id) return
    if (isMatch) {
      updateActivity(id, {
        date: editDate,
        sets: editSets,
        selfRating: editRating,
        memo: editMemo.trim() || undefined,
        opponentId: editOpponentId,
        partnerId: editPartnerId,
      } as Partial<Match>)
    } else {
      if (editTags.length === 0) return
      updateActivity(id, {
        date: editDate,
        tags: editTags,
        selfRating: editRating,
        memo: editMemo.trim() || undefined,
      } as Partial<Practice>)
    }
    setEditing(false)
  }

  const handleDelete = () => {
    if (!id) return
    deleteActivity(id)
    navigate('/', { replace: true })
  }

  const typeLabel =
    activity.type === 'practice' ? '🏋️ 練習' :
    activity.type === 'doubles' ? '🎾🎾 ダブルス' : '🎾 シングルス'

  const opponentName = match?.opponentId ? getPerson(match.opponentId)?.name : undefined
  const partnerName = match?.partnerId ? getPerson(match.partnerId)?.name : undefined

  if (editing) {
    return (
      <div className="mx-auto max-w-md px-4 py-4">
        <div className="mb-4 flex items-center gap-2">
          <button onClick={() => setEditing(false)} className="text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">記録を編集</h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium">日付</label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3"
            />
          </div>

          {isMatch && (
            <ScoreInput sets={editSets} onChange={setEditSets} />
          )}

          {!isMatch && (
            <div>
              <label className="mb-2 block text-sm font-medium">何に取り組んだ？（複数可）</label>
              <div className="flex flex-wrap gap-2">
                {practiceTagOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() =>
                      setEditTags((prev) =>
                        prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
                      )
                    }
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      editTags.includes(value)
                        ? 'border-practice bg-practice/10 text-practice'
                        : 'border-border bg-card'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <SelfRatingPicker value={editRating} onChange={setEditRating} />

          {match?.type === 'singles' && (
            <PersonPicker value={editOpponentId} onChange={setEditOpponentId} label="相手" />
          )}
          {match?.type === 'doubles' && (
            <PersonPicker value={editPartnerId} onChange={setEditPartnerId} label="パートナー" />
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">メモ（任意）</label>
            <Textarea
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={!editRating || (!isMatch && editTags.length === 0)}
              className="flex-1"
            >
              保存する
            </Button>
          </div>
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
        <h1 className="text-lg font-bold">{typeLabel}</h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={startEditing}
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            <Pencil className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Date */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">日付</div>
          <div className="text-sm font-medium">{format(new Date(activity.date), 'yyyy年M月d日')}</div>
        </div>

        {/* Match details */}
        {match && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-3">
              <span className={`text-lg font-bold ${match.result === 'win' ? 'text-win' : 'text-lose'}`}>
                {match.result === 'win' ? '勝ち' : '負け'}
              </span>
              <span className="text-sm font-medium">
                {match.sets.map((s) => `${s.myScore}-${s.opponentScore}`).join(', ')}
              </span>
            </div>
            {opponentName && (
              <div className="text-sm text-muted-foreground">相手: {opponentName}</div>
            )}
            {partnerName && (
              <div className="text-sm text-muted-foreground">パートナー: {partnerName}</div>
            )}
          </div>
        )}

        {/* Practice details */}
        {practice && (
          <div className="rounded-xl border border-practice/20 bg-practice/5 p-4">
            <div className="text-xs text-muted-foreground mb-1">練習内容</div>
            <div className="flex flex-wrap gap-1">
              {practice.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-practice/10 px-3 py-1 text-xs text-practice">
                  {practiceTagLabels[tag]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Self rating */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">調子</div>
          <div className="text-2xl">{ratingEmoji[activity.selfRating]}</div>
        </div>

        {/* Memo */}
        {activity.memo && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground mb-1">メモ</div>
            <div className="text-sm whitespace-pre-wrap">{activity.memo}</div>
          </div>
        )}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>記録を削除しますか？</DialogTitle>
            <DialogDescription>
              この記録を完全に削除します。この操作は取り消せません。
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
