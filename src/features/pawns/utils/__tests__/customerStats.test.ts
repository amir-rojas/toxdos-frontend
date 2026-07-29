import { describe, it, expect } from 'vitest'
import { computeCustomerStats } from '../customerStats'
import type { Pawn } from '../../types'

function makePawn(overrides: Partial<Pawn>): Pawn {
  return {
    pawn_id: 1,
    customer_id: 1,
    customer_name: 'Test Customer',
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
    ...overrides,
  }
}

describe('computeCustomerStats', () => {
  it('returns zeros for a customer with no pawns', () => {
    expect(computeCustomerStats([])).toEqual({
      total: 0,
      activeCount: 0,
      totalLoaned: 0,
      overdueCount: 0,
      forSaleCount: 0,
    })
  })

  it('counts active and renewed pawns as active, excludes redeemed/forfeited', () => {
    const pawns = [
      makePawn({ pawn_id: 1, status: 'active', loan_amount: '100.00' }),
      makePawn({ pawn_id: 2, status: 'renewed', loan_amount: '200.50' }),
      makePawn({ pawn_id: 3, status: 'redeemed', loan_amount: '50.00' }),
      makePawn({ pawn_id: 4, status: 'forfeited', loan_amount: '75.25' }),
    ]

    const stats = computeCustomerStats(pawns)

    expect(stats.total).toBe(4)
    expect(stats.activeCount).toBe(2)
    expect(stats.totalLoaned).toBeCloseTo(425.75)
  })

  it('sums loan amounts across all pawns regardless of status', () => {
    const pawns = [
      makePawn({ pawn_id: 1, status: 'redeemed', loan_amount: '10.00' }),
      makePawn({ pawn_id: 2, status: 'forfeited', loan_amount: '20.00' }),
    ]

    expect(computeCustomerStats(pawns).totalLoaned).toBeCloseTo(30)
  })

  it('counts overdue pawns as active/renewed with a due_date in the past', () => {
    const pawns = [
      makePawn({ pawn_id: 1, status: 'active', due_date: '2020-01-01' }),
      makePawn({ pawn_id: 2, status: 'renewed', due_date: '2020-01-01' }),
      makePawn({ pawn_id: 3, status: 'active', due_date: '2999-01-01' }),
      makePawn({ pawn_id: 4, status: 'redeemed', due_date: '2020-01-01' }),
    ]

    expect(computeCustomerStats(pawns).overdueCount).toBe(2)
  })

  it('counts forfeited pawns as for-sale', () => {
    const pawns = [
      makePawn({ pawn_id: 1, status: 'forfeited' }),
      makePawn({ pawn_id: 2, status: 'forfeited' }),
      makePawn({ pawn_id: 3, status: 'active' }),
    ]

    expect(computeCustomerStats(pawns).forSaleCount).toBe(2)
  })
})
