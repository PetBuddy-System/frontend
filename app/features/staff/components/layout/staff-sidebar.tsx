import { useTranslation } from 'react-i18next'

import { useSidebar } from '~/providers/sidebar-provider'
import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const STAFF_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBuAh0OLqjDAwBT92pgm1m0PQuCq-4lY3Roo0v-PfbrMF5S_5kJNBDrTmyHdsaWPvZcMnGLotDJRDzKnOYRUj8XbJTH_PVyBktsYpg9OU1q__0JsjIC2Agz8SEHro0U3BJ9d6Wf0xLH_tlBMRNhNdGZjbuUPEgFsdsU9a_B_cUvs-JX7Y_Th7tMwz_bvAcafcswIIvRBc3Z4CFF70SllZQR3JXuad6nmKqAF1D8weMPDYZd3y119IBLx1gtAPypuzHVlAUZlI1mF4Y'

const STAFF_NAV_ITEMS = [
  { icon: 'swap_horiz', key: 'shiftRequest', href: '/staff/shift-request' },
  { icon: 'delete_sweep', key: 'disposalRequest', href: '/staff/disposal-request' },
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
  const { isCollapsed, toggleSidebar } = useSidebar()

  return (
    <aside
      className={cn(
        'hidden h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-card transition-all duration-300 md:flex',
        isCollapsed ? 'w-[4.5rem]' : 'w-60'
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-center border-b border-border px-3 py-3',
          isCollapsed ? 'flex-col gap-2' : 'justify-between'
        )}
      >
        <a href='/' className='transition-opacity hover:opacity-85'>
          <img
            src='/petbuddy-logo-cropped.png'
            alt={t('sidebar.logoAlt')}
            className={cn('w-auto object-contain', isCollapsed ? 'h-9 max-w-10' : 'h-11 max-w-[7rem]')}
          />
        </a>
        <button
          type='button'
          onClick={toggleSidebar}
          aria-label={t('sidebar.toggle')}
          className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary active:scale-95'
        >
          <MaterialIcon name={isCollapsed ? 'menu' : 'menu_open'} className='text-[20px]' />
        </button>
      </div>

      <div className='shrink-0 border-b border-border p-3'>
        <div className={cn('flex items-center rounded-xl bg-muted p-3', isCollapsed ? 'justify-center' : 'gap-3')}>
          <img
            src={STAFF_AVATAR_URL}
            alt={t('sidebar.avatarAlt')}
            className='h-11 w-11 rounded-full border-2 border-primary object-cover'
          />
          {!isCollapsed && (
            <div className='min-w-0'>
              <p className='truncate font-display text-base font-bold'>{t('staff.name')}</p>
              <p className='text-sm text-muted-foreground'>{t('sidebar.roleTitle')}</p>
            </div>
          )}
        </div>
      </div>

      <nav className='min-h-0 flex-1 space-y-1 overflow-y-auto p-3'>
        {STAFF_NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.key

          return (
            <a
              key={item.key}
              href={item.href}
              title={isCollapsed ? t(`sidebar.nav.${item.key}`) : undefined}
              className={cn(
                'flex items-center rounded-xl font-medium transition-colors',
                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5',
                isActive
                  ? 'bg-secondary font-semibold text-secondary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-primary'
              )}
            >
              <MaterialIcon name={item.icon} filled={isActive} />
              {!isCollapsed && <span>{t(`sidebar.nav.${item.key}`)}</span>}
            </a>
          )
        })}
      </nav>

      <div className='shrink-0 border-t border-border p-3'>
        <button
          className={cn(
            'flex w-full items-center justify-center rounded-xl border border-border font-semibold text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground',
            isCollapsed ? 'p-2.5' : 'gap-2 px-3.5 py-2.5'
          )}
          title={isCollapsed ? t('sidebar.logout') : undefined}
        >
          <MaterialIcon name='logout' />
          {!isCollapsed && <span>{t('sidebar.logout')}</span>}
        </button>
      </div>
    </aside>
  )
}
