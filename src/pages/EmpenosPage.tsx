import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PlusCircle, AlertTriangle, CreditCard, Gavel, Search, CalendarDays, X, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { usePawns } from '@/features/pawns/api/usePawns'
import { useForfeitPawn } from '@/features/pawns/api/useForfeitPawn'
import { PawnFormDialog } from '@/features/pawns/components/PawnFormDialog'
import { PaymentFormDialog } from '@/features/payments/components/PaymentFormDialog'
import { useSessionStore } from '@/shared/store/session.store'
import { useAuthStore } from '@/shared/store/auth.store'
import type { Pawn } from '@/features/pawns/types'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'overdue', label: 'Vencidos' },
  { value: 'active', label: 'Activo' },
  { value: 'renewed', label: 'Renovado' },
  { value: 'redeemed', label: 'Redimido' },
  { value: 'forfeited', label: 'Perdido' },
]

const STATUS_BADGE: Record<Pawn['status'], string> = {
  active: 'bg-green-500/15 text-green-400 border-green-500/30',
  renewed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  redeemed: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  forfeited: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const STATUS_LABEL: Record<Pawn['status'], string> = {
  active: 'Activo',
  renewed: 'Renovado',
  redeemed: 'Redimido',
  forfeited: 'Perdido',
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0]
}

function getThisWeekRange() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  const sunday = new Date(today)
  sunday.setDate(today.getDate() + daysUntilSunday)
  return { from: toISO(today), to: toISO(sunday) }
}

function getNextWeekRange() {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  const nextMonday = new Date(today)
  nextMonday.setDate(today.getDate() + daysUntilNextMonday)
  const nextSunday = new Date(nextMonday)
  nextSunday.setDate(nextMonday.getDate() + 6)
  return { from: toISO(nextMonday), to: toISO(nextSunday) }
}

function getThisMonthRange() {
  const today = new Date()
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return { from: toISO(today), to: toISO(lastDay) }
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}

function getDaysUntilDue(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr.split('T')[0] + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function DueBadge({ dateStr }: { dateStr: string }) {
  const days = getDaysUntilDue(dateStr)
  const date = formatDate(dateStr)

  let label: string
  let className: string

  if (days < 0) {
    label = `Vencido hace ${Math.abs(days)}d`
    className = 'text-red-400 font-medium'
  } else if (days === 0) {
    label = 'Vence hoy'
    className = 'text-red-400 font-semibold'
  } else if (days <= 3) {
    label = `${days}d restantes`
    className = 'text-orange-400 font-medium'
  } else if (days <= 7) {
    label = `${days}d restantes`
    className = 'text-yellow-400'
  } else {
    label = `${days}d restantes`
    className = 'text-muted-foreground'
  }

  return (
    <div className="text-sm">
      <span className={className}>{label}</span>
      <span className="block text-xs text-muted-foreground/60">{date}</span>
    </div>
  )
}

export function EmpenosPage() {
  const [searchParams] = useSearchParams()
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [dueDateFrom, setDueDateFrom] = useState('')
  const [dueDateTo, setDueDateTo] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 50
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sessionWarning, setSessionWarning] = useState(false)
  const [payingPawn, setPayingPawn] = useState<Pawn | null>(null)
  const [forfeitingPawn, setForfeitingPawn] = useState<Pawn | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => { setPage(1) }, [statusFilter, dueDateFrom, dueDateTo])

  const isOverdue = statusFilter === 'overdue'
  const hasDateFilter = dueDateFrom !== '' || dueDateTo !== ''

  function applyPreset(range: { from: string; to: string }) {
    setDueDateFrom(range.from)
    setDueDateTo(range.to)
  }

  function clearDateFilter() {
    setDueDateFrom('')
    setDueDateTo('')
  }

  const activeSession = useSessionStore((s) => s.activeSession)
  const userRole = useAuthStore((s) => s.user?.role)
  const { data: pawnsResult, isLoading } = usePawns(
    isOverdue ? undefined : (statusFilter || undefined),
    { page, limit: PAGE_SIZE },
    search || undefined,
    isOverdue ? true : undefined,
    dueDateFrom || undefined,
    dueDateTo || undefined
  )
  const pawns = pawnsResult?.data ?? []
  const meta = pawnsResult?.meta
  const forfeitMutation = useForfeitPawn()

  function handleNuevoEmpeno() {
    if (!activeSession) {
      setSessionWarning(true)
      return
    }
    setSessionWarning(false)
    setDialogOpen(true)
  }

  function handlePagar(pawn: Pawn) {
    if (!activeSession) {
      setSessionWarning(true)
      return
    }
    setSessionWarning(false)
    setPayingPawn(pawn)
  }

  function handleConfirmForfeit() {
    if (!forfeitingPawn) return
    forfeitMutation.mutate(forfeitingPawn.pawn_id, {
      onSuccess: () => setForfeitingPawn(null),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Empeños</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Listado de empeños. Filtrá por estado para encontrar rápidamente.
          </p>
        </div>
        <Button
          onClick={handleNuevoEmpeno}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nuevo empeño
        </Button>
      </div>

      {sessionWarning && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Debés abrir caja para realizar operaciones.
        </div>
      )}

      {/* Búsqueda + botón filtros (mobile) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o artículo..."
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
          {(statusFilter !== '' || hasDateFilter) && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
              {(statusFilter !== '' ? 1 : 0) + (hasDateFilter ? 1 : 0)}
            </span>
          )}
        </Button>
      </div>

      {/* Panel de filtros — siempre visible en desktop, colapsable en mobile */}
      <div className={`space-y-3 ${filtersOpen ? 'block' : 'hidden'} md:block`}>

      {/* Filtro estado */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
              statusFilter === opt.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filtro por rango de vencimiento */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
          <CalendarDays className="h-4 w-4" />
          Vencimiento:
        </div>

        {/* Presets */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'Esta semana', fn: getThisWeekRange },
            { label: 'Próxima semana', fn: getNextWeekRange },
            { label: 'Este mes', fn: getThisMonthRange },
          ].map(({ label, fn }) => {
            const range = fn()
            const isActive = dueDateFrom === range.from && dueDateTo === range.to
            return (
              <button
                key={label}
                onClick={() => isActive ? clearDateFilter() : applyPreset(range)}
                className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Separador visual */}
        <span className="text-border hidden sm:inline">|</span>

        {/* Inputs manuales */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="date"
              value={dueDateFrom}
              onChange={(e) => setDueDateFrom(e.target.value)}
              className="h-9 w-full sm:w-auto rounded-md border border-border bg-input/50 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-muted-foreground text-sm hidden sm:inline shrink-0">→</span>
            <input
              type="date"
              value={dueDateTo}
              onChange={(e) => setDueDateTo(e.target.value)}
              className="h-9 w-full sm:w-auto rounded-md border border-border bg-input/50 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {hasDateFilter && (
            <button
              onClick={clearDateFilter}
              className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border transition-colors w-full sm:w-auto"
            >
              <X className="h-3 w-3" />
              Limpiar fechas
            </button>
          )}
        </div>
      </div>

      </div>{/* end panel filtros */}

      {/* Tabla — desktop */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-muted-foreground">Artículo</TableHead>
              <TableHead className="text-muted-foreground">Monto (Bs)</TableHead>
              <TableHead className="text-muted-foreground">Tasas</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="text-muted-foreground">Vencimiento</TableHead>
              <TableHead className="text-muted-foreground w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && pawns.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No hay empeños registrados.
                </TableCell>
              </TableRow>
            )}
            {pawns.map((p) => (
              <TableRow key={p.pawn_id} className="border-border hover:bg-muted/30">
                <TableCell className="text-foreground text-sm">
                  <span className="font-medium">{p.customer_name}</span>
                  <span className="text-muted-foreground text-xs ml-1.5">({p.customer_id_number})</span>
                </TableCell>
                <TableCell className="text-foreground text-sm max-w-[200px]">
                  <span className="truncate block">
                    {p.first_item_description ?? <span className="text-muted-foreground italic">Sin artículo</span>}
                  </span>
                  {p.items_count > 1 && (
                    <span className="text-muted-foreground text-xs">+{p.items_count - 1} más</span>
                  )}
                </TableCell>
                <TableCell className="text-foreground text-sm font-medium">
                  {parseFloat(p.loan_amount).toFixed(2)}
                </TableCell>
                <TableCell className="text-foreground text-sm">
                  <span>{parseFloat(p.interest_rate).toFixed(2)}%</span>
                  {parseFloat(p.custody_rate) > 0 && (
                    <span className="text-muted-foreground"> / {parseFloat(p.custody_rate).toFixed(2)}%</span>
                  )}
                  <span className="block text-muted-foreground text-xs">
                    {p.interest_type === 'monthly' ? 'mens.' : 'diario'}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status]}`}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </TableCell>
                <TableCell>
                  <DueBadge dateStr={p.due_date} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {(p.status === 'active' || p.status === 'renewed') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePagar(p)}
                        className="h-7 px-2 text-xs border-border text-muted-foreground hover:text-foreground"
                      >
                        <CreditCard className="h-3.5 w-3.5 mr-1" />
                        Pagar
                      </Button>
                    )}
                    {p.status === 'active' && getDaysUntilDue(p.due_date) < 0 && userRole === 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setForfeitingPawn(p)}
                        className="h-7 px-2 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Gavel className="h-3.5 w-3.5 mr-1" />
                        Decomisar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden">
        {isLoading && (
          <p className="text-center text-muted-foreground py-10">Cargando...</p>
        )}
        {!isLoading && pawns.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No hay empeños registrados.</p>
        )}
        <div className="space-y-3">
          {pawns.map((p) => (
            <div key={p.pawn_id} className="rounded-lg border border-border bg-card p-4 space-y-3">

              {/* Nombre + estado */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{p.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{p.customer_id_number}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 ${STATUS_BADGE[p.status]}`}
                >
                  {STATUS_LABEL[p.status]}
                </span>
              </div>

              {/* Artículo */}
              <div>
                <p className="text-sm text-foreground">
                  {p.first_item_description ?? <span className="italic text-muted-foreground">Sin artículo</span>}
                </p>
                {p.items_count > 1 && (
                  <p className="text-xs text-muted-foreground">+{p.items_count - 1} más</p>
                )}
              </div>

              {/* Monto + vencimiento */}
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Monto</p>
                  <p className="text-lg font-semibold text-foreground leading-none">
                    {parseFloat(p.loan_amount).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">Bs</span>
                  </p>
                </div>
                <DueBadge dateStr={p.due_date} />
              </div>

              {/* Tasas */}
              <p className="text-xs text-muted-foreground">
                {parseFloat(p.interest_rate).toFixed(2)}% interés
                {parseFloat(p.custody_rate) > 0 && ` · ${parseFloat(p.custody_rate).toFixed(2)}% custodia`}
                {' · '}{p.interest_type === 'monthly' ? 'mensual' : 'diario'}
              </p>

              {/* Acciones */}
              {(p.status === 'active' || p.status === 'renewed') && (
                <div className="flex gap-2 pt-1 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePagar(p)}
                    className="flex-1 h-9 text-sm border-border text-muted-foreground hover:text-foreground"
                  >
                    <CreditCard className="h-4 w-4 mr-1.5" />
                    Pagar
                  </Button>
                  {p.status === 'active' && getDaysUntilDue(p.due_date) < 0 && userRole === 'admin' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setForfeitingPawn(p)}
                      className="flex-1 h-9 text-sm border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Gavel className="h-4 w-4 mr-1.5" />
                      Decomisar
                    </Button>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

      {/* Paginación */}
      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-sm text-muted-foreground">
            {meta.total} empeños · página {meta.page} de {meta.total_pages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="h-8 w-8 p-0 border-border"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Anterior</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.total_pages}
              className="h-8 w-8 p-0 border-border"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Siguiente</span>
            </Button>
          </div>
        </div>
      )}

      <PawnFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <PaymentFormDialog
        open={payingPawn !== null}
        onOpenChange={(open) => { if (!open) setPayingPawn(null) }}
        preloadedPawn={payingPawn ?? undefined}
      />

      <AlertDialog open={forfeitingPawn !== null} onOpenChange={(open) => { if (!open) setForfeitingPawn(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Decomisar este empeño?</AlertDialogTitle>
            <AlertDialogDescription>
              {forfeitingPawn && (
                <>
                  El empeño de <strong>{forfeitingPawn.customer_name}</strong> pasará a estado{' '}
                  <strong>Perdido</strong> y sus artículos quedarán{' '}
                  <strong>disponibles para la venta</strong>. Esta acción no se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={forfeitMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmForfeit}
              disabled={forfeitMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {forfeitMutation.isPending ? 'Decomisando...' : 'Sí, decomisar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
