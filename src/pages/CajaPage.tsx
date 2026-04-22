import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getSessions } from '@/features/cash-sessions/api/cashSessions.api'
import { formatDate } from '@/shared/utils/format'

const LIMIT = 20

export function CajaPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['cash-sessions', page],
    queryFn: () => getSessions({ page, limit: LIMIT }),
  })

  const sessions = data?.data ?? []
  const meta = data?.meta

  const start = meta ? (meta.page - 1) * meta.limit + 1 : 0
  const end   = meta ? Math.min(meta.page * meta.limit, meta.total) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Caja</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Historial de sesiones de caja. Abrí o cerrá la caja desde el botón en el encabezado.
        </p>
      </div>

      {/* Tabla — desktop */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">#</TableHead>
              <TableHead className="text-muted-foreground">Cajero</TableHead>
              <TableHead className="text-muted-foreground">Apertura</TableHead>
              <TableHead className="text-muted-foreground text-right">Monto apertura</TableHead>
              <TableHead className="text-muted-foreground text-right">Monto cierre</TableHead>
              <TableHead className="text-muted-foreground text-right">Diferencia</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
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
            {!isLoading && sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No hay sesiones registradas.
                </TableCell>
              </TableRow>
            )}
            {sessions.map((s) => (
              <TableRow key={s.session_id} className="border-border hover:bg-muted/30">
                <TableCell className="text-muted-foreground font-mono text-xs">
                  #{s.session_id}
                </TableCell>
                <TableCell className="text-foreground text-sm">{s.cashier_name}</TableCell>
                <TableCell className="text-foreground text-sm">
                  {formatDate(s.opened_at)}
                </TableCell>
                <TableCell className="text-right text-foreground text-sm font-medium">
                  Bs {s.opening_amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {s.closing_amount != null ? (
                    <span className="text-foreground font-medium">
                      Bs {s.closing_amount.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {s.difference != null ? (
                    <span className={s.difference >= 0 ? 'text-success' : 'text-destructive'}>
                      {s.difference >= 0 ? '+' : ''}Bs {s.difference.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <SessionBadge status={s.status} />
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
        {!isLoading && sessions.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No hay sesiones registradas.</p>
        )}
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.session_id} className="rounded-lg border border-border bg-card p-4 space-y-3">

              {/* Cajero + estado */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{s.cashier_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">#{s.session_id} · {formatDate(s.opened_at)}</p>
                </div>
                <SessionBadge status={s.status} />
              </div>

              {/* Montos */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm pt-1 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Apertura</p>
                  <p className="font-medium text-foreground">Bs {s.opening_amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cierre</p>
                  {s.closing_amount != null ? (
                    <p className="font-medium text-foreground">Bs {s.closing_amount.toFixed(2)}</p>
                  ) : (
                    <p className="text-muted-foreground">—</p>
                  )}
                </div>
                {s.difference != null && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Diferencia</p>
                    <p className={`font-medium ${s.difference >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {s.difference >= 0 ? '+' : ''}Bs {s.difference.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {start}–{end} de {meta.total} sesiones
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.total_pages}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function SessionBadge({ status }: { status: 'open' | 'closed' }) {
  if (status === 'open') {
    return (
      <Badge variant="outline" className="border-success/40 text-success bg-success/10 text-xs">
        Abierta
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="border-border text-muted-foreground text-xs">
      Cerrada
    </Badge>
  )
}
