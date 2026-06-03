import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const STAFF_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBuAh0OLqjDAwBT92pgm1m0PQuCq-4lY3Roo0v-PfbrMF5S_5kJNBDrTmyHdsaWPvZcMnGLotDJRDzKnOYRUj8XbJTH_PVyBktsYpg9OU1q__0JsjIC2Agz8SEHro0U3BJ9d6Wf0xLH_tlBMRNhNdGZjbuUPEgFsdsU9a_B_cUvs-JX7Y_Th7tMwz_bvAcafcswIIvRBc3Z4CFF70SllZQR3JXuad6nmKqAF1D8weMPDYZd3y119IBLx1gtAPypuzHVlAUZlI1mF4Y'

const STAFF_NAV_ITEMS = [
  { icon: 'swap_horiz', key: 'shiftRequest', href: '/staff/shift-request' },
  { icon: 'report_problem', key: 'violations', href: '#' },
  { icon: 'calendar_view_week', key: 'weeklySchedule', href: '#' },
  { icon: 'history', key: 'attendanceHistory', href: '/staff/attendance' }
] as const

export type StaffNavKey = (typeof STAFF_NAV_ITEMS)[number]['key']

export interface StaffSidebarProps {
  activeItem?: StaffNavKey
}

export function StaffSidebar({ activeItem }: StaffSidebarProps) {
  const { t } = useTranslation('staff')

  return (
    <aside className='hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-card md:flex'>
      <a href='/' className='flex items-center gap-3 border-b border-border p-6 transition-opacity hover:opacity-85'>
        <img
          src='/petbuddy-logo-cropped.png'
          alt={t('sidebar.logoAlt')}
          className='h-12 w-12 rounded-xl object-contain shadow-sm'
        />
        <div>
          <p className='font-display text-xl font-bold text-primary'>{t('topNav.brand')}</p>
          <p className='text-sm text-muted-foreground'>{t('sidebar.portalLabel')}</p>
        </div>
      </a>

      <div className='border-b border-border p-6'>
        <div className='flex items-center gap-4 rounded-xl bg-muted p-4'>
          <img
            src={STAFF_AVATAR_URL}
            alt={t('sidebar.avatarAlt')}
            className='h-14 w-14 rounded-full border-2 border-primary object-cover'
          />
          <div className='min-w-0'>
            <p className='truncate font-display text-base font-bold'>{t('staff.name')}</p>
            <p className='text-sm text-muted-foreground'>{t('sidebar.roleTitle')}</p>
          </div>
        </div>
      </div>

      <nav className='flex-1 space-y-2 p-4'>
        {STAFF_NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.key

          return (
            <a
              key={item.key}
              href={item.href}
              className={
                isActive
                  ? 'flex items-center gap-3 rounded-xl bg-secondary px-4 py-3 font-semibold text-secondary-foreground shadow-sm'
                  : 'flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
              }
            >
              <MaterialIcon name={item.icon} filled={isActive} />
              <span>{t(`sidebar.nav.${item.key}`)}</span>
            </a>
          )
        })}
      </nav>

      <div className='border-t border-border p-4'>
        <button className='flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 font-semibold text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground'>
          <MaterialIcon name='logout' />
          <span>{t('sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  )
}
