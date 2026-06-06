import { useTranslation } from 'react-i18next'

import { useSidebar } from '~/providers/sidebar-provider'
import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const ADMIN_NAV_ITEMS = [
  { icon: 'assessment', key: 'reports', href: '/admin/dashboard' },
  { icon: 'badge', key: 'employees', href: '/admin/employees' },
  { icon: 'medical_services', key: 'services', href: '/admin/services' },
  { icon: 'event_note', key: 'serviceBookings', href: '/admin/service-bookings' },
  { icon: 'group', key: 'users', href: '/admin/users' },
  { icon: 'inventory_2', key: 'inventory', href: '/admin/products' },
  { icon: 'confirmation_number', key: 'vouchers', href: '/admin/vouchers' }
] as const

export type AdminNavKey = (typeof ADMIN_NAV_ITEMS)[number]['key']

export interface AdminSidebarProps {
  activeItem?: AdminNavKey
}

export function AdminSidebar({ activeItem = 'reports' }: AdminSidebarProps) {
  const { t } = useTranslation('admin')
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
          isCollapsed ? 'justify-center' : 'justify-between'
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
          className={cn(
            'rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary active:scale-95',
            isCollapsed && 'mt-2'
          )}
        >
          <MaterialIcon name={isCollapsed ? 'menu' : 'menu_open'} className='text-[20px]' />
        </button>
      </div>

      <nav className='min-h-0 flex-1 space-y-1 overflow-y-auto p-3'>
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = item.key === activeItem

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
        <div className={cn('flex items-center rounded-xl bg-muted p-3', isCollapsed ? 'justify-center' : 'gap-3')}>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground'>
            <MaterialIcon name='admin_panel_settings' filled />
          </div>
          {!isCollapsed && (
            <div className='min-w-0'>
              <p className='truncate font-display font-bold'>{t('admin.name')}</p>
              <p className='text-sm text-muted-foreground'>{t('admin.role')}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
