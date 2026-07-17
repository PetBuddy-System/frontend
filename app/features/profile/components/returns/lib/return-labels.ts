/**
 * Pure helpers cho return request UI: formatters, status maps.
 * Không phụ thuộc React/i18n — để dễ test và reuse.
 */

export type ReturnStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PICKED_UP'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'DELIVERY_FAILED'

export type ReturnType = 'RETURN' | 'EXCHANGE'

export type ReturnReason =
  | 'DAMAGED'
  | 'WRONG_PRODUCT'
  | 'MISSING_ITEM'
  | 'EXPIRED'
  | 'CUSTOMER_CHANGED_MIND'
  | 'OTHER'

export type RefundStatus = 'NOT_REQUIRED' | 'PENDING' | 'SUCCESS' | 'FAILED'

/**
 * Tailwind classes cho status badge — dùng semantic token nơi có thể.
 * Status cụ thể giữ palette phân biệt để user phân biệt nhanh.
 */
export const RETURN_STATUS_BADGE_STYLE: Record<ReturnStatus, string> = {
  PENDING: 'bg-warning/15 text-warning',
  APPROVED: 'bg-info/15 text-info',
  PICKED_UP: 'bg-accent text-accent-foreground',
  REJECTED: 'bg-destructive/15 text-destructive',
  CANCELLED: 'bg-muted text-muted-foreground',
  COMPLETED: 'bg-success/15 text-success',
  DELIVERY_FAILED: 'bg-destructive/15 text-destructive'
}

export function getStatusBadgeClassName(status: string): string {
  return (
    RETURN_STATUS_BADGE_STYLE[status as ReturnStatus] ?? 'bg-muted text-muted-foreground'
  )
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
