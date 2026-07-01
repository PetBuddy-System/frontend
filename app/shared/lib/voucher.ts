/**
 * Voucher types — chỉ chứa types/interfaces, không có API functions.
 * API functions nằm trong features/services/.
 */

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
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | string
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
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | string
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
