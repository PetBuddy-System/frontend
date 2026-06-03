import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import happydog from '../../assets/happy-dog-training-03.png'
import dogTrust from '../../assets/dogTrust.png'

const TRUST_ITEMS = [
  { key: 'love', icon: 'favorite' },
  { key: 'authentic', icon: 'verified' },
  { key: 'support', icon: 'support_agent' }
] as const

export function LandingTrust() {
  const { t } = useTranslation('landing')

  return (
    <section id='trust' className='py-16 md:py-20'>
      <div className='mx-auto w-full max-w-6xl px-4 md:px-6'>
        <div className='grid items-center gap-12 md:grid-cols-2'>
          <div>
            <h2 className='text-2xl font-bold text-primary md:text-3xl font-display'>{t('trust.title')}</h2>
            <div className='mt-8 space-y-6'>
              {TRUST_ITEMS.map((item) => (
                <div key={item.key} className='flex gap-4'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground'>
                    <MaterialIcon name={item.icon} className='text-[22px]' />
                  </div>
                  <div>
                    <h3 className='text-base font-semibold text-foreground'>{t(`trust.items.${item.key}.title`)}</h3>
                    <p className='mt-1 text-sm text-muted-foreground'>{t(`trust.items.${item.key}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className='overflow-hidden rounded-2xl border border-border/60 shadow-sm'>
            <img src={happydog} alt={t('images.trustAlt')} className='h-full w-full object-cover' />
          </div>
        </div>

        <div className='mt-16 grid items-center gap-12 md:grid-cols-2'>
          <div className='order-2 overflow-hidden rounded-2xl border border-border/60 shadow-sm md:order-1'>
            <img src={dogTrust} alt={t('images.teamAlt')} className='h-full w-full object-cover' />
          </div>
          <div className='order-1 md:order-2'>
            <h2 className='text-2xl font-bold text-primary md:text-3xl font-display'>{t('team.title')}</h2>
            <p className='mt-4 text-sm text-muted-foreground md:text-base'>{t('team.description')}</p>
            <button
              type='button'
              className='mt-6 rounded-full border-2 border-primary px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
            >
              {t('team.cta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
