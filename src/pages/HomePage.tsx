import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivityStore } from '@/stores/useActivityStore'
import { usePersonStore } from '@/stores/usePersonStore'
import { useProfileStore } from '@/stores/useProfileStore'
import type { Activity, Match } from '@/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ratingEmoji = { bad: '😤', neutral: '😐', good: '😊' }
const ratingValue = { bad: 1, neutral: 2, good: 3 }

function MoodGraph({ activities }: { activities: Activity[] }) {
  const sorted = [...activities]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)

  if (sorted.length < 3) {
    const remaining = 3 - sorted.length
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-2 text-sm font-medium">調子の推移</h3>
        <div className="flex items-center justify-center py-6 text-center text-sm text-muted-foreground">
          <span>あと{remaining}回記録すると<br/>調子の推移グラフが表示されます</span>
        </div>
      </div>
    )
  }

  const width = 280
  const height = 80
  const padding = 20
  const graphWidth = width - padding * 2
  const graphHeight = height - padding * 2
  const stepX = graphWidth / (sorted.length - 1)

  const points = sorted.map((a, i) => ({
    x: padding + i * stepX,
    y: padding + graphHeight - ((ratingValue[a.selfRating] - 1) / 2) * graphHeight,
    rating: a.selfRating,
    date: a.date,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-medium">調子の推移</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Grid lines */}
        {[1, 2, 3].map((v) => {
          const y = padding + graphHeight - ((v - 1) / 2) * graphHeight
          return <line key={v} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#E5E7EB" strokeDasharray="2,2" />
        })}
        {/* Y axis labels */}
        <text x={4} y={padding + 4} fontSize="10" fill="#9CA3AF">😊</text>
        <text x={4} y={padding + graphHeight / 2 + 4} fontSize="10" fill="#9CA3AF">😐</text>
        <text x={4} y={padding + graphHeight + 4} fontSize="10" fill="#9CA3AF">😤</text>
        {/* Line */}
        <path d={pathD} fill="none" stroke="#1B7A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={
            p.rating === 'good' ? '#22C55E' : p.rating === 'neutral' ? '#F59E0B' : '#EF4444'
          } />
        ))}
      </svg>
      {/* Consecutive good streak */}
      {(() => {
        let streak = 0
        for (let i = sorted.length - 1; i >= 0; i--) {
          if (sorted[i].selfRating === 'good') streak++
          else break
        }
        if (streak >= 2) {
          return <p className="mt-1 text-xs text-primary font-medium">😊が{streak}回連続! 好調持続中</p>
        }
        return null
      })()}
    </div>
  )
}

function Calendar({ activities, currentMonth }: { activities: Activity[]; currentMonth: Date }) {
  const start = startOfMonth(currentMonth)
  const end = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start, end })
  const startDow = getDay(start)
  const dows = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 grid grid-cols-7 gap-1">
        {dows.map((d) => (
          <div key={d} className="text-center text-[11px] text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDow }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const dayActivities = activities.filter((a) => isSameDay(new Date(a.date), day))
          const hasMatch = dayActivities.some((a) => a.type !== 'practice')
          const hasPractice = dayActivities.some((a) => a.type === 'practice')
          return (
            <div
              key={day.toISOString()}
              className={`flex h-8 items-center justify-center rounded-md text-xs ${
                hasMatch ? 'bg-win/15 text-win font-medium' :
                hasPractice ? 'bg-practice/15 text-practice font-medium' : ''
              }`}
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-win/40" />試合
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-practice/40" />練習
        </span>
      </div>
    </div>
  )
}

function ActivityCard({ activity, personName }: { activity: Activity; personName?: string }) {
  const isMatch = activity.type !== 'practice'
  const match = isMatch ? (activity as Match) : null

  const typeIcon = activity.type === 'practice' ? '🏋️' : activity.type === 'doubles' ? '🎾🎾' : '🎾'
  const score = match ? match.sets.map((s) => `${s.myScore}-${s.opponentScore}`).join(', ') : null

  const practiceTagLabels: Record<string, string> = {
    serve: 'サーブ',
    stroke: 'ストローク',
    volley: 'ボレー',
    footwork: 'フットワーク',
    'match-play': '試合形式',
  }

  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${
      activity.type === 'practice' ? 'border-practice/20 bg-practice/5' : 'border-border bg-card'
    }`}>
      <span className="text-lg">{typeIcon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {match && (
            <>
              {personName && (
                <span className="text-sm font-medium">
                  {match.type === 'doubles' ? `w/ ${personName}` : `vs ${personName}`}
                </span>
              )}
              <span className={`text-sm font-bold ${match.result === 'win' ? 'text-win' : 'text-lose'}`}>
                {score}
              </span>
            </>
          )}
          {activity.type === 'practice' && (
            <span className="text-sm text-practice">
              {(activity as import('@/types').Practice).tags.map((t) => practiceTagLabels[t] || t).join(', ')}
            </span>
          )}
        </div>
      </div>
      <span className="text-lg">{ratingEmoji[activity.selfRating]}</span>
      <span className="text-xs text-muted-foreground">{format(new Date(activity.date), 'M/d')}</span>
    </div>
  )
}

export function HomePage() {
  const { activities, getMonthlyStats } = useActivityStore()
  const { getPerson } = usePersonStore()
  const { profile } = useProfileStore()
  const navigate = useNavigate()

  const [monthOffset, setMonthOffset] = useState(0)
  const currentMonth = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + monthOffset)
    return d
  }, [monthOffset])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth() + 1
  const stats = getMonthlyStats(year, month)

  const sortedActivities = useMemo(
    () => [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [activities]
  )

  // Empty state
  if (activities.length === 0) {
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
          <Button onClick={() => navigate('/record/singles')}>最初の記録をする</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <h1 className="mb-4 text-xl font-bold">
        {profile?.nickname ? `${profile.nickname}さんの` : ''}TennisLog
      </h1>

      <div className="space-y-4">
        {/* Mood Graph - First (emotion first) */}
        <MoodGraph activities={activities} />

        {/* Monthly Summary + Calendar */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => setMonthOffset((o) => o - 1)}>
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <h3 className="text-sm font-medium">
              {format(currentMonth, 'yyyy年M月', { locale: ja })}
            </h3>
            <button onClick={() => setMonthOffset((o) => o + 1)}>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="mb-3 grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-lg font-bold">{stats.matchCount}</div>
              <div className="text-[11px] text-muted-foreground">試合</div>
            </div>
            <div>
              <div className="text-lg font-bold">{stats.winRate !== null ? `${stats.winRate}%` : '-'}</div>
              <div className="text-[11px] text-muted-foreground">勝率</div>
            </div>
            <div>
              <div className="text-lg font-bold">{stats.practiceCount}</div>
              <div className="text-[11px] text-muted-foreground">練習</div>
            </div>
            <div>
              <div className="text-lg font-bold">
                {stats.currentStreak > 0 ? `${stats.currentStreak}` : '-'}
              </div>
              <div className="text-[11px] text-muted-foreground">連勝</div>
            </div>
          </div>

          <Calendar activities={activities} currentMonth={currentMonth} />
        </div>

        {/* Timeline */}
        <div>
          <h3 className="mb-2 text-sm font-medium">直近のアクティビティ</h3>
          <div className="space-y-2">
            {sortedActivities.slice(0, 20).map((activity) => {
              const match = activity.type !== 'practice' ? (activity as Match) : null
              const personId = match?.opponentId ?? match?.partnerId
              const personName = personId ? getPerson(personId)?.name : undefined
              return (
                <ActivityCard key={activity.id} activity={activity} personName={personName} />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
