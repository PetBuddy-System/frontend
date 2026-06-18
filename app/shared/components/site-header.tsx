import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuth } from '~/providers/auth-provider'
import { getDashboardPathByRole } from '~/shared/lib/auth'
import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const NAV_ITEMS = [
  { key: 'store', href: '/' },
  { key: 'services', href: '/services' },
  { key: 'products', href: '/products' },
  { key: 'blog', href: '/blog' },
  { key: 'contact', href: '/contact' }
] as const

type SiteHeaderNavKey = (typeof NAV_ITEMS)[number]['key']

export interface SiteHeaderProps {
  activeItem?: SiteHeaderNavKey
}

/**
 * Trích chữ cái đầu từ fullName để hiển thị avatar initials.
 * Ví dụ: "Nguyễn Văn An" → "NA", "John" → "J"
 */
function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function SiteHeader({ activeItem = 'store' }: SiteHeaderProps) {
  const { t } = useTranslation('landing')
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  async function handleLogout() {
    setIsMenuOpen(false)
    await logout()
    window.location.href = '/'
  }

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

          {/* ─── Auth state: loading → skeleton, logged in → avatar, guest → login/register ─── */}
          {isLoading ? (
            /* Skeleton placeholder — tránh nhấp nháy layout khi đang đọc localStorage */
            <div className='h-9 w-9 animate-pulse rounded-full bg-muted' />
          ) : isAuthenticated && user ? (
            /* ── Đã đăng nhập: hiển thị avatar + dropdown ── */
            <div className='relative' ref={menuRef}>
              <button
                type='button'
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className='flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-muted'
                aria-label={t('actions.account')}
                aria-expanded={isMenuOpen}
              >
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground'>
                  {getInitials(user.fullName)}
                </div>
                <span className='hidden max-w-[120px] truncate text-sm font-semibold text-foreground md:block'>
                  {user.fullName}
                </span>
                <MaterialIcon
                  name='expand_more'
                  className={cn('hidden text-[18px] text-muted-foreground transition-transform md:block', isMenuOpen && 'rotate-180')}
                />
              </button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <div className='absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg'>
                  {/* User info */}
                  <div className='border-b border-border px-4 py-3'>
                    <p className='truncate text-sm font-semibold text-foreground'>{user.fullName}</p>
                    <p className='truncate text-xs text-muted-foreground'>{user.email}</p>
                  </div>

                  {/* Menu items */}
                  <div className='py-1'>
                    <a
                      href={getDashboardPathByRole(user.role)}
                      className='flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted'
                    >
                      <MaterialIcon name='person' className='text-[18px] text-muted-foreground' />
                      {t('actions.profile')}
                    </a>
                    <button
                      type='button'
                      onClick={handleLogout}
                      className='flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10'
                    >
                      <MaterialIcon name='logout' className='text-[18px]' />
                      {t('actions.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Chưa đăng nhập: icon placeholder + nút login/register ── */
            <>
              <a
                href='/login'
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
            </>
          )}

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
