import { useTranslation } from 'react-i18next'
import blogHero from '../../assets/blogHero2.png'
export function BlogHero() {
  const { t } = useTranslation('blog')

  return (
    <section className='relative flex min-h-[320px] items-center justify-center overflow-hidden bg-muted md:min-h-[440px]'>
      <img src={blogHero} alt={t('hero.title')} className='absolute inset-0 h-full w-full object-cover' />
      <div className='absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent' aria-hidden />
      <div className='relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center md:px-6'>
        <span className='inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary'>
          Pet Blog
        </span>
        <h1 className='font-display text-3xl font-bold text-foreground md:text-5xl'>{t('hero.title')}</h1>
        <p className='max-w-xl text-base text-muted-foreground md:text-lg'>{t('hero.subtitle')}</p>
      </div>
    </section>
  )
}
