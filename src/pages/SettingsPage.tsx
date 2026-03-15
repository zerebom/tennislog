import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProfileStore } from '@/stores/useProfileStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { useCoachingStore } from '@/stores/useCoachingStore'
import { usePersonStore } from '@/stores/usePersonStore'

interface DiagnosisOutputApi {
  type_name: string
  summary: string
  strengths: string
  challenge: string
  first_suggestion: string
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { profile, setProfile, resetProfile } = useProfileStore()
  const { clearAll: clearSessions } = useSessionStore()
  const { clearAll: clearCoaching } = useCoachingStore()
  const { clearAll: clearPersons } = usePersonStore()

  const [nickname, setNickname] = useState(profile?.nickname ?? '')
  const [savedMessage, setSavedMessage] = useState(false)
  const [showDiagnosisDialog, setShowDiagnosisDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const hasNicknameChanged = nickname !== (profile?.nickname ?? '')

  const diagnosisResult: DiagnosisOutputApi | null = (() => {
    if (!profile?.diagnosisResult) return null
    try {
      return JSON.parse(profile.diagnosisResult) as DiagnosisOutputApi
    } catch {
      return null
    }
  })()

  const handleSaveNickname = () => {
    setProfile({ nickname })
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 1000)
  }

  const handleRestartDiagnosis = () => {
    setShowDiagnosisDialog(false)
    navigate('/onboarding?startFrom=diagnosis')
  }

  const handleDeleteAll = () => {
    clearSessions()
    clearCoaching()
    clearPersons()
    resetProfile()
    localStorage.removeItem('sessions-storage')
    localStorage.removeItem('coaching-storage')
    localStorage.removeItem('tennislog-persons')
    localStorage.removeItem('tennislog-profile')
    setShowDeleteDialog(false)
    navigate('/onboarding')
  }

  return (
    <div
      className="min-h-dvh px-5 pb-12"
      style={{ backgroundColor: '#F3F1EC' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 pt-10 mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 transition-opacity active:opacity-70"
          style={{ color: '#4A5550', fontSize: '15px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft size={20} />
          ホームへ
        </button>
      </div>

      <h1
        className="mb-11"
        style={{
          fontSize: '24px',
          fontWeight: 800,
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
          color: '#1A2B1F',
        }}
      >
        設定
      </h1>

      {/* プロフィールセクション */}
      <section className="mb-11">
        <p
          className="mb-3"
          style={{ fontSize: '14px', fontWeight: 600, color: '#4A5550' }}
        >
          プロフィール
        </p>
        <div
          className="p-5"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <label
            className="mb-1.5 block"
            style={{ fontSize: '14px', fontWeight: 500, color: '#4A5550' }}
          >
            ニックネーム
          </label>
          <div className="flex gap-2 items-center">
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例: テニス太郎"
              style={{ borderColor: '#DDD9D2' }}
            />
            <Button
              onClick={handleSaveNickname}
              disabled={!hasNicknameChanged}
              style={{
                height: '48px',
                borderRadius: '16px',
                backgroundColor: '#1B6B4A',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              保存
            </Button>
          </div>
          {savedMessage && (
            <p
              className="mt-2"
              style={{ fontSize: '13px', color: '#1B6B4A', fontWeight: 500 }}
            >
              保存しました
            </p>
          )}
        </div>
      </section>

      {/* テニスタイプ診断セクション */}
      <section className="mb-11">
        <p
          className="mb-3"
          style={{ fontSize: '14px', fontWeight: 600, color: '#4A5550' }}
        >
          テニスタイプ診断
        </p>
        <div
          className="p-5"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {diagnosisResult ? (
            <>
              <p
                className="mb-1"
                style={{ fontSize: '16px', fontWeight: 700, color: '#1B6B4A' }}
              >
                {diagnosisResult.type_name}
              </p>
              <p
                className="mb-4"
                style={{ fontSize: '14px', fontWeight: 400, color: '#4A5550', lineHeight: 1.7 }}
              >
                {diagnosisResult.summary}
              </p>
            </>
          ) : (
            <p
              className="mb-4"
              style={{ fontSize: '14px', fontWeight: 400, color: '#4A5550' }}
            >
              診断結果がありません
            </p>
          )}
          <Button
            variant="outline"
            onClick={() => setShowDiagnosisDialog(true)}
            className="w-full"
            style={{
              height: '48px',
              borderRadius: '16px',
              borderColor: '#1B6B4A',
              color: '#1B6B4A',
              fontSize: '15px',
              fontWeight: 700,
              backgroundColor: 'transparent',
            }}
          >
            診断をやり直す
          </Button>
        </div>
      </section>

      {/* データ管理セクション */}
      <section>
        <p
          className="mb-3"
          style={{ fontSize: '14px', fontWeight: 600, color: '#4A5550' }}
        >
          データ管理
        </p>
        <div
          className="p-5"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <p
            className="mb-1"
            style={{ fontSize: '16px', fontWeight: 500, color: '#1B6B4A' }}
          >
            メモをインポート
          </p>
          <p
            className="mb-4"
            style={{ fontSize: '14px', fontWeight: 400, color: '#4A5550', lineHeight: 1.7 }}
          >
            過去のテニスメモをまとめて取り込みます
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/import')}
            className="w-full mb-5"
            style={{
              height: '48px',
              borderRadius: '16px',
              borderColor: '#1B6B4A',
              color: '#1B6B4A',
              fontSize: '15px',
              fontWeight: 700,
              backgroundColor: 'transparent',
            }}
          >
            インポートする
          </Button>

          <div style={{ height: '1px', backgroundColor: '#DDD9D2', marginBottom: '20px' }} />

          <p
            className="mb-1"
            style={{ fontSize: '16px', fontWeight: 500, color: '#D4483B' }}
          >
            すべてのデータを削除
          </p>
          <p
            className="mb-4"
            style={{ fontSize: '14px', fontWeight: 400, color: '#4A5550', lineHeight: 1.7 }}
          >
            記録、コーチングデータ、プロフィールをすべて削除します。この操作は元に戻せません。
          </p>
          <button
            onClick={() => setShowDeleteDialog(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontSize: '15px',
              fontWeight: 700,
              color: '#D4483B',
            }}
          >
            データを削除する
          </button>
        </div>
      </section>

      {/* 診断やり直し確認ダイアログ */}
      {showDiagnosisDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center px-5"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 50 }}
        >
          <div
            className="w-full max-w-sm p-6"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
            }}
          >
            <h3
              className="mb-2"
              style={{ fontSize: '18px', fontWeight: 700, color: '#1A2B1F' }}
            >
              診断をやり直しますか？
            </h3>
            <p
              className="mb-6"
              style={{ fontSize: '14px', fontWeight: 400, color: '#4A5550', lineHeight: 1.7 }}
            >
              現在の診断結果は上書きされます。
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDiagnosisDialog(false)}
                className="flex-1"
                style={{
                  height: '48px',
                  borderRadius: '16px',
                  borderColor: '#DDD9D2',
                  color: '#4A5550',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleRestartDiagnosis}
                className="flex-1"
                style={{
                  height: '48px',
                  borderRadius: '16px',
                  backgroundColor: '#1B6B4A',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 700,
                }}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* データ削除確認ダイアログ */}
      {showDeleteDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center px-5"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 50 }}
        >
          <div
            className="w-full max-w-sm p-6"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
            }}
          >
            <h3
              className="mb-2"
              style={{ fontSize: '18px', fontWeight: 700, color: '#1A2B1F' }}
            >
              本当に削除しますか？
            </h3>
            <p
              className="mb-6"
              style={{ fontSize: '14px', fontWeight: 400, color: '#4A5550', lineHeight: 1.7 }}
            >
              すべての記録・コーチングデータ・プロフィールが完全に削除されます。この操作は元に戻せません。
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1"
                style={{
                  height: '48px',
                  borderRadius: '16px',
                  borderColor: '#DDD9D2',
                  color: '#4A5550',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                キャンセル
              </Button>
              <button
                onClick={handleDeleteAll}
                className="flex-1 transition-opacity active:opacity-70"
                style={{
                  height: '48px',
                  borderRadius: '16px',
                  backgroundColor: '#D4483B',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
