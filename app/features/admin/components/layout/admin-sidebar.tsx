import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const ADMIN_NAV_ITEMS = [
  { icon: 'badge', key: 'employees', href: '/admin/employees' },
  { icon: 'medical_services', key: 'services', href: '/admin/service-bookings' },
  { icon: 'group', key: 'users', href: '/admin/users' },
  { icon: 'inventory_2', key: 'inventory', href: '#' },
  { icon: 'assessment', key: 'reports', href: '/admin/dashboard' }
] as const

export type AdminNavKey = (typeof ADMIN_NAV_ITEMS)[number]['key']

export interface AdminSidebarProps {
  activeItem?: AdminNavKey
}

export function AdminSidebar({ activeItem = 'reports' }: AdminSidebarProps) {
  const { t } = useTranslation('admin')

  return (
    <aside className='hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-card md:flex'>
      <a href='/' className='flex items-center gap-3 border-b border-border p-6 transition-opacity hover:opacity-85'>
        <img
          src='/petbuddy-logo-cropped.png'
          alt={t('sidebar.logoAlt')}
          className='h-12 w-12 rounded-xl object-contain shadow-sm'
        />
        <div>
          <p className='font-display text-xl font-bold text-primary'>{t('sidebar.brand')}</p>
          <p className='text-sm text-muted-foreground'>{t('sidebar.branch')}</p>
        </div>
      </a>

      <nav className='flex-1 space-y-2 p-4'>
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = item.key === activeItem

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
        <div className='flex items-center gap-3 rounded-xl bg-muted p-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground'>
            <MaterialIcon name='admin_panel_settings' filled />
          </div>
          <div className='min-w-0'>
            <p className='truncate font-display font-bold'>{t('admin.name')}</p>
            <p className='text-sm text-muted-foreground'>{t('admin.role')}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
