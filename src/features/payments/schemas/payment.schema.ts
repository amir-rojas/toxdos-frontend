import { z } from 'zod'

export const paymentSchema = z.object({
  pawn_id:          z.number({ error: 'Seleccioná un empeño' }).positive(),
  payment_type:     z.enum(['interest', 'redemption']),
  payment_method:   z.enum(['cash', 'transfer', 'qr']),
  months_paid:      z.number().int().min(1, 'Mínimo 1 bloque'),
  principal_amount: z.number().min(0),
})

export type PaymentFormValues = z.infer<typeof paymentSchema>
