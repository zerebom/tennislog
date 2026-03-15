import type { Set } from '@/types'
import { Plus, X } from 'lucide-react'

interface Props {
  sets: Set[]
  onChange: (sets: Set[]) => void
}

const scores = [0, 1, 2, 3, 4, 5, 6, 7]

export function ScoreInput({ sets, onChange }: Props) {
  const updateSet = (index: number, field: 'myScore' | 'opponentScore', value: number) => {
    const newSets = [...sets]
    newSets[index] = { ...newSets[index], [field]: value }
    onChange(newSets)
  }

  const addSet = () => {
    if (sets.length < 3) {
      onChange([...sets, { myScore: 0, opponentScore: 0 }])
    }
  }

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      onChange(sets.filter((_, i) => i !== index))
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">スコア</label>
      <div className="space-y-2">
        {sets.map((set, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-16 text-xs text-muted-foreground">
              {i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}
            </span>
            <select
              value={set.myScore}
              onChange={(e) => updateSet(i, 'myScore', Number(e.target.value))}
              className="h-10 w-16 rounded-lg border border-border bg-card px-2 text-center text-lg font-bold"
            >
              {scores.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-muted-foreground">-</span>
            <select
              value={set.opponentScore}
              onChange={(e) => updateSet(i, 'opponentScore', Number(e.target.value))}
              className="h-10 w-16 rounded-lg border border-border bg-card px-2 text-center text-lg font-bold"
            >
              {scores.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {sets.length > 1 && (
              <button
                onClick={() => removeSet(i)}
                className="ml-1 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {sets.length < 3 && (
          <button
            onClick={addSet}
            className="flex items-center gap-1 text-sm text-primary"
          >
            <Plus className="h-4 w-4" />
            セットを追加
          </button>
        )}
      </div>
    </div>
  )
}
