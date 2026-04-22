import { z } from 'zod'

export const itemSchema = z.object({
  description: z.string().min(1, 'La descripción es requerida'),
  appraised_value: z.number({ error: 'Ingresá el valor tasado' }).positive('Debe ser mayor a 0'),
  category_id: z.number().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
})

export const pawnSchema = z
  .object({
    customer_id: z.number({ error: 'Seleccioná un cliente de la lista' }).positive(),
    loan_amount: z.number({ error: 'Ingresá el monto del préstamo' }).positive('Debe ser mayor a 0'),
    interest_rate: z.number({ error: 'Ingresá la tasa de interés' }).positive('Debe ser mayor a 0'),
    custody_rate: z.number().min(0).optional().catch(undefined),
    interest_type: z.enum(['daily', 'monthly']),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
    items: z.array(itemSchema).min(1, 'Al menos un artículo es requerido'),
  })
  .superRefine((data, ctx) => {
    const totalAppraised = data.items.reduce(
      (sum, item) => sum + (item.appraised_value || 0),
      0,
    )
    if (data.loan_amount > totalAppraised) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El préstamo no puede superar el valor tasado total (${totalAppraised.toFixed(2)} Bs)`,
        path: ['loan_amount'],
      })
    }
  })

export type PawnFormValues = z.infer<typeof pawnSchema>
