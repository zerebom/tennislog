import type { Activity, Match } from '@/types'

export interface Insight {
  text: string
  type: 'self' | 'tribe' | 'hunt'
}

export function generateInsight(
  activities: Activity[],
  newActivity: Activity,
  getPersonName: (id: string) => string | undefined
): Insight {
  const totalCount = activities.length
  const matches = activities.filter((a): a is Match => a.type !== 'practice')
  const totalMatches = matches.length

  // First ever record
  if (totalCount === 1) {
    return { text: '初記録おめでとう! テニス記録の第一歩 🎾', type: 'self' }
  }

  // Milestone checks
  if (totalCount === 3) {
    const goodCount = activities.filter((a) => a.selfRating === 'good').length
    if (goodCount >= 2) {
      return { text: `3件記録! 😊が${goodCount}回、好調ですね`, type: 'self' }
    }
    return { text: '3件記録達成! 記録の習慣が始まっています', type: 'self' }
  }

  if (totalMatches === 10) {
    const wins = matches.filter((m) => m.result === 'win').length
    const rate = Math.round((wins / totalMatches) * 100)
    return { text: `10試合達成! 勝率${rate}%`, type: 'self' }
  }

  if (totalMatches === 50) {
    return { text: '通算50試合達成! すごい記録量です', type: 'self' }
  }

  // Check consecutive good ratings
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  let consecutiveGood = 0
  for (const a of sortedActivities) {
    if (a.selfRating === 'good') consecutiveGood++
    else break
  }
  if (consecutiveGood >= 3) {
    return { text: `😊が${consecutiveGood}回連続! 好調持続中`, type: 'self' }
  }

  // Person-specific insights
  if (newActivity.type !== 'practice') {
    const match = newActivity as Match

    // Opponent insights (singles)
    if (match.opponentId) {
      const opponentMatches = matches.filter((m) => m.opponentId === match.opponentId)
      const name = getPersonName(match.opponentId) ?? '相手'
      if (opponentMatches.length === 2) {
        const prev = opponentMatches.find((m) => m.id !== match.id)
        if (prev) {
          const prevScore = prev.sets.map((s) => `${s.myScore}-${s.opponentScore}`).join(', ')
          return { text: `${name}さんとの2回目! 前回は${prevScore}でした`, type: 'tribe' }
        }
      }
      if (opponentMatches.length >= 3) {
        const wins = opponentMatches.filter((m) => m.result === 'win').length
        const losses = opponentMatches.length - wins
        if (wins > losses) {
          return { text: `${name}さんに通算${wins}勝${losses}敗! 勝ち越しています`, type: 'tribe' }
        }
      }
    }

    // Partner insights (doubles)
    if (match.partnerId) {
      const partnerMatches = matches.filter((m) => m.partnerId === match.partnerId)
      const name = getPersonName(match.partnerId) ?? 'パートナー'
      if (partnerMatches.length >= 3) {
        const wins = partnerMatches.filter((m) => m.result === 'win').length
        const losses = partnerMatches.length - wins
        return { text: `${name}さんとのダブルス ${wins}勝${losses}敗!`, type: 'tribe' }
      }
    }

    // Win streak
    const recentMatches = matches
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let streak = 0
    for (const m of recentMatches) {
      if (m.result === 'win') streak++
      else break
    }
    if (streak >= 3) {
      return { text: `${streak}連勝中! 🔥`, type: 'self' }
    }
  }

  // Monthly comparison
  const now = new Date(newActivity.date)
  const thisMonth = activities.filter((a) => {
    const d = new Date(a.date)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const lastMonth = activities.filter((a) => {
    const d = new Date(a.date)
    const lm = new Date(now.getFullYear(), now.getMonth() - 1)
    return d.getFullYear() === lm.getFullYear() && d.getMonth() === lm.getMonth()
  })
  if (lastMonth.length > 0 && thisMonth.length > lastMonth.length) {
    return {
      text: `今月${thisMonth.length}件目。先月の${lastMonth.length}件をもう超えました`,
      type: 'hunt',
    }
  }

  // Default
  return { text: `${totalCount}件目の記録! 続けていきましょう`, type: 'self' }
}
