import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { useAuth } from '~/providers/auth-provider'

const STAFF_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBuAh0OLqjDAwBT92pgm1m0PQuCq-4lY3Roo0v-PfbrMF5S_5kJNBDrTmyHdsaWPvZcMnGLotDJRDzKnOYRUj8XbJTH_PVyBktsYpg9OU1q__0JsjIC2Agz8SEHro0U3BJ9d6Wf0xLH_tlBMRNhNdGZjbuUPEgFsdsU9a_B_cUvs-JX7Y_Th7tMwz_bvAcafcswIIvRBc3Z4CFF70SllZQR3JXuad6nmKqAF1D8weMPDYZd3y119IBLx1gtAPypuzHVlAUZlI1mF4Y'

export interface StaffTopNavProps {
  titleKey?: string
  subtitleKey?: string
}

export function StaffTopNav({ titleKey = 'dashboard.title', subtitleKey = 'dashboard.subtitle' }: StaffTopNavProps) {
  const { t } = useTranslation('staff')
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
            <p className='text-sm font-semibold'>{user?.fullName || t('staff.name')}</p>
            <p className='text-xs text-muted-foreground'>{t('sidebar.roleTitle')}</p>
          </div>
          <img
            src={STAFF_AVATAR_URL}
            alt={t('sidebar.avatarAlt')}
            className='h-10 w-10 rounded-full border-2 border-primary object-cover'
          />
        </div>
      </div>
    </header>
  )
}
