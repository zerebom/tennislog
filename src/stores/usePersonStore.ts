import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Person } from '@/types'

interface PersonState {
  persons: Person[]
  addPerson: (name: string) => Person
  updatePerson: (id: string, data: Partial<Omit<Person, 'id' | 'createdAt'>>) => void
  deletePerson: (id: string) => void
  getPerson: (id: string) => Person | undefined
  searchPersons: (query: string) => Person[]
}

export const usePersonStore = create<PersonState>()(
  persist(
    (set, get) => ({
      persons: [],

      addPerson: (name) => {
        const now = new Date().toISOString()
        const person: Person = {
          id: nanoid(),
          name,
          createdAt: now,
        }
        set((state) => ({ persons: [...state.persons, person] }))
        return person
      },

      updatePerson: (id, data) => {
        set((state) => ({
          persons: state.persons.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        }))
      },

      deletePerson: (id) => {
        set((state) => ({
          persons: state.persons.filter((p) => p.id !== id),
        }))
      },

      getPerson: (id) => get().persons.find((p) => p.id === id),

      searchPersons: (query) => {
        const q = query.toLowerCase()
        return get().persons.filter((p) => p.name.toLowerCase().includes(q))
      },
    }),
    { name: 'tennislog-persons' }
  )
)
