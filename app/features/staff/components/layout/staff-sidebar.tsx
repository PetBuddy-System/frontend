import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { useSidebar } from '~/providers/sidebar-provider'
import { useAuth } from '~/providers/auth-provider'
import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

type StaffTask = 'COORDINATOR' | 'SHIPPER'

type AllowedTasks = readonly StaffTask[] | null

const STAFF_NAV_ITEMS = [
  { icon: 'content_cut', key: 'groomerBookings', href: '/staff/groomer-bookings', roles: ['GROOMER'] },
  { icon: 'assignment_ind', key: 'coordinatorBookings', href: '/staff/coordinator-bookings', roles: ['COORDINATOR'] },
  { icon: 'shopping_cart', key: 'orders', href: '/staff/orders', allowedTasks: null as AllowedTasks },
  {
    icon: 'route',
    key: 'deliveryRoute',
    href: '/staff/delivery-route',
    allowedTasks: ['SHIPPER'] as AllowedTasks
  },
  {
    icon: 'delete_sweep',
    key: 'disposalRequest',
    href: '/staff/disposal-request',
    allowedTasks: ['COORDINATOR'] as AllowedTasks
  },
  {
    icon: 'assignment_return',
    key: 'returns',
    href: '/staff/returns',
    allowedTasks: ['COORDINATOR', 'SHIPPER'] as AllowedTasks
  },
  { icon: 'inventory_2', key: 'inventory', href: '/staff/add-product', allowedTasks: ['COORDINATOR'] as AllowedTasks },
  {
    icon: 'local_shipping',
    key: 'shipperAssignment',
    href: '/staff/shipper-assignment',
    allowedTasks: ['COORDINATOR'] as AllowedTasks
  },
  { icon: 'event_note', key: 'weeklySchedule', href: '/staff/weekly-schedule', allowedTasks: null as AllowedTasks },
  { icon: 'history', key: 'attendanceHistory', href: '/staff/attendance', allowedTasks: null as AllowedTasks }
] as const

export type StaffNavKey = (typeof STAFF_NAV_ITEMS)[number]['key']

export interface StaffSidebarProps {
  activeItem?: StaffNavKey
}

export function StaffSidebar({ activeItem }: StaffSidebarProps) {
  const { t } = useTranslation('staff')
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const staffTask = user?.staffTask
  const visibleNavItems = STAFF_NAV_ITEMS.filter((item) => {
    if ('roles' in item && item.roles && !(item.roles as readonly string[]).includes(staffTask ?? '')) {
      return false
    }

    if (staffTask === 'GROOMER' && ['orders', 'disposalRequest', 'returns', 'inventory'].includes(item.key)) {
      return false
    }

    // For SHIPPER: hide 'orders' (they use deliveryRoute instead)
    if (staffTask === 'SHIPPER' && item.key === 'orders') {
      return false
    }

    if ('allowedTasks' in item && item.allowedTasks && !(item.allowedTasks as readonly string[]).includes(staffTask ?? '')) {
    return false
    }

    return true
  })

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-card transition-all duration-300 md:flex',
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

      <nav className='min-h-0 flex-1 space-y-1 overflow-y-auto p-3'>
        {visibleNavItems.map((item) => {
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
          type='button'
          onClick={async () => {
            await logout()
            void navigate('/')
          }}
          className={cn(
            'flex w-full items-center rounded-xl font-bold text-destructive transition-colors hover:bg-destructive/10',
            isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3.5 py-2.5'
          )}
          title={isCollapsed ? t('sidebar.logout') : undefined}
        >
          <MaterialIcon name='logout' className='text-[22px] shrink-0' />
          {!isCollapsed && <span className='text-sm'>{t('sidebar.logout')}</span>}
        </button>
      </div>
    </aside>
  )
}