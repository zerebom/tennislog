import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { RecordSinglesPage } from '@/pages/RecordSinglesPage'
import { RecordDoublesPage } from '@/pages/RecordDoublesPage'
import { RecordPracticePage } from '@/pages/RecordPracticePage'
import { SessionDetailPage } from '@/pages/SessionDetailPage'
import { TimelinePage } from '@/pages/TimelinePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ImportPage } from '@/pages/ImportPage'
import { useProfileStore } from '@/stores/useProfileStore'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { LoginPage } from '@/pages/LoginPage'
import { useSupabaseSync } from '@/hooks/useSupabaseSync'
import { Loader2 } from 'lucide-react'

function AppRoutes() {
  const { isOnboarded } = useProfileStore()

  if (!isOnboarded()) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/record/singles" element={<RecordSinglesPage />} />
        <Route path="/record/doubles" element={<RecordDoublesPage />} />
        <Route path="/record/practice" element={<RecordPracticePage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/sessions/:id" element={<SessionDetailPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/import" element={<ImportPage />} />
      <Route path="/record/singles" element={<RecordSinglesPage />} />
      <Route path="/record/doubles" element={<RecordDoublesPage />} />
      <Route path="/record/practice" element={<RecordPracticePage />} />
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AuthGate() {
  const { user, loading } = useAuth()
  const { syncing, synced } = useSupabaseSync()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  if (syncing && !synced) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}
