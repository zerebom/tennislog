import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CircleDot, Dumbbell, Users } from 'lucide-react'
import type { Session } from '@/types'

interface SessionCardProps {
  session: Session
  variant: 'full' | 'compact'
  onClick?: () => void
}

const TYPE_LABEL: Record<Session['type'], string> = {
  singles: 'シングルス',
  doubles: 'ダブルス',
  practice: '練習',
}

const TYPE_ICON: Record<Session['type'], React.ComponentType<{ className?: string }>> = {
  singles: CircleDot,
  doubles: Users,
  practice: Dumbbell,
}

function formatScore(session: Session): string {
  if (!session.sets || session.sets.length === 0) return ''
  return session.sets.map((s) => `${s.myScore}-${s.opponentScore}`).join('  ')
}

export function SessionCard({ session, variant, onClick }: SessionCardProps) {
  const navigate = useNavigate()
  const handleClick = onClick ?? (() => navigate(`/sessions/${session.id}`))

  if (variant === 'compact') {
    const score = formatScore(session)
    const dateStr = format(new Date(session.date), 'M/d')
    return (
      <div
        onClick={handleClick}
        className="flex items-center gap-3 h-[52px] px-5 cursor-pointer active:bg-muted/40 rounded-[16px] transition-colors"
      >
        <span className="w-10 shrink-0 text-[13px] text-muted-foreground">{dateStr}</span>
        <span className="text-[14px] text-foreground">{TYPE_LABEL[session.type]}</span>
        {score && (
          <span className="font-score-compact text-[16px] font-semibold text-foreground">{score}</span>
        )}
        {session.result && (
          <span
            className="font-score-compact text-[14px] font-semibold"
            style={{ color: session.result === 'win' ? 'var(--primary)' : 'var(--destructive)' }}
          >
            {session.result === 'win' ? 'WIN' : 'LOSE'}
          </span>
        )}
        {session.memo && (
          <span className="flex-1 min-w-0 text-[13px] text-muted-foreground truncate">
            {session.memo}
          </span>
        )}
      </div>
    )
  }

  // variant === 'full'
  const score = formatScore(session)
  const dateStr = format(new Date(session.date), 'M月d日(E)', { locale: ja })
  const accentColor =
    session.result === 'win'
      ? 'var(--primary)'
      : session.result === 'lose'
      ? 'var(--destructive)'
      : 'transparent'

  const TypeIcon = TYPE_ICON[session.type]

  return (
    <div
      onClick={handleClick}
      className="relative flex overflow-hidden rounded-[16px] bg-card cursor-pointer active:scale-[0.98] transition-transform shadow-[var(--shadow-card)]"
    >
      {/* 左端アクセントバー (3px) */}
      <div
        className="w-[3px] shrink-0"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex-1 p-5">
        {/* ヘッダー行: 種別タグ + 日付 */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[14px] font-medium text-secondary-foreground">
            <TypeIcon className="h-4 w-4" />
            {TYPE_LABEL[session.type]}
          </span>
          <span className="text-[13px] text-muted-foreground">{dateStr}</span>
        </div>

        {/* スコア + 結果バッジ（試合のみ） */}
        {score && (
          <div className="flex items-center justify-between mb-4">
            <span className="font-score text-[46px] font-medium leading-none tracking-[0.02em] text-foreground">
              {score}
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

        {/* メモ抜粋（左ボーダー引用スタイル） */}
        {session.memo && (
          <div className="border-l-[3px] border-border pl-4 mb-4">
            <p className="text-[15px] text-muted-foreground leading-[1.7] line-clamp-2">
              {session.memo}
            </p>
          </div>
        )}

        {/* フッター */}
        <div className="flex justify-end">
          <span className="text-[13px] font-medium text-primary">
            コーチングを見る →
          </span>
        </div>
      </div>
    </div>
  )
}
