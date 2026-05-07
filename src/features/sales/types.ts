export interface SalesStats {
  sold_today: string
  count_today: number
}

export interface Sale {
  sale_id: number
  item_id: number
  session_id: number
  buyer_customer_id: number | null
  sale_price: number                     // NUMERIC parsed to number
  payment_method: 'cash' | 'transfer' | 'qr'
  sold_at: string                        // ISO 8601
  item_description: string               // JOIN items
  item_model: string | null              // JOIN items
  buyer_name: string | null              // LEFT JOIN customers
}

export interface CreateSaleDto {
  item_id: number
  sale_price: number
  payment_method?: 'cash' | 'transfer' | 'qr'
  buyer_customer_id?: number
}

export type SaleFormValues = {
  item_id: number
  sale_price: number
  payment_method: 'cash' | 'transfer' | 'qr'
  buyer_customer_id?: number
}
