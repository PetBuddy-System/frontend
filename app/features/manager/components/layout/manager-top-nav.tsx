import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function ManagerTopNav() {
  const { t } = useTranslation('manager')

  return (
    <header className='flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 shadow-sm md:px-8'>
      <div className='font-display text-xl font-bold text-primary'>{t('topNav.title')}</div>
      <div className='flex items-center gap-3'>
        <div className='relative hidden w-64 lg:block'>
          <MaterialIcon
            name='search'
            className='absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground'
          />
          <input
            type='text'
            className='h-10 w-full rounded-full border border-input bg-muted px-10 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring'
            placeholder={t('topNav.search')}
          />
        </div>
        <button
          type='button'
          aria-label={t('topNav.notifications')}
          className='relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
        >
          <MaterialIcon name='notifications' />
          <span className='absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive' />
        </button>
        <button
          type='button'
          aria-label={t('topNav.settings')}
          className='flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
        >
          <MaterialIcon name='settings' />
        </button>
        <div className='hidden h-8 w-px bg-border sm:block' />
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground'>
          <MaterialIcon name='account_circle' filled />
        </div>
      </div>
    </header>
  )
}
