import type { UserRole } from '@/shared/types'

export interface LoginDto {
  email: string
  password: string
}

export interface AuthUser {
  user_id: number
  full_name: string
  email: string
  role: UserRole
}

export interface LoginResponse {
  token: string
  user: AuthUser
}
