import { useTranslation } from 'react-i18next'

export interface CartSuggestion {
  key: string
  image: string
  price: number
}

export interface CartSuggestionsProps {
  items: CartSuggestion[]
  formatPrice: (value: number) => string
}

export function CartSuggestions({ items, formatPrice }: CartSuggestionsProps) {
  const { t } = useTranslation('products')

  return (
    <section className='mt-16 md:mt-20'>
      <h2 className='mb-8 font-display text-2xl font-semibold text-foreground'>{t('cart.suggestions.title')}</h2>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {items.map((item) => (
          <article
            key={item.key}
            className='group rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-lg'
          >
            <div className='mb-4 aspect-square overflow-hidden rounded-lg bg-muted'>
              <img
                src={item.image}
                alt={t(`cart.suggestions.items.${item.key}.imageAlt`)}
                className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'
              />
            </div>
            <h3 className='truncate text-sm font-semibold text-foreground'>
              {t(`cart.suggestions.items.${item.key}.title`)}
            </h3>
            <p className='mt-2 font-display text-lg font-bold text-primary'>{formatPrice(item.price)}</p>
            <button
              type='button'
              className='mt-3 w-full rounded-lg border border-primary px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
            >
              {t('cart.suggestions.add')}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
