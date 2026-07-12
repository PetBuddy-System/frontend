import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type { ApiResponse, PageResponse } from '~/shared/lib/order'
import type { ManagementReturnResponse } from '~/shared/lib/returns'

const RETURNS_MANAGEMENT_URL = `${env.API_URL}/api/management/returns`

export interface FetchReturnsParams {
  page?: number
  size?: number
  sort?: string
  status?: string
  orderCode?: string
  returnCode?: string
  refundMethod?: string
  type?: string
  fromDate?: string
  toDate?: string
  keyword?: string
}

export async function fetchReturnsApi(
  params: FetchReturnsParams = {}
): Promise<ApiResponse<PageResponse<ManagementReturnResponse>>> {
  return customFetch<ApiResponse<PageResponse<ManagementReturnResponse>>>({
    url: RETURNS_MANAGEMENT_URL,
    method: 'GET',
    params
  })
}

export async function fetchReturnDetailApi(
  returnId: number
): Promise<ApiResponse<ManagementReturnResponse>> {
  return customFetch<ApiResponse<ManagementReturnResponse>>({
    url: `${RETURNS_MANAGEMENT_URL}/${returnId}`,
    method: 'GET'
  })
}

export async function updateReturnStatusApi(
  returnId: number,
  status: string,
  staffNote: string
): Promise<ApiResponse<ManagementReturnResponse>> {
  return customFetch<ApiResponse<ManagementReturnResponse>>({
    url: `${RETURNS_MANAGEMENT_URL}/${returnId}/status`,
    method: 'PATCH',
    data: { status, staffNote }
  })
}
