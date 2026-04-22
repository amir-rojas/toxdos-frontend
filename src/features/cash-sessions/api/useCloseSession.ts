import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSessionStore } from '@/shared/store/session.store'
import { closeSession } from './cashSessions.api'
import { CURRENT_SESSION_KEY } from './useCurrentSession'
import type { CloseSessionDto } from '../types'

export function useCloseSession() {
  const queryClient = useQueryClient()
  const setActiveSession = useSessionStore((s) => s.setActiveSession)

  return useMutation({
    mutationFn: ({ sessionId, dto }: { sessionId: number; dto: CloseSessionDto }) =>
      closeSession(sessionId, dto),
    onSuccess: () => {
      setActiveSession(null)
      queryClient.setQueryData(CURRENT_SESSION_KEY, null)
      void queryClient.invalidateQueries({ queryKey: ['cash-sessions'] })
    },
  })
}
