import { useState } from 'react'
import { Menu, PanelLeft } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ModeToggle } from '@/components/mode-toggle'
import { useSessionStore } from '@/shared/store/session.store'
import { OpenSessionDialog } from '@/features/cash-sessions/components/OpenSessionDialog'
import { CloseSessionDialog } from '@/features/cash-sessions/components/CloseSessionDialog'

export function AppHeader({ title }: { title?: string }) {
  const activeSession = useSessionStore((s) => s.activeSession)
  const [openDialog, setOpenDialog] = useState<'open' | 'close' | null>(null)
  const { toggleSidebar, isMobile } = useSidebar()

  return (
    <>
      <header className="flex items-center h-14 px-4 gap-3 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground -ml-1"
          onClick={toggleSidebar}
        >
          {isMobile ? <Menu size={18} /> : <PanelLeft size={18} />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <Separator orientation="vertical" className="h-5 bg-border" />

        {title && (
          <h2 className="text-foreground text-sm font-medium truncate">{title}</h2>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <Separator orientation="vertical" className="h-5 bg-border" />
          {activeSession ? (
            <button onClick={() => setOpenDialog('close')} className="cursor-pointer">
              <Badge
                variant="outline"
                className="border-success/40 text-success bg-success/10 text-xs gap-1.5 hover:bg-success/20 transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                Caja abierta
              </Badge>
            </button>
          ) : (
            <button onClick={() => setOpenDialog('open')} className="cursor-pointer">
              <Badge
                variant="outline"
                className="border-muted-foreground/30 text-muted-foreground text-xs gap-1.5 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 inline-block" />
                Sin caja — Abrir
              </Badge>
            </button>
          )}
        </div>
      </header>

      <OpenSessionDialog
        open={openDialog === 'open'}
        onOpenChange={(v) => setOpenDialog(v ? 'open' : null)}
      />

      {activeSession && (
        <CloseSessionDialog
          open={openDialog === 'close'}
          onOpenChange={(v) => setOpenDialog(v ? 'close' : null)}
          session={activeSession}
        />
      )}
    </>
  )
}
