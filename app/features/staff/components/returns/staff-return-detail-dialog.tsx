import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import type { ManagementReturnResponse } from '~/shared/lib/returns'
import { updateReturnStatusApi } from '../../services/returns/returns-api'
import { useAuth } from '~/providers/auth-provider'

export interface StaffReturnDetailDialogProps {
  returnRequest: ManagementReturnResponse
  onClose: () => void
  onSuccess: () => void
}

export function StaffReturnDetailDialog({
  returnRequest,
  onClose,
  onSuccess
}: StaffReturnDetailDialogProps) {
  const { t } = useTranslation('staff')
  const { user } = useAuth()
  const staffTask = user?.staffTask

  const [staffNote, setStaffNote] = useState(returnRequest.staffNote || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function getStatusBadgeClassName(status: string) {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'PICKED_UP':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'DELIVERY_FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'PENDING':
        return t('returns.stats.pending')
      case 'APPROVED':
        return t('returns.stats.approved')
      case 'PICKED_UP':
        return t('returns.stats.pickedUp')
      case 'REJECTED':
        return t('returns.stats.rejected')
      case 'CANCELLED':
        return t('returns.stats.cancelled')
      case 'COMPLETED':
        return t('returns.stats.completed')
      case 'DELIVERY_FAILED':
        return t('returns.stats.deliveryFailed')
      default:
        return status
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'RETURN':
        return 'Hoàn trả'
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

  function getRefundMethodLabel(method: string) {
    switch (method) {
      case 'STRIPE_PAYMENT':
        return 'Thanh toán tài khoản gốc'
      case 'BANK_TRANSFER':
        return 'Thanh toán tài khoản khác'
      default:
        return method
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
    return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
  }

  function formatDate(dateString?: string | null) {
    if (!dateString) return '—'
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${min} ${dd}/${mm}/${yyyy}`
  }

  async function handleUpdateStatus(
    nextStatus: 'APPROVED' | 'REJECTED' | 'PICKED_UP' | 'COMPLETED' | 'DELIVERY_FAILED'
  ) {
    if (nextStatus === 'REJECTED' && !staffNote.trim()) {
      setErrorMessage(t('returns.detail.requiredNote'))
      return
    }

    if (nextStatus === 'DELIVERY_FAILED' && !staffNote.trim()) {
      setErrorMessage('Vui lòng nhập lý do giao hàng thất bại')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await updateReturnStatusApi(returnRequest.returnRequestId, nextStatus, staffNote)
      if (res.success) {
        onSuccess()
      } else {
        setErrorMessage(res.message || t('returns.detail.errorUpdate'))
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : t('returns.detail.errorUpdate'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function getAvailableActions() {
    if (!staffTask) {
      return []
    }

    const { type, status } = returnRequest
    const actions: Array<{
      value: 'APPROVED' | 'REJECTED' | 'PICKED_UP' | 'COMPLETED' | 'DELIVERY_FAILED'
      label: string
      variant: string
    }> = []

    // COORDINATOR
    if (staffTask === 'COORDINATOR') {
      if (status === 'PENDING') {
        actions.push(
          { value: 'APPROVED', label: t('returns.detail.btnApprove'), variant: 'primary' },
          { value: 'REJECTED', label: t('returns.detail.btnReject'), variant: 'danger' }
        )
      }

      // RETURN: PICKED_UP → COMPLETED (COORDINATOR)
      if (type === 'RETURN' && status === 'PICKED_UP') {
        actions.push(
          { value: 'COMPLETED', label: t('returns.stats.completed'), variant: 'success' }
        )
      }

      return actions
    }

    // SHIPPER
    if (staffTask === 'SHIPPER') {
      if (type === 'RETURN') {
        // RETURN: APPROVED → PICKED_UP
        if (status === 'APPROVED') {
          actions.push(
            { value: 'PICKED_UP', label: t('returns.stats.pickedUp'), variant: 'primary' },
            { value: 'DELIVERY_FAILED', label: t('returns.stats.deliveryFailed'), variant: 'danger' }
          )
        }
      }

      if (type === 'EXCHANGE') {
        // EXCHANGE: APPROVED → COMPLETED (SHIPPER bấm luôn, không qua PICKED_UP)
        if (status === 'APPROVED') {
          actions.push(
            { value: 'COMPLETED', label: t('returns.stats.completed'), variant: 'success' },
            { value: 'DELIVERY_FAILED', label: t('returns.stats.deliveryFailed'), variant: 'danger' }
          )
        }
      }
      return actions
    }

    return []
  }

  const availableActions = getAvailableActions()

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200'>
      <div className='flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border px-6 py-4'>
          <div className='flex items-center gap-3'>
            <span className='rounded-lg bg-primary/10 p-2 text-primary'>
              <MaterialIcon name='assignment_return' className='text-xl' />
            </span>
            <div>
              <h3 className='font-display text-lg font-bold text-card-foreground'>
                {t('returns.detail.title')} #{returnRequest.returnCode}
              </h3>
              <p className='text-xs text-muted-foreground'>
                {t('returns.detail.orderCode')}: #{returnRequest.orderCode}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
            aria-label='Close Dialog'
          >
            <MaterialIcon name='close' className='text-xl' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6 space-y-6'>
          {errorMessage && (
            <div className='rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive flex items-center gap-2'>
              <MaterialIcon name='error' className='text-lg' />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Column 1: Info & Request details */}
            <div className='md:col-span-2 space-y-6'>
              {/* Customer & Status Summary */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border bg-muted/20 p-4'>
                <div>
                  <h4 className='text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2'>
                    {t('returns.detail.customerInfo')}
                  </h4>
                  <p className='font-bold text-card-foreground'>
                    {returnRequest.requestedBy.fullName}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {returnRequest.requestedBy.email}
                  </p>
                </div>
                <div>
                  <h4 className='text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2'>
                    {t('returns.detail.status')}
                  </h4>
                  <div className='flex items-center gap-2'>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider',
                        getStatusBadgeClassName(returnRequest.status)
                      )}
                    >
                      {getStatusLabel(returnRequest.status)}
                    </span>
                  </div>
                  <p className='mt-1.5 text-xs text-muted-foreground'>
                    {t('returns.detail.createdAt')}: {formatDate(returnRequest.createdAt)}
                  </p>
                </div>
              </div>

              {/* Reason and Description */}
              <div className='space-y-3'>
                <h4 className='text-sm font-bold text-card-foreground border-b border-border pb-1.5'>
                  {t('returns.detail.reason')}
                </h4>
                <div className='rounded-xl border border-border bg-card p-4 space-y-2.5'>
                  <div>
                    <span className='text-xs text-muted-foreground block'>{t('returns.detail.type')}:</span>
                    <strong className='text-foreground'>{getTypeLabel(returnRequest.type)}</strong>
                  </div>
                  <div>
                    <span className='text-xs text-muted-foreground block'>Lý do cụ thể:</span>
                    <strong className='text-foreground'>{getReasonLabel(returnRequest.reason)}</strong>
                  </div>
                  {returnRequest.description && (
                    <div>
                      <span className='text-xs text-muted-foreground block'>{t('returns.detail.description')}:</span>
                      <p className='text-sm text-foreground whitespace-pre-line mt-1 bg-muted/30 p-3 rounded-lg border border-border/60'>
                        {returnRequest.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className='space-y-3'>
                <h4 className='text-sm font-bold text-card-foreground border-b border-border pb-1.5'>
                  {t('returns.detail.items')} ({returnRequest.returnItems.length})
                </h4>
                <div className='divide-y divide-border rounded-xl border border-border bg-card overflow-hidden'>
                  {returnRequest.returnItems.map((item) => (
                    <div
                      key={item.returnItemId}
                      className='flex items-center justify-between gap-4 p-4 hover:bg-muted/10 transition-colors'
                    >
                      <div>
                        <p className='font-semibold text-card-foreground'>{item.productName}</p>
                        <p className='text-xs text-muted-foreground'>SKU/ID: #{item.orderDetailId}</p>
                      </div>
                      <div className='flex items-center gap-6 text-sm shrink-0'>
                        <div>
                          <span className='text-muted-foreground'>SL:</span>{' '}
                          <strong className='text-foreground'>{item.quantity}</strong>
                        </div>
                        {returnRequest.type === 'RETURN' && (
                          <div>
                            <span className='text-muted-foreground'>Hoàn lại:</span>{' '}
                            <strong className='text-primary font-bold'>{formatPrice(item.refundAmount)}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Media attachments */}
              <div className='space-y-3'>
                <h4 className='text-sm font-bold text-card-foreground border-b border-border pb-1.5'>
                  {t('returns.detail.media')}
                </h4>
                {returnRequest.mediaFiles && returnRequest.mediaFiles.length > 0 ? (
                  <div className='flex flex-wrap gap-4'>
                    {returnRequest.mediaFiles.map((media) => {
                      const url = typeof media === 'string' ? media : media.fileUrl
                      return (
                        <a
                          key={typeof media === 'string' ? media : media.mediaFileId}
                          href={url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='group relative h-20 w-20 overflow-hidden rounded-xl border border-border shadow-sm hover:border-primary transition-all active:scale-95'
                        >
                          <img
                            src={url}
                            alt='Proof document'
                            className='h-full w-full object-cover transition-transform group-hover:scale-105'
                          />
                          <span className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs'>
                            <MaterialIcon name='open_in_new' className='text-lg' />
                          </span>
                        </a>
                      )
                    })}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground italic'>{t('returns.detail.mediaEmpty')}</p>
                )}
              </div>
            </div>

            {/* Column 2: Financials & Actions */}
            <div className='space-y-6'>
              {/* Financials details — chỉ hiện khi Trả hàng */}
              {returnRequest.type === 'RETURN' && (
                <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                  <h4 className='text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border pb-2'>
                    {t('returns.detail.refundInfo')}
                  </h4>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.refundMethod')}:</span>
                      <strong className='text-foreground'>
                        {getRefundMethodLabel(returnRequest.refundMethod)}
                      </strong>
                    </div>
                    {returnRequest.refundStatus && (
                      <div className='flex justify-between'>
                        <span className='text-muted-foreground'>{t('returns.detail.refundStatus')}:</span>
                        <span className='font-semibold text-primary'>{getRefundStatusLabel(returnRequest.refundStatus)}</span>
                      </div>
                    )}
                    <div className='flex justify-between border-t border-border pt-2 text-base'>
                      <span className='font-semibold text-card-foreground'>{t('returns.detail.refundAmount')}:</span>
                      <strong className='text-primary font-extrabold'>{formatPrice(returnRequest.refundAmount)}</strong>
                    </div>
                  </div>

                  {returnRequest.refundMethod === 'BANK_TRANSFER' && (returnRequest.bankName || returnRequest.bankAccountNumber) && (
                    <div className='rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1.5 border border-border/50'>
                      <div>
                        {t('returns.detail.bankName')}: <strong className='text-foreground'>{returnRequest.bankName || '—'}</strong>
                      </div>
                      <div>
                        {t('returns.detail.bankAccountNumber')}: <strong className='text-foreground'>{returnRequest.bankAccountNumber || '—'}</strong>
                      </div>
                      <div>
                        {t('returns.detail.bankAccountHolder')}: <strong className='text-foreground'>{returnRequest.bankAccountHolder || '—'}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Thông tin bổ sung */}
              <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                <h4 className='text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border pb-2'>
                  Thông tin bổ sung
                </h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Ngày tạo:</span>
                    <span className='text-foreground'>{formatDate(returnRequest.createdAt)}</span>
                  </div>
                  {returnRequest.updatedAt && returnRequest.updatedAt !== returnRequest.createdAt && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Cập nhật:</span>
                      <span className='text-foreground'>{formatDate(returnRequest.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Processing Info (if resolved) */}
              {returnRequest.processedBy && (
                <div className='rounded-xl border border-border bg-muted/10 p-4 space-y-2 text-xs'>
                  <h4 className='font-bold text-card-foreground border-b border-border/60 pb-1.5 mb-2'>
                    {t('returns.detail.processInfo')}
                  </h4>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>{t('returns.detail.processedBy')}:</span>
                    <span className='font-semibold text-foreground'>{returnRequest.processedBy.fullName}</span>
                  </div>
                  {returnRequest.processedAt && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.processedAt')}:</span>
                      <span className='text-foreground'>{formatDate(returnRequest.processedAt)}</span>
                    </div>
                  )}
                  {returnRequest.completedAt && (
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>{t('returns.detail.completedAt')}:</span>
                      <span className='text-foreground'>{formatDate(returnRequest.completedAt)}</span>
                    </div>
                  )}

                  {returnRequest.staffNote && (
                    <div className='mt-2 border-t border-border/60 pt-2'>
                      <span className='text-muted-foreground block mb-1'>Lý do / Ghi chú:</span>
                      <p className='bg-card p-2 rounded border border-border text-foreground font-medium whitespace-pre-line'>
                        {returnRequest.staffNote}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons (For Staff to resolve) */}
              {availableActions.length > 0 && (
                <div className='rounded-xl border border-border bg-card p-4 space-y-4'>
                  <h4 className='text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-border pb-2'>
                    {t('returns.detail.actionTitle')}
                  </h4>

                  <div className='space-y-2'>
                    <label htmlFor='staff-note' className='text-xs font-semibold text-muted-foreground block'>
                      {t('returns.detail.staffNote')}{' '}
                      {(returnRequest.status === 'PENDING' || returnRequest.status === 'PICKED_UP') && (
                        <span className='text-rose-500'>* (bắt buộc khi từ chối hoặc giao thất bại)</span>
                      )}
                    </label>
                    <textarea
                      id='staff-note'
                      value={staffNote}
                      onChange={(e) => setStaffNote(e.target.value)}
                      placeholder={t('returns.detail.notePlaceholder')}
                      className='w-full min-h-[80px] rounded-lg border border-border p-2.5 text-sm bg-card text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all'
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className='flex flex-col gap-2'>
                    {availableActions.map((action) => {
                      let className = 'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm hover:opacity-90 active:scale-98 disabled:opacity-50 transition-all'

                      if (action.variant === 'primary') {
                        className += ' bg-primary text-white'
                      } else if (action.variant === 'danger') {
                        className += ' bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40'
                      } else if (action.variant === 'success') {
                        className += ' bg-emerald-600 text-white dark:bg-emerald-700'
                      } else {
                        className += ' bg-primary text-white'
                      }

                      return (
                        <button
                          key={action.value}
                          type='button'
                          onClick={() => handleUpdateStatus(action.value)}
                          disabled={isSubmitting}
                          className={className}
                        >
                          {action.value === 'APPROVED' && <MaterialIcon name='check' className='text-lg' />}
                          {action.value === 'REJECTED' && <MaterialIcon name='close' className='text-lg' />}
                          {action.value === 'PICKED_UP' && <MaterialIcon name='local_shipping' className='text-lg' />}
                          {action.value === 'COMPLETED' && <MaterialIcon name='done_all' className='text-lg' />}
                          {action.value === 'DELIVERY_FAILED' && <MaterialIcon name='error' className='text-lg' />}
                          {action.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-muted/10'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-card-foreground hover:bg-muted transition-colors active:scale-95'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}