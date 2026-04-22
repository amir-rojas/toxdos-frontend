import { useState } from 'react'
import { SlidersHorizontal, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import { ReferenceDetailModal } from '@/features/movements/components/ReferenceDetailModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useMovements } from '@/features/movements/api/useMovements'
import { useUsers } from '@/features/users/api/useUsers'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { DateRangeFilter, type DateRange } from '@/shared/components/DateRangeFilter'
import { StatCard } from '@/shared/components/StatCard'
import { formatDate } from '@/shared/utils/format'
import { Button } from '@/components/ui/button'
import type { Movement, MovementCategory, MovementType } from '@/features/movements/types'

type ReferenceType = NonNullable<Movement['reference_type']>

// ── labels ────────────────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<MovementCategory, string> = {
  loan:              'Préstamo',
  interest_payment:  'Pago interés',
  custody_payment:   'Pago custodia',
  redemption:        'Rescate',
  sale:              'Venta',
  operating_expense: 'Gasto operativo',
  cash_withdrawal:   'Retiro',
  cash_deposit:      'Depósito',
}

const TYPE_OPTIONS: { value: MovementType | ''; label: string }[] = [
  { value: '',    label: 'Todos'    },
  { value: 'in',  label: 'Entradas' },
  { value: 'out', label: 'Salidas'  },
]

// ── helpers ───────────────────────────────────────────────────────────────────

function AmountCell({ movement }: { movement: Movement }) {
  const isIn   = movement.movement_type === 'in'
  const sign   = isIn ? '+' : '−'
  const color  = isIn ? 'text-emerald-500' : 'text-red-400'
  return (
    <span className={`font-semibold tabular-nums ${color}`}>
      {sign} Bs {movement.amount.toFixed(2)}
    </span>
  )
}

function TypeBadge({ type }: { type: MovementType }) {
  const isIn = type === 'in'
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border ${
      isIn
        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        : 'bg-red-400/10 text-red-400 border-red-400/20'
    }`}>
      {isIn
        ? <TrendingUp  className="h-3 w-3" />
        : <TrendingDown className="h-3 w-3" />
      }
      {isIn ? 'Entrada' : 'Salida'}
    </span>
  )
}

function CategoryBadge({ category }: { category: MovementCategory }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground">
      {CATEGORY_LABEL[category]}
    </span>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

function ReferenceLink({ movement, onClick }: { movement: Movement; onClick: (type: ReferenceType, id: number) => void }) {
  if (!movement.reference_type || !movement.reference_id) return <span>—</span>
  return (
    <button
      type="button"
      onClick={() => onClick(movement.reference_type as ReferenceType, movement.reference_id!)}
      className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:text-primary/80 hover:underline underline-offset-2 transition-colors"
    >
      {movement.reference_type} #{movement.reference_id}
      <ExternalLink className="h-3 w-3 shrink-0" />
    </button>
  )
}

export function MovimientosPage() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [dateRange, setDateRange]     = useState<DateRange>({ from: '', to: '' })
  const [typeFilter, setTypeFilter]   = useState<MovementType | ''>('')
  const [userIdFilter, setUserIdFilter] = useState<string>('')

  const [selectedRef, setSelectedRef] = useState<{ type: ReferenceType; id: number } | null>(null)
  const openRef = (type: ReferenceType, id: number) => setSelectedRef({ type, id })

  const currentUser = useCurrentUser()
  const isAdmin     = currentUser?.role === 'admin'

  const { data: usersData } = useUsers({ enabled: isAdmin })
  const users = usersData ?? []

  const hasDateFilter   = dateRange.from !== '' || dateRange.to !== ''
  const activeFilters   = (hasDateFilter ? 1 : 0) + (typeFilter !== '' ? 1 : 0) + (userIdFilter !== '' ? 1 : 0)

  const { data: result, isLoading } = useMovements({
    limit:        100,
    movementType: typeFilter    || undefined,
    dateFrom:     dateRange.from || undefined,
    dateTo:       dateRange.to   || undefined,
    userId:       userIdFilter ? Number(userIdFilter) : undefined,
  })

  const movements = result?.data ?? []

  // stats derivadas durante render — sin estado extra (vercel: rerender-derived-state-no-effect)
  const totalIn  = movements.filter((m) => m.movement_type === 'in' ).reduce((s, m) => s + m.amount, 0)
  const totalOut = movements.filter((m) => m.movement_type === 'out').reduce((s, m) => s + m.amount, 0)
  const balance  = totalIn - totalOut
  const balancePositive = balance >= 0

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Movimientos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Libro mayor de caja — todas las entradas y salidas.
          </p>
        </div>
      </div>

      {/* Toggle filtros — mobile */}
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

      {/* Panel filtros */}
      <div className={`space-y-3 ${filtersOpen ? 'block' : 'hidden'} md:block`}>

        {/* Fila superior: Tipo + Cajero */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">

          {/* Tipo */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0 w-10">Tipo</span>
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTypeFilter(opt.value as MovementType | '')}
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

          {/* Cajero — solo visible para admin */}
          {isAdmin && users.length > 0 && (
            <>
              <span className="hidden sm:block w-px h-5 bg-border shrink-0" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">Cajero</span>
                <select
                  value={userIdFilter}
                  onChange={(e) => setUserIdFilter(e.target.value)}
                  className="h-9 rounded-md border border-border bg-input/50 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Todos</option>
                  {users.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Fecha */}
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          label="Fecha"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total entradas"
          value={isLoading ? null : `Bs ${totalIn.toFixed(2)}`}
          valueClassName="text-emerald-500"
        />
        <StatCard
          label="Total salidas"
          value={isLoading ? null : `Bs ${totalOut.toFixed(2)}`}
          valueClassName="text-red-400"
        />
        <StatCard
          label="Balance neto"
          value={isLoading ? null : `${balancePositive ? '+' : '−'} Bs ${Math.abs(balance).toFixed(2)}`}
          valueClassName={balancePositive ? 'text-emerald-500' : 'text-red-400'}
        />
      </div>

      {/* Tabla — desktop */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground w-10">#</TableHead>
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground">Categoría</TableHead>
              <TableHead className="text-muted-foreground text-right">Monto</TableHead>
              <TableHead className="text-muted-foreground">Referencia</TableHead>
              <TableHead className="text-muted-foreground">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-border">
                {Array.from({ length: 6 }).map((__, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))}
            {!isLoading && movements.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  {hasDateFilter || typeFilter ? 'Sin movimientos para los filtros seleccionados.' : 'No hay movimientos registrados.'}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && movements.map((m) => (
              <TableRow
                key={m.movement_id}
                className={`border-border hover:bg-muted/30 border-l-2 ${
                  m.movement_type === 'in' ? 'border-l-emerald-500/40' : 'border-l-red-400/40'
                }`}
              >
                <TableCell className="text-muted-foreground font-mono text-xs">
                  #{m.movement_id}
                </TableCell>
                <TableCell>
                  <TypeBadge type={m.movement_type} />
                </TableCell>
                <TableCell>
                  <CategoryBadge category={m.category} />
                </TableCell>
                <TableCell className="text-right">
                  <AmountCell movement={m} />
                </TableCell>
                <TableCell>
                  <ReferenceLink movement={m} onClick={openRef} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(m.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {isLoading && <p className="text-center text-muted-foreground py-10">Cargando...</p>}
        {!isLoading && movements.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            {hasDateFilter || typeFilter ? 'Sin movimientos para los filtros seleccionados.' : 'No hay movimientos registrados.'}
          </p>
        )}
        {!isLoading && movements.map((m) => (
          <div
            key={m.movement_id}
            className={`rounded-lg border bg-card p-4 space-y-3 border-l-2 ${
              m.movement_type === 'in'
                ? 'border-border border-l-emerald-500/60'
                : 'border-border border-l-red-400/60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <TypeBadge type={m.movement_type} />
                <CategoryBadge category={m.category} />
              </div>
              <AmountCell movement={m} />
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-xs text-muted-foreground font-mono">
                <ReferenceLink movement={m} onClick={openRef} />
              </span>
              <span className="text-xs text-muted-foreground">{formatDate(m.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      <ReferenceDetailModal
        open={selectedRef !== null}
        onOpenChange={(open) => { if (!open) setSelectedRef(null) }}
        referenceType={selectedRef?.type ?? null}
        referenceId={selectedRef?.id ?? null}
      />

    </div>
  )
}
