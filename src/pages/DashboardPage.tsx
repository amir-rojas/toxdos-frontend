import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, CreditCard, ShoppingCart, AlertTriangle, Gem, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PawnFormDialog } from '@/features/pawns/components/PawnFormDialog'
import { PaymentFormDialog } from '@/features/payments/components/PaymentFormDialog'
import { SaleFormDialog } from '@/features/sales/components/SaleFormDialog'
import { OpenSessionDialog } from '@/features/cash-sessions/components/OpenSessionDialog'
import { useDashboardSummary } from '@/features/dashboard/api/useDashboardSummary'
import { useSessionStore } from '@/shared/store/session.store'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { formatCurrency } from '@/shared/utils/format'
import type { OverduePawnRow, AvailableItemRow } from '@/features/dashboard/types'

// ── count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

// ── pulse card ────────────────────────────────────────────────────────────────

interface PulseCardProps {
  label: string
  primary: string | null
  secondary?: string | null
  primaryClassName?: string
}

function PulseCard({ label, primary, secondary, primaryClassName }: PulseCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {primary === null ? (
        <Skeleton className="h-8 w-28" />
      ) : (
        <p className={`text-2xl font-bold tabular-nums ${primaryClassName ?? 'text-foreground'}`}>{primary}</p>
      )}
      {secondary !== undefined && (
        secondary === null
          ? <Skeleton className="h-4 w-20" />
          : <p className="text-xs text-muted-foreground">{secondary}</p>
      )}
    </div>
  )
}

// ── task list ─────────────────────────────────────────────────────────────────

function OverduePawnItem({ row, onNavigate }: { row: OverduePawnRow; onNavigate: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{row.customer_name}</p>
        <p className="text-xs text-muted-foreground truncate">{row.first_item_description}</p>
        <p className="text-xs text-red-400 mt-0.5">
          Vencido {row.months_overdue} mes(es) · {formatCurrency(row.loan_amount)}
        </p>
      </div>
      <button
        type="button"
        onClick={onNavigate}
        className="shrink-0 text-xs text-primary hover:underline underline-offset-2 flex items-center gap-0.5 mt-0.5"
      >
        Ver <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  )
}

function AvailableItemCard({ item }: { item: AvailableItemRow }) {
  return (
    <div className="py-2.5 border-b border-border last:border-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground truncate">{item.description}</p>
        <p className="text-sm font-semibold text-emerald-500 shrink-0 tabular-nums">
          {formatCurrency(item.appraised_value)}
        </p>
      </div>
      {(item.brand || item.model) && (
        <p className="text-xs text-muted-foreground truncate">
          {[item.brand, item.model].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate      = useNavigate()
  const currentUser   = useCurrentUser()
  const activeSession = useSessionStore((s) => s.activeSession)
  const isAdmin       = currentUser?.role === 'admin'
  const sessionOpen   = activeSession?.status === 'open'

  // Cajero ve su sesión; admin ve todo
  const sessionIdForQuery = !isAdmin && activeSession ? activeSession.session_id : undefined
  const { data, isLoading } = useDashboardSummary(sessionIdForQuery)

  const [pawnOpen, setPawnOpen]         = useState(false)
  const [paymentOpen, setPaymentOpen]   = useState(false)
  const [saleOpen, setSaleOpen]         = useState(false)
  const [openSessionOpen, setOpenSessionOpen] = useState(false)

  // count-up animations
  const animPawns    = useCountUp(data?.today_pawns_count    ?? 0)
  const animSales    = useCountUp(data?.today_sales_count    ?? 0)
  const animOverdue  = useCountUp(data?.overdue_pawns?.length ?? 0)

  const canOperate = sessionOpen

  return (
    <div className="space-y-8">

      {/* ── Bloque 1: Estado de caja + Quick Actions ── */}
      <div className="space-y-4">

        {/* Banner estado de caja */}
        {sessionOpen ? (
          <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-emerald-500">Caja abierta</span>
              <span className="text-sm text-muted-foreground ml-2">
                Cajero: {activeSession.cashier_name} · Apertura: {formatCurrency(activeSession.opening_amount)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-sm font-medium text-amber-500">Caja cerrada</span>
            <span className="text-sm text-muted-foreground ml-1">— Abrí una caja para comenzar a operar.</span>
            <Button variant="outline" size="sm" className="ml-auto shrink-0 h-7 text-xs" onClick={() => setOpenSessionOpen(true)}>
              Abrir caja
            </Button>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            disabled={!canOperate}
            onClick={() => setPawnOpen(true)}
            className="h-16 flex-col gap-1.5 text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-40"
          >
            <PlusCircle className="h-5 w-5 text-primary" />
            Nuevo empeño
          </Button>
          <Button
            variant="outline"
            disabled={!canOperate}
            onClick={() => setPaymentOpen(true)}
            className="h-16 flex-col gap-1.5 text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-40"
          >
            <CreditCard className="h-5 w-5 text-primary" />
            Registrar pago
          </Button>
          <Button
            variant="outline"
            disabled={!canOperate}
            onClick={() => setSaleOpen(true)}
            className="h-16 flex-col gap-1.5 text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-40"
          >
            <ShoppingCart className="h-5 w-5 text-primary" />
            Nueva venta
          </Button>
        </div>
      </div>

      {/* ── Bloque 2: Pulso del día ── */}
      <div>
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground">Pulso del día</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAdmin ? 'Toda la tienda hoy.' : 'Tu sesión actual.'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PulseCard
            label="Nuevos empeños"
            primary={isLoading ? null : String(animPawns)}
            secondary={isLoading ? null : data!.today_capital_out > 0 ? `−${formatCurrency(data!.today_capital_out)} prestados` : 'Sin empeños hoy'}
            primaryClassName={data?.today_pawns_count ? 'text-foreground' : 'text-muted-foreground'}
          />
          <PulseCard
            label="Cobros recibidos"
            primary={isLoading ? null : formatCurrency(data!.today_payments_total)}
            primaryClassName={data?.today_payments_total ? 'text-emerald-500' : 'text-muted-foreground'}
          />
          <PulseCard
            label="Ventas"
            primary={isLoading ? null : String(animSales)}
            secondary={isLoading ? null : data!.today_sales_total > 0 ? `+${formatCurrency(data!.today_sales_total)}` : 'Sin ventas hoy'}
            primaryClassName={data?.today_sales_count ? 'text-foreground' : 'text-muted-foreground'}
          />
        </div>
      </div>

      {/* ── Bloque 3: Centro de tareas ── */}
      <div>
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground">Centro de tareas</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Lo que el sistema necesita que hagas hoy.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Para decomisar */}
          <div className="rounded-lg border border-red-400/20 bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-red-400/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-foreground">Para decomisar</span>
                {!isLoading && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-red-400/15 text-red-400 text-[10px] font-semibold px-1.5">
                    {animOverdue}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate('/empenos?status=overdue')}
                className="text-xs text-primary hover:underline underline-offset-2 flex items-center gap-0.5"
              >
                Ver todos <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="px-4">
              {isLoading && <Skeleton className="h-16 w-full my-3" />}
              {!isLoading && data!.overdue_pawns.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">Sin empeños vencidos. ✓</p>
              )}
              {!isLoading && data!.overdue_pawns.map((row) => (
                <OverduePawnItem
                  key={row.pawn_id}
                  row={row}
                  onNavigate={() => navigate(`/empenos?status=overdue`)}
                />
              ))}
            </div>
          </div>

          {/* En vitrina */}
          <div className="rounded-lg border border-amber-500/20 bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-amber-500/5">
              <div className="flex items-center gap-2">
                <Gem className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-foreground">Listos para venta</span>
                {!isLoading && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-semibold px-1.5">
                    {data!.available_for_sale_items.length}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate('/ventas')}
                className="text-xs text-primary hover:underline underline-offset-2 flex items-center gap-0.5"
              >
                Ir a ventas <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="px-4">
              {isLoading && <Skeleton className="h-16 w-full my-3" />}
              {!isLoading && data!.available_for_sale_items.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">Sin artículos en vitrina aún.</p>
              )}
              {!isLoading && data!.available_for_sale_items.map((item) => (
                <AvailableItemCard key={item.item_id} item={item} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Dialogs */}
      <PawnFormDialog open={pawnOpen} onOpenChange={setPawnOpen} />
      <PaymentFormDialog open={paymentOpen} onOpenChange={setPaymentOpen} />
      <SaleFormDialog open={saleOpen} onOpenChange={setSaleOpen} />
      <OpenSessionDialog open={openSessionOpen} onOpenChange={setOpenSessionOpen} />
    </div>
  )
}
