import { apiClient } from "@/shared/api/client";
import type { PaginationMeta } from "@/shared/types/pagination";
import type { CashSession, CloseSessionDto, OpenSessionDto } from "../types";

// PostgreSQL NUMERIC columns arrive as strings — parse everything in this layer
interface RawSession {
  session_id: string | number
  user_id: string | number
  cashier_name: string
  opening_amount: string | number
  closing_amount: string | number | null
  expected_amount: string | number | null
  difference: string | number | null
  notes: string | null
  status: "open" | "closed"
  opened_at: string
  closed_at: string | null
}

function parseSession(raw: RawSession): CashSession {
  return {
    session_id: Number(raw.session_id),
    user_id: Number(raw.user_id),
    cashier_name: raw.cashier_name,
    opening_amount: parseFloat(String(raw.opening_amount)),
    closing_amount: raw.closing_amount != null ? parseFloat(String(raw.closing_amount)) : null,
    expected_amount: raw.expected_amount != null ? parseFloat(String(raw.expected_amount)) : null,
    difference: raw.difference != null ? parseFloat(String(raw.difference)) : null,
    notes: raw.notes,
    status: raw.status,
    opened_at: raw.opened_at,
    closed_at: raw.closed_at,
  };
}

export async function getCurrentSession(): Promise<CashSession | null> {
  try {
    const { data } = await apiClient.get<{ data: RawSession }>(
      "/api/cash-sessions/current",
    );
    return parseSession(data.data);
  } catch {
    return null;
  }
}

export async function openSession(dto: OpenSessionDto): Promise<CashSession> {
  const { data } = await apiClient.post<{ data: RawSession }>(
    "/api/cash-sessions",
    dto,
  );
  return parseSession(data.data);
}

export async function closeSession(
  sessionId: number,
  dto: CloseSessionDto,
): Promise<CashSession> {
  const { data } = await apiClient.post<{ data: RawSession }>(
    `/api/cash-sessions/${sessionId}/close`,
    dto,
  );
  return parseSession(data.data);
}

export async function getSessions(params?: { page?: number; limit?: number }): Promise<{
  data: CashSession[]
  meta: PaginationMeta
}> {
  const { data } = await apiClient.get<{ data: RawSession[]; meta: PaginationMeta }>(
    "/api/cash-sessions",
    { params },
  );
  return { data: data.data.map(parseSession), meta: data.meta };
}
