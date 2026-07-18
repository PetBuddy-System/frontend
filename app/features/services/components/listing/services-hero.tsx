import { useTranslation } from 'react-i18next'
import serviceHero from '../../assets/serviceHero.png'
import { MaterialIcon } from '~/shared/ui'

export function ServicesHero() {
  const { t } = useTranslation('services')

  return (
    <section className='relative flex min-h-[420px] items-center overflow-hidden bg-muted md:min-h-[600px]'>
      <div className='absolute inset-0 bg-cover bg-center opacity-80' style={{ backgroundImage: `url(${serviceHero})` }} role='img' aria-label={t('hero.title')} />
      <div className='absolute inset-0 bg-black/40' aria-hidden />
      <div className='relative z-10 mx-auto w-full max-w-6xl px-4 md:px-6'>
        <div className='w-full md:w-1/2'>
          <h1 className='font-display text-3xl font-bold text-white md:text-5xl'>{t('hero.title')}</h1>
          <p className='mt-4 max-w-md text-base text-white/80 md:text-lg'>{t('hero.subtitle')}</p>
          <a
            href='/booking'
            className='mt-8 flex w-max items-center gap-2 rounded-full bg-secondary px-8 py-4 text-sm font-semibold text-secondary-foreground shadow-lg transition-colors hover:opacity-90'
          >
             <MaterialIcon name='calendar_month' className='text-[20px]' />
             {t('hero.cta')}
          </a>
        </div>
      </div>
    </section>
  )
}
