import { z } from 'zod'

export const openSessionSchema = z.object({
  opening_amount: z
    .number({ error: 'Ingresá un monto válido' })
    .positive('El monto debe ser mayor a 0'),
})

export type OpenSessionFormValues = z.infer<typeof openSessionSchema>
