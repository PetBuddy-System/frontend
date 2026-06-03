import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export interface StaffTopNavProps {
  titleKey?: string
  subtitleKey?: string
}

export function StaffTopNav({
  titleKey = 'dashboard.title',
  subtitleKey = 'dashboard.subtitle'
}: StaffTopNavProps) {
  const { t } = useTranslation('staff')

  return (
    <header className='flex h-20 shrink-0 items-center justify-between border-b border-border bg-card px-4 shadow-sm md:px-8'>
      <div className='flex items-center gap-3'>
        <button
          type='button'
          aria-label={t('topNav.menu')}
          className='rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary md:hidden'
        >
          <MaterialIcon name='menu' />
        </button>
        <div>
          <p className='font-display text-xl font-bold text-primary md:text-2xl'>{t(titleKey)}</p>
          {subtitleKey ? (
            <p className='hidden text-sm text-muted-foreground sm:block'>{t(subtitleKey)}</p>
          ) : null}
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <button
          type='button'
          aria-label={t('topNav.notifications')}
          className='relative rounded-full p-3 text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
        >
          <MaterialIcon name='notifications' />
          <span className='absolute right-3 top-3 h-2 w-2 rounded-full bg-destructive' />
        </button>
        <button
          type='button'
          aria-label={t('topNav.help')}
          className='rounded-full p-3 text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
        >
          <MaterialIcon name='help' />
        </button>
      </div>
    </header>
  )
}
