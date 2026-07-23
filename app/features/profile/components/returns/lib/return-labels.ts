/**
 * Pure helpers cho return request UI: formatters, status maps.
 * Không phụ thuộc React/i18n — để dễ test và reuse.
 */

export type ReturnStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PICKING_UP'
  | 'PICKED_UP'
  | 'PICKUP_FAILED'
  | 'RETURNED_TO_STORE'
  | 'READY_TO_DELIVER'
  | 'DELIVERING'
  | 'DELIVERING_FAILED'
  | 'REJECTED'
  | 'REJECTED_RETURN_SHIPPING'
  | 'CANCELLED'
  | 'COMPLETED'

export type ReturnType = 'RETURN' | 'EXCHANGE'

export type ReturnReason = 'DAMAGED' | 'WRONG_PRODUCT' | 'MISSING_ITEM' | 'EXPIRED' | 'CUSTOMER_CHANGED_MIND' | 'OTHER'

export type RefundStatus = 'NOT_REQUIRED' | 'PENDING' | 'SUCCESS' | 'FAILED'

/**
 * Tailwind classes cho status badge — dùng semantic token nơi có thể.
 * Status cụ thể giữ palette phân biệt để user phân biệt nhanh.
 */
export const RETURN_STATUS_BADGE_STYLE: Record<ReturnStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  PICKING_UP: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  PICKED_UP: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  PICKUP_FAILED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  RETURNED_TO_STORE: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  READY_TO_DELIVER: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  DELIVERING: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  DELIVERING_FAILED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  REJECTED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  REJECTED_RETURN_SHIPPING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  CANCELLED: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
}

export function getStatusBadgeClassName(status: string): string {
  return RETURN_STATUS_BADGE_STYLE[status as ReturnStatus] ?? 'bg-muted text-muted-foreground'
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return `${new Intl.NumberFormat('vi-VN').format(Number(value))}đ`
}

/**
 * Format ISO date → "hh:mm dd/MM/yyyy" theo timezone local.
 * Trả về empty string nếu input rỗng, hoặc raw string nếu parse fail.
 */
export function formatReturnDateTime(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return dateString

  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')

  return `${hh}:${min} ${dd}/${mm}/${yyyy}`
}

/** Trả về true nếu user có thể tự hủy return request ở status hiện tại. */
export function isReturnCancellable(status: string): boolean {
  return status === 'PENDING' || status === 'APPROVED'
}

/**
 * Trả về URL của 1 media file — hỗ trợ cả string (legacy) và object { fileUrl }.
 */
export function getMediaUrl(media: unknown): string | undefined {
  if (typeof media === 'string') return media
  if (media && typeof media === 'object' && 'fileUrl' in media) {
    const url = (media as { fileUrl: unknown }).fileUrl
    return typeof url === 'string' ? url : undefined
  }
  return undefined
}
