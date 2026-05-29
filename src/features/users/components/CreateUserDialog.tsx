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
import { useCreateUser } from '../api/useUserMutations'

const schema = z.object({
  full_name: z.string().min(1, 'El nombre es requerido'),
  email:     z.string().email('Email inválido'),
  password:  z.string().min(8, 'Mínimo 8 caracteres'),
  role:      z.enum(['admin', 'cashier']),
})
type FormValues = z.infer<typeof schema>

interface Props { open: boolean; onOpenChange: (v: boolean) => void }

export function CreateUserDialog({ open, onOpenChange }: Props) {
  const mutation = useCreateUser()
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', email: '', password: '', role: 'cashier' },
  })

  useEffect(() => { if (open) reset() }, [open, reset])

  function onSubmit(values: FormValues) {
    mutation.mutate(values, {
      onSuccess: () => { toast.success('Usuario creado'); onOpenChange(false) },
      onError: (err) => {
        if (axios.isAxiosError(err) && err.response?.data?.code === 'EMAIL_ALREADY_EXISTS') {
          setError('email', { message: 'Este email ya está en uso' })
          return
        }
        setError('root', { message: 'Error inesperado. Intentá de nuevo.' })
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!mutation.isPending) onOpenChange(v) }}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nuevo Usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-foreground/80">Nombre completo</Label>
            <Input placeholder="Ej: María González" className="bg-input/50 border-border h-10" {...register('full_name')} />
            {errors.full_name && <p className="text-destructive text-xs">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground/80">Email</Label>
            <Input type="email" placeholder="email@ejemplo.com" className="bg-input/50 border-border h-10" {...register('email')} />
            {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground/80">Contraseña</Label>
            <Input type="password" placeholder="Mínimo 8 caracteres" className="bg-input/50 border-border h-10" {...register('password')} />
            {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
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
            {errors.role && <p className="text-destructive text-xs">{errors.role.message}</p>}
          </div>

          {errors.root && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
              <p className="text-destructive text-sm">{errors.root.message}</p>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending} className="border-border">
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {mutation.isPending ? 'Creando...' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
