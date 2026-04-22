import { LoginForm } from '@/features/auth/components/LoginForm'
import logoPng from '@/assets/logo.png'

export function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Fondo con textura sutil */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, oklch(0.76 0.148 68) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Resplandor central suave */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.76 0.148 68 / 0.15), transparent)',
        }}
      />

      {/* Card de login */}
      <div className="relative w-full max-w-sm">
        {/* Línea de acento superior */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent mb-px rounded-full" />

        <div className="bg-card border border-border rounded-lg px-8 py-9">
          {/* Logo / Branding */}
          <div className="flex justify-center mb-8">
            <div
              className="rounded-xl p-3 overflow-hidden"
              style={{
                background: 'oklch(0.76 0.148 68)',
                boxShadow: '0 0 28px 6px oklch(0.76 0.148 68 / 0.35)',
              }}
            >
              <img
                src={logoPng}
                alt="Logo"
                className="h-16 w-auto block"
                style={{ mixBlendMode: 'multiply' }}
                draggable={false}
              />
            </div>
          </div>

          <LoginForm />
        </div>

        <p className="text-center text-muted-foreground text-xs mt-5">
          Acceso restringido a personal autorizado
        </p>
      </div>
    </div>
  )
}
