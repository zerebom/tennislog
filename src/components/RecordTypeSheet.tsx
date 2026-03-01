import { useNavigate } from 'react-router-dom'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const recordTypes = [
  { type: 'practice', emoji: '🏋️', label: '練習・レッスン', path: '/record/practice' },
  { type: 'singles', emoji: '🎾', label: 'シングルス', path: '/record/singles' },
  { type: 'doubles', emoji: '🎾🎾', label: 'ダブルス', path: '/record/doubles' },
  { type: 'batch', emoji: '📋', label: 'まとめ記録', path: '/record/batch' },
] as const

export function RecordTypeSheet({ open, onOpenChange }: Props) {
  const navigate = useNavigate()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>今日は何をした？</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-2 px-4 pb-8">
          {recordTypes.map(({ type, emoji, label, path }) => (
            <button
              key={type}
              onClick={() => {
                onOpenChange(false)
                navigate(path)
              }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors active:bg-accent"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-base font-medium">{label}</span>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
