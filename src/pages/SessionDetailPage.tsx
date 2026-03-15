import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/useSessionStore'
import { usePersonStore } from '@/stores/usePersonStore'
import { useCoachingStore } from '@/stores/useCoachingStore'
import { ScoreInput } from '@/components/ScoreInput'
import { PersonPicker } from '@/components/PersonPicker'
import { CoachingCard } from '@/components/CoachingCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { Set } from '@/types'

const typeLabel: Record<string, string> = {
  singles: 'シングルス',
  doubles: 'ダブルス',
  practice: '練習・レッスン',
}

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, updateSession, deleteSession } = useSessionStore()
  const { getPerson } = usePersonStore()
  const { getBySessionId } = useCoachingStore()

  const session = sessions.find((s) => s.id === id)

  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editDate, setEditDate] = useState(session?.date ?? '')
  const [editSets, setEditSets] = useState<Set[]>(session?.sets ?? [{ myScore: 0, opponentScore: 0 }])
  const [editMemo, setEditMemo] = useState(session?.memo ?? '')
  const [editOpponentId, setEditOpponentId] = useState<string | undefined>(session?.opponentId)
  const [editPartnerId, setEditPartnerId] = useState<string | undefined>(session?.partnerId)

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">セッションが見つかりません</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          ホームへ戻る
        </Button>
      </div>
    )
  }

  const opponent = session.opponentId ? getPerson(session.opponentId) : undefined
  const partner = session.partnerId ? getPerson(session.partnerId) : undefined
  const coaching = id ? (getBySessionId(id) ?? null) : null

  const handleSave = () => {
    const data: Parameters<typeof updateSession>[1] = {
      date: editDate,
      memo: editMemo,
    }
    if (session.type !== 'practice') {
      data.sets = editSets
    }
    if (session.type === 'singles') {
      data.opponentId = editOpponentId
    }
    if (session.type === 'doubles') {
      data.partnerId = editPartnerId
    }
    updateSession(session.id, data)
    setIsEditing(false)
  }

  const handleDelete = () => {
    deleteSession(session.id)
    navigate('/')
  }

  const handleCancelEdit = () => {
    setEditDate(session.date)
    setEditSets(session.sets ?? [{ myScore: 0, opponentScore: 0 }])
    setEditMemo(session.memo)
    setEditOpponentId(session.opponentId)
    setEditPartnerId(session.partnerId)
    setIsEditing(false)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          ホームへ
        </button>
      </div>

      {/* タイトル行: 種別タグ + 日付 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#1B7A4A]/10 px-3 py-0.5 text-xs font-medium text-[#1B7A4A]">
            {typeLabel[session.type]}
          </span>
          <span className="text-sm text-muted-foreground">
            {format(new Date(session.date), 'M月d日(E)', { locale: ja })}
          </span>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-primary"
          >
            編集
          </button>
        )}
        {isEditing && <div className="w-8" />}
      </div>

      {/* スコア + WIN/LOSE バッジ（試合の場合） */}
      {session.type !== 'practice' && session.sets && session.sets.length > 0 && !isEditing && (
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-bold ${
              session.result === 'win'
                ? 'bg-[#1B7A4A] text-white'
                : 'bg-[#D4483B] text-white'
            }`}
          >
            {session.result === 'win' ? 'WIN' : 'LOSE'}
          </span>
          <div className="flex gap-2">
            {session.sets.map((s, i) => (
              <span key={i} className="text-sm font-medium">
                {i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}: {s.myScore}-{s.opponentScore}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* vs. 相手名 */}
      {opponent && !isEditing && (
        <p className="text-sm text-muted-foreground">vs. {opponent.name}さん</p>
      )}

      {/* パートナー名 */}
      {partner && !isEditing && (
        <p className="text-sm text-muted-foreground">パートナー: {partner.name}さん</p>
      )}

      {isEditing ? (
        /* Edit Mode */
        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="mb-1 block text-sm font-medium">日付</label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
            />
          </div>

          {/* Score (matches only) */}
          {session.type !== 'practice' && (
            <ScoreInput sets={editSets} onChange={setEditSets} />
          )}

          {/* Opponent (singles) */}
          {session.type === 'singles' && (
            <PersonPicker
              value={editOpponentId}
              onChange={setEditOpponentId}
              label="相手"
            />
          )}

          {/* Partner (doubles) */}
          {session.type === 'doubles' && (
            <PersonPicker
              value={editPartnerId}
              onChange={setEditPartnerId}
              label="パートナー"
            />
          )}

          {/* Memo */}
          <div>
            <label className="mb-1 block text-sm font-medium">メモ（任意）</label>
            <textarea
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm resize-none"
              placeholder="今日のテニスで気づいたことを書いてください"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleCancelEdit}>
              キャンセル
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              保存
            </Button>
          </div>

          {/* Delete */}
          <Button variant="destructive" className="w-full" onClick={() => setShowDeleteDialog(true)}>
            削除
          </Button>
        </div>
      ) : (
        /* View Mode */
        <div className="space-y-4">
          {/* メモセクション */}
          <div>
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">メモ</h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex">
                <div className="w-1 shrink-0 bg-[#1B7A4A]" />
                <div className="px-4 py-3">
                  {session.memo ? (
                    <p className="text-sm whitespace-pre-wrap">{session.memo}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">メモなし</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AIコーチングセクション */}
          <div>
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">AIコーチング</h2>
            <CoachingCard coaching={coaching} />
          </div>

          {/* Delete */}
          <Button variant="destructive" className="w-full" onClick={() => setShowDeleteDialog(true)}>
            削除
          </Button>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>セッションを削除しますか？</DialogTitle>
                <DialogDescription>
                  この操作は取り消せません。
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
      )}
    </div>
  )
}
