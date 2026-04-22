import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSessionStore } from '@/shared/store/session.store'
import { openSession } from './cashSessions.api'
import { CURRENT_SESSION_KEY } from './useCurrentSession'
import type { OpenSessionDto } from '../types'

export function useOpenSession() {
  const queryClient = useQueryClient()
  const setActiveSession = useSessionStore((s) => s.setActiveSession)

  return useMutation({
    mutationFn: (dto: OpenSessionDto) => openSession(dto),
    onSuccess: (session) => {
      setActiveSession(session)
      queryClient.setQueryData(CURRENT_SESSION_KEY, session)
      void queryClient.invalidateQueries({ queryKey: ['cash-sessions'] })
    },
  })
}
