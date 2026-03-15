import { ChevronDown, ListChecks, Play, Search, TrendingUp } from 'lucide-react'
import type { CoachingResponse } from '@/types'

interface CoachingCardProps {
  coaching: CoachingResponse | null
}

export function CoachingCard({ coaching }: CoachingCardProps) {
  if (!coaching) {
    return (
      <div className="border-t border-border pt-4 text-[15px] text-muted-foreground">
        <p>AIコーチング（近日実装予定）</p>
      </div>
    )
  }

  return (
    <div className="space-y-0 divide-y divide-border">
      {/* 1行サマリー */}
      <p className="text-[16px] font-semibold leading-[1.5] pb-4">{coaching.summary}</p>

      {/* 原因分析 */}
      <details open className="pt-4 pb-4">
        <summary className="cursor-pointer select-none flex items-center gap-2 text-[15px] font-medium text-muted-foreground">
          <Search className="h-5 w-5 shrink-0" />
          原因分析
          <ChevronDown className="h-4 w-4 ml-auto transition-transform [[open]>&]:rotate-180" />
        </summary>
        <p className="mt-3 text-[15px] leading-[1.7]">{coaching.analysis}</p>
      </details>

      {/* 次回への提案 */}
      <details open className="pt-4 pb-4">
        <summary className="cursor-pointer select-none flex items-center gap-2 text-[15px] font-medium text-muted-foreground">
          <ListChecks className="h-5 w-5 shrink-0" />
          次回への提案
          <ChevronDown className="h-4 w-4 ml-auto transition-transform [[open]>&]:rotate-180" />
        </summary>
        <div className="mt-3 space-y-2">
          {coaching.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 shrink-0" />
              <span className="text-[15px] leading-[1.7]">{s}</span>
            </div>
          ))}
        </div>
      </details>

      {/* 参考動画 */}
      {Array.isArray(coaching.videoSuggestions) && coaching.videoSuggestions.length > 0 && (
        <details className="pt-4 pb-4">
          <summary className="cursor-pointer select-none flex items-center gap-2 text-[15px] font-medium text-muted-foreground">
            <Play className="h-5 w-5 shrink-0" />
            参考動画
            <ChevronDown className="h-4 w-4 ml-auto transition-transform [[open]>&]:rotate-180" />
          </summary>
          <div className="mt-3 space-y-2">
            {coaching.videoSuggestions.map((v, i) => (
              <div key={i} className="text-[15px]">
                {v.title} ({v.duration})
              </div>
            ))}
          </div>
        </details>
      )}

      {/* パターン検出 */}
      {Array.isArray(coaching.patternInsights) && coaching.patternInsights.length > 0 && (
        <details open className="pt-4 pb-4">
          <summary className="cursor-pointer select-none flex items-center gap-2 text-[15px] font-medium text-muted-foreground">
            <TrendingUp className="h-5 w-5 shrink-0" />
            パターン検出
            <ChevronDown className="h-4 w-4 ml-auto transition-transform [[open]>&]:rotate-180" />
          </summary>
          <div className="mt-3 space-y-2">
            {coaching.patternInsights.map((p, i) => (
              <p key={i} className="text-[15px] leading-[1.7]">{p}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
