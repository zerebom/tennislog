import { ThumbsDown, Minus, ThumbsUp } from 'lucide-react'
import type { SelfRating } from '@/types'

interface Props {
  value: SelfRating | null
  onChange: (rating: SelfRating) => void
}

const ratings: { value: SelfRating; icon: React.ComponentType<{ className?: string }>; label: string; activeColor: string }[] = [
  { value: 'bad', icon: ThumbsDown, label: 'ダメだった', activeColor: 'border-[var(--color-rating-bad)] bg-[var(--color-lose-bg)]' },
  { value: 'neutral', icon: Minus, label: 'いつも通り', activeColor: 'border-[var(--color-rating-neutral)] bg-[var(--color-improving-bg)]' },
  { value: 'good', icon: ThumbsUp, label: '良かった', activeColor: 'border-[var(--color-rating-good)] bg-[var(--color-win-bg)]' },
]

export function SelfRatingPicker({ value, onChange }: Props) {
  return (
    <div>
      <label className="mb-2 block text-[14px] font-medium">今日の調子</label>
      <div className="flex gap-3">
        {ratings.map((r) => {
          const Icon = r.icon
          return (
            <button
              key={r.value}
              onClick={() => onChange(r.value)}
              className={`flex flex-1 flex-col items-center gap-2 rounded-[16px] border-[1.5px] p-4 transition-colors ${
                value === r.value
                  ? r.activeColor
                  : 'border-border bg-card'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[13px] text-muted-foreground">{r.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
