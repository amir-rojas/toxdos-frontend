import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaymentFormDialog } from '../PaymentFormDialog'
import type { Pawn } from '@/features/pawns/types'

vi.mock('@/features/pawns/api/usePawns', () => ({
  usePawns: () => ({ data: { data: [], meta: { total: 0, page: 1, limit: 50, total_pages: 0 } } }),
}))

vi.mock('@/features/pawns/api/usePawnDebt', () => ({
  usePawnDebt: () => ({
    data: { loan_amount: 100, interest_per_block: 10, custody_per_block: 0, blocks_due: 1 },
    isLoading: false,
  }),
}))

vi.mock('../../api/useCreatePayment', () => ({
  useCreatePayment: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}))

const preloadedPawn: Pawn = {
  pawn_id: 1,
  customer_id: 1,
  customer_name: 'Juan Pérez',
  customer_id_number: '1234567',
  user_id: 1,
  loan_amount: '100.00',
  interest_rate: '10.00',
  custody_rate: '0',
  interest_type: 'monthly',
  start_date: '2026-01-01',
  due_date: '2026-02-01',
  status: 'active',
  first_item_description: null,
  items_count: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

describe('PaymentFormDialog — defaultPaymentType reset behavior', () => {
  it('defaults to interest payment type when defaultPaymentType is not provided', () => {
    render(<PaymentFormDialog open onOpenChange={() => {}} preloadedPawn={preloadedPawn} />)

    expect(screen.queryByText(/CANCELADO/i)).not.toBeInTheDocument()
  })

  it('resets to redemption payment type when defaultPaymentType="redemption" and the dialog opens', () => {
    render(
      <PaymentFormDialog
        open
        onOpenChange={() => {}}
        preloadedPawn={preloadedPawn}
        defaultPaymentType="redemption"
      />
    )

    expect(screen.getByText(/CANCELADO/i)).toBeInTheDocument()
  })

  it('re-applies defaultPaymentType on every open, not only on initial mount', () => {
    const { rerender } = render(
      <PaymentFormDialog
        open={false}
        onOpenChange={() => {}}
        preloadedPawn={preloadedPawn}
        defaultPaymentType="redemption"
      />
    )

    // Reopen with a different preset — the open-reset effect must re-run and pick up the new default
    rerender(
      <PaymentFormDialog
        open
        onOpenChange={() => {}}
        preloadedPawn={preloadedPawn}
        defaultPaymentType="interest"
      />
    )

    expect(screen.queryByText(/CANCELADO/i)).not.toBeInTheDocument()
  })
})
