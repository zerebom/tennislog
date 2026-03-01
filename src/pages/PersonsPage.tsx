import { useNavigate } from 'react-router-dom'
import { usePersonStore } from '@/stores/usePersonStore'
import { useActivityStore } from '@/stores/useActivityStore'
import type { Match } from '@/types'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'

export function PersonsPage() {
  const { persons } = usePersonStore()
  const { activities } = useActivityStore()
  const navigate = useNavigate()

  if (persons.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-6">
        <h1 className="mb-6 text-xl font-bold">仲間</h1>
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-12 text-center">
          <div className="mb-4 text-4xl">👥</div>
          <p className="mb-2 text-sm text-muted-foreground">
            試合を記録するとき、
            <br />
            相手やパートナーの名前を入れると
            <br />
            ここに自動で追加されます
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/record/singles')}
          >
            試合を記録する
          </Button>
        </div>
      </div>
    )
  }

  const personStats = persons.map((person) => {
    const matches = activities.filter(
      (a): a is Match =>
        a.type !== 'practice' &&
        (a.opponentId === person.id || a.partnerId === person.id)
    )
    const wins = matches.filter((m) => m.result === 'win').length
    const losses = matches.length - wins
    const lastMatch = matches.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]
    return { person, wins, losses, total: matches.length, lastMatch }
  })

  return (
    <div className="mx-auto max-w-md px-4 py-4">
      <h1 className="mb-4 text-xl font-bold">仲間</h1>
      <div className="space-y-2">
        {personStats.map(({ person, wins, losses, total, lastMatch }) => (
          <button
            key={person.id}
            onClick={() => navigate(`/persons/${person.id}`)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors active:bg-accent"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {person.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{person.name}</div>
              {total > 0 && (
                <div className="text-xs text-muted-foreground">
                  {wins}勝 {losses}敗
                  {total > 0 ? ` (${Math.round((wins / total) * 100)}%)` : ''}
                  {lastMatch ? ` | 最終 ${format(new Date(lastMatch.date), 'M/d')}` : ''}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
