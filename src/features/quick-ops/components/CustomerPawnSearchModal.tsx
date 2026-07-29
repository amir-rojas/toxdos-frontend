import { useEffect, useState } from 'react'
import { Search, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCustomers } from '@/features/customers/api/useCustomers'
import { usePawnsByCustomer } from '@/features/pawns/api/usePawnsByCustomer'
import type { Customer } from '@/features/customers/types'
import type { Pawn } from '@/features/pawns/types'

interface CustomerPawnSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (pawn: Pawn) => void
}

const STATUS_LABEL: Record<Pawn['status'], string> = {
  active: 'Activo',
  renewed: 'Renovado',
  redeemed: 'Cancelado',
  forfeited: 'Perdido',
}

export function CustomerPawnSearchModal({ open, onOpenChange, onSelect }: CustomerPawnSearchModalProps) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Debounce customer search 300ms
  useEffect(() => {
    const trimmed = searchInput.trim()
    const timer = setTimeout(() => setSearch(trimmed.length >= 2 ? trimmed : ''), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: customers = [], isFetching: searchingCustomers } = useCustomers(
    selectedCustomer ? undefined : search || undefined
  )

  const { data: pawnsResult, isLoading: loadingPawns } = usePawnsByCustomer(
    selectedCustomer?.customer_id ?? Number.NaN
  )

  const eligiblePawns = (pawnsResult?.data ?? []).filter(
    (p) => p.status === 'active' || p.status === 'renewed'
  )

  // Reset on open
  useEffect(() => {
    if (open) {
      setSearchInput('')
      setSearch('')
      setSelectedCustomer(null)
    }
  }, [open])

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c)
  }

  function backToSearch() {
    setSelectedCustomer(null)
    setSearchInput('')
    setSearch('')
  }

  function confirmPawn(pawn: Pawn) {
    onSelect(pawn)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Buscar cliente</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Buscá por nombre o CI/NIT para encontrar su empeño activo.
          </DialogDescription>
        </DialogHeader>

        {!selectedCustomer && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Buscá por nombre o CI/NIT..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 bg-input/50 border-border focus-visible:ring-primary h-11"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {search && searchingCustomers && (
                <p className="text-sm text-muted-foreground text-center py-4">Buscando...</p>
              )}
              {search && !searchingCustomers && customers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin resultados para &quot;{search}&quot;
                </p>
              )}
              {!search && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Escribí al menos 2 caracteres para buscar.
                </p>
              )}
              {customers.map((c) => (
                <button
                  key={c.customer_id}
                  type="button"
                  onClick={() => selectCustomer(c)}
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm hover:bg-muted/50 border border-transparent hover:border-border transition-colors"
                >
                  <span className="font-medium text-foreground">{c.full_name}</span>
                  <span className="text-muted-foreground ml-2">({c.id_number})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedCustomer && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{selectedCustomer.full_name}</p>
                <p className="text-xs text-muted-foreground">CI: {selectedCustomer.id_number}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={backToSearch}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Cambiar
              </Button>
            </div>

            {loadingPawns && (
              <p className="text-sm text-muted-foreground text-center py-6">Buscando empeños...</p>
            )}

            {!loadingPawns && eligiblePawns.length === 0 && (
              <div className="rounded-md border border-border bg-muted/20 px-3 py-4 text-center space-y-1">
                <p className="text-sm text-foreground">
                  Este cliente no tiene empeños activos o renovados.
                </p>
                <p className="text-xs text-muted-foreground">
                  No es posible continuar con esta operación.
                </p>
              </div>
            )}

            {!loadingPawns && eligiblePawns.length > 0 && (
              <div className="space-y-2">
                {eligiblePawns.map((p) => (
                  <div
                    key={p.pawn_id}
                    className="rounded-lg border border-border px-3 py-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">#{p.pawn_id}</span>
                        <span className="inline-flex items-center rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {STATUS_LABEL[p.status]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        Bs {parseFloat(p.loan_amount).toFixed(2)} — {p.first_item_description ?? 'Sin artículo'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => confirmPawn(p)}
                      className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Confirmar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
