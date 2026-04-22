import { apiClient } from '@/shared/api/client'
import type { PaginationMeta } from '@/shared/types/pagination'
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '../types'

// customer_id es BIGINT → pg lo devuelve como string. parseCustomer normaliza el ID a number.
function parseCustomer(raw: Customer): Customer {
  return { ...raw, customer_id: Number(raw.customer_id) }
}

// Search (combobox): returns plain array, no pagination
export async function searchCustomers(search: string): Promise<Customer[]> {
  const { data } = await apiClient.get<{ data: Customer[] }>('/api/customers', { params: { search } })
  return data.data.map(parseCustomer)
}

// Full list (paginated)
export async function getCustomers(params?: { page?: number; limit?: number }): Promise<{
  data: Customer[]
  meta: PaginationMeta
}> {
  const { data } = await apiClient.get<{ data: Customer[]; meta: PaginationMeta }>('/api/customers', { params })
  return { data: data.data.map(parseCustomer), meta: data.meta }
}

export async function getCustomerById(id: number): Promise<Customer> {
  const { data } = await apiClient.get<{ data: Customer }>(`/api/customers/${id}`)
  return parseCustomer(data.data)
}

export async function createCustomer(dto: CreateCustomerDto): Promise<Customer> {
  const { data } = await apiClient.post<{ data: Customer }>('/api/customers', dto)
  return parseCustomer(data.data)
}

export async function updateCustomer(id: number, dto: UpdateCustomerDto): Promise<Customer> {
  const { data } = await apiClient.put<{ data: Customer }>(`/api/customers/${id}`, dto)
  return parseCustomer(data.data)
}
