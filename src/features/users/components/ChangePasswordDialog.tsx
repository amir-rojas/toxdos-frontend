import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useChangePassword } from '../api/useUserMutations'
import type { AppUser } from '../types'

const schema = z.object({
  new_password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm:      z.string(),
}).refine((v) => v.new_password === v.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
})
type FormValues = z.infer<typeof schema>

interface Props {
  user: AppUser | null
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function ChangePasswordDialog({ user, open, onOpenChange }: Props) {
  const mutation = useChangePassword()
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { new_password: '', confirm: '' },
  })

  useEffect(() => { if (open) reset() }, [open, reset])

  function onSubmit(values: FormValues) {
    if (!user) return
    mutation.mutate({ id: user.user_id, dto: { new_password: values.new_password } }, {
      onSuccess: () => { toast.success('Contraseña actualizada'); onOpenChange(false) },
      onError: () => { setError('root', { message: 'Error inesperado. Intentá de nuevo.' }) },
    })
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!mutation.isPending) onOpenChange(v) }}>
      <DialogContent className="bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Cambiar Contraseña</DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-sm -mt-1">
          Cambiando contraseña de <span className="text-foreground font-medium">{user.full_name}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-foreground/80">Nueva contraseña</Label>
            <Input type="password" placeholder="Mínimo 8 caracteres" className="bg-input/50 border-border h-10" {...register('new_password')} />
            {errors.new_password && <p className="text-destructive text-xs">{errors.new_password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground/80">Confirmar contraseña</Label>
            <Input type="password" placeholder="Repetí la contraseña" className="bg-input/50 border-border h-10" {...register('confirm')} />
            {errors.confirm && <p className="text-destructive text-xs">{errors.confirm.message}</p>}
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
              {mutation.isPending ? 'Guardando...' : 'Cambiar contraseña'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
