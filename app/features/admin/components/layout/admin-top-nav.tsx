import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { useAuth } from '~/providers/auth-provider'

export interface AdminTopNavProps {
  titleKey?: string
  subtitleKey?: string
}

export function AdminTopNav({ titleKey = 'dashboard.title', subtitleKey = 'dashboard.subtitle' }: AdminTopNavProps) {
  const { t } = useTranslation('admin')
  const { user } = useAuth()

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
          {subtitleKey ? <p className='hidden text-sm text-muted-foreground sm:block'>{t(subtitleKey)}</p> : null}
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

        <div className='mx-1 h-8 w-px bg-border' />

        <div className='flex items-center gap-3'>
          <div className='hidden text-right sm:block'>
            <p className='text-sm font-semibold'>{user?.fullName || t('admin.name')}</p>
            <p className='text-xs text-muted-foreground'>{t('admin.role')}</p>
          </div>
          <div className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground shrink-0'>
            <MaterialIcon name='admin_panel_settings' filled />
          </div>
        </div>
      </div>
    </header>
  )
}
