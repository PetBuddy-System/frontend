import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function OrderTrackingSupport() {
  const { t } = useTranslation('profile')

  return (
    <div className='rounded-2xl border border-secondary bg-secondary p-6 shadow-sm'>
      <h4 className='font-display text-lg font-semibold text-secondary-foreground'>
        {t('orderTracking.support.title')}
      </h4>
      <p className='mb-6 mt-2 text-secondary-foreground'>{t('orderTracking.support.description')}</p>
      <div className='flex flex-col gap-3'>
        <a
          href='tel:19001234'
          className='flex items-center justify-center gap-2 rounded-full bg-foreground py-3 font-semibold text-background transition-all hover:opacity-90 active:scale-95'
        >
          <MaterialIcon name='call' className='text-[20px]' />
          {t('orderTracking.support.hotline')}
        </a>
        <button
          type='button'
          className='flex items-center justify-center gap-2 rounded-full border-2 border-primary bg-card py-3 font-semibold text-primary transition-all hover:bg-primary/5 active:scale-95'
        >
          <MaterialIcon name='chat' filled className='text-[20px]' />
          {t('orderTracking.support.chat')}
        </button>
      </div>
    </div>
  )
}
