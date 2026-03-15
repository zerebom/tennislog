import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Settings } from 'lucide-react'
import { useSessionStore } from '@/stores/useSessionStore'
import { useProfileStore } from '@/stores/useProfileStore'
import { useCoachingStore } from '@/stores/useCoachingStore'
import { RecordTypeSheet } from '@/components/RecordTypeSheet'
import { SessionCard } from '@/components/SessionCard'
import { Button } from '@/components/ui/button'

export function HomePage() {
  const { sessions } = useSessionStore()
  const { profile } = useProfileStore()
  const { getBySessionId } = useCoachingStore()
  const navigate = useNavigate()

  const [showRecordSheet, setShowRecordSheet] = useState(false)

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
      if (dateDiff !== 0) return dateDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }),
    [sessions]
  )

  const firstName = sortedSessions[0]
  const restSessions = sortedSessions.slice(1, 4)

  // コーチングがある最新セッションの suggestions を表示
  const latestCoaching = useMemo(() => {
    for (const s of sortedSessions) {
      const c = getBySessionId(s.id)
      if (c) return c
    }
    return undefined
  }, [sortedSessions, getBySessionId])
  const suggestions = latestCoaching?.suggestions ?? []

  return (
    <div className="mx-auto max-w-md px-5 pt-[48px]">
      {/* ページタイトル */}
      <div className="flex items-center justify-between mb-[44px]">
        <h1 className="text-[28px] font-extrabold leading-[1.3] tracking-[-0.02em]">
          {profile?.nickname ? `${profile.nickname}さんの` : ''}TennisLog
        </h1>
        <button onClick={() => navigate('/settings')} aria-label="設定">
          <Settings className="h-6 w-6" style={{ color: '#4A5550' }} />
        </button>
      </div>

      {/* セクション1: 次回のテニスで意識すること */}
      <section className="mb-[44px]">
        <h2 className="section-title text-[24px] font-extrabold leading-[1.3] tracking-[-0.02em] text-foreground mb-4">
          次回のテニスで意識すること
        </h2>
        <div className="rounded-[16px] bg-card p-5 shadow-[var(--shadow-card)]">
          {suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 shrink-0" readOnly />
                  <span className="text-[15px] leading-[1.7]">{s}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-muted-foreground leading-[1.7]">
              テニスの後にメモを書くと、AIコーチからの提案がここに表示されます
            </p>
          )}
        </div>
      </section>

      {/* セクション2: 直近のセッション */}
      <section className="mb-[44px]">
        <h2 className="section-title text-[24px] font-extrabold leading-[1.3] tracking-[-0.02em] text-foreground mb-4">
          直近のセッション
        </h2>

        {sessions.length === 0 ? (
          /* 空状態: 左揃え、Lucide Icon */
          <div className="py-8">
            <ClipboardList className="h-8 w-8 text-muted-foreground mb-4" />
            <h3 className="text-[16px] font-semibold mb-2">まだ記録がありません</h3>
            <p className="text-[16px] text-muted-foreground leading-[1.7] mb-6">
              テニスの後にサクッと記録して
              <br />
              上達を見える化しましょう
            </p>
            <Button onClick={() => setShowRecordSheet(true)}>最初の記録をする</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 最新1件: フルカード */}
            {firstName && (
              <SessionCard
                session={firstName}
                variant="full"
                onClick={() => navigate(`/sessions/${firstName.id}`)}
              />
            )}

            {/* 2件目以降: コンパクトカード（最大3件） */}
            {restSessions.length > 0 && (
              <div className="rounded-[16px] bg-card shadow-[var(--shadow-card)] divide-y divide-border">
                {restSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    variant="compact"
                    onClick={() => navigate(`/sessions/${session.id}`)}
                  />
                ))}
              </div>
            )}

            {/* もっと見るボタン */}
            {sortedSessions.length > 4 && (
              <Button
                variant="link"
                className="w-full"
                onClick={() => navigate('/timeline')}
              >
                もっと見る
              </Button>
            )}
          </div>
        )}
      </section>

      <RecordTypeSheet open={showRecordSheet} onOpenChange={setShowRecordSheet} />
    </div>
  )
}
