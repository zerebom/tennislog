import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSessionStore } from '@/stores/useSessionStore'
import { SessionCard } from '@/components/SessionCard'

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

export function TimelinePage() {
  const { sessions } = useSessionStore()
  const navigate = useNavigate()

  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [sessions]
  )

  // カレンダー計算
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 月初の曜日オフセット（日=0）
  const startOffset = getDay(monthStart)

  // テニスした日のセット
  const tennisDates = useMemo(
    () => new Set(sessions.map((s) => s.date)),
    [sessions]
  )

  function hasTennis(day: Date): boolean {
    const dateStr = format(day, 'yyyy-MM-dd')
    return tennisDates.has(dateStr)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">タイムライン</h1>

      {/* カレンダービュー */}
      <section>
        {/* 月ナビゲーション */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="前の月"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <span className="text-base font-semibold">
            {format(currentMonth, 'yyyy年M月', { locale: ja })}
          </span>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="次の月"
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={`text-center text-xs font-medium py-1 ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-muted-foreground'
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-y-1">
          {/* 月初オフセット */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`offset-${i}`} />
          ))}

          {daysInMonth.map((day) => {
            const hasMatch = hasTennis(day)
            const todayDay = isToday(day)
            const dayNum = format(day, 'd')

            return (
              <div
                key={day.toISOString()}
                className="flex flex-col items-center py-1"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
                    todayDay
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-foreground'
                  }`}
                >
                  {dayNum}
                </div>
                {/* テニスした日のドット */}
                <div className="h-1.5 mt-0.5">
                  {hasMatch && (
                    <div
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: '#1B7A4A' }}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* セッション一覧 */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">すべての記録</h2>

        {sortedSessions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              まだ記録がありません。テニスの後にメモを書いてみましょう
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                variant="full"
                onClick={() => navigate(`/sessions/${session.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
