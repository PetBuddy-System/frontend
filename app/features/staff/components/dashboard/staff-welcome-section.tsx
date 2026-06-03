import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function StaffWelcomeSection() {
  const { t } = useTranslation('staff')

  return (
    <section className='overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-lg'>
      <div className='relative p-5 md:p-6'>
        <div className='absolute right-6 top-4 hidden opacity-15 md:block'>
          <MaterialIcon name='pets' filled className='text-9xl' />
        </div>
        <div className='relative max-w-2xl'>
          <p className='mb-2 text-sm font-semibold uppercase tracking-wide text-primary-foreground/80'>
            {t('welcome.kicker')}
          </p>
          <h1 className='font-display text-2xl font-bold md:text-3xl'>{t('welcome.title')}</h1>
          <p className='mt-3 text-lg text-primary-foreground/85'>{t('welcome.subtitle')}</p>
          <button className='mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-3 font-display font-bold text-secondary-foreground shadow-md transition-transform active:scale-95'>
            <MaterialIcon name='fingerprint' />
            {t('welcome.checkIn')}
          </button>
        </div>
      </div>
    </section>
  )
}
