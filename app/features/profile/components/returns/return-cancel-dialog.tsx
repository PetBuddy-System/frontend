import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export interface ReturnCancelDialogProps {
  open: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ReturnCancelDialog({ open, isSubmitting, onClose, onConfirm }: ReturnCancelDialogProps) {
  const { t } = useTranslation('returns')

  // Đóng bằng phím Escape cho a11y.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Khóa scroll khi mở.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='return-cancel-title'
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
    >
      <div className='w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150'>
        <h4 id='return-cancel-title' className='font-display text-lg font-bold text-foreground mb-2'>
          {t('cancel.title')}
        </h4>
        <p className='text-sm text-muted-foreground mb-6'>{t('cancel.description')}</p>
        <div className='flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={onClose}
            disabled={isSubmitting}
            className='rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted text-foreground disabled:opacity-50'
          >
            {t('cancel.keep')}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={isSubmitting}
            className='rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50'
          >
            {isSubmitting ? t('cancel.submitting') : t('cancel.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
