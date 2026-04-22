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
import { useOpenSession } from '../api/useOpenSession'
import { openSessionSchema, type OpenSessionFormValues } from '../schemas/openSession.schema'

interface OpenSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OpenSessionDialog({ open, onOpenChange }: OpenSessionDialogProps) {
  const { mutate, isPending, error } = useOpenSession()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OpenSessionFormValues>({
    resolver: zodResolver(openSessionSchema),
  })

  function onSubmit(values: OpenSessionFormValues) {
    mutate(
      { opening_amount: values.opening_amount },
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
          <DialogTitle className="text-foreground">Abrir caja</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Ingresá el monto inicial en efectivo para comenzar la jornada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="opening_amount" className="text-foreground/80">
              Monto inicial (Bs)
            </Label>
            <Input
              id="opening_amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="bg-input/50 border-border focus-visible:ring-primary h-11"
              {...register('opening_amount', { valueAsNumber: true })}
            />
            {errors.opening_amount && (
              <p className="text-destructive text-xs">{errors.opening_amount.message}</p>
            )}
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
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? 'Abriendo...' : 'Abrir caja'}
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
    if (code === 'SESSION_ALREADY_OPEN') return 'Ya hay una caja abierta.'
    if (error.response?.status && error.response.status >= 500) return 'Error del servidor.'
  }
  return 'Ocurrió un error inesperado.'
}
