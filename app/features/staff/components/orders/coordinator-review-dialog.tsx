// app/features/staff/components/orders/coordinator-review-dialog.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import type { OrderResponse } from '~/shared/lib/order'
import {
  coordinatorNegotiateRedeliveryApi,
  coordinatorReportUnreachableApi
} from '../../services/order'

interface CoordinatorReviewDialogProps {
  order: OrderResponse | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type Mode = 'negotiate' | 'unreachable'

export function CoordinatorReviewDialog({
  order,
  isOpen,
  onClose,
  onSuccess
}: CoordinatorReviewDialogProps) {
  const { t } = useTranslation('staff')
  const [mode, setMode] = useState<Mode>('negotiate')
  const [negotiatedDate, setNegotiatedDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !order) return null

  async function handleSubmit() {
    if (!note.trim()) {
      setError(t('coordinatorReviewDialog.noteRequired', { defaultValue: 'Vui lòng nhập ghi chú' }))
      return
    }

    if (mode === 'negotiate' && !negotiatedDate) {
      setError(t('coordinatorReviewDialog.dateRequired', { defaultValue: 'Vui lòng chọn ngày giao lại' }))
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      if (mode === 'negotiate') {
        const res = await coordinatorNegotiateRedeliveryApi(order!.orderId, negotiatedDate, note.trim())
        if (res.success) {
          handleClose()
          onSuccess()
        } else {
          setError(res.message || t('coordinatorReviewDialog.submitError', { defaultValue: 'Cập nhật thất bại' }))
        }
      } else {
        const res = await coordinatorReportUnreachableApi(order!.orderId, note.trim())
        if (res.success) {
          handleClose()
          onSuccess()
        } else {
          setError(res.message || t('coordinatorReviewDialog.submitError', { defaultValue: 'Cập nhật thất bại' }))
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('coordinatorReviewDialog.submitError', { defaultValue: 'Có lỗi xảy ra' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    setNote('')
    setError('')
    onClose()
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center gap-3 border-b border-border bg-indigo-50 dark:bg-indigo-950/30 px-5 py-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shrink-0'>
            <MaterialIcon name='support_agent' className='text-[22px]' />
          </div>
          <div>
            <h2 className='font-bold text-base text-foreground'>
              {t('coordinatorReviewDialog.title', { defaultValue: 'Xử lý đơn giao thất bại' })}
            </h2>
            <p className='text-xs text-muted-foreground'>
              {t('coordinatorReviewDialog.orderCode', { code: order.orderCode, defaultValue: `Mã đơn: ${order.orderCode}` })}
            </p>
          </div>
          <button
            onClick={handleClose}
            className='ml-auto rounded-full p-1.5 hover:bg-muted transition-colors'
          >
            <MaterialIcon name='close' className='text-[18px] text-muted-foreground' />
          </button>
        </div>

        <div className='p-5 flex flex-col gap-4'>
          {/* Information Notice */}
          <div className='flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs text-amber-800 dark:text-amber-300'>
            <MaterialIcon name='info' className='text-[18px] shrink-0 mt-0.5' />
            <div>
              <p className='font-semibold mb-0.5'>
                {t('coordinatorReviewDialog.infoTitle', { defaultValue: 'Lưu ý' })}
              </p>
              <p>
                {t('coordinatorReviewDialog.infoDesc', {
                  defaultValue: 'Đơn hàng này đã giao thất bại 2 lần. Bạn có thể thương lượng ngày giao mới với khách hàng hoặc xác nhận không liên lạc được.'
                })}
              </p>
              {order.cancelReason && (
                <p className='mt-1 text-foreground font-medium'>
                  <span className='font-bold'>{t('coordinatorReviewDialog.shipperNote', { defaultValue: 'Lý do từ Shipper' })}:</span> {order.cancelReason}
                </p>
              )}
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className='grid grid-cols-2 gap-2 rounded-xl bg-muted p-1'>
            <button
              type='button'
              onClick={() => setMode('negotiate')}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all',
                mode === 'negotiate'
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <MaterialIcon name='event_available' className='text-[16px]' />
              <span>{t('coordinatorReviewDialog.tabs.negotiate', { defaultValue: 'Thương lượng giao lại' })}</span>
            </button>

            <button
              type='button'
              onClick={() => setMode('unreachable')}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all',
                mode === 'unreachable'
                  ? 'bg-card text-destructive shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <MaterialIcon name='phone_missed' className='text-[16px]' />
              <span>{t('coordinatorReviewDialog.tabs.unreachable', { defaultValue: 'Không liên lạc được' })}</span>
            </button>
          </div>

          {/* Form fields */}
          {mode === 'negotiate' && (
            <div className='flex flex-col gap-1.5'>
              <label className='text-xs font-semibold text-foreground flex items-center gap-1'>
                <MaterialIcon name='calendar_month' className='text-[16px] text-muted-foreground' />
                <span>{t('coordinatorReviewDialog.dateLabel', { defaultValue: 'Ngày giao lại' })}</span>
                <span className='text-destructive'>*</span>
              </label>
              <input
                type='date'
                min={todayStr}
                value={negotiatedDate}
                onChange={(e) => setNegotiatedDate(e.target.value)}
                className='w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-ring'
              />
            </div>
          )}

          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-semibold text-foreground flex items-center gap-1'>
              <MaterialIcon name='notes' className='text-[16px] text-muted-foreground' />
              <span>{t('coordinatorReviewDialog.noteLabel', { defaultValue: 'Ghi chú' })}</span>
              <span className='text-destructive'>*</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
                if (error) setError('')
              }}
              placeholder={
                mode === 'negotiate'
                  ? t('coordinatorReviewDialog.notePlaceholderNegotiate', { defaultValue: 'Ví dụ: Khách hẹn giao sau 18h ngày mai...' })
                  : t('coordinatorReviewDialog.notePlaceholderUnreachable', { defaultValue: 'Ví dụ: Gọi 3 cuộc không nghe máy, gửi SMS không phản hồi...' })
              }
              className={cn(
                'w-full resize-none rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring',
                error ? 'border-destructive' : 'border-border'
              )}
            />
            {error && <p className='text-xs text-destructive font-medium'>{error}</p>}
          </div>

          {/* Action buttons */}
          <div className='flex gap-3 pt-2'>
            <button
              type='button'
              onClick={handleClose}
              disabled={isSubmitting}
              className='flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-50'
            >
              {t('coordinatorReviewDialog.cancel', { defaultValue: 'Hủy' })}
            </button>

            <button
              type='button'
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-colors active:scale-95 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed',
                mode === 'negotiate' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'
              )}
            >
              {isSubmitting ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  <span>{t('coordinatorReviewDialog.submitting', { defaultValue: 'Đang xử lý...' })}</span>
                </>
              ) : (
                <>
                  <MaterialIcon name={mode === 'negotiate' ? 'check_circle' : 'gavel'} className='text-[18px]' />
                  <span>
                    {mode === 'negotiate'
                      ? t('coordinatorReviewDialog.submitNegotiate', { defaultValue: 'Xác nhận giao lại' })
                      : t('coordinatorReviewDialog.submitUnreachable', { defaultValue: 'Xác nhận thất bại' })}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
