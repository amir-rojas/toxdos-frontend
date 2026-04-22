import { HardHat } from 'lucide-react'

interface ComingSoonPageProps {
  title: string
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
        <HardHat className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Esta sección está en desarrollo. Próximamente disponible.
        </p>
      </div>
    </div>
  )
}
