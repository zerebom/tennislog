import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/useSessionStore'
import { usePersonStore } from '@/stores/usePersonStore'
import { useProfileStore } from '@/stores/useProfileStore'
import { RecordTypeSheet } from '@/components/RecordTypeSheet'
import type { Session } from '@/types'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'

function SessionCard({
  session,
  personName,
  isFirst,
  onClick,
}: {
  session: Session
  personName?: string
  isFirst?: boolean
  onClick?: () => void
}) {
  const typeIcon = session.type === 'practice' ? '🏋️' : session.type === 'doubles' ? '🎾🎾' : '🎾'
  const score = session.sets?.map((s) => `${s.myScore}-${s.opponentScore}`).join(', ')

  if (isFirst) {
    return (
      <div
        onClick={onClick}
        className="rounded-xl border border-border bg-card p-4 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{typeIcon}</span>
          <span className="text-xs text-muted-foreground">{format(new Date(session.date), 'M/d')}</span>
          {session.result && (
            <span
              className={`text-sm font-bold ${session.result === 'win' ? 'text-win' : 'text-lose'}`}
            >
              {session.result === 'win' ? 'WIN' : 'LOSE'}
            </span>
          )}
        </div>
        {score && <div className="text-sm font-medium mb-1">{score}</div>}
        {personName && <div className="text-sm text-muted-foreground mb-1">{personName}</div>}
        {session.memo && (
          <div className="text-sm text-muted-foreground line-clamp-2">{session.memo}</div>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 cursor-pointer active:scale-[0.98] transition-transform"
    >
      <span className="text-lg">{typeIcon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {score && (
            <span
              className={`text-sm font-bold ${session.result === 'win' ? 'text-win' : 'text-lose'}`}
            >
              {score}
            </span>
          )}
          {personName && <span className="text-sm truncate">{personName}</span>}
        </div>
        {session.memo && (
          <div className="text-xs text-muted-foreground truncate">{session.memo}</div>
        )}
      </div>
      <span className="text-xs text-muted-foreground">{format(new Date(session.date), 'M/d')}</span>
    </div>
  )
}

export function HomePage() {
  const { sessions } = useSessionStore()
  const { getPerson } = usePersonStore()
  const { profile } = useProfileStore()
  const navigate = useNavigate()

  const [showRecordSheet, setShowRecordSheet] = useState(false)

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [sessions]
  )

  if (sessions.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <h1 className="mb-6 text-xl font-bold">
          {profile?.nickname ? `${profile.nickname}さんの` : ''}TennisLog
        </h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-12 text-center">
          <div className="mb-4 text-5xl">🎾</div>
          <h2 className="mb-2 text-lg font-bold">まだ記録がありません</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            テニスの後にサクッと記録して
            <br />
            上達を見える化しましょう
          </p>
          <Button onClick={() => setShowRecordSheet(true)}>最初の記録をする</Button>
        </div>
        <RecordTypeSheet open={showRecordSheet} onOpenChange={setShowRecordSheet} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <h1 className="mb-4 text-xl font-bold">
        {profile?.nickname ? `${profile.nickname}さんの` : ''}TennisLog
      </h1>

      <div className="space-y-2">
        {sortedSessions.map((session, index) => {
          const personName =
            session.opponentId
              ? getPerson(session.opponentId)?.name
              : session.partnerId
              ? getPerson(session.partnerId)?.name
              : undefined

          return (
            <SessionCard
              key={session.id}
              session={session}
              personName={personName}
              isFirst={index === 0}
              onClick={() => navigate(`/sessions/${session.id}`)}
            />
          )
        })}
      </div>
    </div>
  )
}
