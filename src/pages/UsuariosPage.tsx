import { useState } from 'react'
import { AlertCircle, UserCog, UserPlus } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useUsers } from '@/features/users/api/useUsers'
import { CreateUserDialog }      from '@/features/users/components/CreateUserDialog'
import { EditUserDialog }         from '@/features/users/components/EditUserDialog'
import { ChangePasswordDialog }  from '@/features/users/components/ChangePasswordDialog'
import type { AppUser } from '@/features/users/types'

export function UsuariosPage() {
  const { data: users = [], isLoading, isError } = useUsers()

  const [createOpen,    setCreateOpen]    = useState(false)
  const [editUser,      setEditUser]      = useState<AppUser | null>(null)
  const [passwordUser,  setPasswordUser]  = useState<AppUser | null>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestión de accesos al sistema.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo usuario
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Nombre</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Rol</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
              <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : isError ? (
              <TableRow className="border-border">
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30 text-destructive" />
                  No se pudo cargar la lista de usuarios. Intentá de nuevo.
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  <UserCog className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.user_id} className="border-border">
                  <TableCell className="font-medium text-foreground">{user.full_name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={user.role === 'admin'
                        ? 'border-primary/40 text-primary bg-primary/10'
                        : 'border-border text-muted-foreground'}
                    >
                      {user.role === 'admin' ? 'Administrador' : 'Cajero'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={user.is_active
                        ? 'border-green-500/40 text-green-400 bg-green-500/10'
                        : 'border-border text-muted-foreground opacity-60'}
                    >
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs border-border"
                        onClick={() => setPasswordUser(user)}
                      >
                        Contraseña
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs border-border"
                        onClick={() => setEditUser(user)}
                      >
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateUserDialog     open={createOpen}         onOpenChange={setCreateOpen} />
      <EditUserDialog       user={editUser}            open={!!editUser}       onOpenChange={(v) => { if (!v) setEditUser(null) }} />
      <ChangePasswordDialog user={passwordUser}        open={!!passwordUser}   onOpenChange={(v) => { if (!v) setPasswordUser(null) }} />
    </div>
  )
}
