import { createContext, useContext, type ReactNode } from 'react'

interface AuthContextValue {
  user: { id: string } | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: false })

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Stub: always authenticated, no loading
  const value: AuthContextValue = { user: { id: 'local' }, loading: false }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
