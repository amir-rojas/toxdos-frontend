import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCustomerById } from '@/features/customers/api/useCustomers'
import { usePawnsByCustomer } from '@/features/pawns/api/usePawnsByCustomer'
import { computeCustomerStats, isPawnOverdue } from '@/features/pawns/utils/customerStats'
import { formatCurrency } from '@/shared/utils/format'
import { ReferenceDetailModal } from '@/features/movements/components/ReferenceDetailModal'
import type { Pawn } from '@/features/pawns/types'

const STATUS_BADGE: Record<Pawn['status'], string> = {
  active: 'bg-green-500/15 text-green-400 border-green-500/30',
  renewed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  redeemed: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  forfeited: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const STATUS_LABEL: Record<Pawn['status'], string> = {
  active: 'Activo',
  renewed: 'Renovado',
  redeemed: 'Cancelado',
  forfeited: 'Perdido',
}

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const customerId = Number(id)

  const { data: customer, isLoading: loadingCustomer, error: customerError } = useCustomerById(customerId)
  const { data: pawnsResult, isLoading: loadingPawns } = usePawnsByCustomer(customerId)

  const [selectedPawnId, setSelectedPawnId] = useState<number | null>(null)

  const notFound =
    !Number.isFinite(customerId) ||
    customerId <= 0 ||
    (axios.isAxiosError(customerError) && customerError.response?.status === 404)

  if (loadingCustomer) {
    return <p className="text-center text-muted-foreground py-20">Cargando...</p>
  }

  if (notFound || !customer) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center py-20">
        <p className="text-foreground text-lg font-medium">Cliente no encontrado.</p>
        <p className="text-muted-foreground text-sm max-w-xs">
          El cliente que buscás no existe o fue eliminado.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate('/clientes')}
          className="border-border"
        >
          Volver a clientes
        </Button>
      </div>
    )
  }

  const pawns = pawnsResult?.data ?? []
  const stats = computeCustomerStats(pawns)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/clientes')}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {customer.full_name}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Historial de empeños del cliente</p>
        </div>
      </div>

      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Datos del cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <dt className="text-xs text-muted-foreground">CI / NIT</dt>
              <dd className="text-sm font-medium text-foreground font-mono">{customer.id_number}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Teléfono</dt>
              <dd className="text-sm text-foreground">{customer.phone ?? '—'}</dd>
            </div>
            <div className="col-span-2 sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Dirección</dt>
              <dd className="text-sm text-foreground truncate">{customer.address ?? '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Total de empeños
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Empeños activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Total prestado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(stats.totalLoaned)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-semibold ${stats.overdueCount > 0 ? 'text-red-400' : 'text-foreground'}`}>
              {stats.overdueCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              En venta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.forSaleCount}</p>
            {stats.forSaleCount > 0 && (
              <button
                type="button"
                onClick={() => navigate('/ventas')}
                className="mt-1 text-xs text-primary hover:underline underline-offset-2 flex items-center gap-0.5"
              >
                Ver artículos en venta <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historial de empeños */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="text-muted-foreground">Monto (Bs)</TableHead>
              <TableHead className="text-muted-foreground">Interés</TableHead>
              <TableHead className="text-muted-foreground">Inicio</TableHead>
              <TableHead className="text-muted-foreground">Vencimiento</TableHead>
              <TableHead className="text-muted-foreground">Artículos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingPawns && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!loadingPawns && pawns.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  Este cliente todavía no tiene empeños registrados.
                </TableCell>
              </TableRow>
            )}
            {pawns.map((p) => {
              const overdue = isPawnOverdue(p)
              return (
                <TableRow
                  key={p.pawn_id}
                  className="border-border hover:bg-muted/30 cursor-pointer"
                  tabIndex={0}
                  role="link"
                  aria-label={`Ver detalle del empeño #${p.pawn_id}`}
                  onClick={() => setSelectedPawnId(p.pawn_id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedPawnId(p.pawn_id)
                    }
                  }}
                >
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[p.status]}`}
                    >
                      {STATUS_LABEL[p.status]}
                    </span>
                  </TableCell>
                  <TableCell className={`text-sm font-medium ${overdue ? 'text-red-400' : 'text-foreground'}`}>
                    {parseFloat(p.loan_amount).toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-sm ${overdue ? 'text-red-400' : 'text-foreground'}`}>
                    {parseFloat(p.interest_rate).toFixed(2)}%
                  </TableCell>
                  <TableCell className={`text-sm ${overdue ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {formatShortDate(p.start_date)}
                  </TableCell>
                  <TableCell className={`text-sm ${overdue ? 'text-red-400 font-medium' : 'text-muted-foreground'}`}>
                    {formatShortDate(p.due_date)}
                  </TableCell>
                  <TableCell className={`text-sm ${overdue ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {p.items_count}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ReferenceDetailModal
        open={selectedPawnId !== null}
        onOpenChange={(next) => { if (!next) setSelectedPawnId(null) }}
        referenceType="pawn"
        referenceId={selectedPawnId}
      />
    </div>
  )
}
