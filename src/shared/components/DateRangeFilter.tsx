import { CalendarDays, X } from 'lucide-react'

export interface DateRange {
  from: string
  to: string
}

interface DateRangeFilterProps {
  value: DateRange
  onChange: (value: DateRange) => void
  label?: string
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0]!
}

const PRESETS = [
  {
    label: 'Hoy',
    range: (): DateRange => { const t = toISO(new Date()); return { from: t, to: t } },
  },
  {
    label: 'Esta semana',
    range: (): DateRange => {
      const today = new Date()
      const dow = today.getDay()
      const mon = new Date(today)
      mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
      return { from: toISO(mon), to: toISO(today) }
    },
  },
  {
    label: 'Este mes',
    range: (): DateRange => {
      const today = new Date()
      return { from: toISO(new Date(today.getFullYear(), today.getMonth(), 1)), to: toISO(today) }
    },
  },
]

const EMPTY: DateRange = { from: '', to: '' }

export function DateRangeFilter({ value, onChange, label = 'Fecha' }: DateRangeFilterProps) {
  const hasFilter = value.from !== '' || value.to !== ''

  function clear() { onChange(EMPTY) }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
        <CalendarDays className="h-4 w-4" />
        {label}:
      </div>

      <div className="flex gap-2 flex-wrap">
        {PRESETS.map(({ label: presetLabel, range }) => {
          const r = range()
          const isActive = value.from === r.from && value.to === r.to
          return (
            <button
              key={presetLabel}
              type="button"
              onClick={() => onChange(isActive ? EMPTY : r)}
              className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {presetLabel}
            </button>
          )
        })}
      </div>

      <span className="text-border hidden sm:inline">|</span>

      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="h-9 w-full sm:w-auto rounded-md border border-border bg-input/50 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-muted-foreground text-sm hidden sm:inline shrink-0">→</span>
          <input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="h-9 w-full sm:w-auto rounded-md border border-border bg-input/50 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {hasFilter && (
          <button
            type="button"
            onClick={clear}
            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border transition-colors w-full sm:w-auto"
          >
            <X className="h-3 w-3" />
            Limpiar fechas
          </button>
        )}
      </div>
    </div>
  )
}
