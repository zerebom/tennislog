import { useNavigate } from 'react-router-dom'
import { useActivityStore } from '@/stores/useActivityStore'
import { Button } from '@/components/ui/button'
import type { Match } from '@/types'

export function StatsPage() {
  const navigate = useNavigate()
  const { activities } = useActivityStore()
  const matches = activities.filter((a): a is Match => a.type !== 'practice')
  const practices = activities.filter((a) => a.type === 'practice')
  const wins = matches.filter((m) => m.result === 'win').length
  const losses = matches.length - wins
  const singles = matches.filter((m) => m.type === 'singles')
  const doubles = matches.filter((m) => m.type === 'doubles')

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <h1 className="mb-4 text-xl font-bold">統計</h1>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-12 text-center">
          <div className="mb-4 text-4xl">📊</div>
          <p className="mb-6 text-sm text-muted-foreground">
            記録を追加すると
            <br />
            ここに統計が表示されます
          </p>
          <Button onClick={() => navigate('/')}>最初の記録をする</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overall */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-medium">通算成績</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{activities.length}</div>
                <div className="text-xs text-muted-foreground">総記録</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-win">{wins}</div>
                <div className="text-xs text-muted-foreground">勝ち</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-lose">{losses}</div>
                <div className="text-xs text-muted-foreground">負け</div>
              </div>
            </div>
            {matches.length > 0 && (
              <div className="mt-3 text-center">
                <span className="text-3xl font-bold">
                  {Math.round((wins / matches.length) * 100)}%
                </span>
                <div className="text-xs text-muted-foreground">勝率</div>
              </div>
            )}
          </div>

          {/* By type */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-medium">タイプ別</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">🎾 シングルス</span>
                <span className="text-sm font-medium">{singles.length}試合</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">🎾🎾 ダブルス</span>
                <span className="text-sm font-medium">{doubles.length}試合</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">🏋️ 練習</span>
                <span className="text-sm font-medium">{practices.length}回</span>
              </div>
            </div>
          </div>

          {/* Rating distribution */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-medium">調子の分布</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {(['good', 'neutral', 'bad'] as const).map((r) => {
                const count = activities.filter((a) => a.selfRating === r).length
                const pct = Math.round((count / activities.length) * 100)
                const emoji = { good: '😊', neutral: '😐', bad: '😤' }
                return (
                  <div key={r}>
                    <div className="text-2xl">{emoji[r]}</div>
                    <div className="text-lg font-bold">{pct}%</div>
                    <div className="text-xs text-muted-foreground">{count}回</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
