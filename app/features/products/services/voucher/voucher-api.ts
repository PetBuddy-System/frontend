/**
 * Products feature — voucher API service (customer-facing).
 * Chứa voucher-related API functions cho customer-facing pages.
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

export async function fetchActiveVouchersApi(params?: {
  page?: number
  size?: number
}): Promise<ApiResponse<PageResponse<VoucherResponse>>> {
  return customFetch<ApiResponse<PageResponse<VoucherResponse>>>({
    url: `${VOUCHER_BASE_URL}/active`,
    method: 'GET',
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 100,
      sortBy: 'createdAt',
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
