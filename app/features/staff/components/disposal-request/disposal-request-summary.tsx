import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function DisposalRequestSummary() {
  const { t } = useTranslation('staff')

  return (
    <section className='relative overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground shadow-sm'>
      <div className='relative z-10'>
        <p className='mb-4 text-xs font-bold uppercase tracking-wide text-primary-foreground/80'>
          {t('disposalRequest.summary.title')}
        </p>
        <div className='flex items-end justify-between gap-4'>
          <div>
            <p className='font-display text-4xl font-extrabold'>03</p>
            <p className='text-sm text-primary-foreground/85'>{t('disposalRequest.summary.sent')}</p>
          </div>
          <div className='text-right'>
            <p className='font-display text-2xl font-bold'>12</p>
            <p className='text-sm text-primary-foreground/85'>{t('disposalRequest.summary.products')}</p>
          </div>
        </div>
      </div>
      <MaterialIcon name='delete_sweep' className='absolute -bottom-4 -right-4 text-8xl text-primary-foreground/10' />
    </section>
  )
}
