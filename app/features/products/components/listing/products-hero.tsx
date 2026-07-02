import { useTranslation } from 'react-i18next'
import cat from '../../assets/hinh-nen-meo.png'

export function ProductsHero() {
  const { t } = useTranslation('products')

  return (
    <section className='relative flex min-h-[420px] items-center overflow-hidden bg-muted md:min-h-[600px]'>
      <div className='absolute inset-0 bg-cover bg-center opacity-80' style={{ backgroundImage: `url(${cat})` }} aria-hidden />
      <div className='absolute inset-0 bg-black/40' aria-hidden />
      <div className='relative z-10 mx-auto w-full max-w-6xl px-4 md:px-6'>
        <div className='max-w-lg'>
          <h1 className='text-3xl font-bold text-white md:text-4xl font-display'>{t('hero.title')}</h1>
          <p className='mt-3 text-sm text-white/80 md:text-base'>{t('hero.subtitle')}</p>
        </div>
      </div>
    </section>
  )
}
