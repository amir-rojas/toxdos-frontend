import { useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Printer } from 'lucide-react'
import { useCreatePawn } from '../api/useCreatePawn'
import { printPawnContract } from '../api/pawns.api'
import { useCategories } from '@/features/categories/api/useCategories'
import { useCustomers } from '@/features/customers/api/useCustomers'
import { CustomerFormDialog } from '@/features/customers/components/CustomerFormDialog'
import { pawnSchema, type PawnFormValues } from '../schemas/pawn.schema'
import type { Customer } from '@/features/customers/types'

interface PawnFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const today = () => new Date().toISOString().split('T')[0]
const addDays = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function PawnFormDialog({ open, onOpenChange }: PawnFormDialogProps) {
  const createMutation = useCreatePawn()
  const [createdPawnId, setCreatedPawnId] = useState<number | null>(null)
  const [printing, setPrinting] = useState(false)
  const { data: categories = [] } = useCategories()

  // Customer combobox state
  const [customerInput, setCustomerInput] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false)
  const suppressNextFocus = useRef(false)

  // Debounce customer search 300ms
  useEffect(() => {
    const trimmed = customerInput.trim()
    const timer = setTimeout(() => setCustomerSearch(trimmed.length >= 2 ? trimmed : ''), 300)
    return () => clearTimeout(timer)
  }, [customerInput])

  const { data: customers = [] } = useCustomers(customerSearch || undefined)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PawnFormValues>({
    resolver: zodResolver(pawnSchema),
    defaultValues: {
      customer_id: undefined,
      loan_amount: undefined,
      interest_rate: undefined,
      custody_rate: undefined,
      interest_type: 'monthly',
      start_date: today(),
      due_date: addDays(30),
      items: [{ description: '', appraised_value: undefined as unknown as number }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  // Reset on open
  useEffect(() => {
    if (open) {
      reset({
        customer_id: undefined,
        loan_amount: undefined,
        interest_rate: undefined,
        custody_rate: undefined,
        interest_type: 'monthly',
        start_date: today(),
        due_date: addDays(30),
        items: [{ description: '', appraised_value: undefined as unknown as number }],
      })
      setCustomerInput('')
      setCustomerSearch('')
      setSelectedCustomer(null)
      setShowDropdown(false)
      setCreatedPawnId(null)
      setPrinting(false)
    }
  }, [open, reset])

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c)
    setCustomerInput(c.full_name)
    setValue('customer_id', c.customer_id, { shouldValidate: true })
    setShowDropdown(false)
  }

  function handleCustomerCreated(c: Customer) {
    selectCustomer(c)
  }

  async function handlePrint() {
    if (!createdPawnId) return
    setPrinting(true)
    try {
      await printPawnContract(createdPawnId)
    } finally {
      setPrinting(false)
    }
    onOpenChange(false)
  }

  function onSubmit(values: PawnFormValues) {
    const dto = {
      ...values,
      custody_rate: values.custody_rate && values.custody_rate > 0 ? values.custody_rate : undefined,
    }
    createMutation.mutate(dto, {
      onSuccess: (pawn) => {
        setCreatedPawnId(pawn.pawn_id)
      },
    })
  }

  function handleOpenChange(next: boolean) {
    if (!createMutation.isPending) {
      onOpenChange(next)
    }
  }

  const errorMessage = resolveErrorMessage(createMutation.error)

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nuevo empeño</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Completá los datos del empeño y los artículos a recibir.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-1">
          {/* Cliente combobox */}
          <div className="space-y-1.5 relative">
            <Label className="text-foreground/80">Cliente</Label>
            <Input
              placeholder="Buscá por nombre o CI/NIT..."
              value={customerInput}
              onChange={(e) => {
                setCustomerInput(e.target.value)
                setSelectedCustomer(null)
                setValue('customer_id', undefined as unknown as number)
                setShowDropdown(true)
              }}
              onFocus={() => {
                if (suppressNextFocus.current) {
                  suppressNextFocus.current = false
                  return
                }
                setShowDropdown(true)
              }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              className="bg-input/50 border-border focus-visible:ring-primary h-11"
            />
            {showDropdown && customerSearch && (
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
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sin resultados para "{customerSearch}"</span>
                    <button
                      type="button"
                      onMouseDown={() => {
                        suppressNextFocus.current = true
                        setShowDropdown(false)
                        setCreateCustomerOpen(true)
                      }}
                      className="ml-3 shrink-0 text-sm text-primary hover:underline font-medium"
                    >
                      + Crear nuevo cliente
                    </button>
                  </div>
                )}
              </div>
            )}
            {errors.customer_id && (
              <p className="text-destructive text-xs">{errors.customer_id.message}</p>
            )}
            {selectedCustomer && (
              <p className="text-xs text-muted-foreground">
                CI: {selectedCustomer.id_number}
              </p>
            )}
          </div>

          {/* Montos y tasas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-foreground/80">Monto préstamo (Bs)</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="500.00"
                className="bg-input/50 border-border focus-visible:ring-primary h-11"
                {...register('loan_amount', { valueAsNumber: true })}
              />
              {errors.loan_amount && (
                <p className="text-destructive text-xs">{errors.loan_amount.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground/80">Interés (%)</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="3.00"
                className="bg-input/50 border-border focus-visible:ring-primary h-11"
                {...register('interest_rate', { valueAsNumber: true })}
              />
              {errors.interest_rate && (
                <p className="text-destructive text-xs">{errors.interest_rate.message}</p>
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label className="text-foreground/80 leading-tight">
                Custodia (%){' '}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                className="bg-input/50 border-border focus-visible:ring-primary h-11"
                {...register('custody_rate', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground/80">Tipo de interés</Label>
              <Controller
                control={control}
                name="interest_type"
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full h-11 rounded-md border border-border bg-input/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="monthly">Mensual</option>
                    <option value="daily">Diario</option>
                  </select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground/80">Fecha inicio</Label>
              <Input
                type="date"
                className="bg-input/50 border-border focus-visible:ring-primary h-11"
                {...register('start_date')}
              />
              {errors.start_date && (
                <p className="text-destructive text-xs">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-foreground/80">Fecha vencimiento</Label>
              <Input
                type="date"
                className="bg-input/50 border-border focus-visible:ring-primary h-11"
                {...register('due_date')}
              />
              {errors.due_date && (
                <p className="text-destructive text-xs">{errors.due_date.message}</p>
              )}
            </div>
          </div>

          {/* Artículos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground/80 text-sm font-medium">Artículos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ description: '', appraised_value: undefined as unknown as number })
                }
                className="border-border h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Agregar artículo
              </Button>
            </div>

            {errors.items?.root && (
              <p className="text-destructive text-xs">{errors.items.root.message}</p>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    Artículo {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Quitar</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1 col-span-2">
                    <Label className="text-foreground/70 text-xs">Descripción</Label>
                    <Input
                      placeholder="Ej: Celular Samsung Galaxy A54"
                      className="bg-input/50 border-border focus-visible:ring-primary h-9 text-sm"
                      {...register(`items.${index}.description`)}
                    />
                    {errors.items?.[index]?.description && (
                      <p className="text-destructive text-xs">
                        {errors.items[index]?.description?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <Label className="text-foreground/70 text-xs leading-tight">Valor tasado (Bs)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="800.00"
                      className="bg-input/50 border-border focus-visible:ring-primary h-9 text-sm"
                      {...register(`items.${index}.appraised_value`, { valueAsNumber: true })}
                    />
                    {errors.items?.[index]?.appraised_value && (
                      <p className="text-destructive text-xs">
                        {errors.items[index]?.appraised_value?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <Label className="text-foreground/70 text-xs leading-tight">
                      Categoría{' '}
                      <span className="text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    <Controller
                      control={control}
                      name={`items.${index}.category_id`}
                      render={({ field }) => (
                        <select
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          className="w-full h-9 rounded-md border border-border bg-input/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Sin categoría</option>
                          {categories.map((cat) => (
                            <option key={cat.category_id} value={cat.category_id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <Label className="text-foreground/70 text-xs leading-tight">
                      Marca{' '}
                      <span className="text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    <Input
                      placeholder="Samsung"
                      className="bg-input/50 border-border focus-visible:ring-primary h-9 text-sm"
                      {...register(`items.${index}.brand`)}
                    />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <Label className="text-foreground/70 text-xs leading-tight">
                      Modelo{' '}
                      <span className="text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    <Input
                      placeholder="Galaxy A54"
                      className="bg-input/50 border-border focus-visible:ring-primary h-9 text-sm"
                      {...register(`items.${index}.model`)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
              <p className="text-destructive text-sm">{errorMessage}</p>
            </div>
          )}

          {createdPawnId ? (
            <div className="pt-2 space-y-3">
              <div className="bg-green-500/10 border border-green-500/30 rounded-md px-3 py-2">
                <p className="text-green-400 text-sm font-medium">Empeño #{createdPawnId} creado correctamente</p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-border"
                >
                  Cerrar
                </Button>
                <Button
                  type="button"
                  onClick={handlePrint}
                  disabled={printing}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {printing ? 'Abriendo...' : 'Imprimir contrato'}
                </Button>
              </DialogFooter>
            </div>
          ) : (
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
                {createMutation.isPending ? 'Guardando...' : 'Guardar empeño'}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
      </Dialog>

      <CustomerFormDialog
        open={createCustomerOpen}
        onOpenChange={setCreateCustomerOpen}
        mode="create"
        defaultIdNumber={/^\d+$/.test(customerInput) ? customerInput : undefined}
        defaultFullName={/^\d+$/.test(customerInput) ? undefined : customerInput}
        onCreated={handleCustomerCreated}
      />
    </>
  )
}

function resolveErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (axios.isAxiosError(error)) {
    const code = error.response?.data?.code as string | undefined
    if (code === 'NO_OPEN_SESSION') return 'Abrí una sesión de caja antes de crear un empeño.'
    if (code === 'CUSTOMER_NOT_FOUND') return 'El cliente no existe.'
    if (code === 'VALIDATION_ERROR') return error.response?.data?.error ?? 'Datos inválidos.'
    if (error.response?.status && error.response.status >= 500) return 'Error del servidor.'
  }
  return 'Ocurrió un error inesperado.'
}
