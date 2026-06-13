import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const PROFILE_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBYPki0QBRVMSU_gWuywGYHn2MGY0cy3c-I4AAJ1_AGgnsJhDdnUw4dxmNLwCruTAGeNIlHm_hINFhjIHPh_xLPeWBEkHAY9W3t97tqqozH0jF0ksRy6LmXQuVxlAph8P4-UpAphk1wILD996LWc4UhSdrZasTcPSzgFTGdqusfTOZY73gIJMLsF51IhPqG41XlPiHaolRIBOrT5HUwMwS6M80kSFL6PJwyJMATjUpg9fHXI58YLmNXqBV78v1g6YrkqOFUGOvXWJg'

export interface ProfilePageHeaderProps {
  titleKey?: string
  subtitleKey?: string
}

export function ProfilePageHeader({ titleKey = 'header.title', subtitleKey }: ProfilePageHeaderProps) {
  const { t } = useTranslation('profile')

  return (
    <header className='flex h-20 shrink-0 items-center justify-between border-b border-border bg-card px-4 shadow-sm md:px-8'>
      <div className='flex items-center gap-3'>
        <button
          type='button'
          aria-label={t('header.menu')}
          className='rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary md:hidden'
        >
          <MaterialIcon name='menu' />
        </button>
        <div>
          <p className='font-display text-xl font-bold text-primary md:text-2xl'>{t(titleKey)}</p>
          {subtitleKey && subtitleKey !== '' ? (
            <p className='hidden text-sm text-muted-foreground sm:block'>{t(subtitleKey)}</p>
          ) : null}
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <button
          type='button'
          aria-label={t('header.notifications')}
          className='relative rounded-full p-3 text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
        >
          <MaterialIcon name='notifications' />
          <span className='absolute right-3 top-3 h-2 w-2 rounded-full bg-destructive' />
        </button>
        <a
          href='/cart'
          aria-label={t('header.cart')}
          className='rounded-full p-3 text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
        >
          <MaterialIcon name='shopping_cart' />
        </a>

        <div className='mx-1 h-8 w-px bg-border' />

        <div className='flex items-center gap-3'>
          <div className='hidden text-right sm:block'>
            <p className='text-sm font-semibold'>{t('user.name')}</p>
            <p className='text-xs text-muted-foreground'>{t('user.tier')}</p>
          </div>
          <img
            src={PROFILE_AVATAR_URL}
            alt={t('user.avatarAlt')}
            className='h-10 w-10 rounded-full border-2 border-primary object-cover'
          />
        </div>
      </div>
    </header>
  )
}
