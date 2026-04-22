import { z } from 'zod'

export const closeSessionSchema = z.object({
  closing_amount: z
    .number({ error: 'Ingresá un monto válido' })
    .min(0, 'El monto no puede ser negativo'),
  notes: z.string().max(500).optional(),
})

export type CloseSessionFormValues = z.infer<typeof closeSessionSchema>
