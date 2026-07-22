import { useTranslation } from 'react-i18next'
import contactHero from '../../assets/corgi_800x450.png'
export function ContactHero() {
  const { t } = useTranslation('landing')

  return (
    <section className='relative flex min-h-[420px] items-center overflow-hidden bg-muted md:min-h-[600px]'>
      <img src={contactHero} alt={t('contact.hero.imageAlt')} className='absolute inset-0 h-full w-full object-cover' />
      <div className='absolute inset-0 bg-black/40' aria-hidden />
      <div className='relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-16 md:px-6'>
        <h1 className='max-w-2xl text-4xl font-bold tracking-normal text-white md:text-5xl'>
          {t('contact.hero.title')}
        </h1>
        <p className='max-w-xl text-lg leading-8 text-white/80'>{t('contact.hero.subtitle')}</p>
      </div>
    </section>
  )
}
