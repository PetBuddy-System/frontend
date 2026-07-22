import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const SERVICES = [
  {
    key: 'bath',
    imageUrl: 'https://doraemonpet.com/wp-content/uploads/2022/06/ky-nang-tam-cho-thu-cung.jpg',
    icon: 'check_circle'
  },
  {
    key: 'grooming',
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE_KwfRak8vRXOov9hzKdGncHAqdcEf215L8zcIfo-7ofKzuTbBWvhZok&s=10',
    icon: 'check_circle'
  }
] as const

export function LandingServices() {
  const { t } = useTranslation('landing')

  return (
    <section id='services' className='py-16 md:py-20'>
      <div className='mx-auto w-full max-w-6xl px-4 md:px-6'>
        <div className='mb-10 text-center'>
          <h2 className='text-2xl font-bold text-primary md:text-3xl font-display'>{t('services.title')}</h2>
          <p className='mt-3 text-sm text-muted-foreground md:text-base'>{t('services.subtitle')}</p>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {SERVICES.map((service) => (
            <article
              key={service.key}
              className='flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md'
            >
              <div className='h-60 w-full overflow-hidden bg-muted'>
                <img
                  src={service.imageUrl}
                  alt={t(`services.items.${service.key}.imageAlt`)}
                  className='h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]'
                />
              </div>
              <div className='flex flex-1 flex-col p-6'>
                <h3 className='text-xl font-semibold text-card-foreground font-display'>
                  {t(`services.items.${service.key}.title`)}
                </h3>
                <p className='mt-2 text-sm text-muted-foreground'>{t(`services.items.${service.key}.description`)}</p>
                <ul className='mt-5 space-y-2 text-sm text-muted-foreground'>
                  {(
                    t(`services.items.${service.key}.bullets`, {
                      returnObjects: true
                    }) as string[]
                  ).map((bullet) => (
                    <li key={bullet} className='flex items-center gap-2'>
                      <MaterialIcon name={service.icon} className='text-primary text-[20px]' />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <button
                  type='button'
                  className='mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-brand-zalo bg-brand-zalo px-4 py-3 text-sm font-semibold text-brand-zalo-foreground transition-colors hover:opacity-90'
                >
                  {t('services.cta')}
                  <MaterialIcon name='chat' className='text-[20px]' />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
