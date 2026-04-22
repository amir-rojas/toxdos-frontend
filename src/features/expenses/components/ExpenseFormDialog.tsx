import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { toast } from 'sonner'
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
import { useCreateExpense } from '../api/useCreateExpense'
import { expenseSchema, type ExpenseFormValues } from '../schemas/expense.schema'

interface ExpenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExpenseFormDialog({ open, onOpenChange }: ExpenseFormDialogProps) {
  const createMutation = useCreateExpense()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { concept: '', amount: 0 },
  })

  useEffect(() => {
    if (open) reset({ concept: '', amount: 0 })
  }, [open, reset])

  function onSubmit(values: ExpenseFormValues) {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Gasto registrado')
        onOpenChange(false)
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          const code = error.response?.data?.code as string | undefined
          if (code === 'NO_OPEN_SESSION') {
            setError('root', { message: 'Abrí una sesión de caja antes de registrar un gasto.' })
            return
          }
        }
        setError('root', { message: 'Error inesperado. Intentá de nuevo.' })
      },
    })
  }

  function handleOpenChange(next: boolean) {
    if (!createMutation.isPending) onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Registrar Gasto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-1">
          <div className="space-y-1.5">
            <Label className="text-foreground/80">Concepto</Label>
            <Input
              placeholder="Ej: Limpieza, papelería, servicio..."
              className="bg-input/50 border-border focus-visible:ring-primary h-10"
              {...register('concept')}
            />
            {errors.concept && (
              <p className="text-destructive text-xs">{errors.concept.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground/80">Monto (Bs)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="bg-input/50 border-border focus-visible:ring-primary h-10"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-destructive text-xs">{errors.amount.message}</p>
            )}
          </div>

          {errors.root && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
              <p className="text-destructive text-sm">{errors.root.message}</p>
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
              {createMutation.isPending ? 'Guardando...' : 'Registrar gasto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
