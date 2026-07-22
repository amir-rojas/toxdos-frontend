import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser, updateUser, deactivateUser, changePassword } from './users.api'
import type { CreateUserPayload, UpdateUserPayload, ChangePasswordPayload } from '../types'

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateUserPayload) => createUser(dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }) },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateUserPayload }) => updateUser(id, dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }) },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deactivateUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }) },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ChangePasswordPayload }) => changePassword(id, dto),
  })
}
