import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

export interface ReturnWarrantySuccessProps {
  onReset: () => void
}

export function ReturnWarrantySuccess({ onReset }: ReturnWarrantySuccessProps) {
  const { t } = useTranslation('profile')

  return (
    <div className='flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center shadow-md'>
      <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground'>
        <MaterialIcon name='check' className='text-[36px]' />
      </div>
      <h3 className='font-display text-xl font-bold text-foreground sm:text-2xl'>
        {t('returnWarranty.success.title')}
      </h3>
      <p className='mt-2 max-w-md text-sm text-muted-foreground'>{t('returnWarranty.success.message')}</p>
      <button
        type='button'
        onClick={onReset}
        className='mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-105 active:scale-[0.98]'
      >
        {t('returnWarranty.success.button')}
      </button>
    </div>
  )
}
