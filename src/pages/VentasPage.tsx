import { useState } from 'react'
import { ShoppingBag, AlertTriangle } from 'lucide-react'
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
import { useSales } from '@/features/sales/api/useSales'
import { SaleFormDialog } from '@/features/sales/components/SaleFormDialog'
import { useSessionStore } from '@/shared/store/session.store'
import { formatDate } from '@/shared/utils/format'
import { StatCard } from '@/shared/components/StatCard'
import type { Sale } from '@/features/sales/types'

const PAYMENT_METHOD_LABEL: Record<Sale['payment_method'], string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  qr: 'QR',
}

function isToday(iso: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return iso.split('T')[0] === today
}

export function VentasPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sessionWarning, setSessionWarning] = useState(false)

  const activeSession = useSessionStore((s) => s.activeSession)
  const { data: salesResult, isLoading: loadingSales } = useSales({ limit: 50 })

  const sales = salesResult?.data ?? []

  const todaySales = sales.filter((s) => isToday(s.sold_at))
  const totalVendidoHoy = todaySales.reduce((sum, s) => sum + s.sale_price, 0)
  const ventasHoy = todaySales.length
  const totalVentas = sales.length

  function handleNuevaVenta() {
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
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Registro de ventas de artículos disponibles.
          </p>
        </div>
        <Button
          onClick={handleNuevaVenta}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Nueva venta
        </Button>
      </div>

      {sessionWarning && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Debés abrir caja para registrar ventas.
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Vendido hoy"
          value={loadingSales ? null : `Bs ${totalVendidoHoy.toFixed(2)}`}
        />
        <StatCard
          label="Ventas hoy"
          value={loadingSales ? null : String(ventasHoy)}
        />
        <StatCard
          label="Total ventas"
          value={loadingSales ? null : String(totalVentas)}
        />
      </div>

      {/* Tabla — desktop */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Artículo</TableHead>
              <TableHead className="text-muted-foreground">Comprador</TableHead>
              <TableHead className="text-muted-foreground text-right">Precio (Bs)</TableHead>
              <TableHead className="text-muted-foreground">Método</TableHead>
              <TableHead className="text-muted-foreground">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingSales && (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
            {!loadingSales && sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No hay ventas registradas.
                </TableCell>
              </TableRow>
            )}
            {!loadingSales && sales.map((sale) => (
              <TableRow key={sale.sale_id} className="border-border hover:bg-muted/30">
                <TableCell className="text-foreground text-sm">
                  <div>
                    <span className="font-medium">{sale.item_description}</span>
                    {sale.item_model && (
                      <p className="text-xs text-muted-foreground mt-0.5">{sale.item_model}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {sale.buyer_name
                    ? <span className="text-foreground">{sale.buyer_name}</span>
                    : <span className="text-muted-foreground italic">Cliente casual</span>
                  }
                </TableCell>
                <TableCell className="text-right text-foreground text-sm font-medium">
                  Bs {sale.sale_price.toFixed(2)}
                </TableCell>
                <TableCell>
                  <PaymentMethodBadge method={sale.payment_method} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(sale.sold_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden">
        {loadingSales && (
          <p className="text-center text-muted-foreground py-10">Cargando...</p>
        )}
        {!loadingSales && sales.length === 0 && (
          <p className="text-center text-muted-foreground py-10">No hay ventas registradas.</p>
        )}
        <div className="space-y-3">
          {!loadingSales && sales.map((sale) => (
            <div key={sale.sale_id} className="rounded-lg border border-border bg-card p-4 space-y-3">

              {/* Artículo */}
              <div>
                <p className="font-medium text-foreground">{sale.item_description}</p>
                {sale.item_model && (
                  <p className="text-xs text-muted-foreground mt-0.5">{sale.item_model}</p>
                )}
              </div>

              {/* Comprador + método */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm truncate">
                  {sale.buyer_name
                    ? <span className="text-foreground">{sale.buyer_name}</span>
                    : <span className="text-muted-foreground italic">Cliente casual</span>
                  }
                </p>
                <PaymentMethodBadge method={sale.payment_method} />
              </div>

              {/* Precio + fecha */}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <p className="text-lg font-semibold text-foreground leading-none">
                  Bs {sale.sale_price.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(sale.sold_at)}</p>
              </div>

            </div>
          ))}
        </div>
      </div>

      <SaleFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}


function PaymentMethodBadge({ method }: { method: Sale['payment_method'] }) {
  const label = PAYMENT_METHOD_LABEL[method]
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground">
      {label}
    </span>
  )
}
