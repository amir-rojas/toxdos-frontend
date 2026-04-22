import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  label: string
  value: string | null
  valueClassName?: string
}

export function StatCard({ label, value, valueClassName }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{label}</p>
      {value === null ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <p className={`text-xl font-semibold ${valueClassName ?? 'text-foreground'}`}>{value}</p>
      )}
    </div>
  )
}
