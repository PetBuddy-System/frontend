import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { useSidebar } from '~/providers/sidebar-provider'
import { useAuth } from '~/providers/auth-provider'
import { MobileSidebarDrawer } from '~/shared/components'

const MAIN_NAV = [
  { key: 'profile', icon: 'person', href: '/profile' },
  { key: 'pets', icon: 'pets', href: '/profile/pets' },
  { key: 'orders', icon: 'shopping_bag', href: '/profile/orders' },
  { key: 'services', icon: 'calendar_today', href: '/my-bookings' },
  { key: 'returns', icon: 'assignment_return', href: '/profile/returns' },
  { key: 'addresses', icon: 'location_on', href: '#' }
] as const

export type ProfileSidebarItem = (typeof MAIN_NAV)[number]['key']

export interface ProfileSidebarProps {
  activeItem?: ProfileSidebarItem
}

export function ProfileSidebar({ activeItem = 'profile' }: ProfileSidebarProps) {
  const { t } = useTranslation('profile')
  const { isCollapsed, toggleSidebar, closeMobileSidebar } = useSidebar()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    void navigate('/')
  }

  const renderNavItems = (closeHandler?: () => void) =>
    MAIN_NAV.map((item) => (
      <a
        key={item.key}
        href={item.href}
        onClick={closeHandler}
        className={cn(
          'flex items-center rounded-xl text-sm font-semibold transition-colors active:scale-95',
          isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5',
          activeItem === item.key ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-card'
        )}
        title={isCollapsed ? t(`sidebar.nav.${item.key}`) : undefined}
      >
        <MaterialIcon name={item.icon} className='text-[22px] shrink-0' />
        {!isCollapsed && t(`sidebar.nav.${item.key}`)}
      </a>
    ))

  const renderLogoutButton = (closeHandler?: () => void) => (
    <button
      type='button'
      onClick={async () => {
        closeHandler?.()
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
  )

  const sidebarLogo = (
    <a href='/' className='transition-opacity hover:opacity-85'>
      <img
        src='/petbuddy-logo-cropped.png'
        alt={t('brand.logoAlt')}
        className={cn('w-auto object-contain', isCollapsed ? 'h-9 max-w-10' : 'h-11 max-w-[7rem]')}
      />
    </a>
  )

  return (
    <>
      <MobileSidebarDrawer>
        <div className='flex items-center justify-between border-b border-border px-3 py-3'>
          {sidebarLogo}
          <button
            type='button'
            onClick={closeMobileSidebar}
            aria-label={t('sidebar.close')}
            className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-card active:scale-95'
          >
            <MaterialIcon name='close' className='text-[20px]' />
          </button>
        </div>
        <div className='mb-auto flex flex-col gap-2 p-3'>
          <nav className='flex flex-col gap-1'>{renderNavItems(closeMobileSidebar)}</nav>
        </div>
        <div className='flex flex-col gap-1 border-t border-border p-3'>{renderLogoutButton()}</div>
      </MobileSidebarDrawer>

      <aside
        className={cn(
          'hidden h-screen shrink-0 flex-col gap-2 overflow-y-auto border-r border-border bg-muted shadow-sm transition-all duration-300 lg:flex',
          isCollapsed ? 'w-[4.5rem] p-2' : 'w-60 p-3'
        )}
      >
        <div className={cn('mb-5 flex items-center justify-between', isCollapsed ? 'justify-center' : 'px-3')}>
          {sidebarLogo}
          <button
            type='button'
            onClick={toggleSidebar}
            className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-card active:scale-95'
            aria-label='Toggle Sidebar'
          >
            <MaterialIcon name={isCollapsed ? 'menu' : 'menu_open'} className='text-[20px]' />
          </button>
        </div>

        <div className='mb-auto flex flex-col gap-2'>
          <nav className='flex flex-col gap-1'>{renderNavItems()}</nav>
        </div>

        <div className='flex flex-col gap-1 border-t border-border pt-4'>{renderLogoutButton()}</div>
      </aside>
    </>
  )
}
