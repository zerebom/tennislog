import type { SelfRating } from '@/types'

interface Props {
  value: SelfRating | null
  onChange: (rating: SelfRating) => void
}

const ratings: { value: SelfRating; emoji: string; label: string }[] = [
  { value: 'bad', emoji: '😤', label: 'ダメだった' },
  { value: 'neutral', emoji: '😐', label: 'いつも通り' },
  { value: 'good', emoji: '😊', label: '良かった' },
]

export function SelfRatingPicker({ value, onChange }: Props) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">今日の調子</label>
      <div className="flex gap-2">
        {ratings.map((r) => (
          <button
            key={r.value}
            onClick={() => onChange(r.value)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${
              value === r.value
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card'
            }`}
          >
            <span className="text-2xl">{r.emoji}</span>
            <span className="text-xs text-muted-foreground">{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
