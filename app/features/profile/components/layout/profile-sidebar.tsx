import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { useSidebar } from '~/providers/sidebar-provider'

const AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBYPki0QBRVMSU_gWuywGYHn2MGY0cy3c-I4AAJ1_AGgnsJhDdnUw4dxmNLwCruTAGeNIlHm_hINFhjIHPh_xLPeWBEkHAY9W3t97tqqozH0jF0ksRy6LmXQuVxlAph8P4-UpAphk1wILD996LWc4UhSdrZasTcPSzgFTGdqusfTOZY73gIJMLsF51IhPqG41XlPiHaolRIBOrT5HUwMwS6M80kSFL6PJwyJMATjUpg9fHXI58YLmNXqBV78v1g6YrkqOFUGOvXWJg'

const MAIN_NAV = [
  { key: 'profile', icon: 'person', href: '/profile' },
  { key: 'tracking', icon: 'local_shipping', href: '/profile/tracking' },
  { key: 'orders', icon: 'shopping_bag', href: '/profile/orders' },
  { key: 'services', icon: 'calendar_today', href: '/profile/services' },
  { key: 'returns', icon: 'assignment_return', href: '/profile/returns' },
  { key: 'addresses', icon: 'location_on', href: '#' }
] as const

const UTILITY_NAV = [
  { key: 'zalo', icon: 'chat', href: '#', brand: true },
  { key: 'home', icon: 'home', href: '/', brand: false }
] as const

export type ProfileSidebarItem = (typeof MAIN_NAV)[number]['key']

export interface ProfileSidebarProps {
  activeItem?: ProfileSidebarItem
}

export function ProfileSidebar({ activeItem = 'profile' }: ProfileSidebarProps) {
  const { t } = useTranslation('profile')
  const { isCollapsed, toggleSidebar } = useSidebar()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 hidden h-full flex-col gap-2 overflow-y-auto border-r border-border bg-muted shadow-sm lg:flex transition-all duration-300',
        isCollapsed ? 'w-20 p-2' : 'w-64 p-4'
      )}
    >
      <div className={cn('mb-8 flex items-center justify-between', isCollapsed ? 'justify-center' : 'px-4')}>
        {!isCollapsed ? (
          <a href='/' className='flex items-center gap-3 transition-opacity hover:opacity-85'>
            <img
              src='/petbuddy-logo-cropped.png'
              alt={t('brand.logoAlt')}
              className='h-10 w-10 rounded-xl object-contain'
            />
            <span className='font-display text-2xl font-bold text-primary shrink-0'>{t('brand.name')}</span>
          </a>
        ) : (
          <a href='/' className='transition-opacity hover:opacity-85'>
            <img
              src='/petbuddy-logo-cropped.png'
              alt={t('brand.logoAlt')}
              className='h-10 w-10 rounded-xl object-contain'
            />
          </a>
        )}
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
        <div
          className={cn(
            'mb-4 flex items-center rounded-xl bg-card transition-all',
            isCollapsed ? 'justify-center p-2' : 'gap-3 px-4 py-4'
          )}
        >
          <img src={AVATAR_URL} alt={t('user.avatarAlt')} className='h-10 w-10 rounded-full object-cover shrink-0' />
          {!isCollapsed && (
            <div className='min-w-0'>
              <p className='text-sm font-bold text-foreground truncate'>{t('user.name')}</p>
              <p className='text-xs text-muted-foreground truncate'>{t('user.tier')}</p>
            </div>
          )}
        </div>

        <nav className='flex flex-col gap-1'>
          {MAIN_NAV.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={cn(
                'flex items-center rounded-xl text-sm font-semibold transition-colors active:scale-95',
                isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                activeItem === item.key
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-card'
              )}
              title={isCollapsed ? t(`sidebar.nav.${item.key}`) : undefined}
            >
              <MaterialIcon name={item.icon} className='text-[22px] shrink-0' />
              {!isCollapsed && t(`sidebar.nav.${item.key}`)}
            </a>
          ))}
        </nav>
      </div>

      <div className='flex flex-col gap-1 border-t border-border pt-4'>
        {UTILITY_NAV.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={cn(
              'flex items-center rounded-xl text-sm font-semibold text-muted-foreground transition-colors hover:bg-card',
              isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'
            )}
            title={isCollapsed ? t(`sidebar.utility.${item.key}`) : undefined}
          >
            <MaterialIcon name={item.icon} className='text-[22px] shrink-0' />
            {!isCollapsed && (
              <span className={item.brand ? 'text-brand-zalo' : undefined}>{t(`sidebar.utility.${item.key}`)}</span>
            )}
          </a>
        ))}
        <button
          type='button'
          className={cn(
            'mt-4 flex items-center font-bold text-destructive transition-colors hover:bg-destructive/10 rounded-xl',
            isCollapsed ? 'justify-center p-3 w-full' : 'gap-2 px-4 py-3'
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
