import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const MANAGER_NAV_ITEMS = [
  { icon: 'gpp_maybe', key: 'risk', href: '#' },
  { icon: 'inventory_2', key: 'inventory', href: '/manager/dashboard' },
  { icon: 'groups', key: 'staff', href: '/manager/staff-schedule' },
  { icon: 'assessment', key: 'reports', href: '#' }
] as const

export type ManagerNavKey = (typeof MANAGER_NAV_ITEMS)[number]['key']

export interface ManagerSidebarProps {
  activeItem?: ManagerNavKey
}

export function ManagerSidebar({ activeItem = 'inventory' }: ManagerSidebarProps) {
  const { t } = useTranslation('manager')

  return (
    <aside className='hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-card px-4 py-6 shadow-sm md:flex'>
      <a href='/' className='mb-6 flex items-center gap-3 px-3 transition-opacity hover:opacity-85'>
        <img
          src='/petbuddy-logo-cropped.png'
          alt={t('sidebar.logoAlt')}
          className='h-11 w-11 rounded-xl object-contain'
        />
        <div>
          <p className='font-display text-xl font-bold text-primary'>{t('sidebar.brand')}</p>
          <p className='text-sm text-muted-foreground'>{t('sidebar.branch')}</p>
        </div>
      </a>

      <button className='mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 text-sm font-semibold text-secondary-foreground shadow-sm transition-opacity hover:opacity-90'>
        <MaterialIcon name='add' className='text-lg' />
        <span>{t('sidebar.newReport')}</span>
      </button>

      <nav className='flex flex-1 flex-col gap-1'>
        {MANAGER_NAV_ITEMS.map((item) => {
          const isActive = item.key === activeItem

          return (
            <a
              key={item.key}
              href={item.href}
              className={
                isActive
                  ? 'flex items-center gap-3 rounded-lg bg-secondary px-4 py-3 font-bold text-secondary-foreground shadow-sm'
                  : 'flex items-center gap-3 rounded-lg px-4 py-3 font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
              }
            >
              <MaterialIcon name={item.icon} filled={isActive} className='text-xl' />
              <span>{t(`sidebar.nav.${item.key}`)}</span>
            </a>
          )
        })}
      </nav>

      <div className='my-4 h-px bg-border' />
      <nav className='flex flex-col gap-1'>
        <a
          className='flex items-center gap-3 rounded-lg px-4 py-3 font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
          href='#'
        >
          <MaterialIcon name='help' className='text-xl' />
          <span>{t('sidebar.help')}</span>
        </a>
        <a
          className='flex items-center gap-3 rounded-lg px-4 py-3 font-semibold text-destructive transition-colors hover:bg-muted'
          href='#'
        >
          <MaterialIcon name='logout' className='text-xl' />
          <span>{t('sidebar.logout')}</span>
        </a>
      </nav>
    </aside>
  )
}
