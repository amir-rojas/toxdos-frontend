import { useState, useEffect } from 'react'
import { Search, UserPlus, Pencil } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCustomers, useCustomersList } from '@/features/customers/api/useCustomers'
import { CustomerFormDialog } from '@/features/customers/components/CustomerFormDialog'
import { formatDate } from '@/shared/utils/format'
import type { Customer } from '@/features/customers/types'

export function ClientesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>()

  // Debounce: 300ms — also reset page on new search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Search uses combobox hook (plain array), full list uses paginated hook
  const { data: searchResults = [], isLoading: loadingSearch } = useCustomers(search || undefined)
  const { data: listResult, isLoading: loadingList } = useCustomersList(page, 20)

  const isLoading = search ? loadingSearch : loadingList
  const customers = search ? searchResults : (listResult?.data ?? [])
  const meta = search ? undefined : listResult?.meta

  function openCreateDialog() {
    setSelectedCustomer(undefined)
    setDialogMode('create')
    setDialogOpen(true)
  }

  function openEditDialog(customer: Customer) {
    setSelectedCustomer(customer)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Registros de clientes. Buscá por CI/NIT para encontrar uno rápidamente.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por CI/NIT..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 bg-input/50 border-border focus-visible:ring-primary"
        />
      </div>

      {/* Tabla — desktop */}
      <div className="hidden md:block rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">CI / NIT</TableHead>
              <TableHead className="text-muted-foreground">Nombre</TableHead>
              <TableHead className="text-muted-foreground">Teléfono</TableHead>
              <TableHead className="text-muted-foreground">Dirección</TableHead>
              <TableHead className="text-muted-foreground">Registrado</TableHead>
              <TableHead className="text-muted-foreground w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  {search ? `No se encontró ningún cliente con CI/NIT "${search}".` : 'No hay clientes registrados.'}
                </TableCell>
              </TableRow>
            )}
            {customers.map((c) => (
              <TableRow key={c.customer_id} className="border-border hover:bg-muted/30">
                <TableCell className="text-foreground font-mono text-sm font-medium">
                  {c.id_number}
                </TableCell>
                <TableCell className="text-foreground text-sm">{c.full_name}</TableCell>
                <TableCell className="text-sm">
                  {c.phone ? (
                    <span className="text-foreground">{c.phone}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm max-w-[180px] truncate">
                  {c.address ? (
                    <span className="text-foreground">{c.address}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(c.created_at)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(c)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="sr-only">Editar</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden">
        {isLoading && (
          <p className="text-center text-muted-foreground py-10">Cargando...</p>
        )}
        {!isLoading && customers.length === 0 && (
          <p className="text-center text-muted-foreground py-10">
            {search ? `No se encontró ningún cliente con CI/NIT "${search}".` : 'No hay clientes registrados.'}
          </p>
        )}
        <div className="space-y-3">
          {customers.map((c) => (
            <div key={c.customer_id} className="rounded-lg border border-border bg-card p-4 space-y-2">

              {/* Nombre + botón editar */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{c.full_name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{c.id_number}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(c)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
              </div>

              {/* Teléfono y dirección */}
              <div className="space-y-1 text-sm">
                <p className={c.phone ? 'text-foreground' : 'text-muted-foreground'}>
                  {c.phone ?? 'Sin teléfono'}
                </p>
                <p className={`truncate ${c.address ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {c.address ?? 'Sin dirección'}
                </p>
              </div>

              {/* Fecha */}
              <p className="text-xs text-muted-foreground">
                Registrado el {formatDate(c.created_at)}
              </p>

            </div>
          ))}
        </div>
      </div>

      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} de {meta.total} clientes
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.total_pages}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        customer={selectedCustomer}
      />
    </div>
  )
}
