import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginFormValues } from '../schemas/login.schema'
import { useLogin } from '../api/useLogin'

export function LoginForm() {
  const { mutate, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const errorMessage = resolveErrorMessage(error)

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} noValidate className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-foreground/80 text-sm font-medium">
          Correo electrónico
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="usuario@empresa.com"
          className="bg-input/50 border-border focus-visible:ring-primary h-11"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-destructive text-xs">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-foreground/80 text-sm font-medium">
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="bg-input/50 border-border focus-visible:ring-primary h-11"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-destructive text-xs">{errors.password.message}</p>
        )}
      </div>

      {errorMessage && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-md px-4 py-3">
          <p className="text-destructive text-sm">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold tracking-wide"
      >
        {isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>
    </form>
  )
}

function resolveErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    if (status === 401) return 'Correo o contraseña incorrectos.'
    if (status === 403) return 'Tu cuenta no tiene acceso al sistema.'
    if (status && status >= 500) return 'Error del servidor. Intentá más tarde.'
  }
  return 'Ocurrió un error inesperado.'
}
