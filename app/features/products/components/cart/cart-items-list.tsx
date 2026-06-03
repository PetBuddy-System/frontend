import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export interface CartItem {
  key: string
  image: string
  price: number
  quantity: number
}

export interface CartItemsListProps {
  items: CartItem[]
  formatPrice: (value: number) => string
  onDecrease: (key: string) => void
  onIncrease: (key: string) => void
}

export function CartItemsList({ items, formatPrice, onDecrease, onIncrease }: CartItemsListProps) {
  const { t } = useTranslation('products')

  return (
    <section className='space-y-4 lg:col-span-8'>
      {items.map((item) => (
        <article
          key={item.key}
          className='group flex flex-col gap-6 rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-transform hover:scale-[1.01] md:flex-row md:items-center md:p-6'
        >
          <div className='h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-muted'>
            <img src={item.image} alt={t(`cart.items.${item.key}.imageAlt`)} className='h-full w-full object-cover' />
          </div>

          <div className='flex flex-1 flex-col gap-3'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='font-display text-xl font-semibold text-foreground md:text-2xl'>
                  {t(`cart.items.${item.key}.title`)}
                </h2>
                <p className='mt-2 text-sm text-muted-foreground md:text-base'>
                  {t('cart.categoryLabel', {
                    category: t(`cart.items.${item.key}.category`)
                  })}
                </p>
              </div>
              <button
                type='button'
                aria-label={t('cart.remove')}
                className='rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
              >
                <MaterialIcon name='delete' className='text-[22px]' />
              </button>
            </div>

            <div className='flex flex-wrap items-center justify-between gap-4 pt-2'>
              <span className='font-display text-xl font-bold text-primary'>{formatPrice(item.price)}</span>
              <div className='flex items-center rounded-full border border-border bg-muted p-1'>
                <button
                  type='button'
                  aria-label={t('cart.quantity.decrease')}
                  className='flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-card'
                  onClick={() => onDecrease(item.key)}
                >
                  <MaterialIcon name='remove' className='text-[18px]' />
                </button>
                <span className='min-w-10 px-3 text-center font-bold text-foreground'>{item.quantity}</span>
                <button
                  type='button'
                  aria-label={t('cart.quantity.increase')}
                  className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90'
                  onClick={() => onIncrease(item.key)}
                >
                  <MaterialIcon name='add' className='text-[18px]' />
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}

      <div className='pt-6'>
        <a
          className='inline-flex items-center gap-2 font-bold text-primary transition-transform hover:-translate-x-1'
          href='/products'
        >
          <MaterialIcon name='arrow_back' className='text-[20px]' />
          {t('cart.continueShopping')}
        </a>
      </div>
    </section>
  )
}
