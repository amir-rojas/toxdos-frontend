import { useState } from 'react'
import { PawnFormDialog } from '@/features/pawns/components/PawnFormDialog'
import { PaymentFormDialog } from '@/features/payments/components/PaymentFormDialog'
import { CustomerFormDialog } from '@/features/customers/components/CustomerFormDialog'
import { CustomerPawnSearchModal } from '@/features/quick-ops/components/CustomerPawnSearchModal'
import type { Pawn } from '@/features/pawns/types'

type SearchIntent = 'interest' | 'redemption'

/**
 * Shared state + handlers for the "quick ops" flows (nuevo contrato, nuevo
 * cliente, renovación, cancelación). Consumers (sidebar panel, dashboard)
 * call the `open*` handlers to trigger a flow and mount `<QuickOpsDialogs />`
 * once in their JSX to render the underlying dialogs/modal.
 */
export function useQuickOpsActions() {
  const [pawnFormOpen, setPawnFormOpen] = useState(false)
  const [customerFormOpen, setCustomerFormOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [searchIntent, setSearchIntent] = useState<SearchIntent>('interest')
  const [selectedPawn, setSelectedPawn] = useState<Pawn | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  function openNuevoContrato() {
    setPawnFormOpen(true)
  }

  function openNuevoCliente() {
    setCustomerFormOpen(true)
  }

  function openRenovacion() {
    setSearchIntent('interest')
    setSearchModalOpen(true)
  }

  function openCancelacion() {
    setSearchIntent('redemption')
    setSearchModalOpen(true)
  }

  function handlePawnSelected(pawn: Pawn) {
    setSelectedPawn(pawn)
    setPaymentDialogOpen(true)
  }

  function handlePaymentDialogOpenChange(next: boolean) {
    setPaymentDialogOpen(next)
    if (!next) setSelectedPawn(null)
  }

  function QuickOpsDialogs() {
    return (
      <>
        <PawnFormDialog open={pawnFormOpen} onOpenChange={setPawnFormOpen} />

        <CustomerFormDialog open={customerFormOpen} onOpenChange={setCustomerFormOpen} mode="create" />

        <CustomerPawnSearchModal
          open={searchModalOpen}
          onOpenChange={setSearchModalOpen}
          onSelect={handlePawnSelected}
        />

        <PaymentFormDialog
          open={paymentDialogOpen}
          onOpenChange={handlePaymentDialogOpenChange}
          preloadedPawn={selectedPawn ?? undefined}
          defaultPaymentType={searchIntent}
        />
      </>
    )
  }

  return {
    openNuevoContrato,
    openNuevoCliente,
    openRenovacion,
    openCancelacion,
    QuickOpsDialogs,
  }
}
