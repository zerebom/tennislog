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
      <div className="mx-auto max-w-md px-5 py-6">
        <p className="text-[15px] text-muted-foreground">セッションが見つかりません</p>
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

  const scoreText = session.sets && session.sets.length > 0
    ? session.sets.map((s) => `${s.myScore}-${s.opponentScore}`).join('  ')
    : ''

  return (
    <div className="mx-auto max-w-md px-5 pt-[48px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-[14px] text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          ホームへ
        </button>
      </div>

      {/* タイトル行: 種別タグ + 日付 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[var(--primary-light)] px-3 py-1 text-[14px] font-medium text-primary">
            {typeLabel[session.type]}
          </span>
          <span className="text-[14px] text-muted-foreground">
            {format(new Date(session.date), 'M月d日(E)', { locale: ja })}
          </span>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[14px] text-primary font-medium"
          >
            編集
          </button>
        )}
        {isEditing && <div className="w-8" />}
      </div>

      {/* スコア + WIN/LOSE バッジ（試合の場合） */}
      {session.type !== 'practice' && scoreText && !isEditing && (
        <div className="flex items-center gap-4 mb-6">
          <span className="font-score text-[46px] font-medium leading-none tracking-[0.02em]">
            {scoreText}
          </span>
          {session.result && (
            <span
              className="font-score-compact rounded-full px-4 py-1 text-[14px] font-semibold text-white"
              style={{
                backgroundColor: session.result === 'win' ? 'var(--primary)' : 'var(--destructive)',
              }}
            >
              {session.result === 'win' ? 'WIN' : 'LOSE'}
            </span>
          )}
        </div>
      )}

      {/* vs. 相手名 */}
      {opponent && !isEditing && (
        <p className="text-[15px] text-muted-foreground mb-4">vs. {opponent.name}さん</p>
      )}

      {/* パートナー名 */}
      {partner && !isEditing && (
        <p className="text-[15px] text-muted-foreground mb-4">パートナー: {partner.name}さん</p>
      )}

      {isEditing ? (
        /* Edit Mode */
        <div className="space-y-6">
          {/* Date */}
          <div>
            <label className="mb-2 block text-[14px] font-medium">日付</label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="h-12 w-full rounded-[12px] border-[1.5px] border-border bg-background px-5 text-base"
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
            <label className="mb-2 block text-[14px] font-medium">メモ（任意）</label>
            <textarea
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
              rows={4}
              className="w-full rounded-[12px] border-[1.5px] border-border bg-background px-5 py-3.5 text-base resize-none leading-[1.7]"
              placeholder="今日のテニスで気づいたことを書いてください"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleCancelEdit}>
              キャンセル
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              保存する
            </Button>
          </div>

          {/* Delete */}
          <Button variant="destructive" className="w-full" onClick={() => setShowDeleteDialog(true)}>
            削除する
          </Button>
        </div>
      ) : (
        /* View Mode */
        <div>
          {/* メモセクション */}
          <section className="mb-[44px]">
            <h2 className="section-title text-[24px] font-extrabold leading-[1.3] tracking-[-0.02em] text-foreground mb-4">
              メモ
            </h2>
            {session.memo ? (
              <div className="border-l-[3px] border-border pl-5">
                <p className="text-[15px] leading-[1.7] whitespace-pre-wrap">{session.memo}</p>
              </div>
            ) : (
              <p className="text-[15px] text-muted-foreground">メモなし</p>
            )}
          </section>

          {/* AIコーチングセクション */}
          <section className="mb-[44px]">
            <h2 className="section-title text-[24px] font-extrabold leading-[1.3] tracking-[-0.02em] text-foreground mb-4">
              AIコーチング
            </h2>
            <CoachingCard coaching={coaching} />
          </section>

          {/* ホームへ戻る */}
          <Button className="w-full mb-4" onClick={() => navigate('/')}>
            ホームへ戻る
          </Button>

          {/* Delete */}
          <button
            className="w-full text-[14px] text-muted-foreground py-2"
            onClick={() => setShowDeleteDialog(true)}
          >
            このセッションを削除
          </button>

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
