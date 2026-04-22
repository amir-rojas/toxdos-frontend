export interface Expense {
  expense_id: number
  session_id: number
  user_id: number
  concept: string
  amount: number
  created_at: string
}

export interface CreateExpenseDto {
  concept: string
  amount: number
}

export interface ExpenseFormValues {
  concept: string
  amount: number
}
