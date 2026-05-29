import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateUser, useDeactivateUser } from '../api/useUserMutations'
import type { AppUser } from '../types'

const schema = z.object({
  full_name: z.string().min(1, 'El nombre es requerido'),
  email:     z.string().email('Email inválido'),
  role:      z.enum(['admin', 'cashier']),
})
type FormValues = z.infer<typeof schema>

interface Props {
  user: AppUser | null
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function EditUserDialog({ user, open, onOpenChange }: Props) {
  const updateMutation     = useUpdateUser()
  const deactivateMutation = useDeactivateUser()
  const isPending = updateMutation.isPending || deactivateMutation.isPending

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open && user) reset({ full_name: user.full_name, email: user.email, role: user.role })
  }, [open, user, reset])

  function onSubmit(values: FormValues) {
    if (!user) return
    updateMutation.mutate({ id: user.user_id, dto: values }, {
      onSuccess: () => { toast.success('Usuario actualizado'); onOpenChange(false) },
      onError: (err) => {
        if (axios.isAxiosError(err) && err.response?.data?.code === 'EMAIL_ALREADY_EXISTS') {
          setError('email', { message: 'Este email ya está en uso' })
          return
        }
        setError('root', { message: 'Error inesperado. Intentá de nuevo.' })
      },
    })
  }

  function handleToggleActive() {
    if (!user) return
    if (user.is_active) {
      deactivateMutation.mutate(user.user_id, {
        onSuccess: () => { toast.success('Usuario desactivado'); onOpenChange(false) },
        onError: (err) => {
          if (axios.isAxiosError(err)) {
            const code = err.response?.data?.code as string | undefined
            if (code === 'CANNOT_DEACTIVATE_SELF') {
              toast.error('No podés desactivar tu propia cuenta')
              return
            }
            if (code === 'LAST_ADMIN_PROTECTED') {
              toast.error('No podés desactivar al último administrador activo')
              return
            }
          }
          toast.error('Error inesperado. Intentá de nuevo.')
        },
      })
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) onOpenChange(v) }}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-foreground/80">Nombre completo</Label>
            <Input className="bg-input/50 border-border h-10" {...register('full_name')} />
            {errors.full_name && <p className="text-destructive text-xs">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground/80">Email</Label>
            <Input type="email" className="bg-input/50 border-border h-10" {...register('email')} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground/80">Rol</Label>
            <select
              className="w-full h-10 rounded-md border border-border bg-input/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('role')}
            >
              <option value="cashier">Cajero</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {errors.root && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
              <p className="text-destructive text-sm">{errors.root.message}</p>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            {user.is_active && (
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleActive}
                disabled={isPending}
                className="border-destructive/50 text-destructive hover:bg-destructive/10 sm:mr-auto"
              >
                Desactivar
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="border-border">
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
