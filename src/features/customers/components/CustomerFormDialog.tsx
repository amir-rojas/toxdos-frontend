import { useEffect } from 'react'
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
import { useCreateCustomer } from '../api/useCreateCustomer'
import { useUpdateCustomer } from '../api/useUpdateCustomer'
import { customerSchema, type CustomerFormValues } from '../schemas/customer.schema'
import type { Customer } from '../types'

interface CustomerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  customer?: Customer
  onCreated?: (customer: Customer) => void
  defaultIdNumber?: string
  defaultFullName?: string
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  mode,
  customer,
  onCreated,
  defaultIdNumber,
  defaultFullName,
}: CustomerFormDialogProps) {
  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()
  const isPending = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error ?? updateMutation.error

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { full_name: '', id_number: '', phone: '', address: '' },
  })

  // Sync form with customer data when dialog opens in edit mode
  useEffect(() => {
    if (open && mode === 'edit' && customer) {
      reset({
        full_name: customer.full_name,
        id_number: customer.id_number,
        phone: customer.phone ?? '',
        address: customer.address ?? '',
      })
    } else if (open && mode === 'create') {
      reset({ full_name: defaultFullName ?? '', id_number: defaultIdNumber ?? '', phone: '', address: '' })
    }
  }, [open, mode, customer, defaultIdNumber, defaultFullName, reset])

  function onSubmit(values: CustomerFormValues) {
    const dto = {
      full_name: values.full_name,
      id_number: values.id_number,
      phone: values.phone || undefined,
      address: values.address || undefined,
    }

    if (mode === 'create') {
      createMutation.mutate(dto, {
        onSuccess: (created) => {
          reset()
          onOpenChange(false)
          onCreated?.(created)
        },
      })
    } else {
      updateMutation.mutate(
        { id: customer!.customer_id, dto },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
    }
  }

  function handleOpenChange(next: boolean) {
    if (!isPending) {
      onOpenChange(next)
    }
  }

  const errorMessage = resolveErrorMessage(error)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {mode === 'create' ? 'Nuevo cliente' : 'Editar cliente'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {mode === 'create'
              ? 'Registrá un nuevo cliente con su CI o NIT.'
              : 'Modificá los datos del cliente.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="full_name" className="text-foreground/80">
                Nombre completo
              </Label>
              <Input
                id="full_name"
                placeholder="Juan Pérez"
                className="bg-input/50 border-border focus-visible:ring-primary h-11"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-destructive text-xs">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="id_number" className="text-foreground/80">
                CI / NIT
              </Label>
              <Input
                id="id_number"
                placeholder="12345678"
                className="bg-input/50 border-border focus-visible:ring-primary h-11"
                {...register('id_number')}
              />
              {errors.id_number && (
                <p className="text-destructive text-xs">{errors.id_number.message}</p>
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="phone" className="text-foreground/80 leading-tight">
                Teléfono{' '}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input
                id="phone"
                placeholder="70000000"
                className="bg-input/50 border-border focus-visible:ring-primary h-11"
                {...register('phone')}
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              <Label htmlFor="address" className="text-foreground/80 leading-tight">
                Dirección{' '}
                <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Input
                id="address"
                placeholder="Calle X, Ciudad"
                className="bg-input/50 border-border focus-visible:ring-primary h-11"
                {...register('address')}
              />
            </div>
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
              {isPending
                ? mode === 'create'
                  ? 'Guardando...'
                  : 'Actualizando...'
                : mode === 'create'
                  ? 'Guardar cliente'
                  : 'Actualizar'}
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
    if (code === 'CUSTOMER_DUPLICATE_ID') return 'Ya existe un cliente con ese CI/NIT.'
    if (code === 'VALIDATION_ERROR') return error.response?.data?.error ?? 'Datos inválidos.'
    if (error.response?.status && error.response.status >= 500) return 'Error del servidor.'
  }
  return 'Ocurrió un error inesperado.'
}
