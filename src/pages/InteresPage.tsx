import { Info, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useFinancesSummary } from '@/features/finances/api/useFinancesSummary'
import { formatCurrency } from '@/shared/utils/format'

// ── helpers ───────────────────────────────────────────────────────────────────

function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex items-center ml-1.5 cursor-help">
      <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-md bg-popover border border-border px-2.5 py-1.5 text-xs text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10">
        {text}
      </span>
    </span>
  )
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xs font-semibold text-foreground uppercase tracking-widest">{title}</h2>
      <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  )
}

// ── stat cards ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string | null
  valueClassName?: string
  sublabel?: string
  sublabelClassName?: string
  tip?: string
  onClick?: () => void
}

function KpiCard({ label, value, valueClassName, sublabel, sublabelClassName, tip, onClick }: KpiCardProps) {
  const isClickable = !!onClick
  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      className={`rounded-lg border border-border bg-card p-4 space-y-1 transition-all duration-150 ${
        isClickable
          ? 'cursor-pointer hover:border-primary/40 hover:shadow-sm hover:-translate-y-0.5 group'
          : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{label}</p>
          {tip && <InfoTip text={tip} />}
        </div>
        {isClickable && (
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        )}
      </div>
      {value === null ? (
        <Skeleton className="h-8 w-28" />
      ) : (
        <p className={`text-2xl font-bold tabular-nums ${valueClassName ?? 'text-foreground'}`}>{value}</p>
      )}
      {sublabel && value !== null && (
        <p className={`text-xs ${sublabelClassName ?? 'text-muted-foreground'}`}>{sublabel}</p>
      )}
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export function InteresPage() {
  const { data, isLoading } = useFinancesSummary()
  const navigate = useNavigate()

  const loading = isLoading || !data

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Interés</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Rentabilidad del capital en la calle — en tiempo real.
        </p>
      </div>

      {/* ── Sección 1: Termómetro ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <SectionTitle
            title="Termómetro de hoy"
            subtitle="Lo que generó tu cartera mientras dormías."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard
            label="Interés acumulado hoy"
            value={loading ? null : formatCurrency(data.today_interest)}
            valueClassName="text-emerald-500"
          />
          <KpiCard
            label="Custodia acumulada hoy"
            value={loading ? null : formatCurrency(data.today_custody)}
            valueClassName="text-emerald-500"
          />
        </div>
      </div>

      {/* ── Sección 2: Proyecciones ── */}
      <div>
        <SectionTitle
          title="Proyecciones de cobro"
          subtitle="Flujo de caja estimado para los próximos 30 días."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard
            label="Estimado mensual"
            value={loading ? null : formatCurrency(data.monthly_projection)}
            valueClassName="text-emerald-500"
            tip="Proyección basada en el cumplimiento del mes completo. No descuenta rescates anticipados."
          />
          <KpiCard
            label="Capital en riesgo"
            value={loading ? null : formatCurrency(data.capital_at_risk)}
            valueClassName={!loading && data.capital_at_risk > 0 ? 'text-red-400' : 'text-foreground'}
            sublabel={
              !loading && data.overdue_pawns_count > 0
                ? `${data.overdue_pawns_count} empeño${data.overdue_pawns_count !== 1 ? 's' : ''} vencido${data.overdue_pawns_count !== 1 ? 's' : ''} — ver detalle`
                : undefined
            }
            sublabelClassName="text-red-400/70"
            tip="Empeños activos o renovados con vencimiento pasado. Candidatos a decomisar."
            onClick={
              !loading && data.capital_at_risk > 0
                ? () => navigate('/empenos?status=overdue')
                : undefined
            }
          />
        </div>
      </div>

      {/* ── Sección 3: Salud del portafolio ── */}
      <div>
        <SectionTitle
          title="Salud del portafolio"
          subtitle="Análisis histórico de rendimiento y riesgo."
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          {/* Tasa de rescate — color semáforo */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-1 transition-all duration-150">
            <div className="flex items-center">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Tasa de rescate</p>
              <InfoTip text="De los contratos cerrados (rescatados + decomisados), qué porcentaje terminó en rescate." />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className={`text-2xl font-bold tabular-nums ${
                data.redemption_rate >= 0.7
                  ? 'text-emerald-500'
                  : data.redemption_rate >= 0.5
                    ? 'text-amber-400'
                    : 'text-red-400'
              }`}>
                {(data.redemption_rate * 100).toFixed(1)}%
              </p>
            )}
          </div>

          <KpiCard
            label="Tasa promedio"
            value={loading ? null : `${data.average_interest_rate.toFixed(2)}%`}
          />
          <KpiCard
            label="Empeños activos"
            value={loading ? null : String(data.active_pawns_count)}
          />
          <KpiCard
            label="Capital en la calle"
            value={loading ? null : formatCurrency(data.total_deployed_capital)}
          />
        </div>
      </div>

    </div>
  )
}
