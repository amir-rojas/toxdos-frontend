import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatCurrency } from '@/shared/utils/format'
import { useReferenceDetail } from '../api/useReferenceDetail'
import type { Movement } from '../types'
import type { PawnWithItems } from '@/features/pawns/types'
import type { Payment } from '@/features/payments/types'
import type { Sale } from '@/features/sales/types'
import type { Expense } from '@/features/expenses/types'

type ReferenceType = NonNullable<Movement['reference_type']>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  referenceType: ReferenceType | null
  referenceId: number | null
}

// ── label helpers ──────────────────────────────────────────────────────────────

const MODAL_TITLE: Record<ReferenceType, string> = {
  pawn:    'Empeño',
  payment: 'Pago',
  sale:    'Venta',
  expense: 'Gasto',
}

const PAYMENT_TYPE_LABEL: Record<Payment['payment_type'], string> = {
  interest:   'Interés',
  redemption: 'Rescate',
  partial:    'Parcial',
}

const PAYMENT_METHOD_LABEL: Record<Payment['payment_method'], string> = {
  cash:     'Efectivo',
  transfer: 'Transferencia',
  qr:       'QR',
}

const PAWN_STATUS_LABEL: Record<PawnWithItems['status'], string> = {
  active:    'Activo',
  renewed:   'Renovado',
  redeemed:  'Rescatado',
  forfeited: 'Decomisado',
}

const PAWN_STATUS_COLOR: Record<PawnWithItems['status'], string> = {
  active:    'text-emerald-500',
  renewed:   'text-blue-400',
  redeemed:  'text-muted-foreground',
  forfeited: 'text-red-400',
}

// ── field row ─────────────────────────────────────────────────────────────────

function Field({ label, value, valueClassName }: { label: string; value: ReactNode; valueClassName?: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-border last:border-0">
      <span className="text-muted-foreground text-sm shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right ${valueClassName ?? ''}`}>{value}</span>
    </div>
  )
}

// ── content per type ──────────────────────────────────────────────────────────

function PawnDetail({ pawn }: { pawn: PawnWithItems }) {
  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        <Field label="Cliente" value={pawn.customer_name} />
        <Field label="CI" value={pawn.customer_id_number} />
        <Field
          label="Estado"
          value={PAWN_STATUS_LABEL[pawn.status]}
          valueClassName={PAWN_STATUS_COLOR[pawn.status]}
        />
        <Field label="Monto prestado" value={formatCurrency(parseFloat(pawn.loan_amount))} />
        <Field label="Tasa interés" value={`${parseFloat(pawn.interest_rate)}% ${pawn.interest_type === 'daily' ? 'diario' : 'mensual'}`} />
        <Field label="Inicio" value={pawn.start_date.slice(0, 10)} />
        <Field label="Vencimiento" value={pawn.due_date.slice(0, 10)} />
      </div>

      {pawn.items.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Artículos ({pawn.items.length})
          </p>
          <div className="space-y-1.5">
            {pawn.items.map((item) => (
              <div key={item.item_id} className="rounded-md border border-border bg-muted/30 px-3 py-2">
                <p className="text-sm font-medium">{item.description}</p>
                {(item.brand || item.model) && (
                  <p className="text-xs text-muted-foreground">
                    {[item.brand, item.model].filter(Boolean).join(' · ')}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  Valor tasado: {formatCurrency(parseFloat(item.appraised_value))}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PaymentDetail({ payment }: { payment: Payment }) {
  return (
    <div className="space-y-0.5">
      <Field label="Cliente" value={payment.customer_name ?? '—'} />
      <Field label="Tipo" value={PAYMENT_TYPE_LABEL[payment.payment_type]} />
      <Field label="Método" value={PAYMENT_METHOD_LABEL[payment.payment_method]} />
      <Field label="Interés" value={formatCurrency(parseFloat(payment.interest_amount))} />
      <Field label="Custodia" value={formatCurrency(parseFloat(payment.custody_amount))} />
      <Field label="Capital" value={formatCurrency(parseFloat(payment.principal_amount))} />
      <Field label="Total" value={formatCurrency(parseFloat(payment.total))} valueClassName="text-emerald-500" />
      <Field label="Fecha" value={formatDate(payment.paid_at)} />
    </div>
  )
}

function SaleDetail({ sale }: { sale: Sale }) {
  return (
    <div className="space-y-0.5">
      <Field label="Artículo" value={sale.item_description} />
      {sale.item_model && <Field label="Modelo" value={sale.item_model} />}
      <Field label="Comprador" value={sale.buyer_name ?? '—'} />
      <Field label="Método" value={PAYMENT_METHOD_LABEL[sale.payment_method]} />
      <Field label="Precio" value={formatCurrency(sale.sale_price)} valueClassName="text-emerald-500" />
      <Field label="Fecha" value={formatDate(sale.sold_at)} />
    </div>
  )
}

function ExpenseDetail({ expense }: { expense: Expense }) {
  return (
    <div className="space-y-0.5">
      <Field label="Concepto" value={expense.concept} />
      <Field label="Monto" value={formatCurrency(expense.amount)} valueClassName="text-red-400" />
      <Field label="Fecha" value={formatDate(expense.created_at)} />
    </div>
  )
}

// ── modal ─────────────────────────────────────────────────────────────────────

export function ReferenceDetailModal({ open, onOpenChange, referenceType, referenceId }: Props) {
  const { data, isLoading } = useReferenceDetail(referenceType, referenceId)

  const title = referenceType
    ? `${MODAL_TITLE[referenceType]} #${referenceId}`
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-2 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        )}

        {!isLoading && data && referenceType === 'pawn' && (
          <PawnDetail pawn={data as PawnWithItems} />
        )}
        {!isLoading && data && referenceType === 'payment' && (
          <PaymentDetail payment={data as Payment} />
        )}
        {!isLoading && data && referenceType === 'sale' && (
          <SaleDetail sale={data as Sale} />
        )}
        {!isLoading && data && referenceType === 'expense' && (
          <ExpenseDetail expense={data as Expense} />
        )}

        {!isLoading && !data && (
          <p className="text-center text-muted-foreground py-6 text-sm">
            No se encontró el registro.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
