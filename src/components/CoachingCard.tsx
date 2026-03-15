import type { CoachingResponse } from '@/types'

interface CoachingCardProps {
  coaching: CoachingResponse | null
}

export function CoachingCard({ coaching }: CoachingCardProps) {
  if (!coaching) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        <p>AIコーチング（近日実装予定）</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* 1行サマリー */}
      <p className="text-sm font-medium">{coaching.summary}</p>

      {/* 原因分析 */}
      <details open>
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground select-none">
          原因分析
        </summary>
        <p className="mt-2 text-sm">{coaching.analysis}</p>
      </details>

      {/* 次回への提案 */}
      <details open>
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground select-none">
          次回への提案
        </summary>
        <div className="mt-2 space-y-1">
          {coaching.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <input type="checkbox" className="mt-0.5 shrink-0" />
              <span className="text-sm">{s}</span>
            </div>
          ))}
        </div>
      </details>

      {/* 参考動画 */}
      <details>
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground select-none">
          参考動画
        </summary>
        <div className="mt-2 space-y-1">
          {coaching.videoSuggestions.map((v, i) => (
            <div key={i} className="text-sm">
              {v.title} ({v.duration})
            </div>
          ))}
        </div>
      </details>

      {/* パターン検出 */}
      {coaching.patternInsights && coaching.patternInsights.length > 0 && (
        <details open>
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground select-none">
            パターン検出
          </summary>
          <div className="mt-2 space-y-1">
            {coaching.patternInsights.map((p, i) => (
              <p key={i} className="text-sm">{p}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
