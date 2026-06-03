import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function ReturnSupportCard() {
  const { t } = useTranslation('profile')

  return (
    <div className='space-y-4 rounded-xl border border-border bg-secondary p-4 text-secondary-foreground shadow-sm'>
      <div className='flex items-center gap-2'>
        <MaterialIcon name='support_agent' className='text-2xl' />
        <h4 className='font-display text-lg font-bold'>{t('returnWarranty.urgentSupport.title')}</h4>
      </div>
      <p className='text-xs leading-relaxed opacity-90'>{t('returnWarranty.urgentSupport.description')}</p>
      <div className='space-y-2'>
        <a
          className='flex items-center gap-3 rounded-lg bg-card p-3 text-foreground shadow-sm transition-all hover:shadow-md'
          href='tel:19001234'
        >
          <MaterialIcon name='phone_in_talk' className='text-primary text-xl' />
          <span className='text-sm font-semibold'>{t('returnWarranty.urgentSupport.hotline')}</span>
        </a>
        <a
          className='flex items-center gap-3 rounded-lg bg-card p-3 text-foreground shadow-sm transition-all hover:shadow-md'
          href='#'
        >
          <MaterialIcon name='chat_bubble' className='text-primary text-xl' />
          <span className='text-sm font-semibold'>{t('returnWarranty.urgentSupport.zalo')}</span>
        </a>
      </div>
    </div>
  )
}
