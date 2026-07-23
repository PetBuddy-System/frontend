import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type { AuditLog, AuditLogFilter, ApiResponse, PagedAuditResponse } from '~/shared/lib/audit'

const AUDIT_BASE_URL = `${env.API_URL}/api/audit-logs`
export async function fetchManagerAuditLogsApi(filter?: AuditLogFilter): Promise<PagedAuditResponse> {
  const params = new URLSearchParams()

  if (filter?.entityType) params.append('entityType', filter.entityType)
  if (filter?.entityCode) params.append('entityCode', filter.entityCode)
  if (filter?.action) params.append('action', filter.action)
  if (filter?.fromDate) params.append('fromDate', filter.fromDate)
  if (filter?.toDate) params.append('toDate', filter.toDate)
  if (filter?.performedBy) params.append('performedBy', filter.performedBy)
  if (filter?.page !== undefined) params.append('page', String(filter.page))
  if (filter?.size !== undefined) params.append('size', String(filter.size))

  const url = params.toString() ? `${AUDIT_BASE_URL}?${params}` : AUDIT_BASE_URL

  return customFetch<PagedAuditResponse>({ url, method: 'GET' })
}

export async function fetchManagerAuditLogByIdApi(id: string): Promise<ApiResponse<AuditLog>> {
  return customFetch<ApiResponse<AuditLog>>({
    url: `${AUDIT_BASE_URL}/${id}`,
    method: 'GET'
  })
}
