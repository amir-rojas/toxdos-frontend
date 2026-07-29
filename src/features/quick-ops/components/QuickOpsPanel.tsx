import { FilePlus2, RefreshCw, Ban, UserPlus } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useQuickOpsActions } from '@/features/quick-ops/hooks/useQuickOpsActions'

export function QuickOpsPanel() {
  const { openNuevoContrato, openNuevoCliente, openRenovacion, openCancelacion, QuickOpsDialogs } =
    useQuickOpsActions()

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] tracking-widest uppercase px-2">
          Acciones rápidas
        </SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton type="button" tooltip="Nuevo Contrato" onClick={openNuevoContrato}>
              <FilePlus2 size={16} className="shrink-0" />
              <span>Nuevo Contrato</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton type="button" tooltip="Renovaciones" onClick={openRenovacion}>
              <RefreshCw size={16} className="shrink-0" />
              <span>Renovaciones</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton type="button" tooltip="Cancelación" onClick={openCancelacion}>
              <Ban size={16} className="shrink-0" />
              <span>Cancelación</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton type="button" tooltip="Nuevo Cliente" onClick={openNuevoCliente}>
              <UserPlus size={16} className="shrink-0" />
              <span>Nuevo Cliente</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <QuickOpsDialogs />
    </>
  )
}
