// app/features/staff/components/orders/delivery-failed-dialog.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import type { OrderResponse } from '~/shared/lib/order'
import { reportDeliveryFailedApi } from '../../services/order'

const MAX_FAIL_COUNT = 2

interface DeliveryFailedDialogProps {
  order: OrderResponse | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeliveryFailedDialog({ order, isOpen, onClose, onSuccess }: DeliveryFailedDialogProps) {
  const { t } = useTranslation('staff')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !order) return null

  const currentFailCount = order.deliveryFailCount ?? 0
  const nextFailCount = currentFailCount + 1
  const willBeCoordinatorReview = nextFailCount >= MAX_FAIL_COUNT || Boolean(order.postCoordinatorRedelivery)

  async function handleSubmit() {
    if (!reason.trim()) {
      setError(t('deliveryFailedDialog.reasonRequired'))
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      const res = await reportDeliveryFailedApi(order!.orderId, reason.trim())
      if (res.success) {
        setReason('')
        onSuccess()
        onClose()
      } else {
        setError(res.message || t('deliveryFailedDialog.submitError'))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('deliveryFailedDialog.submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    setReason('')
    setError('')
    onClose()
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center gap-3 border-b border-border bg-rose-50 dark:bg-rose-950/30 px-5 py-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0'>
            <MaterialIcon name='local_shipping' className='text-[22px]' />
          </div>
          <div>
            <h2 className='font-bold text-base text-foreground'>
              {t('deliveryFailedDialog.title')}
            </h2>
            <p className='text-xs text-muted-foreground'>
              {t('deliveryFailedDialog.orderCode', { code: order.orderCode })}
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
          {/* Info banner — coordinator review warning if applicable */}
          {willBeCoordinatorReview && (
            <div className='flex items-start gap-3 rounded-xl px-4 py-3 border text-sm font-medium bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'>
              <MaterialIcon
                name='support_agent'
                className='text-[20px] shrink-0 mt-0.5'
              />
              <p className='font-semibold'>
                {t('deliveryFailedDialog.willBeCoordinatorReview')}
              </p>
            </div>
          )}

          {/* Reason textarea */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm font-semibold text-foreground'>
              {t('deliveryFailedDialog.reasonLabel')}
              <span className='text-destructive ml-1'>*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error) setError('')
              }}
              placeholder={t('deliveryFailedDialog.reasonPlaceholder')}
              className={cn(
                'w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring',
                error ? 'border-destructive' : 'border-border'
              )}
            />
            {error && (
              <p className='text-xs text-destructive font-medium'>{error}</p>
            )}
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-1'>
            <button
              type='button'
              onClick={handleClose}
              disabled={isSubmitting}
              className='flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-50'
            >
              {t('deliveryFailedDialog.cancel')}
            </button>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-colors active:scale-95 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed',
                willBeCoordinatorReview
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              )}
            >
              {isSubmitting ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  <span>{t('deliveryFailedDialog.submitting')}</span>
                </>
              ) : (
                <>
                  <MaterialIcon name={willBeCoordinatorReview ? 'support_agent' : 'flag'} className='text-[18px]' />
                  <span>
                    {willBeCoordinatorReview
                      ? t('deliveryFailedDialog.submitCoordinatorReview')
                      : t('deliveryFailedDialog.submit')}
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
