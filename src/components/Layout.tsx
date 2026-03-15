import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, AlertCircle, Clock, Plus } from 'lucide-react'
import { useState } from 'react'
import { RecordTypeSheet } from '@/components/RecordTypeSheet'

const tabs = [
  { path: '/', icon: Home, label: 'ホーム' },
  { path: '/issues', icon: AlertCircle, label: '課題' },
  { path: '/timeline', icon: Clock, label: '記録' },
] as const

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showRecordSheet, setShowRecordSheet] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* FAB — pill型 + テキストラベル */}
      <button
        onClick={() => setShowRecordSheet(true)}
        className="fixed bottom-[76px] right-5 z-50 flex h-[52px] items-center gap-2 rounded-full px-6 bg-primary text-primary-foreground shadow-[var(--shadow-fab)] active:scale-95 transition-transform duration-100"
        style={{ transitionTimingFunction: 'var(--ease-out)' }}
      >
        <Plus className="h-5 w-5" />
        <span className="text-[15px] font-bold">記録する</span>
      </button>

      {/* Bottom Navigation — 3 tabs, 60px height */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex h-[60px] max-w-md items-center justify-around">
          {tabs.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[48px] min-w-[48px] text-[14px] transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-6 w-6" />
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
