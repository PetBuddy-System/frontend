import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const NAV_ITEMS = [
  { key: 'store', href: '/' },
  { key: 'services', href: '/services' },
  { key: 'products', href: '/products' },
  { key: 'blog', href: '/' },
  { key: 'contact', href: '/contact' }
] as const

type SiteHeaderNavKey = (typeof NAV_ITEMS)[number]['key']

export interface SiteHeaderProps {
  activeItem?: SiteHeaderNavKey
}

export function SiteHeader({ activeItem = 'store' }: SiteHeaderProps) {
  const { t } = useTranslation('landing')

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 shadow-sm backdrop-blur'>
      <div className='mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6'>
        <a className='flex items-center gap-3' href='/'>
          <img
            src='/petbuddy-logo-cropped.png'
            alt={t('brand.logoAlt')}
            className='h-auto w-30 object-contain md:w-30'
          />
          <span className='sr-only'>{t('brand.name')}</span>
        </a>

        <nav className='hidden items-center gap-4 md:flex'>
          {NAV_ITEMS.map((navItem) => (
            <a
              key={navItem.key}
              href={navItem.href}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                navItem.key === activeItem
                  ? 'text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {t(`nav.${navItem.key}`)}
            </a>
          ))}
        </nav>

        <div className='flex items-center gap-2 text-primary'>
          <a href='/cart' aria-label={t('actions.cart')} className='rounded-full p-2 transition-colors hover:bg-muted'>
            <MaterialIcon name='shopping_cart' className='text-[22px]' />
          </a>
          <a
            href='/profile'
            aria-label={t('actions.account')}
            className='rounded-full p-2 transition-colors hover:bg-muted'
          >
            <MaterialIcon name='account_circle' className='text-[22px]' />
          </a>
          <div className='hidden items-center gap-2 md:flex'>
            <a
              href='/login'
              className='rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
            >
              {t('actions.login')}
            </a>
            <a
              href='/register'
              className='rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90'
            >
              {t('actions.register')}
            </a>
          </div>
          <button
            type='button'
            aria-label={t('actions.menu')}
            className='rounded-full p-2 transition-colors hover:bg-muted md:hidden'
          >
            <MaterialIcon name='menu' className='text-[22px]' />
          </button>
        </div>
      </div>
    </header>
  )
}
