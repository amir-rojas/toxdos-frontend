import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
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
import { useCloseSession } from '../api/useCloseSession'
import { closeSessionSchema, type CloseSessionFormValues } from '../schemas/closeSession.schema'
import type { CashSession } from '../types'

interface CloseSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: CashSession
}

export function CloseSessionDialog({ open, onOpenChange, session }: CloseSessionDialogProps) {
  const { mutate, isPending, error } = useCloseSession()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CloseSessionFormValues>({
    resolver: zodResolver(closeSessionSchema),
  })

  function onSubmit(values: CloseSessionFormValues) {
    mutate(
      { sessionId: session.session_id, dto: values },
      {
        onSuccess: () => {
          reset()
          onOpenChange(false)
        },
      }
    )
  }

  function handleOpenChange(next: boolean) {
    if (!isPending) {
      reset()
      onOpenChange(next)
    }
  }

  const errorMessage = resolveErrorMessage(error)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Cerrar caja</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Contá el efectivo en caja e ingresá el monto real para calcular la diferencia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          {/* Resumen de apertura */}
          <div className="bg-muted/40 rounded-md px-4 py-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto de apertura</span>
              <span className="text-foreground font-medium">
                Bs {session.opening_amount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="closing_amount" className="text-foreground/80">
              Monto real en caja (Bs)
            </Label>
            <Input
              id="closing_amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="bg-input/50 border-border focus-visible:ring-primary h-11"
              {...register('closing_amount', { valueAsNumber: true })}
            />
            {errors.closing_amount && (
              <p className="text-destructive text-xs">{errors.closing_amount.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-foreground/80">
              Notas <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="notes"
              type="text"
              placeholder="Observaciones del cierre..."
              className="bg-input/50 border-border focus-visible:ring-primary h-11"
              {...register('notes')}
            />
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
              disabled={isPending}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending ? 'Cerrando...' : 'Cerrar caja'}
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
    if (code === 'SESSION_ALREADY_CLOSED') return 'Esta caja ya fue cerrada.'
    if (code === 'FORBIDDEN') return 'No tenés permiso para cerrar esta caja.'
    if (error.response?.status && error.response.status >= 500) return 'Error del servidor.'
  }
  return 'Ocurrió un error inesperado.'
}
