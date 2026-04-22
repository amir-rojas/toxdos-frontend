import { create } from 'zustand'
import type { CashSession } from '@/features/cash-sessions/types'

interface SessionState {
  activeSession: CashSession | null
  setActiveSession: (session: CashSession | null) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),
}))
