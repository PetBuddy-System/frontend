import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function SiteFab() {
  const { t } = useTranslation('landing')

  return (
    <div className='fixed bottom-8 right-8 z-50 hidden flex-col gap-4 md:flex'>
      <button
        type='button'
        aria-label={t('actions.supportChat')}
        className='flex h-14 w-14 items-center justify-center rounded-full bg-brand-zalo text-brand-zalo-foreground shadow-lg transition-transform hover:scale-105'
      >
        <MaterialIcon name='chat' className='text-[30px]' />
      </button>
      <button
        type='button'
        aria-label={t('actions.callNow')}
        className='flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105'
      >
        <MaterialIcon name='call' className='text-[28px]' />
      </button>
    </div>
  )
}
