import { z } from 'zod'

export const expenseSchema = z.object({
  concept: z.string({ error: 'El concepto es requerido' }).min(1, 'El concepto es requerido').max(200, 'Máximo 200 caracteres'),
  amount: z.number({ error: 'El monto es requerido' }).positive('El monto debe ser mayor a 0'),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
