import { useTranslation } from 'react-i18next'

const HERO_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida/ADBb0ujUvir-U55of6tVY0VW1LwtFXFqdWHuMZdvuqGCJND60tGofrdom0jryqqOxwNmetAJoWLOMCJ8GbVNf4BxLspLTLJgwb1J5lEPgHyuXO6PTlISGrz38VxFRIevyyu9tq8jzKknoOTrFhIPHZQAjFLwDYFYyENB00TJTQgEdmgZq9-zWaZVnyV2wurkRN5WmMnzTjNNWpNLwai_P_TPOeZaLbpyvReGVF_unr932Yw2djPMaTBXW3r__A'

export function LandingHero() {
  const { t } = useTranslation('landing')

  return (
    <section
      id='hero'
      className='relative flex min-h-[420px] items-center justify-center overflow-hidden bg-muted md:min-h-[600px]'
    >
      <div
        className='absolute inset-0 bg-cover bg-center'
        style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}
        aria-hidden
      />
      <div className='absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent' aria-hidden />
      <div className='relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 md:px-6'>
        <h1 className='max-w-2xl text-3xl font-bold text-primary-foreground md:text-5xl font-display'>
          {t('hero.title')}
        </h1>
        <p className='max-w-xl text-base text-primary-foreground/90 md:text-lg'>{t('hero.subtitle')}</p>
        <button
          type='button'
          className='rounded-full bg-tertiary px-6 py-3 text-sm font-semibold text-tertiary-foreground shadow-md transition-transform hover:scale-[1.02]'
        >
          {t('hero.cta')}
        </button>
      </div>
    </section>
  )
}
