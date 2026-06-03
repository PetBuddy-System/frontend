import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const SERVICES = [
  {
    key: 'bath',
    imageUrl:
      'https://lh3.googleusercontent.com/aida/ADBb0uh52RpcFbu1XGzWt7elY-_58td2OhVfTmJh7LrRteHmc7uwKetPvOEQYDoS7OwztP6YTZtCOVikIAiZ74QZc4aYbjnup-Jb7Z0ot7BHxKGOm2JLSNN73tAEWmsmSPeEOIHsM1-cGQWU2BnDqCvDSzw9BY2EvQ-A0dX0wdhSX1Pf3atW3rlDz5lNfQDa4MqtC9Qbw_FOgzvcFChIHhtQax0MnmPcHQLb0wadnEtWz1AblgvqLJo5Es2CFis',
    icon: 'check_circle'
  },
  {
    key: 'grooming',
    imageUrl:
      'https://lh3.googleusercontent.com/aida/ADBb0uh3wgasCrbK6RWyyFdBl3Vk9NGk2259m89iqpjaYeqV50wwuRrd5JcRRDYIPAu_CqNSIy4Lu92ruyLpc_qsIXKIEdsrPGz6JeOkSDgEh9NYDzhAWfFotrBDyhIdtKBxNchthaY5oubrsZtfsh0rL2XDT3LlbH9aVASGBDlXewJiduCKzOO6LkXKDBkJ9303qpl-LS4NSsSftWNa6J-tXxz9pUc2aS2X1m2Y02VBgdrF-kCqH7MtnD1Gcoc',
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
