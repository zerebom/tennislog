import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, AlertTriangle, X, ChevronDown } from 'lucide-react'
import { nanoid } from 'nanoid'
import { parseImportText, generateCoaching } from '@/lib/api'
import type { ParsedSessionApi } from '@/lib/api'
import type { Session } from '@/types'
import { useSessionStore } from '@/stores/useSessionStore'
import { useCoachingStore } from '@/stores/useCoachingStore'
import { useProfileStore } from '@/stores/useProfileStore'

type ImportStep = 'input' | 'parsing' | 'preview' | 'importing' | 'done'

interface ParsedEntry {
  id: string
  date: string | null
  sessionType: 'practice' | 'singles' | 'doubles'
  memo: string
  score: string | null
  result: string | null
  opponent: string | null
  excluded: boolean
}

function toImportEntry(api: ParsedSessionApi): ParsedEntry {
  return {
    id: nanoid(),
    date: api.date,
    sessionType: (api.session_type as ParsedEntry['sessionType']) || 'practice',
    memo: api.memo,
    score: api.score,
    result: api.result,
    opponent: api.opponent,
    excluded: false,
  }
}

function toSession(entry: ParsedEntry): Session {
  const now = new Date().toISOString()
  const date = entry.date || new Date().toISOString().slice(0, 10)
  return {
    id: nanoid(),
    type: entry.sessionType,
    date,
    memo: entry.memo,
    result: entry.result === 'win' || entry.result === 'lose' ? entry.result : undefined,
    createdAt: now,
  }
}

export function ImportPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<ImportStep>('input')
  const [rawText, setRawText] = useState('')
  const [parsedEntries, setParsedEntries] = useState<ParsedEntry[]>([])
  const [parseError, setParseError] = useState(false)
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set())
  const [inProgressSet, setInProgressSet] = useState<Set<number>>(new Set())
  const [savedSessions, setSavedSessions] = useState<Session[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const CONCURRENCY = 3

  const { addSession } = useSessionStore()
  const { addCoachingResponse } = useCoachingStore()
  const { profile } = useProfileStore()

  const activeEntries = parsedEntries.filter((e) => !e.excluded)
  const nullDateCount = activeEntries.filter((e) => !e.date).length

  // Step 1: input
  const handleParse = async () => {
    setStep('parsing')
    setParseError(false)
    try {
      const results = await parseImportText(rawText)
      setParsedEntries(results.map(toImportEntry))
      setStep('preview')
    } catch {
      setParseError(true)
      setStep('parsing')
    }
  }

  // Step 3: preview → importing (parallel coaching generation)
  const handleImport = async () => {
    setStep('importing')
    setCompletedSet(new Set())
    setInProgressSet(new Set())

    // 1. Save all sessions immediately
    const newSessions: Session[] = []
    for (const entry of activeEntries) {
      const session = toSession(entry)
      addSession({
        type: session.type,
        date: session.date,
        memo: session.memo,
        sets: session.sets,
      })
      const allSessions = useSessionStore.getState().sessions
      const saved = allSessions[allSessions.length - 1]
      newSessions.push(saved)
    }
    setSavedSessions(newSessions)

    // 2. Generate coaching in parallel batches
    const generateOne = async (session: Session, index: number) => {
      setInProgressSet((prev) => new Set(prev).add(index))
      try {
        const allSessions = useSessionStore.getState().sessions
        const allCoaching = useCoachingStore.getState().coachingResponses
        const pastSessions = allSessions
          .filter((s) => s.id !== session.id && s.date <= session.date)
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 5)
          .map((s) => ({
            session: s,
            coaching: allCoaching.find((c) => c.sessionId === s.id) ?? null,
          }))

        const coaching = await generateCoaching(
          session,
          pastSessions,
          profile ?? undefined
        )
        addCoachingResponse(coaching)
        useSessionStore.getState().updateSession(session.id, {
          coachingResponseId: coaching.id,
        })
      } catch (e) {
        console.error(`Coaching failed for ${session.id}:`, e)
      }
      setInProgressSet((prev) => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
      setCompletedSet((prev) => new Set(prev).add(index))
    }

    // Process in batches of CONCURRENCY
    for (let start = 0; start < newSessions.length; start += CONCURRENCY) {
      const batch = newSessions.slice(start, start + CONCURRENCY)
      await Promise.all(
        batch.map((session, j) => generateOne(session, start + j))
      )
    }

    setStep('done')
  }

  const handleBackgroundContinue = () => {
    // Don't abort - just navigate away, coaching continues
    navigate('/')
  }

  const updateEntry = (id: string, updates: Partial<ParsedEntry>) => {
    setParsedEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    )
  }

  // ─── Render ───

  // Step 1: input
  if (step === 'input') {
    return (
      <div className="min-h-dvh px-5 pb-12" style={{ backgroundColor: '#F3F1EC' }}>
        <div className="mx-auto max-w-md">
          <div className="pt-10 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 transition-opacity active:opacity-70"
              style={{
                color: '#4A5550',
                fontSize: '15px',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ArrowLeft size={20} />
              戻る
            </button>
          </div>

          <h1
            className="mb-3"
            style={{
              fontSize: '24px',
              fontWeight: 800,
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: '#1A2B1F',
            }}
          >
            メモをインポート
          </h1>
          <p
            className="mb-6"
            style={{ fontSize: '15px', fontWeight: 400, lineHeight: 1.7, color: '#4A5550' }}
          >
            過去のテニスメモをまとめて取り込めます
          </p>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="テニスメモをここに貼り付けてください"
            rows={8}
            style={{
              width: '100%',
              backgroundColor: '#F3F1EC',
              border: '1.5px solid #DDD9D2',
              borderRadius: '12px',
              padding: '14px 20px',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: 1.7,
              color: '#1A2B1F',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          <p
            className="mt-3 mb-6"
            style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.7, color: '#4A5550' }}
          >
            日付の書き方はバラバラで構いません。AIが自動で読み取ります
          </p>

          <button
            onClick={handleParse}
            disabled={!rawText.trim()}
            className="w-full transition-transform active:scale-[0.98]"
            style={{
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#1B6B4A',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: rawText.trim() ? 'pointer' : 'not-allowed',
              opacity: rawText.trim() ? 1 : 0.4,
            }}
          >
            読み取る
          </button>
        </div>
      </div>
    )
  }

  // Step 2: parsing
  if (step === 'parsing') {
    if (parseError) {
      return (
        <div className="min-h-dvh px-5 pb-12" style={{ backgroundColor: '#F3F1EC' }}>
          <div className="mx-auto max-w-md flex flex-col justify-center min-h-dvh">
            <h1
              className="mb-4"
              style={{
                fontSize: '24px',
                fontWeight: 800,
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
                color: '#1A2B1F',
              }}
            >
              解析に失敗しました
            </h1>
            <p
              className="mb-8"
              style={{ fontSize: '15px', color: '#4A5550', lineHeight: 1.7 }}
            >
              ネットワークの状態を確認してください。
            </p>
            <button
              onClick={() => {
                setParseError(false)
                setStep('input')
              }}
              className="w-full transition-transform active:scale-[0.98]"
              style={{
                height: '48px',
                borderRadius: '16px',
                backgroundColor: '#1B6B4A',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              やり直す
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-dvh px-5 pb-12" style={{ backgroundColor: '#F3F1EC' }}>
        <div className="mx-auto max-w-md flex flex-col justify-center min-h-dvh">
          <h1
            className="mb-6"
            style={{
              fontSize: '24px',
              fontWeight: 800,
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: '#1A2B1F',
            }}
          >
            メモを解析しています...
          </h1>
          <div className="space-y-3">
            {[80, 60, 90].map((width, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{ height: '72px', backgroundColor: '#DDD9D2' }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${width}%`,
                    backgroundColor: '#C8C4BC',
                    animation: 'shimmer 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes shimmer {
            0% { opacity: 0.4; }
            50% { opacity: 0.8; }
            100% { opacity: 0.4; }
          }
        `}</style>
      </div>
    )
  }

  // Step 3: preview
  if (step === 'preview') {
    return (
      <div className="min-h-dvh px-5 pb-12" style={{ backgroundColor: '#F3F1EC' }}>
        <div className="mx-auto max-w-md">
          <div className="pt-10 mb-8">
            <button
              onClick={() => setStep('input')}
              className="flex items-center gap-1.5 transition-opacity active:opacity-70"
              style={{
                color: '#4A5550',
                fontSize: '15px',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ArrowLeft size={20} />
              戻る
            </button>
          </div>

          <h1
            className="mb-3"
            style={{
              fontSize: '24px',
              fontWeight: 800,
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: '#1A2B1F',
            }}
          >
            {activeEntries.length}件のメモが見つかりました
          </h1>

          {nullDateCount > 0 && (
            <p
              className="mb-4"
              style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.7, color: '#4A5550' }}
            >
              日付がないメモはタップして日付を入力してください
            </p>
          )}

          <div className="space-y-3 mb-8">
            {parsedEntries.map((entry) => {
              if (entry.excluded) return null
              const isExpanded = expandedId === entry.id
              const hasDate = !!entry.date
              return (
                <div
                  key={entry.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                    borderLeft: `3px solid ${hasDate ? '#1B6B4A' : '#D4483B'}`,
                    overflow: 'hidden',
                  }}
                >
                  <div className="p-4">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {!hasDate ? (
                          <div className="flex items-center gap-1">
                            <AlertTriangle size={14} style={{ color: '#D4483B' }} />
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#D4483B' }}>
                              日付なし
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A2B1F' }}>
                            {entry.date!.replace(/-/g, '/')}
                          </span>
                        )}

                        {/* Date input */}
                        <input
                          type="date"
                          value={entry.date || ''}
                          onChange={(e) => updateEntry(entry.id, { date: e.target.value || null })}
                          style={{
                            fontSize: '13px',
                            color: '#1B6B4A',
                            border: `1px solid ${hasDate ? '#DDD9D2' : '#D4483B'}`,
                            borderRadius: '8px',
                            padding: '2px 6px',
                            background: 'transparent',
                            cursor: 'pointer',
                            width: hasDate ? '24px' : 'auto',
                            opacity: hasDate ? 0.6 : 1,
                          }}
                        />

                        {/* Session type selector */}
                        <div className="relative">
                          <select
                            value={entry.sessionType}
                            onChange={(e) =>
                              updateEntry(entry.id, {
                                sessionType: e.target.value as ParsedEntry['sessionType'],
                              })
                            }
                            style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#4A5550',
                              backgroundColor: 'rgba(27, 107, 74, 0.08)',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '2px 20px 2px 8px',
                              appearance: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="practice">練習</option>
                            <option value="singles">シングルス</option>
                            <option value="doubles">ダブルス</option>
                          </select>
                          <ChevronDown
                            size={12}
                            style={{
                              position: 'absolute',
                              right: '6px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#4A5550',
                              pointerEvents: 'none',
                            }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => updateEntry(entry.id, { excluded: true })}
                        className="transition-opacity active:opacity-70 flex-shrink-0 ml-2"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#4A5550',
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Memo preview */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="w-full text-left"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: 400,
                          lineHeight: 1.7,
                          color: '#4A5550',
                          whiteSpace: isExpanded ? 'pre-wrap' : 'nowrap',
                          overflow: isExpanded ? 'visible' : 'hidden',
                          textOverflow: isExpanded ? 'unset' : 'ellipsis',
                        }}
                      >
                        {entry.memo}
                      </p>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={handleImport}
            className="w-full transition-transform active:scale-[0.98] mb-3"
            style={{
              height: '48px',
              borderRadius: '16px',
              backgroundColor: '#1B6B4A',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            インポートする ({activeEntries.length}件)
          </button>
          <button
            onClick={() => setStep('input')}
            className="w-full transition-transform active:scale-[0.98]"
            style={{
              height: '40px',
              backgroundColor: 'transparent',
              color: '#4A5550',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
    )
  }

  // Step 4: importing
  if (step === 'importing') {
    const total = savedSessions.length || activeEntries.length
    const doneCount = completedSet.size
    const progress = total > 0 ? (doneCount / total) * 100 : 0

    return (
      <div className="min-h-dvh px-5 pb-12" style={{ backgroundColor: '#F3F1EC' }}>
        <div className="mx-auto max-w-md">
          <div className="pt-10 mb-8">
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 800,
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
                color: '#1A2B1F',
              }}
            >
              インポート中...
            </h1>
          </div>

          <div className="space-y-2 mb-8">
            {(savedSessions.length > 0 ? savedSessions : activeEntries).map((item, i) => {
              const date = 'date' in item && typeof item.date === 'string'
                ? item.date.replace(/-/g, '/')
                : '日付なし'
              const isCompleted = completedSet.has(i)
              const isCurrent = inProgressSet.has(i)
              return (
                <div
                  key={i}
                  className="flex items-center gap-3"
                  style={{
                    padding: '10px 0',
                    fontSize: '14px',
                    color: isCompleted ? '#1B6B4A' : isCurrent ? '#1A2B1F' : '#DDD9D2',
                    fontWeight: isCurrent ? 600 : 400,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle size={18} style={{ color: '#1B6B4A', flexShrink: 0 }} />
                  ) : isCurrent ? (
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid #1B6B4A',
                        flexShrink: 0,
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid #DDD9D2',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span>{date}</span>
                  {isCurrent && (
                    <span style={{ fontSize: '13px', color: '#4A5550', fontWeight: 400 }}>
                      コーチング生成中...
                    </span>
                  )}
                  {isCompleted && (
                    <span style={{ fontSize: '13px', color: '#1B6B4A', fontWeight: 400 }}>
                      完了
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Progress */}
          <p
            className="mb-2"
            style={{ fontSize: '14px', fontWeight: 500, color: '#4A5550' }}
          >
            {doneCount} / {total} 件完了
          </p>
          <div
            style={{
              height: '6px',
              backgroundColor: '#DDD9D2',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: '#1B6B4A',
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          <button
            onClick={handleBackgroundContinue}
            className="w-full transition-transform active:scale-[0.98]"
            style={{
              height: '40px',
              backgroundColor: 'transparent',
              color: '#1B6B4A',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            バックグラウンドで続ける
          </button>
        </div>
        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  // Step 5: done
  return (
    <div className="min-h-dvh px-5 pb-12" style={{ backgroundColor: '#F3F1EC' }}>
      <div className="mx-auto max-w-md flex flex-col items-center justify-center min-h-dvh">
        <CheckCircle size={32} style={{ color: '#1B6B4A', marginBottom: '16px' }} />

        <h1
          className="mb-3 text-center"
          style={{
            fontSize: '24px',
            fontWeight: 800,
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            color: '#1A2B1F',
          }}
        >
          {savedSessions.length}件のメモを
          <br />
          インポートしました
        </h1>
        <p
          className="mb-10 text-center"
          style={{ fontSize: '15px', fontWeight: 400, lineHeight: 1.7, color: '#4A5550' }}
        >
          コーチングが生成されたセッションをタイムラインで確認できます
        </p>

        <button
          onClick={() => navigate('/timeline')}
          className="w-full transition-transform active:scale-[0.98] mb-3"
          style={{
            height: '48px',
            borderRadius: '16px',
            backgroundColor: '#1B6B4A',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          タイムラインを見る
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full transition-transform active:scale-[0.98]"
          style={{
            height: '40px',
            backgroundColor: 'transparent',
            color: '#4A5550',
            fontSize: '15px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ホームに戻る
        </button>
      </div>
    </div>
  )
}
