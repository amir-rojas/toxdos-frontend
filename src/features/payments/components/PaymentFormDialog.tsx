import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { toast } from 'sonner'
import { AlertTriangle, Banknote, QrCode, ArrowLeftRight, Printer } from 'lucide-react'
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
import { usePawns } from '@/features/pawns/api/usePawns'
import { usePawnDebt } from '@/features/pawns/api/usePawnDebt'
import { useCreatePayment } from '../api/useCreatePayment'
import { printPaymentVoucher } from '../api/payments.api'
import { paymentSchema, type PaymentFormValues } from '../schemas/payment.schema'
import type { Pawn } from '@/features/pawns/types'

interface PaymentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preloadedPawn?: Pawn
}

function getDaysUntilDue(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr.split('T')[0] + 'T00:00:00')
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function DueBadgeInline({ dateStr }: { dateStr: string }) {
  const days = getDaysUntilDue(dateStr)
  const [y, m, d] = dateStr.split('T')[0].split('-')
  const formatted = `${d}/${m}/${y}`

  let label: string
  let className: string

  if (days < 0) {
    label = `Vencido hace ${Math.abs(days)}d`
    className = 'text-red-400 font-medium'
  } else if (days === 0) {
    label = 'Vence hoy'
    className = 'text-red-400 font-semibold'
  } else if (days <= 3) {
    label = `${days}d restantes`
    className = 'text-orange-400'
  } else if (days <= 7) {
    label = `${days}d restantes`
    className = 'text-yellow-400'
  } else {
    label = `${days}d restantes`
    className = 'text-muted-foreground'
  }

  return (
    <span className={`text-xs ${className}`}>
      {label} ({formatted})
    </span>
  )
}

function PawnContextCard({ pawn }: { pawn: Pawn }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 space-y-0.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">
          #{pawn.pawn_id} — {pawn.customer_name}
        </span>
        <DueBadgeInline dateStr={pawn.due_date} />
      </div>
      <p className="text-xs text-muted-foreground truncate">
        {pawn.first_item_description ?? 'Sin artículo'}
      </p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
        <span className="text-foreground font-medium">Bs {parseFloat(pawn.loan_amount).toFixed(2)}</span>
        <span>{parseFloat(pawn.interest_rate).toFixed(2)}% {pawn.interest_type === 'monthly' ? 'mens.' : 'diario'}</span>
        {parseFloat(pawn.custody_rate) > 0 && (
          <span>Custodia {parseFloat(pawn.custody_rate).toFixed(2)}%</span>
        )}
      </div>
    </div>
  )
}

// Solo interest y redemption — parcial removido por política operativa
const PAYMENT_TYPES = [
  { value: 'interest' as const, label: 'Interés' },
  { value: 'redemption' as const, label: 'Rescate' },
]

const PAYMENT_METHODS = [
  { value: 'cash' as const, label: 'Efectivo', icon: Banknote },
  { value: 'qr' as const, label: 'QR', icon: QrCode },
  { value: 'transfer' as const, label: 'Transferencia', icon: ArrowLeftRight },
]

export function PaymentFormDialog({ open, onOpenChange, preloadedPawn }: PaymentFormDialogProps) {
  const createMutation = useCreatePayment()
  const [createdPaymentId, setCreatedPaymentId] = useState<number | null>(null)
  const [printing, setPrinting] = useState(false)

  // Pawn combobox state (solo cuando no hay preloadedPawn)
  const [pawnInput, setPawnInput] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedPawn, setSelectedPawn] = useState<Pawn | null>(preloadedPawn ?? null)
  const suppressNextFocus = useRef(false)
  const isSubmittingRef = useRef(false)

  const { data: pawnsResult } = usePawns(undefined, { limit: 100 })
  const allPawns = pawnsResult?.data ?? []
  const payablePawns = allPawns.filter(
    (p) => p.status === 'active' || p.status === 'renewed'
  )

  const filteredPawns = pawnInput.trim()
    ? payablePawns.filter((p) => {
        const q = pawnInput.trim().toLowerCase()
        return (
          p.customer_name.toLowerCase().includes(q) ||
          String(p.pawn_id).includes(q)
        )
      })
    : payablePawns

  // Debt del empeño seleccionado — se re-fetches cada vez que cambia el pawn
  const { data: debt, isLoading: loadingDebt } = usePawnDebt(selectedPawn?.pawn_id)
  const debtRef = useRef(debt)
  debtRef.current = debt

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      pawn_id:          preloadedPawn?.pawn_id,
      payment_type:     'interest',
      payment_method:   'cash',
      months_paid:      1,
      principal_amount: 0,
    },
  })

  const paymentType  = useWatch({ control, name: 'payment_type' })
  const monthsPaid   = useWatch({ control, name: 'months_paid' }) ?? 1
  const principalAmt = useWatch({ control, name: 'principal_amount' }) ?? 0

  const showCustody  = selectedPawn ? parseFloat(selectedPawn.custody_rate) > 0 : false
  const showPrincipal = paymentType === 'redemption'

  const interestAmt = debt ? debt.interest_per_block * monthsPaid : 0
  const custodyAmt  = debt && showCustody ? debt.custody_per_block * monthsPaid : 0
  const total       = interestAmt + custodyAmt + (Number(principalAmt) || 0)

  // Cuando cambia el tipo a rescate: fijar months_paid = blocks_due y pre-llenar capital
  useEffect(() => {
    if (paymentType === 'redemption' && debt) {
      setValue('months_paid', debt.blocks_due)
      setValue('principal_amount', debt.loan_amount)
    } else {
      setValue('principal_amount', 0)
    }
  }, [paymentType, debt, setValue])

  // Reset al abrir
  useEffect(() => {
    if (open) {
      isSubmittingRef.current = false
      setSelectedPawn(preloadedPawn ?? null)
      setPawnInput('')
      setShowDropdown(false)
      setCreatedPaymentId(null)
      setPrinting(false)
      reset({
        pawn_id:          preloadedPawn?.pawn_id,
        payment_type:     'interest',
        payment_method:   'cash',
        months_paid:      1,
        principal_amount: 0,
      })
    }
  }, [open, preloadedPawn, reset])

  function selectPawn(p: Pawn) {
    setSelectedPawn(p)
    setPawnInput('')
    setShowDropdown(false)
    setValue('pawn_id', p.pawn_id, { shouldValidate: true })
    setValue('months_paid', 1)
    setValue('principal_amount', 0)
  }

  async function handlePrintVoucher() {
    if (!createdPaymentId) return
    setPrinting(true)
    try {
      await printPaymentVoucher(createdPaymentId)
    } finally {
      setPrinting(false)
    }
    onOpenChange(false)
  }

  function onSubmit(values: PaymentFormValues) {
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true

    const dto = {
      pawn_id:          values.pawn_id,
      payment_type:     values.payment_type,
      payment_method:   values.payment_method,
      months_paid:      values.months_paid,
      principal_amount: values.principal_amount > 0 ? values.principal_amount : undefined,
    }
    createMutation.mutate(dto, {
      onSuccess: (payment) => {
        isSubmittingRef.current = false
        if (values.payment_type === 'interest') {
          setCreatedPaymentId(payment.payment_id)
        } else {
          toast.success('Empeño rescatado exitosamente')
          onOpenChange(false)
        }
      },
      onError: () => {
        isSubmittingRef.current = false
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Registrar Pago</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-1">
          {/* Sección 1: Empeño */}
          <div className="space-y-2">
            <Label className="text-foreground/80 text-xs font-semibold uppercase tracking-wide">
              Empeño
            </Label>
            {!preloadedPawn && !selectedPawn && (
              <div className="relative">
                <Input
                  placeholder="Buscá por cliente o #ID..."
                  value={pawnInput}
                  onChange={(e) => {
                    setPawnInput(e.target.value)
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
                  className="bg-input/50 border-border focus-visible:ring-primary h-10"
                />
                {showDropdown && (
                  <div className="absolute z-50 w-full top-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredPawns.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Sin resultados
                      </div>
                    )}
                    {filteredPawns.map((p) => (
                      <button
                        key={p.pawn_id}
                        type="button"
                        onMouseDown={() => selectPawn(p)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50"
                      >
                        <span className="font-medium text-foreground">{p.customer_name}</span>
                        <span className="text-muted-foreground ml-2">
                          #{p.pawn_id} — Bs {parseFloat(p.loan_amount).toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {selectedPawn && <PawnContextCard pawn={selectedPawn} />}
            {errors.pawn_id && (
              <p className="text-destructive text-xs">{errors.pawn_id.message}</p>
            )}
          </div>

          {/* Sección 2: Tipo de pago */}
          <div className="space-y-2">
            <Label className="text-foreground/80 text-xs font-semibold uppercase tracking-wide">
              Tipo de pago
            </Label>
            <Controller
              control={control}
              name="payment_type"
              render={({ field }) => (
                <div className="flex gap-2">
                  {PAYMENT_TYPES.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={`flex-1 px-3 py-2 rounded-md text-sm border transition-colors ${
                        field.value === opt.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            />
            {paymentType === 'redemption' && (
              <div className="flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2.5 text-sm text-yellow-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Este empeño quedará <strong>RESCATADO</strong>. Los artículos serán devueltos al cliente.</span>
              </div>
            )}
          </div>

          {/* Sección 3: Bloques a pagar */}
          <div className="space-y-3">
            <Label className="text-foreground/80 text-xs font-semibold uppercase tracking-wide">
              Bloques a pagar
            </Label>

            {selectedPawn && (
              <>
                {/* Stepper */}
                <Controller
                  control={control}
                  name="months_paid"
                  render={({ field }) => (
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        disabled={field.value <= 1 || paymentType === 'redemption'}
                        onClick={() => field.onChange(Math.max(1, field.value - 1))}
                        className="h-9 w-9 rounded-md border border-border text-foreground text-lg font-medium hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        −
                      </button>
                      <span className="text-2xl font-bold tabular-nums w-8 text-center text-foreground">
                        {field.value}
                      </span>
                      <button
                        type="button"
                        disabled={!debt || loadingDebt || field.value >= debt.blocks_due || paymentType === 'redemption'}
                        onClick={() => field.onChange(Math.min(debt?.blocks_due ?? 1, field.value + 1))}
                        className="h-9 w-9 rounded-md border border-border text-foreground text-lg font-medium hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        +
                      </button>
                      {debt && (
                        <span className="text-xs text-muted-foreground">
                          Pagando{' '}
                          <span className="font-medium text-foreground">{field.value}</span>
                          {' '}de{' '}
                          <span className="font-medium text-foreground">{debt.blocks_due}</span>
                          {' '}bloque(s)
                        </span>
                      )}
                      {loadingDebt && (
                        <span className="text-xs text-muted-foreground">Calculando...</span>
                      )}
                    </div>
                  )}
                />
                {errors.months_paid && (
                  <p className="text-destructive text-xs">{errors.months_paid.message}</p>
                )}

                {/* Desglose calculado */}
                {debt && (
                  <div className="rounded-md bg-muted/20 border border-border px-3 py-2.5 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interés</span>
                      <span className="font-medium text-foreground">
                        Bs {interestAmt.toFixed(2)}
                      </span>
                    </div>
                    {showCustody && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Custodia</span>
                        <span className="font-medium text-foreground">
                          Bs {custodyAmt.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {showPrincipal && (
              <div className="space-y-1.5">
                <Label className="text-foreground/70 text-sm">Capital (Bs)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="bg-input/50 border-border focus-visible:ring-primary h-10"
                  {...register('principal_amount', { valueAsNumber: true })}
                />
              </div>
            )}

            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-base font-semibold text-primary">
                Bs {total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Sección 4: Método de pago */}
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

          {errorMessage && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
              <p className="text-destructive text-sm">{errorMessage}</p>
            </div>
          )}

          {createdPaymentId ? (
            <div className="pt-2 space-y-3">
              <div className="bg-green-500/10 border border-green-500/30 rounded-md px-3 py-2">
                <p className="text-green-400 text-sm font-medium">Renovación registrada correctamente</p>
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
                  onClick={handlePrintVoucher}
                  disabled={printing}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {printing ? 'Abriendo...' : 'Imprimir comprobante'}
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
                disabled={createMutation.isPending || !selectedPawn || !debt}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createMutation.isPending ? 'Procesando...' : 'Confirmar pago'}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}

function resolveErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (axios.isAxiosError(error)) {
    const code = error.response?.data?.code as string | undefined
    if (code === 'NO_OPEN_SESSION')                return 'No hay sesión de caja abierta.'
    if (code === 'PAWN_NOT_PAYABLE')               return 'Este empeño ya no puede recibir pagos.'
    if (code === 'PAWN_NOT_FOUND')                 return 'Empeño no encontrado.'
    if (code === 'MONTHS_PAID_EXCEEDS_BLOCKS_DUE') return 'La cantidad de bloques supera la deuda actual.'
    if (code === 'VALIDATION_ERROR')               return error.response?.data?.error ?? 'Datos inválidos.'
    if ((error.response?.status ?? 0) >= 500) return 'Error del servidor. Intentá de nuevo.'
  }
  return 'Error inesperado. Intentá de nuevo.'
}
