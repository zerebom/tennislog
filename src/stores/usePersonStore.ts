import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Person, RelativeLevel } from '@/types'

interface PersonState {
  persons: Person[]
  addPerson: (name: string, note?: string) => Person
  updatePerson: (id: string, data: Partial<Omit<Person, 'id' | 'createdAt'>>) => void
  deletePerson: (id: string) => void
  getPerson: (id: string) => Person | undefined
  setRelativeLevel: (id: string, level: RelativeLevel) => void
  searchPersons: (query: string) => Person[]
}

export const usePersonStore = create<PersonState>()(
  persist(
    (set, get) => ({
      persons: [],

      addPerson: (name, note) => {
        const now = new Date().toISOString()
        const person: Person = {
          id: nanoid(),
          name,
          note,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ persons: [...state.persons, person] }))
        return person
      },

      updatePerson: (id, data) => {
        set((state) => ({
          persons: state.persons.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      deletePerson: (id) => {
        set((state) => ({
          persons: state.persons.filter((p) => p.id !== id),
        }))
      },

      getPerson: (id) => get().persons.find((p) => p.id === id),

      setRelativeLevel: (id, level) => {
        set((state) => ({
          persons: state.persons.map((p) =>
            p.id === id ? { ...p, relativeLevel: level, updatedAt: new Date().toISOString() } : p
          ),
        }))
      },

      searchPersons: (query) => {
        const q = query.toLowerCase()
        return get().persons.filter((p) => p.name.toLowerCase().includes(q))
      },
    }),
    { name: 'tennislog-persons' }
  )
)
