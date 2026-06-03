import { useTranslation } from 'react-i18next'

const CONTACT_HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA66VRl0ghh0KnU3VCP73CaE-bCoKIAu2_Cp-ZpjUVj3hQtLbTe7rn5Sm1vU0ZW8-vTK8LlSlGdNS9RAo6TMZV5ffEPLba5iQ-bGJZMXm1qcnr7Zgq9UYkstskZ-XLiNO605DwUNVW5Z5ON6KTGdylLQum1GB8jIW3WKEtmlpvZTD7NdWUBRmyyKNRVw2g8iSJaz3qAJsxcebLX5Xjz4aQIsCNMYGa7FfzF4u3EP2wFkUFwiQq9cRozSWsdTpX05PnYkYih1i8ObWw'

export function ContactHero() {
  const { t } = useTranslation('landing')

  return (
    <section className='relative flex min-h-[420px] items-center overflow-hidden bg-muted md:min-h-[600px]'>
      <img
        src={CONTACT_HERO_IMAGE}
        alt={t('contact.hero.imageAlt')}
        className='absolute inset-0 h-full w-full object-cover'
      />
      <div className='absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent' aria-hidden />
      <div className='relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-16 md:px-6'>
        <h1 className='max-w-2xl text-4xl font-bold tracking-normal text-primary-foreground md:text-5xl'>
          {t('contact.hero.title')}
        </h1>
        <p className='max-w-xl text-lg leading-8 text-primary-foreground/90'>{t('contact.hero.subtitle')}</p>
      </div>
    </section>
  )
}
