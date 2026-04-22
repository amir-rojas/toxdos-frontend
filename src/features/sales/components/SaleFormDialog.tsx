import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { toast } from 'sonner'
import { Banknote, QrCode, ArrowLeftRight, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useItems } from '@/features/items/api/useItems'
import { useCustomers } from '@/features/customers/api/useCustomers'
import { useCreateSale } from '../api/useCreateSale'
import { saleSchema, type SaleFormValues } from '../schemas/sale.schema'
import type { CreateSaleDto } from '../types'
import type { Item } from '@/features/items/types'
import type { Customer } from '@/features/customers/types'

interface SaleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PAYMENT_METHODS = [
  { value: 'cash' as const, label: 'Efectivo', icon: Banknote },
  { value: 'qr' as const, label: 'QR', icon: QrCode },
  { value: 'transfer' as const, label: 'Transferencia', icon: ArrowLeftRight },
]

function ItemContextCard({ item }: { item: Item }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 space-y-0.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">
          {item.description}
        </span>
        <span className="text-sm font-medium text-primary">
          Bs {item.appraised_value.toFixed(2)}
        </span>
      </div>
      {(item.brand || item.model) && (
        <p className="text-xs text-muted-foreground">
          {[item.brand, item.model].filter(Boolean).join(' — ')}
        </p>
      )}
    </div>
  )
}

export function SaleFormDialog({ open, onOpenChange }: SaleFormDialogProps) {
  const createMutation = useCreateSale()

  // Item combobox state
  const [itemInput, setItemInput] = useState('')
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  // Customer combobox state
  const [customerInput, setCustomerInput] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const suppressNextFocus = useRef(false)

  // Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Data
  const { data: itemsResult } = useItems({ status: 'available_for_sale' })
  const items = itemsResult?.data ?? []

  // Debounce customer search 300ms
  useEffect(() => {
    const trimmed = customerInput.trim()
    const timer = setTimeout(() => setCustomerSearch(trimmed.length >= 2 ? trimmed : ''), 300)
    return () => clearTimeout(timer)
  }, [customerInput])

  const { data: customers = [] } = useCustomers(customerSearch || undefined)

  // Client-side filter for items
  const filteredItems = itemInput.trim()
    ? items.filter((item) => {
        const q = itemInput.trim().toLowerCase()
        return (
          item.description.toLowerCase().includes(q) ||
          (item.brand?.toLowerCase().includes(q) ?? false) ||
          (item.model?.toLowerCase().includes(q) ?? false)
        )
      })
    : items

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      item_id: undefined as unknown as number,
      sale_price: 0,
      payment_method: 'cash',
      buyer_customer_id: undefined,
    },
  })

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedItem(null)
      setSelectedCustomer(null)
      setItemInput('')
      setCustomerInput('')
      setCustomerSearch('')
      setShowItemDropdown(false)
      setShowCustomerDropdown(false)
      setErrorMessage(null)
      reset({
        item_id: undefined as unknown as number,
        sale_price: 0,
        payment_method: 'cash',
        buyer_customer_id: undefined,
      })
    }
  }, [open, reset])

  function selectItem(item: Item) {
    setSelectedItem(item)
    setItemInput('')
    setShowItemDropdown(false)
    setValue('item_id', item.item_id, { shouldValidate: true })
    setValue('sale_price', item.appraised_value)
  }

  function clearItem() {
    setSelectedItem(null)
    setItemInput('')
    setValue('item_id', undefined as unknown as number)
    setValue('sale_price', 0)
  }

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c)
    setCustomerInput(c.full_name)
    setShowCustomerDropdown(false)
  }

  function clearCustomer() {
    setSelectedCustomer(null)
    setCustomerInput('')
    setCustomerSearch('')
  }

  function onSubmit(values: SaleFormValues) {
    const dto: CreateSaleDto = {
      item_id: values.item_id,
      sale_price: values.sale_price,
      payment_method: values.payment_method,
      buyer_customer_id: selectedCustomer?.customer_id,
    }
    setErrorMessage(null)
    createMutation.mutate(dto, {
      onSuccess: () => {
        toast.success('Venta registrada')
        onOpenChange(false)
      },
      onError: (error) => {
        setErrorMessage(resolveErrorMessage(error))
      },
    })
  }

  function handleOpenChange(next: boolean) {
    if (!createMutation.isPending) {
      onOpenChange(next)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nueva Venta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-1">
          {/* Artículo */}
          <div className="space-y-2">
            <Label className="text-foreground/80 text-xs font-semibold uppercase tracking-wide">
              Artículo
            </Label>
            {!selectedItem && (
              <div className="relative">
                <Input
                  placeholder="Buscá por descripción, marca o modelo..."
                  value={itemInput}
                  onChange={(e) => {
                    setItemInput(e.target.value)
                    setShowItemDropdown(true)
                  }}
                  onFocus={() => setShowItemDropdown(true)}
                  onBlur={() => setTimeout(() => setShowItemDropdown(false), 150)}
                  className="bg-input/50 border-border focus-visible:ring-primary h-10"
                />
                {showItemDropdown && (
                  <div className="absolute z-50 w-full top-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-52 overflow-y-auto">
                    {filteredItems.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {items.length === 0 ? 'No hay artículos disponibles' : 'Sin resultados'}
                      </div>
                    )}
                    {filteredItems.map((item) => (
                      <button
                        key={item.item_id}
                        type="button"
                        onMouseDown={() => selectItem(item)}
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted/50 border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">{item.description}</span>
                          <span className="text-xs text-primary shrink-0">
                            Bs {item.appraised_value.toFixed(2)}
                          </span>
                        </div>
                        {(item.brand || item.model) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {[item.brand, item.model].filter(Boolean).join(' — ')}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {selectedItem && (
              <div className="space-y-1">
                <ItemContextCard item={selectedItem} />
                <button
                  type="button"
                  onClick={clearItem}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                  Cambiar artículo
                </button>
              </div>
            )}
            {errors.item_id && (
              <p className="text-destructive text-xs">{errors.item_id.message}</p>
            )}
          </div>

          {/* Precio de venta */}
          <div className="space-y-1.5">
            <Label className="text-foreground/80">Precio de venta (Bs)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="bg-input/50 border-border focus-visible:ring-primary h-10"
              {...register('sale_price', { valueAsNumber: true })}
            />
            {errors.sale_price && (
              <p className="text-destructive text-xs">{errors.sale_price.message}</p>
            )}
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <Label className="text-foreground/80 text-xs font-semibold uppercase tracking-wide">
              Método de pago
            </Label>
            <Controller
              control={control}
              name="payment_method"
              render={({ field }) => (
                <div className="flex gap-2">
                  {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm border transition-colors ${
                        field.value === value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Comprador (opcional) */}
          <div className="space-y-2">
            <Label className="text-foreground/80 text-xs font-semibold uppercase tracking-wide">
              Comprador <span className="text-muted-foreground normal-case font-normal">(opcional)</span>
            </Label>
            {!selectedCustomer ? (
              <div className="relative">
                <Input
                  placeholder="Buscá por nombre o CI/NIT..."
                  value={customerInput}
                  onChange={(e) => {
                    setCustomerInput(e.target.value)
                    setShowCustomerDropdown(true)
                  }}
                  onFocus={() => {
                    if (suppressNextFocus.current) {
                      suppressNextFocus.current = false
                      return
                    }
                    setShowCustomerDropdown(true)
                  }}
                  onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 150)}
                  className="bg-input/50 border-border focus-visible:ring-primary h-10"
                />
                {showCustomerDropdown && customerSearch && (
                  <div className="absolute z-50 w-full top-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {customers.map((c) => (
                      <button
                        key={c.customer_id}
                        type="button"
                        onMouseDown={() => selectCustomer(c)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 text-foreground"
                      >
                        <span className="font-medium">{c.full_name}</span>
                        <span className="text-muted-foreground ml-2">({c.id_number})</span>
                      </button>
                    ))}
                    {customers.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Sin resultados para "{customerSearch}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
                <div>
                  <span className="text-sm font-medium text-foreground">{selectedCustomer.full_name}</span>
                  <span className="text-xs text-muted-foreground ml-2">({selectedCustomer.id_number})</span>
                </div>
                <button
                  type="button"
                  onClick={clearCustomer}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Si no seleccionás comprador, se registra como "Cliente casual".
            </p>
          </div>

          {errorMessage && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
              <p className="text-destructive text-sm">{errorMessage}</p>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createMutation.isPending}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {createMutation.isPending ? 'Guardando...' : 'Registrar venta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function resolveErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (axios.isAxiosError(error)) {
    const code = error.response?.data?.code as string | undefined
    if (code === 'NO_OPEN_SESSION')   return 'Abrí una sesión de caja antes de registrar una venta.'
    if (code === 'ITEM_NOT_FOUND')    return 'El artículo no existe o fue eliminado.'
    if (code === 'ITEM_NOT_FOR_SALE') return 'El artículo no está disponible para la venta.'
    if (code === 'VALIDATION_ERROR')  return error.response?.data?.error ?? 'Datos inválidos.'
    if ((error.response?.status ?? 0) >= 500) return 'Error del servidor. Intentá de nuevo.'
  }
  return 'Error inesperado. Intentá de nuevo.'
}
