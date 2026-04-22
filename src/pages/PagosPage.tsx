import { useState, useEffect } from 'react'
import { CreditCard, AlertTriangle, Search, SlidersHorizontal } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { usePayments } from '@/features/payments/api/usePayments'
import { usePawns } from '@/features/pawns/api/usePawns'
import { PaymentFormDialog } from '@/features/payments/components/PaymentFormDialog'
import { useSessionStore } from '@/shared/store/session.store'
import { formatDate } from '@/shared/utils/format'
import { DateRangeFilter, type DateRange } from '@/shared/components/DateRangeFilter'
import { StatCard } from '@/shared/components/StatCard'
import type { Payment } from '@/features/payments/types'

const PAYMENT_TYPE_OPTIONS: { value: Payment['payment_type']; label: string }[] = [
  { value: 'interest', label: 'Interés' },
  { value: 'partial', label: 'Parcial' },
  { value: 'redemption', label: 'Rescate' },
]

const PAYMENT_METHOD_OPTIONS: { value: Payment['payment_method']; label: string }[] = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'qr', label: 'QR' },
]

const PAYMENT_TYPE_LABEL: Record<Payment['payment_type'], string> = {
  interest: 'Interés',
  partial: 'Parcial',
  redemption: 'Rescate',
}

const PAYMENT_METHOD_LABEL: Record<Payment['payment_method'], string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  qr: 'QR',
}

function isToday(iso: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return iso.split('T')[0] === today
}

export function PagosPage() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<Payment['payment_type'] | ''>('')
  const [methodFilter, setMethodFilter] = useState<Payment['payment_method'] | ''>('')
  const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sessionWarning, setSessionWarning] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const hasDateFilter = dateRange.from !== '' || dateRange.to !== ''
  const activeFilterCount =
    (typeFilter !== '' ? 1 : 0) +
    (methodFilter !== '' ? 1 : 0) +
    (hasDateFilter ? 1 : 0)

  const activeSession = useSessionStore((s) => s.activeSession)
  const { data: paymentsResult, isLoading: loadingPayments } = usePayments(
    {
      search:        search || undefined,
      paymentType:   typeFilter || undefined,
      paymentMethod: methodFilter || undefined,
      paidFrom:      dateRange.from || undefined,
      paidTo:        dateRange.to   || undefined,
    },
    { limit: 50 }
  )
  const { data: pawnsResult } = usePawns(undefined, { limit: 50 })
  const payments = paymentsResult?.data ?? []
  const pawns = pawnsResult?.data ?? []

  const today = payments.filter((p) => isToday(p.paid_at))
  const cobradoHoy = today.reduce((sum, p) => sum + parseFloat(p.total), 0)
  const pagosHoy = today.length
  const empenosActivos = pawns.filter(
    (p) => p.status === 'active' || p.status === 'renewed'
  ).length

  function handleRegistrarPago() {
    if (!activeSession) {
      setSessionWarning(true)
      return
    }
    setSessionWarning(false)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Pagos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Historial de pagos y operaciones de caja.
          </p>
        </div>
        <Button
          onClick={handleRegistrarPago}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Registrar Pago
        </Button>
      </div>

      {sessionWarning && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Debés abrir caja para registrar pagos.
        </div>
      )}

      {/* Búsqueda + botón filtros */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-input/50 border-border focus-visible:ring-primary"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersOpen((o) => !o)}
          className="md:hidden shrink-0 gap-1.5 border-border text-muted-foreground hover:text-foreground"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Panel de filtros — siempre visible en desktop, colapsable en mobile */}
      <div className={`space-y-3 ${filtersOpen ? 'block' : 'hidden'} md:block`}>

        {/* Tipo + Método — una fila en desktop, apilados en mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">

          {/* Tipo de pago */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0 w-12">Tipo</span>
            {PAYMENT_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter((prev) => prev === opt.value ? '' : opt.value)}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  typeFilter === opt.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <span className="hidden sm:block w-px h-5 bg-border shrink-0" />

          {/* Método de pago */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0 w-12">Método</span>
            {PAYMENT_METHOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMethodFilter((prev) => prev === opt.value ? '' : opt.value)}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  methodFilter === opt.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

        </div>

        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          label="Fecha de pago"
        />

      </div>{/* end panel filtros */}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Cobrado hoy"
          value={loadingPayments ? null : `Bs ${cobradoHoy.toFixed(2)}`}
        />
        <StatCard
          label="Pagos hoy"
          value={loadingPayments ? null : String(pagosHoy)}
        />
        <StatCard
          label="Empeños activos"
          value={String(empenosActivos)}
        />
      </div>

      {/* Tabla — desktop */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">#</TableHead>
              <TableHead className="text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-muted-foreground">Empeño</TableHead>
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground text-right">Interés</TableHead>
              <TableHead className="text-muted-foreground text-right">Custodia</TableHead>
              <TableHead className="text-muted-foreground text-right">Capital</TableHead>
              <TableHead className="text-muted-foreground text-right">Total</TableHead>
              <TableHead className="text-muted-foreground">Método</TableHead>
              <TableHead className="text-muted-foreground">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingPayments && (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  {Array.from({ length: 10 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
            {!loadingPayments && payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-10">
                  No hay pagos registrados.
                </TableCell>
              </TableRow>
            )}
            {!loadingPayments && payments.map((p) => {
              const custodia = parseFloat(p.custody_amount)
              const capital = parseFloat(p.principal_amount)
              return (
                <TableRow key={p.payment_id} className="border-border hover:bg-muted/30">
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    #{p.payment_id}
                  </TableCell>
                  <TableCell className="text-foreground text-sm">
                    {p.customer_name ?? <span className="text-muted-foreground italic">—</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    #{p.pawn_id}
                  </TableCell>
                  <TableCell className="text-foreground text-sm">
                    {PAYMENT_TYPE_LABEL[p.payment_type]}
                  </TableCell>
                  <TableCell className="text-right text-foreground text-sm">
                    Bs {parseFloat(p.interest_amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {custodia > 0
                      ? <span className="text-foreground">Bs {custodia.toFixed(2)}</span>
                      : <span className="text-muted-foreground">—</span>
                    }
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {capital > 0
                      ? <span className="text-foreground">Bs {capital.toFixed(2)}</span>
                      : <span className="text-muted-foreground">—</span>
                    }
                  </TableCell>
                  <TableCell className="text-right text-foreground text-sm font-medium">
                    Bs {parseFloat(p.total).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-foreground text-sm">
                    {PAYMENT_METHOD_LABEL[p.payment_method]}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(p.paid_at)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden">
        {loadingPayments && (
          <p className="text-center text-muted-foreground py-10">Cargando...</p>
        )}
        {!loadingPayments && payments.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No hay pagos registrados.</p>
        )}
        <div className="space-y-3">
          {!loadingPayments && payments.map((p) => {
            const custodia = parseFloat(p.custody_amount)
            const capital = parseFloat(p.principal_amount)
            return (
              <div key={p.payment_id} className="rounded-lg border border-border bg-card p-4 space-y-3">

                {/* Cliente + tipo */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {p.customer_name ?? <span className="italic text-muted-foreground">Sin cliente</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Empeño #{p.pawn_id} · Pago #{p.payment_id}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground shrink-0">
                    {PAYMENT_TYPE_LABEL[p.payment_type]}
                  </span>
                </div>

                {/* Total + método */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-lg font-semibold text-foreground leading-none">
                    Bs {parseFloat(p.total).toFixed(2)}
                  </p>
                  <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground">
                    {PAYMENT_METHOD_LABEL[p.payment_method]}
                  </span>
                </div>

                {/* Desglose + fecha */}
                <div className="flex items-end justify-between gap-2 pt-1 border-t border-border">
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>Interés: Bs {parseFloat(p.interest_amount).toFixed(2)}</p>
                    {custodia > 0 && <p>Custodia: Bs {custodia.toFixed(2)}</p>}
                    {capital > 0 && <p>Capital: Bs {capital.toFixed(2)}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">{formatDate(p.paid_at)}</p>
                </div>

              </div>
            )
          })}
        </div>
      </div>

      <PaymentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

