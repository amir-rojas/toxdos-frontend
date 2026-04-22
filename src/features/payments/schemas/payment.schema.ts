import { z } from 'zod'

export const paymentSchema = z.object({
  pawn_id: z.number({ error: 'Seleccioná un empeño' }).positive(),
  payment_type: z.enum(['interest', 'redemption']),  // 'partial' removido por política operativa
  payment_method: z.enum(['cash', 'transfer', 'qr']),
  interest_amount: z.number().min(0),
  custody_amount: z.number().min(0),
  principal_amount: z.number().min(0),
}).refine(
  (d) => d.interest_amount + d.custody_amount + d.principal_amount > 0,
  { message: 'El total debe ser mayor a 0', path: ['interest_amount'] }
)

export type PaymentFormValues = z.infer<typeof paymentSchema>
