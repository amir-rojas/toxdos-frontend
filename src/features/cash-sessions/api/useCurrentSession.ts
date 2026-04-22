import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSessionStore } from '@/shared/store/session.store'
import { getCurrentSession } from './cashSessions.api'

export const CURRENT_SESSION_KEY = ['cash-sessions', 'current'] as const

export function useCurrentSession() {
  const setActiveSession = useSessionStore((s) => s.setActiveSession)

  const query = useQuery({
    queryKey: CURRENT_SESSION_KEY,
    queryFn: getCurrentSession,
    staleTime: 60_000,
  })

  useEffect(() => {
    setActiveSession(query.data ?? null)
  }, [query.data, setActiveSession])

  return query
}
