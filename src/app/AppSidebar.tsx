import { Link, useLocation, useNavigate } from 'react-router-dom'
import logoPng from '@/assets/logo.png'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChevronUp, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/shared/store/auth.store'
import { NAV_GROUPS } from './nav-config'

export function AppSidebar() {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()

  function handleNavClick() {
    if (isMobile) setOpenMobile(false)
  }

  function handleLogout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  const initials = user
    ? user.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-14 border-b border-border justify-center">
        <div className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center">
          {/* Icon — only visible when collapsed */}
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0 overflow-hidden">
            <img
              src={logoPng}
              alt="Logo"
              className="w-full h-full object-contain"
              style={{ mixBlendMode: 'multiply' }}
              draggable={false}
            />
          </div>
          {/* Full logo — only visible when expanded */}
          <div
            className="min-w-0 rounded-lg px-2 py-1 overflow-hidden group-data-[collapsible=icon]:hidden"
            style={{
              background: 'oklch(0.76 0.148 68)',
              boxShadow: '0 0 14px 2px oklch(0.76 0.148 68 / 0.3)',
            }}
          >
            <img
              src={logoPng}
              alt="Logo"
              className="h-6 w-auto block"
              style={{ mixBlendMode: 'multiply' }}
              draggable={false}
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] tracking-widest uppercase px-2">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link to={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    onClick={handleNavClick}
                  >
                    <item.icon size={16} className="shrink-0" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SidebarMenuButton className="h-auto py-2" />}
              >
                <Avatar className="w-6 h-6 shrink-0">
                  <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium truncate leading-tight">
                    {user?.full_name ?? '—'}
                  </span>
                  <span className="text-muted-foreground text-xs capitalize">
                    {user?.role === 'admin' ? 'Administrador' : 'Cajero'}
                  </span>
                </div>
                <ChevronUp className="ml-auto shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-52 bg-popover border-border"
              >
                <DropdownMenuItem disabled className="opacity-60">
                  <User className="mr-2 h-4 w-4" />
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
