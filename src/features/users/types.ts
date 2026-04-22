export type UserRole = 'admin' | 'cashier'

export interface AppUser {
  user_id: number
  full_name: string
  role: UserRole
}
