export type UserRole = 'admin' | 'cashier'

export interface AppUser {
  user_id: number
  full_name: string
  email: string
  role: UserRole
  is_active: boolean
}

export interface CreateUserPayload {
  full_name: string
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserPayload {
  full_name?: string
  email?: string
  role?: UserRole
}

export interface ChangePasswordPayload {
  new_password: string
}
