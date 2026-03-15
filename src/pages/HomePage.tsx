import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/useSessionStore'
import { useProfileStore } from '@/stores/useProfileStore'
import { RecordTypeSheet } from '@/components/RecordTypeSheet'
import { SessionCard } from '@/components/SessionCard'
import { Button } from '@/components/ui/button'

export function HomePage() {
  const { sessions } = useSessionStore()
  const { profile } = useProfileStore()
  const navigate = useNavigate()

  const [showRecordSheet, setShowRecordSheet] = useState(false)

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [sessions]
  )

  const firstName = sortedSessions[0]
  const restSessions = sortedSessions.slice(1, 4)

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-6">
      {/* ページタイトル */}
      <h1 className="text-xl font-bold">
        {profile?.nickname ? `${profile.nickname}さんの` : ''}TennisLog
      </h1>

      {/* セクション1: 次回のテニスで意識すること */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">
          次回のテニスで意識すること
        </h2>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            テニスの後にメモを書くと、AIコーチからの提案がここに表示されます
          </p>
        </div>
      </section>

      {/* セクション2: 直近のセッション */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">直近のセッション</h2>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-12 text-center">
            <div className="mb-4 text-5xl">🎾</div>
            <h3 className="mb-2 text-base font-bold">まだ記録がありません</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              テニスの後にメモを書いてみましょう
            </p>
            <Button onClick={() => setShowRecordSheet(true)}>最初の記録をする</Button>
          </div>
        ) : (
          <div className="space-y-3">
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
              <div className="rounded-xl border border-border bg-card px-3 divide-y divide-border">
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
                variant="outline"
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
