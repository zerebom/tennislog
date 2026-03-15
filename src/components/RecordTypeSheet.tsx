import { useNavigate } from 'react-router-dom'
import { Dumbbell, CircleDot, Users } from 'lucide-react'
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
  { type: 'practice', icon: Dumbbell, label: '練習・レッスン', path: '/record/practice' },
  { type: 'singles', icon: CircleDot, label: 'シングルス', path: '/record/singles' },
  { type: 'doubles', icon: Users, label: 'ダブルス', path: '/record/doubles' },
] as const

export function RecordTypeSheet({ open, onOpenChange }: Props) {
  const navigate = useNavigate()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>今日は何をした？</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-5 pb-8">
          {recordTypes.map(({ type, icon: Icon, label, path }) => (
            <button
              key={type}
              onClick={() => {
                onOpenChange(false)
                navigate(path)
              }}
              className="flex items-center gap-4 rounded-[16px] bg-card p-5 text-left transition-colors active:bg-accent shadow-[var(--shadow-card)]"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-[16px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
