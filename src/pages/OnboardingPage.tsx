import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProfileStore } from '@/stores/useProfileStore'
import type { UserProfile } from '@/types'

type Step = 'welcome' | 'profile' | 'invite'

export function OnboardingPage() {
  const [step, setStep] = useState<Step>('welcome')
  const [nickname, setNickname] = useState('')
  const [experience, setExperience] = useState<string>('')
  const navigate = useNavigate()
  const { setProfile, completeOnboarding } = useProfileStore()

  if (step === 'welcome') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="mb-6 text-6xl">🎾</div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            試合を記録して、
            <br />
            上達を見える化しよう
          </h1>
          <ul className="mb-8 space-y-1 text-muted-foreground">
            <li>30秒で記録</li>
            <li>勝率が見える</li>
            <li>対戦相手の情報を管理</li>
          </ul>
          <Button onClick={() => setStep('profile')} size="lg" className="w-full max-w-xs">
            はじめる
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'profile') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h2 className="mb-6 text-xl font-bold">プロフィール設定</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">ニックネーム</label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="例: テニス太郎"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">テニス歴（任意）</label>
              <div className="grid grid-cols-2 gap-2">
                {(['< 1 year', '1-3 years', '3-5 years', '5+ years'] as const).map((exp) => {
                  const labels: Record<string, string> = {
                    '< 1 year': '1年未満',
                    '1-3 years': '1〜3年',
                    '3-5 years': '3〜5年',
                    '5+ years': '5年以上',
                  }
                  return (
                    <button
                      key={exp}
                      onClick={() => setExperience(exp === experience ? '' : exp)}
                      className={`rounded-lg border p-3 text-sm transition-colors ${
                        experience === exp
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card'
                      }`}
                    >
                      {labels[exp]}
                    </button>
                  )
                })}
              </div>
            </div>
            <Button
              onClick={() => {
                setProfile({
                  nickname,
                  experience: experience as UserProfile['experience'],
                  onboardingCompleted: false,
                })
                setStep('invite')
              }}
              disabled={!nickname.trim()}
              size="lg"
              className="w-full"
            >
              次へ
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // invite step
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h2 className="mb-2 text-xl font-bold">最近テニスしましたか？</h2>
        <p className="mb-8 text-muted-foreground">
          最初の記録をして、あなたのテニスログを始めましょう
        </p>
        <div className="space-y-3">
          {([
            { emoji: '🏋️', label: '練習・レッスン', path: '/record/practice' },
            { emoji: '🎾', label: 'シングルス', path: '/record/singles' },
            { emoji: '🎾🎾', label: 'ダブルス', path: '/record/doubles' },
          ] as const).map(({ emoji, label, path }) => (
            <button
              key={path}
              onClick={() => {
                completeOnboarding()
                navigate(path)
              }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors active:bg-accent"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-base font-medium">{label}</span>
            </button>
          ))}
          <Button
            variant="ghost"
            onClick={() => {
              completeOnboarding()
              navigate('/')
            }}
            size="lg"
            className="w-full"
          >
            あとで
          </Button>
        </div>
      </div>
    </div>
  )
}
