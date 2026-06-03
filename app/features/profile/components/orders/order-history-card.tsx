import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

export type OrderStatus = 'pending' | 'shipping' | 'delivered' | 'cancelled'

export interface OrderProduct {
  name: string
  quantity: number
  price: string
  image: string
}

export interface OrderHistoryItem {
  key: string
  status: OrderStatus
  id: string
  date: string
  products: OrderProduct[]
  total: string
}

export interface OrderHistoryCardProps {
  item: OrderHistoryItem
}

const STATUS_ICON: Record<OrderStatus, string> = {
  pending: 'schedule',
  shipping: 'local_shipping',
  delivered: 'check_circle',
  cancelled: 'cancel'
}

function getStatusClassName(status: OrderStatus) {
  if (status === 'delivered') {
    return 'bg-success/10 text-success'
  }

  if (status === 'shipping') {
    return 'bg-info/10 text-info'
  }

  if (status === 'pending') {
    return 'bg-warning/10 text-warning'
  }

  return 'bg-muted text-muted-foreground'
}

export function OrderHistoryCard({ item }: OrderHistoryCardProps) {
  const { t } = useTranslation('profile')

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/40',
        item.status === 'cancelled' && 'opacity-75 grayscale-[0.5]'
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between border-b border-border bg-muted px-4 py-3 md:px-5'>
        <div className='flex items-center gap-3'>
          <span className='text-sm font-bold text-foreground'>{item.id}</span>
          <span className='text-xs text-muted-foreground'>{t('orderHistory.orderDate', { date: item.date })}</span>
        </div>
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold',
            getStatusClassName(item.status)
          )}
        >
          <MaterialIcon name={STATUS_ICON[item.status]} filled={item.status === 'delivered'} className='text-sm' />
          {t(`orderHistory.status.${item.status}`)}
        </span>
      </div>

      {/* Product list */}
      <div className='space-y-4 p-4 md:p-5'>
        {item.products.map((product, idx) => (
          <div key={idx} className='flex gap-4'>
            <div className='h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border'>
              <img src={product.image} alt={product.name} className='h-full w-full object-cover' />
            </div>
            <div className='flex-1'>
              <h3 className='text-sm font-semibold text-foreground'>{product.name}</h3>
              <p className='mt-1 text-xs text-muted-foreground'>
                {t('orderHistory.quantity', { qty: product.quantity })}
              </p>
              <p className='mt-1 text-sm font-semibold text-primary'>{product.price}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className='flex flex-col items-center justify-between gap-4 border-t border-border px-4 py-4 sm:flex-row md:px-5'>
        <div className='w-full sm:w-auto'>
          <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
            {t('orderHistory.totalLabel')}
          </span>
          <span
            className={cn(
              'block font-display text-xl font-bold',
              item.status === 'cancelled' ? 'text-muted-foreground' : 'text-primary'
            )}
          >
            {item.total}
          </span>
        </div>
        <div className='flex w-full gap-3 sm:w-auto'>
          <button
            type='button'
            className='flex-1 rounded-xl border border-primary px-5 py-2 text-sm font-bold text-primary transition-colors hover:bg-accent/10 sm:flex-none'
          >
            {t('orderHistory.actions.viewDetails')}
          </button>

          {item.status === 'shipping' ? (
            <button
              type='button'
              className='flex-1 rounded-xl bg-secondary px-5 py-2 text-sm font-bold text-secondary-foreground shadow-sm transition-colors hover:opacity-90 sm:flex-none'
            >
              {t('orderHistory.actions.track')}
            </button>
          ) : (
            <button
              type='button'
              className='flex-1 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:opacity-90 sm:flex-none'
            >
              {t('orderHistory.actions.buyAgain')}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
