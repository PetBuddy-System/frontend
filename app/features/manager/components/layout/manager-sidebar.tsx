import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { useSidebar } from '~/providers/sidebar-provider'
import { useAuth } from '~/providers/auth-provider'
import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const MANAGER_NAV_ITEMS = [
  { icon: 'dashboard', key: 'dashboard', href: '/manager/dashboard' },
  { icon: 'inventory_2', key: 'inventory', href: '/manager/inventory-transactions' },
  { icon: 'groups', key: 'staff', href: '/manager/staff-schedule' },
  { icon: 'assignment_turned_in', key: 'returnRequests', href: '/manager/return-requests' },
  { icon: 'delete_sweep', key: 'disposalApprovals', href: '/manager/disposal-approvals' }
] as const

export type ManagerNavKey = (typeof MANAGER_NAV_ITEMS)[number]['key']

export interface ManagerSidebarProps {
  activeItem?: ManagerNavKey
}

export function ManagerSidebar({ activeItem = 'inventory' }: ManagerSidebarProps) {
  const { t } = useTranslation('manager')
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside
      className={cn(
        'hidden h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-card px-3 py-4 shadow-sm transition-all duration-300 md:flex',
        isCollapsed ? 'w-[4.5rem]' : 'w-60'
      )}
    >
      <div className={cn('mb-4 flex shrink-0 items-center px-1', isCollapsed ? 'flex-col gap-2' : 'justify-between')}>
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

      <nav className='flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto'>
        {MANAGER_NAV_ITEMS.map((item) => {
          const isActive = item.key === activeItem

          return (
            <a
              key={item.key}
              href={item.href}
              title={isCollapsed ? t(`sidebar.nav.${item.key}`) : undefined}
              className={cn(
                'flex items-center rounded-lg font-semibold transition-colors',
                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5',
                isActive
                  ? 'bg-secondary font-bold text-secondary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-primary'
              )}
            >
              <MaterialIcon name={item.icon} filled={isActive} className='text-xl' />
              {!isCollapsed && <span>{t(`sidebar.nav.${item.key}`)}</span>}
            </a>
          )
        })}
      </nav>

      <div className='my-3 h-px shrink-0 bg-border' />
      <nav className='flex shrink-0 flex-col gap-1'>
        <button
          type='button'
          onClick={async () => {
            await logout()
            void navigate('/')
          }}
          className={cn(
            'flex items-center rounded-xl font-bold text-destructive transition-colors hover:bg-destructive/10',
            isCollapsed ? 'w-full justify-center p-2.5' : 'gap-2 px-3.5 py-2.5'
          )}
          title={isCollapsed ? t('sidebar.logout') : undefined}
        >
          <MaterialIcon name='logout' className='text-[22px] shrink-0' />
          {!isCollapsed && <span className='text-sm'>{t('sidebar.logout')}</span>}
        </button>
      </nav>
    </aside>
  )
}
