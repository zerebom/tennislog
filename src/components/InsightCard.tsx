import type { Insight } from '@/stores/useInsightStore'

interface Props {
  insight: Insight
}

export function InsightCard({ insight }: Props) {
  const bgColors = {
    self: 'bg-primary/5 border-primary/20',
    tribe: 'bg-blue-50 border-blue-200',
    hunt: 'bg-amber-50 border-amber-200',
  }

  return (
    <div className={`rounded-xl border p-4 ${bgColors[insight.type]}`}>
      <div className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Today's Insight
      </div>
      <p className="text-sm font-medium">{insight.text}</p>
    </div>
  )
}
