import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/useSessionStore'
import { usePersonStore } from '@/stores/usePersonStore'
import { ScoreInput } from '@/components/ScoreInput'
import { PersonPicker } from '@/components/PersonPicker'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground"
        >
          ← 戻る
        </button>
        <h1 className="text-lg font-bold">{typeLabel[session.type]}</h1>
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
              placeholder="気づいたこと、課題など"
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
        </div>
      ) : (
        /* View Mode */
        <div className="space-y-4">
          {/* Date card */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">日付</p>
            <p className="mt-1 text-base font-medium">{session.date}</p>
          </div>

          {/* Match details */}
          {session.type !== 'practice' && session.sets && session.sets.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">結果</p>
                <span
                  className={`text-sm font-bold ${
                    session.result === 'win' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {session.result === 'win' ? '勝ち' : '負け'}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">スコア</p>
                <div className="flex gap-3">
                  {session.sets.map((s, i) => (
                    <span key={i} className="text-sm font-medium">
                      {i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}: {s.myScore}-{s.opponentScore}
                    </span>
                  ))}
                </div>
              </div>
              {opponent && (
                <div>
                  <p className="text-xs text-muted-foreground">相手</p>
                  <p className="text-sm">{opponent.name}</p>
                </div>
              )}
              {partner && (
                <div>
                  <p className="text-xs text-muted-foreground">パートナー</p>
                  <p className="text-sm">{partner.name}</p>
                </div>
              )}
            </div>
          )}

          {session.type === 'practice' && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">練習・レッスン</p>
            </div>
          )}

          {/* Memo */}
          {session.memo && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">メモ</p>
              <p className="text-sm whitespace-pre-wrap">{session.memo}</p>
            </div>
          )}

          {/* Coaching placeholder */}
          <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            AIコーチングは今後実装予定です
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
