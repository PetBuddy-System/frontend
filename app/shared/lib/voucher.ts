import { env } from '~/shared/config/env'
import { customFetch } from '~/api/mutator/custom-fetch'

export interface ApiResponse<T> {
  code?: number
  message?: string
  success?: boolean
  data: T
  timestamp?: string
}

export interface VoucherResponse {
  voucherId: string
  voucherCode: string
  voucherName: string
  discountType: 'PERCENTAGE' | 'FIXED' | string
  discountValue: number
  maxDiscount: number | null
  minOrderValue: number | null
  applyScope: string
  usageLimit: number | null
  usedCount: number
  perUserLimit: number | null
  startAt: string
  expiredAt: string
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | string
  createdAt: string
}

export interface VoucherRequest {
  voucherCode: string
  voucherName: string
  discountType: 'PERCENTAGE' | 'FIXED' | string
  discountValue: number
  maxDiscount?: number | null
  minOrderValue?: number | null
  applyScope?: string
  usageLimit?: number | null
  perUserLimit?: number | null
  startAt: string
  expiredAt: string
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

const VOUCHER_BASE_URL = `${env.API_URL}/api/vouchers`

/** Admin: Get all vouchers (requires ADMIN role) */
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

/** Customer: Get active vouchers only (public endpoint) */
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

/** Admin: Create new voucher */
export async function createVoucherApi(
  data: VoucherRequest
): Promise<ApiResponse<VoucherResponse>> {
  return customFetch<ApiResponse<VoucherResponse>>({
    url: VOUCHER_BASE_URL,
    method: 'POST',
    data,
  })
}

/** Admin: Update voucher by ID */
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