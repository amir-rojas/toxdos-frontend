import { z } from 'zod'

export const customerSchema = z.object({
  full_name: z.string().min(1, 'El nombre es requerido'),
  id_number: z.string().min(1, 'El CI/NIT es requerido'),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>
