// app/features/staff/components/orders/confirm-returned-warehouse-dialog.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import type { OrderResponse } from '~/shared/lib/order'
import { confirmReturnedToWarehouseApi } from '../../services/order'

interface ConfirmReturnedWarehouseDialogProps {
  order: OrderResponse | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ConfirmReturnedWarehouseDialog({
  order,
  isOpen,
  onClose,
  onSuccess
}: ConfirmReturnedWarehouseDialogProps) {
  const { t } = useTranslation('staff')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !order) return null

  async function handleConfirm() {
    setIsSubmitting(true)
    setError('')
    try {
      const res = await confirmReturnedToWarehouseApi(order!.orderId)
      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.message || t('confirmReturnedWarehouseDialog.submitError'))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('confirmReturnedWarehouseDialog.submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center gap-3 border-b border-border bg-slate-50 dark:bg-slate-900/50 px-5 py-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0'>
            <MaterialIcon name='warehouse' className='text-[22px]' />
          </div>
          <div>
            <h2 className='font-bold text-base text-foreground'>{t('confirmReturnedWarehouseDialog.title')}</h2>
            <p className='text-xs text-muted-foreground'>
              {t('confirmReturnedWarehouseDialog.orderCode', { code: order.orderCode })}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className='ml-auto rounded-full p-1.5 hover:bg-muted transition-colors'
          >
            <MaterialIcon name='close' className='text-[18px] text-muted-foreground' />
          </button>
        </div>

        <div className='p-5 flex flex-col gap-4'>
          {/* Info box */}
          <div className='flex items-start gap-3 rounded-xl bg-muted/60 border border-border px-4 py-3 text-sm'>
            <MaterialIcon name='info' className='text-[20px] text-muted-foreground shrink-0 mt-0.5' />
            <div className='text-muted-foreground'>
              <p className='font-semibold text-foreground mb-1'>{t('confirmReturnedWarehouseDialog.infoTitle')}</p>
              <p>{t('confirmReturnedWarehouseDialog.infoDesc')}</p>
              {order.cancelReason && (
                <p className='mt-2 text-foreground'>
                  <span className='font-semibold'>{t('confirmReturnedWarehouseDialog.bombedReason')}: </span>
                  {order.cancelReason}
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className='text-xs text-destructive font-medium rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2'>
              {error}
            </p>
          )}

          {/* Actions */}
          <div className='flex gap-3 pt-1'>
            <button
              type='button'
              onClick={onClose}
              disabled={isSubmitting}
              className='flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-50'
            >
              {t('confirmReturnedWarehouseDialog.cancel')}
            </button>
            <button
              type='button'
              onClick={handleConfirm}
              disabled={isSubmitting}
              className='flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 py-2.5 text-sm font-bold text-white transition-colors active:scale-95 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {isSubmitting ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  <span>{t('confirmReturnedWarehouseDialog.submitting')}</span>
                </>
              ) : (
                <>
                  <MaterialIcon name='inventory' className='text-[18px]' />
                  <span>{t('confirmReturnedWarehouseDialog.submit')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
