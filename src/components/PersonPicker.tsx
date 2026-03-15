import { useState } from 'react'
import { usePersonStore } from '@/stores/usePersonStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Plus } from 'lucide-react'

interface Props {
  value: string | undefined
  onChange: (personId: string | undefined) => void
  label: string
}

export function PersonPicker({ value, onChange, label }: Props) {
  const { persons, addPerson } = usePersonStore()
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [newName, setNewName] = useState('')

  const selectedPerson = persons.find((p) => p.id === value)

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}（任意）</label>
      <div className="flex flex-wrap gap-2">
        {persons.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange(value === p.id ? undefined : p.id)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              value === p.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card'
            }`}
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={() => setShowAddSheet(true)}
          className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors active:bg-accent"
        >
          <Plus className="h-3.5 w-3.5" />
          新規
        </button>
      </div>
      {selectedPerson && (
        <p className="mt-1 text-xs text-muted-foreground">
          選択中: {selectedPerson.name}
        </p>
      )}

      <Drawer open={showAddSheet} onOpenChange={setShowAddSheet}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>新しい仲間を追加</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 px-4 pb-8">
            <div>
              <label className="mb-1 block text-sm font-medium">名前</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例: 田中さん"
                autoFocus
              />
            </div>
            <Button
              onClick={() => {
                if (newName.trim()) {
                  const person = addPerson(newName.trim())
                  onChange(person.id)
                  setNewName('')
                  setShowAddSheet(false)
                }
              }}
              disabled={!newName.trim()}
              className="w-full"
            >
              追加
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
