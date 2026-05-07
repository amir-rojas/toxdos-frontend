import { useState } from 'react'
import { Receipt, AlertTriangle, SlidersHorizontal } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useExpenses } from '@/features/expenses/api/useExpenses'
import { ExpenseFormDialog } from '@/features/expenses/components/ExpenseFormDialog'
import { useSessionStore } from '@/shared/store/session.store'
import { formatDate } from '@/shared/utils/format'
import { DateRangeFilter, type DateRange } from '@/shared/components/DateRangeFilter'
import { StatCard } from '@/shared/components/StatCard'

const EMPTY_RANGE: DateRange = { from: '', to: '' }

export function GastosPage() {
  const [dialogOpen, setDialogOpen]         = useState(false)
  const [sessionWarning, setSessionWarning] = useState(false)
  const [filtersOpen, setFiltersOpen]       = useState(false)
  const [dateRange, setDateRange]           = useState<DateRange>(EMPTY_RANGE)

  const activeSession  = useSessionStore((s) => s.activeSession)
  const hasDateFilter  = dateRange.from !== '' || dateRange.to !== ''
  const activeFilters  = hasDateFilter ? 1 : 0

  const { data: expensesResult, isLoading } = useExpenses({
    limit:    50,
    dateFrom: dateRange.from || undefined,
    dateTo:   dateRange.to   || undefined,
  })

  const expenses       = expensesResult?.data ?? []
  const totalMonto     = parseFloat(expensesResult?.stats?.total_amount ?? '0')
  const totalCount     = expensesResult?.meta?.total ?? 0
  const statLabel      = hasDateFilter ? 'En el período' : 'Total cargado'

  function handleNuevoGasto() {
    if (!activeSession) { setSessionWarning(true); return }
    setSessionWarning(false)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Gastos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Registro de gastos operativos de caja.
          </p>
        </div>
        <Button
          onClick={handleNuevoGasto}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <Receipt className="h-4 w-4 mr-2" />
          Registrar Gasto
        </Button>
      </div>

      {sessionWarning && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Debés abrir caja para registrar gastos.
        </div>
      )}

      {/* Filtros toggle — mobile only */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setFiltersOpen((o) => !o)}
        className="md:hidden gap-1.5 border-border text-muted-foreground hover:text-foreground"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtros
        {activeFilters > 0 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
            {activeFilters}
          </span>
        )}
      </Button>

      {/* Panel de filtros */}
      <div className={`space-y-3 ${filtersOpen ? 'block' : 'hidden'} md:block`}>
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          label="Fecha de gasto"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label={statLabel}         value={isLoading ? null : `Bs ${totalMonto.toFixed(2)}`} />
        <StatCard label="Cantidad de gastos" value={isLoading ? null : String(totalCount)} />
      </div>

      {/* Tabla — desktop */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Concepto</TableHead>
              <TableHead className="text-muted-foreground text-right">Monto (Bs)</TableHead>
              <TableHead className="text-muted-foreground">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i} className="border-border">
                {Array.from({ length: 3 }).map((__, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))}
            {!isLoading && expenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                  {hasDateFilter ? 'Sin gastos en el período seleccionado.' : 'No hay gastos registrados.'}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && expenses.map((expense) => (
              <TableRow key={expense.expense_id} className="border-border hover:bg-muted/30">
                <TableCell className="text-foreground text-sm font-medium">{expense.concept}</TableCell>
                <TableCell className="text-right text-foreground text-sm font-medium">
                  Bs {expense.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(expense.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {isLoading && <p className="text-center text-muted-foreground py-10">Cargando...</p>}
        {!isLoading && expenses.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            {hasDateFilter ? 'Sin gastos en el período seleccionado.' : 'No hay gastos registrados.'}
          </p>
        )}
        {!isLoading && expenses.map((expense) => (
          <div key={expense.expense_id} className="rounded-lg border border-border bg-card p-4 space-y-2">
            <p className="font-medium text-foreground">{expense.concept}</p>
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <p className="text-lg font-semibold text-foreground leading-none">
                Bs {expense.amount.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(expense.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      <ExpenseFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
