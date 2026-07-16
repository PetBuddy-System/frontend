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
  usedByCurrentUser?: number | null   
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
export function isVoucherEligible(
  voucher: VoucherResponse,
  orderSubtotal: number,
  hasPromotionProduct?: boolean
): boolean {
  if (hasPromotionProduct) return false
  if (voucher.status !== 'ACTIVE') return false
  if (voucher.minOrderValue && orderSubtotal < voucher.minOrderValue) return false
  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) return false
  return true
}

export function getIneligibleReason(
  voucher: VoucherResponse,
  orderSubtotal: number,
  hasPromotionProduct?: boolean,
  t?: any
): string {
  const translate = t || ((key: string) => {
    if (key === 'voucherPicker.reasons.hasPromotion') return 'Đang có sản phẩm trong chương trình giảm giá'
    if (key === 'voucherPicker.reasons.inactive') return 'Voucher không còn hiệu lực'
    if (key === 'voucherPicker.reasons.limitExceeded') return 'Voucher đã hết lượt sử dụng'
    if (key === 'voucherPicker.reasons.ineligible') return 'Chưa đủ điều kiện'
    return 'Chưa đủ điều kiện'
  })

  if (hasPromotionProduct) return translate('voucherPicker.reasons.hasPromotion')
  if (voucher.status !== 'ACTIVE') return translate('voucherPicker.reasons.inactive')
  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) return translate('voucherPicker.reasons.limitExceeded')
  if (voucher.minOrderValue && orderSubtotal < voucher.minOrderValue) {
    const missing = voucher.minOrderValue - orderSubtotal
    if (t) {
      return translate('voucherPicker.reasons.minOrderMissing', {
        missing: new Intl.NumberFormat('vi-VN').format(missing)
      })
    }
    return `Thiếu ${new Intl.NumberFormat('vi-VN').format(missing)}đ nữa`
  }
  return translate('voucherPicker.reasons.ineligible')
}

export function calculateVoucherDiscount(voucher: VoucherResponse, subtotal: number): number {
  if (voucher.discountType === 'PERCENTAGE') {
    const discount = (subtotal * voucher.discountValue) / 100
    if (voucher.maxDiscount) return Math.min(discount, voucher.maxDiscount)
    return discount
  }
  return Math.min(voucher.discountValue, subtotal)
}
