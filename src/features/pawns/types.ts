export interface Pawn {
  pawn_id: number
  customer_id: number
  customer_name: string        // JOIN customers.full_name
  customer_id_number: string   // JOIN customers.id_number
  user_id: number
  loan_amount: string        // NUMERIC — parseFloat antes de mostrar
  interest_rate: string      // NUMERIC — parseFloat
  custody_rate: string       // NUMERIC — parseFloat
  interest_type: 'daily' | 'monthly'
  start_date: string         // YYYY-MM-DD
  due_date: string           // YYYY-MM-DD
  status: 'active' | 'renewed' | 'redeemed' | 'forfeited'
  first_item_description: string | null
  items_count: number
  created_at: string
  updated_at: string
}

export interface PawnWithItems extends Pawn {
  items: Item[]
}

export interface Item {
  item_id: number
  pawn_id: number
  category_id: number | null
  description: string
  brand: string | null
  model: string | null
  serial_number: string | null
  appraised_value: string    // NUMERIC — parseFloat
  status: 'pawned' | 'redeemed' | 'available_for_sale' | 'sold'
  photo_url: string | null
  created_at: string
  updated_at: string
}

export interface CreatePawnDto {
  customer_id: number
  loan_amount: number        // > 0
  interest_rate: number      // > 0
  custody_rate?: number      // >= 0, omitido si 0
  interest_type: 'daily' | 'monthly'
  start_date: string         // YYYY-MM-DD
  due_date: string           // YYYY-MM-DD
  items: CreateItemDto[]     // min 1
}

export interface CreateItemDto {
  description: string
  appraised_value: number    // > 0
  category_id?: number
  brand?: string
  model?: string
}
