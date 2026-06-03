import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function AdminTopNav() {
  const { t } = useTranslation('admin')

  return (
    <header className='flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:hidden'>
      <div className='font-display text-xl font-bold text-primary'>{t('sidebar.brand')}</div>
      <div className='flex items-center gap-2'>
        <button
          type='button'
          aria-label={t('topNav.notifications')}
          className='flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring'
        >
          <MaterialIcon name='notifications' />
        </button>
        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground'>
          <MaterialIcon name='admin_panel_settings' filled />
        </div>
      </div>
    </header>
  )
}
