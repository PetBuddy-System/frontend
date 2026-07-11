import { useEffect, useState } from 'react'
import { fetchMyReturnsApi, cancelReturnRequestApi } from '~/features/profile/services'
import type { ReturnRequestResponse } from '~/shared/lib/returns'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

const STATUS_BADGE_STYLE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
}

function getStatusBadgeClassName(status: string) {
  return STATUS_BADGE_STYLE[status] || 'bg-muted text-muted-foreground'
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Chờ duyệt'
    case 'APPROVED':
      return 'Đã chấp thuận'
    case 'REJECTED':
      return 'Từ chối'
    case 'CANCELLED':
      return 'Đã hủy'
    case 'COMPLETED':
      return 'Hoàn thành'
    default:
      return status
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'RETURN':
      return 'Trả hàng hoàn tiền'
    case 'EXCHANGE':
      return 'Đổi hàng'
    default:
      return type
  }
}

function getRefundStatusLabel(status: string | undefined | null) {
  switch (status) {
    case 'NOT_REQUIRED':
      return 'Không cần hoàn tiền'
    case 'PENDING':
      return 'Chờ hoàn tiền'
    case 'SUCCESS':
      return 'Đã hoàn tiền'
    case 'FAILED':
      return 'Hoàn tiền thất bại'
    default:
      return status || '—'
  }
}

function getReasonLabel(reason: string) {
  switch (reason) {
    case 'DAMAGED':
      return 'Sản phẩm bị hư hỏng nặng khi nhận hàng'
    case 'WRONG_PRODUCT':
      return 'Giao sai sản phẩm'
    case 'MISSING_ITEM':
      return 'Thiếu sản phẩm'
    case 'EXPIRED':
      return 'Sản phẩm hết hạn sử dụng'
    case 'CUSTOMER_CHANGED_MIND':
      return 'Thay đổi ý định mua hàng'
    case 'OTHER':
      return 'Lý do khác'
    default:
      return reason
  }
}

function formatPrice(value: number) {
  if (value == null || isNaN(Number(value))) return '—'
  return `${new Intl.NumberFormat('vi-VN').format(Number(value))}đ`
}

function formatDate(dateString: string) {
  if (!dateString) return ''
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return dateString
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${min} ${dd}/${mm}/${yyyy}`
}

export function ReturnHistoryList() {
  const [returns, setReturns] = useState<ReturnRequestResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  
  // Canceling states
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)

  async function loadReturns() {
    setIsLoading(true)
    try {
      const res = await fetchMyReturnsApi({ page: 0, size: 100 })
      if (res.success && res.data) {
        setReturns(res.data.content)
      }
    } catch (err) {
      console.error('Failed to load return requests', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReturns()
  }, [])

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  async function handleCancelRequest(returnId: number) {
    setIsCanceling(true)
    try {
      const res = await cancelReturnRequestApi(returnId)
      if (res.success) {
        setConfirmCancelId(null)
        void loadReturns()
      } else {
        alert(res.message || 'Hủy yêu cầu thất bại')
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi hệ thống khi hủy yêu cầu')
    } finally {
      setIsCanceling(false)
    }
  }

  if (isLoading) {
    return (
      <div className='rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground animate-pulse'>
        Đang tải lịch sử yêu cầu đổi trả...
      </div>
    )
  }

  if (returns.length === 0) {
    return (
      <div className='rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground'>
        Bạn chưa gửi yêu cầu đổi trả hay bảo hành nào.
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {returns.map((req) => {
        const isExpanded = expandedId === req.returnRequestId
        const isPending = req.status === 'PENDING'

        return (
          <div
            key={req.returnRequestId}
            className='rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md'
          >
            {/* Header info */}
            <div
              onClick={() => toggleExpand(req.returnRequestId)}
              className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer bg-card hover:bg-muted/30 transition-colors'
            >
              <div className='space-y-1.5 min-w-0'>
                <div className='flex flex-wrap items-center gap-2.5'>
                  <span className='font-display font-bold text-foreground'>#{req.returnCode}</span>
                  <span className='text-xs text-muted-foreground'>(Đơn hàng: #{req.orderCode})</span>
                  <span
                    className={cn(
                      'rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      getStatusBadgeClassName(req.status)
                    )}
                  >
                    {getStatusLabel(req.status)}
                  </span>
                </div>
                <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
                  <span>Loại yêu cầu: <strong className='text-foreground'>{getTypeLabel(req.type)}</strong></span>
                  <span>Ngày tạo: {formatDate(req.createdAt)}</span>
                </div>
              </div>

              <div className='flex items-center gap-4 shrink-0 justify-between sm:justify-end'>
                {req.type === 'RETURN' && (
                  <div className='text-left sm:text-right'>
                    <p className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground'>Hoàn tiền dự kiến</p>
                    <p className='text-lg font-extrabold text-primary'>{formatPrice(req.refundAmount)}</p>
                  </div>
                )}
                <MaterialIcon
                  name='expand_more'
                  className={cn('text-2xl text-muted-foreground transition-transform duration-200', isExpanded && 'rotate-180')}
                />
              </div>
            </div>

            {/* Detailed view (Expandable) */}
            {isExpanded && (
              <div className='border-t border-border bg-muted/10 p-5 space-y-5 animate-in slide-in-from-top-1 duration-200'>
                {/* Reason & Description */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <h5 className='text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1'>Lý do đổi trả</h5>
                    <p className='text-sm text-foreground font-semibold'>{getReasonLabel(req.reason)}</p>
                  </div>
                  {req.description && (
                    <div>
                      <h5 className='text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1'>Mô tả chi tiết</h5>
                      <p className='text-sm text-foreground whitespace-pre-line bg-muted/40 p-3 rounded-lg border border-border'>{req.description}</p>
                    </div>
                  )}
                </div>

                {/* Refund Payment Details — chỉ hiện khi Trả hàng hoàn tiền */}
                {req.type === 'RETURN' && (
                  <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                    <h5 className='text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border pb-1.5'>
                      Thông tin hoàn tiền
                    </h5>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
                      <div>
                        <span className='text-muted-foreground'>Phương thức hoàn:</span>{' '}
                        <strong className='text-foreground'>
                          {req.refundMethod === 'STRIPE_PAYMENT' ? 'Tài khoản gốc thanh toán' : 'Chuyển khoản ngân hàng'}
                        </strong>
                      </div>
                      {req.refundStatus && (
                        <div>
                          <span className='text-muted-foreground'>Trạng thái hoàn tiền:</span>{' '}
                          <span className='font-semibold text-primary'>{getRefundStatusLabel(req.refundStatus)}</span>
                        </div>
                      )}
                      <div>
                        <span className='text-muted-foreground'>Tổng số tiền:</span>{' '}
                        <strong className='text-primary'>{formatPrice(req.refundAmount)}</strong>
                      </div>
                    </div>

                    {req.refundMethod === 'BANK_TRANSFER' && (req.bankName || req.bankAccountNumber) && (
                      <div className='mt-2 pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg'>
                        <div>Tên ngân hàng: <strong className='text-foreground'>{req.bankName || 'N/A'}</strong></div>
                        <div>Số tài khoản: <strong className='text-foreground'>{req.bankAccountNumber || 'N/A'}</strong></div>
                        <div>Chủ tài khoản: <strong className='text-foreground'>{req.bankAccountHolder || 'N/A'}</strong></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Return Items */}
                <div className='space-y-2'>
                  <h5 className='text-xs font-bold uppercase text-muted-foreground tracking-wider'>
                    Danh sách sản phẩm hoàn trả ({req.returnItems.length})
                  </h5>
                  <div className='space-y-2'>
                    {req.returnItems.map((item) => (
                      <div
                        key={item.returnItemId}
                        className='flex items-center justify-between gap-4 p-3 rounded-lg border border-border/60 bg-card text-sm'
                      >
                        <div className='font-semibold text-foreground'>{item.productName}</div>
                        <div className='flex items-center gap-6 shrink-0 text-xs'>
                          <span className='text-muted-foreground'>Số lượng: <strong className='text-foreground'>{item.quantity}</strong></span>
                          {req.type === 'RETURN' && (
                            <span className='text-muted-foreground'>Số tiền hoàn: <strong className='text-primary'>{formatPrice(item.refundAmount)}</strong></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Media Files */}
                {req.mediaFiles && req.mediaFiles.length > 0 && (
                  <div className='space-y-2'>
                    <h5 className='text-xs font-bold uppercase text-muted-foreground tracking-wider'>Hình ảnh đính kèm</h5>
                    <div className='flex flex-wrap gap-3.5'>
                      {req.mediaFiles.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='relative w-20 h-20 overflow-hidden rounded-lg border border-border shadow-sm hover:opacity-90 transition-opacity'
                        >
                          <img src={url} alt={`Minh họa ${idx + 1}`} className='w-full h-full object-cover' />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions (Cancel button) */}
                {isPending && (
                  <div className='flex justify-end pt-2'>
                    <button
                      type='button'
                      onClick={() => setConfirmCancelId(req.returnRequestId)}
                      className='flex items-center gap-1.5 rounded-lg border border-destructive bg-destructive/5 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive hover:text-white active:scale-95 transition-all duration-150'
                    >
                      <MaterialIcon name='cancel' className='text-sm' />
                      Hủy yêu cầu đổi trả
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Confirmation modal for cancel return */}
      {confirmCancelId !== null && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150'>
            <h4 className='font-display text-lg font-bold text-foreground mb-2'>Xác nhận hủy yêu cầu</h4>
            <p className='text-sm text-muted-foreground mb-6'>
              Bạn có chắc chắn muốn hủy yêu cầu đổi trả này không? Hành động này không thể hoàn tác.
            </p>
            <div className='flex items-center justify-end gap-3'>
              <button
                type='button'
                onClick={() => setConfirmCancelId(null)}
                className='rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted text-foreground'
              >
                Không, giữ lại
              </button>
              <button
                type='button'
                onClick={() => void handleCancelRequest(confirmCancelId)}
                disabled={isCanceling}
                className='rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50'
              >
                {isCanceling ? 'Đang hủy...' : 'Đồng ý hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
