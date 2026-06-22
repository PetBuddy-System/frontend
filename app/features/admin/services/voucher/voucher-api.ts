/**
 * Admin feature — voucher API service.
 */

import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'
import type {
  VoucherResponse,
  VoucherRequest,
  ApiResponse,
  PageResponse
} from '~/shared/lib/voucher'

const VOUCHER_BASE_URL = `${env.API_URL}${env.API_VOUCHERS_PATH}`

export async function fetchAllVouchersApi(params?: {
  page?: number
  size?: number
  sortBy?: string
}): Promise<ApiResponse<PageResponse<VoucherResponse>>> {
  return customFetch<ApiResponse<PageResponse<VoucherResponse>>>({
    url: VOUCHER_BASE_URL,
    method: 'GET',
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'createdAt',
    },
  })
}

export async function createVoucherApi(
  data: VoucherRequest
): Promise<ApiResponse<VoucherResponse>> {
  return customFetch<ApiResponse<VoucherResponse>>({
    url: VOUCHER_BASE_URL,
    method: 'POST',
    data,
  })
}

export async function updateVoucherApi(
  id: string,
  data: VoucherRequest
): Promise<ApiResponse<VoucherResponse>> {
  return customFetch<ApiResponse<VoucherResponse>>({
    url: `${VOUCHER_BASE_URL}/${id}`,
    method: 'PUT',
    data,
  })
}
