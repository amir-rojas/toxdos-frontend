import { z } from 'zod'

export const saleSchema = z.object({
  item_id: z.number({ error: 'Seleccioná un artículo' }).positive('Seleccioná un artículo'),
  sale_price: z.number({ error: 'El precio debe ser un número' }).positive('El precio debe ser mayor a 0'),
  payment_method: z.enum(['cash', 'transfer', 'qr']),
  buyer_customer_id: z.number().positive().optional(),
})

export type SaleFormValues = z.infer<typeof saleSchema>
