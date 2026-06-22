import { useTranslation } from 'react-i18next'

export interface OrderSuccessItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

export interface OrderSuccessDetailsProps {
  items: OrderSuccessItem[]
  formatPrice: (value: number) => string
}

export function OrderSuccessDetails({ items, formatPrice }: OrderSuccessDetailsProps) {
  const { t } = useTranslation('products')
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <section className='overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm'>
      <div className='flex items-center justify-between gap-4 border-b border-border px-6 py-5 md:px-8'>
        <h2 className='font-display text-2xl font-semibold text-foreground'>{t('orderSuccess.details.title', 'Chi tiết đơn hàng')}</h2>
        <span className='rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground'>
          {t('orderSuccess.details.itemCount', { count: itemCount })}
        </span>
      </div>

      <div className='space-y-6 p-6 md:p-8'>
        {items.map((item) => (
          <article key={item.productId} className='flex items-center gap-5 md:gap-6'>
            <div className='h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-muted'>
              <img
                src={item.imageUrl}
                alt={item.name}
                className='h-full w-full object-cover'
              />
            </div>
            <div className='min-w-0 flex-1'>
              <h3 className='line-clamp-2 font-display text-lg font-semibold text-foreground'>
                {item.name}
              </h3>
              <p className='mt-1 text-sm text-muted-foreground'>
                {t('orderSuccess.details.quantity', { count: item.quantity })}
              </p>
            </div>
            <p className='text-right font-display text-lg font-bold text-primary'>
              {formatPrice(item.price * item.quantity)}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
