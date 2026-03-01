import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, BarChart3, Plus } from 'lucide-react'
import { useState } from 'react'
import { RecordTypeSheet } from '@/components/RecordTypeSheet'

const tabs = [
  { path: '/', icon: Home, label: 'ホーム' },
  { path: '/persons', icon: Users, label: '仲間' },
  { path: '/stats', icon: BarChart3, label: '統計' },
] as const

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showRecordSheet, setShowRecordSheet] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowRecordSheet(true)}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {tabs.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <RecordTypeSheet open={showRecordSheet} onOpenChange={setShowRecordSheet} />
    </div>
  )
}
