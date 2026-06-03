import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const PRODUCTS = [
  {
    key: 'royalCanin',
    imageUrl:
      'https://lh3.googleusercontent.com/aida/ADBb0ugHETrMQc_4-Nif1lEEpK4pxufsQe-rAJQyrjvuPQoQMMHM2CrbUXJH9PoYKxL65tBhJRY_NQ-LkxTRlsqYY6dY6nesA5tYkzDIsG-fsrNZVNrMdxNI10lYYTUmgSeYvOhbeBraGZHb84VTucGzYDk8owiPRLlNg_Ji_7Pm-vQ-MmSAKsR4E1nzkWyXwa_ud5S4NitoZ3OBCcDDXbMgtP3FKMDXZ8c9acm8yxjUw8q32nDMPTnEsT8hxg',
    badge: 'products.badgeHot'
  },
  {
    key: 'ganador',
    imageUrl:
      'https://lh3.googleusercontent.com/aida/ADBb0uhF7Y-7akW4gz95TCBRgSmLmfP-wktiRYh1p5Smd4qSiUF4SmyyzcqQ24iFMFgctk5vnf8mGsBnmV4fTs8jrdzQkVu8W7ZlqD74wGw_mEI9zsV_CpRfLP_D-q_qtY_wc7v9f5T-Jq1d3U2yqjmNShpwjn4AYb8HvWnVAzw4dpXUwBHJ2zGaknHDUg9mEYaGxrsOLhH3fRU6e7seZobs3FLUVcB6B20PHkm5fdRz6ML5PO4O1ZoPBKddYQ',
    badge: null
  },
  {
    key: 'bone',
    imageUrl:
      'https://lh3.googleusercontent.com/aida/ADBb0ugu8LMm54_08l94BpHkOMCzfBgEUy04LIHZUMkiNlEya81zYQWCXqblgvm-q4AnpTKPwXGPlbaVcTmmCAui374ugyM52qoBu1LXxxTLLnn-jQHs8y7CqhS6q3uaWZDJbyMeXxkNDqjyc1JKafFJv2VhWBou13WCuN4AbpuQepRzkRP8vt-j_k93WOYGByvbDBeQ4mic-XQBv6HqxLX1aKr6jgAKzzqnd6MJww6p49VJOuBhObkpXZr6KQo',
    badge: null
  },
  {
    key: 'carrier',
    imageUrl:
      'https://lh3.googleusercontent.com/aida/ADBb0ujC9zSo9FmbU2EwQNsT5qGaNjUKze0XrjaJoNM4_T1qv-ae9bzOLz8HnhEmBa7a7WphURI4mWkx55JSWyfrcus3sGqFlLb7kalB0pozGHt6DHI3_uz0FKwLF3woR-uBY-8VQulldyf7C2qLT9F75Pz6423M0pBnhV7wRBflG0IydjF4OB3hlvpsA-8EvpWrf2rG19rFjg5nxdsfx4bt9ixxhAhjN2yxVWNFhyH7ms2mgoNl5bsoqhdLA4g',
    badge: null
  }
] as const

const FILTERS = ['all', 'food', 'accessories', 'toys'] as const

export function LandingProducts() {
  const { t } = useTranslation('landing')

  return (
    <section id='products' className='bg-muted py-16 md:py-20'>
      <div className='mx-auto w-full max-w-6xl px-4 md:px-6'>
        <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
          <h2 className='text-2xl font-bold text-foreground md:text-3xl font-display'>{t('products.title')}</h2>
          <div className='flex flex-wrap gap-2'>
            {FILTERS.map((filter, index) => (
              <button
                key={filter}
                type='button'
                className={
                  index === 0
                    ? 'rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground'
                    : 'rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-card'
                }
              >
                {t(`products.filters.${filter}`)}
              </button>
            ))}
          </div>
        </div>

        <div className='mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6'>
          {PRODUCTS.map((product) => (
            <article
              key={product.key}
              className='flex h-full flex-col rounded-2xl border border-border/60 bg-card p-4 shadow-sm'
            >
              <div className='relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-background p-2'>
                {product.badge ? (
                  <span className='absolute left-2 top-2 rounded-full bg-destructive px-2 py-1 text-[10px] font-semibold text-destructive-foreground'>
                    {t(product.badge)}
                  </span>
                ) : null}
                <img
                  src={product.imageUrl}
                  alt={t(`products.items.${product.key}.imageAlt`)}
                  className='h-full w-full object-contain'
                />
              </div>
              <h3 className='text-sm font-semibold text-foreground'>{t(`products.items.${product.key}.title`)}</h3>
              <div className='mt-3 text-base font-bold text-primary font-display'>
                {t(`products.items.${product.key}.price`)}
              </div>
              <button
                type='button'
                className='mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
              >
                {t('actions.addToCart')}
                <MaterialIcon name='shopping_cart' className='text-[18px]' />
              </button>
            </article>
          ))}
        </div>

        <div className='mt-8 text-center'>
          <button type='button' className='inline-flex items-center gap-2 text-sm font-semibold text-primary'>
            {t('products.viewAll')}
            <MaterialIcon name='arrow_forward' className='text-[18px]' />
          </button>
        </div>
      </div>
    </section>
  )
}
