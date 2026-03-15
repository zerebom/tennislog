import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
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

const TYPE_ICON: Record<Session['type'], string> = {
  singles: '🎾',
  doubles: '🎾',
  practice: '🏋️',
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
        className="flex items-center gap-2 py-2 px-1 cursor-pointer active:bg-muted/40 rounded-lg transition-colors"
      >
        <span className="w-8 shrink-0 text-xs text-muted-foreground">{dateStr}</span>
        <span className="text-sm text-foreground">{TYPE_LABEL[session.type]}</span>
        {score && (
          <span className="text-sm font-medium text-foreground">{score}</span>
        )}
        {session.result && (
          <span
            className="text-xs font-bold"
            style={{ color: session.result === 'win' ? '#1B7A4A' : '#D4483B' }}
          >
            {session.result === 'win' ? 'WIN' : 'LOSE'}
          </span>
        )}
        {session.memo && (
          <span className="flex-1 min-w-0 text-xs text-muted-foreground truncate">
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
      ? '#1B7A4A'
      : session.result === 'lose'
      ? '#D4483B'
      : 'transparent'

  return (
    <div
      onClick={handleClick}
      className="relative flex overflow-hidden rounded-xl border border-border bg-card cursor-pointer active:scale-[0.98] transition-transform"
    >
      {/* 左端アクセントバー */}
      <div
        className="w-1 shrink-0"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex-1 p-4">
        {/* ヘッダー行: 種別タグ + 日付 */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {TYPE_ICON[session.type]} {TYPE_LABEL[session.type]}
          </span>
          <span className="text-xs text-muted-foreground">{dateStr}</span>
        </div>

        {/* スコア + 結果バッジ（試合のみ） */}
        {score && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-foreground tracking-wide">{score}</span>
            {session.result && (
              <span
                className="rounded-full px-3 py-0.5 text-sm font-bold text-white"
                style={{
                  backgroundColor: session.result === 'win' ? '#1B7A4A' : '#D4483B',
                }}
              >
                {session.result === 'win' ? 'WIN' : 'LOSE'}
              </span>
            )}
          </div>
        )}

        {/* メモ抜粋 */}
        {session.memo && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {session.memo.slice(0, 50)}
            {session.memo.length > 50 ? '...' : ''}
          </p>
        )}

        {/* フッター */}
        <div className="flex justify-end">
          <span className="text-xs font-medium" style={{ color: '#1B7A4A' }}>
            コーチングを見る →
          </span>
        </div>
      </div>
    </div>
  )
}
