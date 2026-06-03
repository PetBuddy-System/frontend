import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const TRUST_BADGES = [
  { key: 'secure', icon: 'verified_user' },
  { key: 'returns', icon: 'replay' },
  { key: 'authentic', icon: 'verified' }
] as const

export interface CheckoutOrderItem {
  key: string
  image: string
  price: number
  quantity: number
}

export interface CheckoutOrderSummaryProps {
  items: CheckoutOrderItem[]
  subtotal: number
  formatPrice: (value: number) => string
}

export function CheckoutOrderSummary({ items, subtotal, formatPrice }: CheckoutOrderSummaryProps) {
  const { t } = useTranslation('products')

  return (
    <aside className='flex flex-col gap-6 lg:sticky lg:top-24'>
      <section className='overflow-hidden rounded-xl border border-border/60 bg-card p-6 shadow-sm'>
        <h2 className='mb-4 border-b border-border pb-4 font-display text-2xl font-semibold text-primary'>
          {t('checkout.summary.title')}
        </h2>

        <div className='mb-6 flex max-h-[300px] flex-col gap-4 overflow-y-auto pr-2'>
          {items.map((item) => (
            <article key={item.key} className='flex gap-4'>
              <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted'>
                <img
                  src={item.image}
                  alt={t(`checkout.summary.items.${item.key}.imageAlt`)}
                  className='h-full w-full object-cover'
                />
              </div>
              <div className='flex flex-1 flex-col'>
                <h3 className='line-clamp-1 text-sm font-semibold text-foreground'>
                  {t(`checkout.summary.items.${item.key}.title`)}
                </h3>
                <span className='text-sm text-muted-foreground'>
                  {t('checkout.summary.quantity', { count: item.quantity })}
                </span>
                <span className='mt-auto font-display text-sm font-bold text-primary'>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className='mb-6 flex flex-col gap-3 border-t border-border pt-4'>
          <div className='flex items-center justify-between text-muted-foreground'>
            <span>{t('checkout.summary.subtotal')}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className='flex items-center justify-between text-muted-foreground'>
            <span>{t('checkout.summary.shipping')}</span>
            <span className='font-bold text-primary'>{t('checkout.summary.freeShipping')}</span>
          </div>
          <div className='flex items-center justify-between text-muted-foreground'>
            <span>{t('checkout.summary.discount')}</span>
            <span>{formatPrice(0)}</span>
          </div>
          <div className='mt-2 flex items-center justify-between pt-2'>
            <span className='font-display text-2xl font-semibold text-foreground'>{t('checkout.summary.total')}</span>
            <span className='font-display text-3xl font-bold text-primary'>{formatPrice(subtotal)}</span>
          </div>
        </div>

        <a
          href='/order-success'
          className='flex w-full items-center justify-center gap-3 rounded-full bg-secondary px-6 py-4 font-display font-semibold text-secondary-foreground shadow-md transition-transform active:scale-95'
        >
          <MaterialIcon name='lock' filled className='text-[20px]' />
          {t('checkout.summary.placeOrder')}
        </a>

        <div className='mt-6 flex flex-col gap-3 border-t border-border pt-4'>
          {TRUST_BADGES.map((badge) => (
            <div key={badge.key} className='flex items-center gap-3 text-sm text-muted-foreground'>
              <MaterialIcon name={badge.icon} className='text-[20px] text-success' />
              <span>{t(`checkout.summary.trust.${badge.key}`)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className='rounded-xl border border-border/60 bg-card p-6 shadow-sm'>
        <label className='mb-2 block text-sm font-semibold text-foreground' htmlFor='checkout-coupon'>
          {t('checkout.coupon.title')}
        </label>
        <div className='flex gap-2'>
          <input
            id='checkout-coupon'
            className='min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
            placeholder={t('checkout.coupon.placeholder')}
            type='text'
          />
          <button
            type='button'
            className='rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
          >
            {t('checkout.coupon.apply')}
          </button>
        </div>
      </section>
    </aside>
  )
}
