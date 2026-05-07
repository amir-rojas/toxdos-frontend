import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <p className="text-8xl font-bold text-muted-foreground/30">404</p>
      <h1 className="text-2xl font-semibold text-foreground">Página no encontrada</h1>
      <p className="text-muted-foreground max-w-xs">
        La dirección que ingresaste no existe en el sistema.
      </p>
      <Button onClick={() => navigate('/dashboard')}>Ir al inicio</Button>
    </div>
  )
}
