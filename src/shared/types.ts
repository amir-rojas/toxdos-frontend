export type UserRole = 'admin' | 'cashier'

export interface ApiError {
  error: string
  code?: string
}
