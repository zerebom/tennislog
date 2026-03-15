import type { Insight } from '@/stores/useInsightStore'

interface Props {
  insight: Insight
}

export function InsightCard({ insight }: Props) {
  const bgColors = {
    self: 'bg-[var(--primary-light)] border-primary/20',
    tribe: 'bg-blue-50 border-blue-200',
    hunt: 'bg-amber-50 border-amber-200',
  }

  return (
    <div className={`rounded-[16px] border-[1.5px] p-5 ${bgColors[insight.type]}`}>
      <div className="mb-1 text-[12px] font-medium text-muted-foreground uppercase tracking-[0.02em]">
        Today's Insight
      </div>
      <p className="text-[15px] font-medium leading-[1.7]">{insight.text}</p>
    </div>
  )
}
