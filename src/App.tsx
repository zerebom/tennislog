import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { PersonsPage } from '@/pages/PersonsPage'
import { PersonDetailPage } from '@/pages/PersonDetailPage'
import { StatsPage } from '@/pages/StatsPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { RecordSinglesPage } from '@/pages/RecordSinglesPage'
import { RecordDoublesPage } from '@/pages/RecordDoublesPage'
import { RecordPracticePage } from '@/pages/RecordPracticePage'
import { RecordBatchPage } from '@/pages/RecordBatchPage'
import { ActivityDetailPage } from '@/pages/ActivityDetailPage'
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
        <Route path="/persons" element={<PersonsPage />} />
        <Route path="/persons/:id" element={<PersonDetailPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/activity/:id" element={<ActivityDetailPage />} />
      </Route>
      <Route path="/record/singles" element={<RecordSinglesPage />} />
      <Route path="/record/doubles" element={<RecordDoublesPage />} />
      <Route path="/record/practice" element={<RecordPracticePage />} />
      <Route path="/record/batch" element={<RecordBatchPage />} />
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
