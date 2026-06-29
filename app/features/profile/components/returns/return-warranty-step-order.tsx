import { type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

export interface ReturnProduct {
  id: string
  name: string
  quantity: number
  price: string
  image: string
}

export interface ReturnOrder {
  id: string
  date: string
  products: ReturnProduct[]
}

export interface ReturnWarrantyStepOrderProps {
  selectedOrderId: string
  selectedProducts: Record<string, boolean>
  orders: ReturnOrder[]
  onOrderChange: (e: ChangeEvent<HTMLSelectElement>) => void
  onProductToggle: (productId: string) => void
}

export function ReturnWarrantyStepOrder({
  selectedOrderId,
  selectedProducts,
  orders,
  onOrderChange,
  onProductToggle
}: ReturnWarrantyStepOrderProps) {
  const { t } = useTranslation('profile')
  const selectedOrder = orders.find((o) => o.id === selectedOrderId)

  return (
    <div className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-center gap-3'>
        <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground'>
          1
        </span>
        <h3 className='font-display text-lg font-bold text-foreground'>{t('returnWarranty.step.order')}</h3>
      </div>

      <div className='relative'>
        <select
          value={selectedOrderId}
          onChange={onOrderChange}
          className='w-full cursor-pointer appearance-none rounded-xl border border-border bg-muted p-4 pr-12 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:outline-none transition-colors'
        >
          <option value=''>{t('returnWarranty.order.placeholder')}</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.id} - {order.date} ({order.products.length} {t('sidebar.nav.orders').toLowerCase()})
            </option>
          ))}
        </select>
        <MaterialIcon
          name='expand_more'
          className='pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground'
        />
      </div>

      {/* Product checkboxes */}
      {selectedOrder && (
        <div className='mt-4 border-t border-border pt-4 space-y-3'>
          <p className='px-2 font-display text-xs font-bold tracking-wider text-muted-foreground'>
            {t('returnWarranty.order.selectProducts')}
          </p>
          <div className='space-y-3'>
            {selectedOrder.products.map((product) => (
              <label
                key={product.id}
                className={cn(
                  'flex items-center gap-4 rounded-xl border border-border bg-card p-3 cursor-pointer transition-colors hover:bg-muted/50',
                  selectedProducts[product.id] && 'border-primary bg-primary/5'
                )}
              >
                <input
                  type='checkbox'
                  checked={!!selectedProducts[product.id]}
                  onChange={() => onProductToggle(product.id)}
                  className='h-5 w-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0'
                />
                <img src={product.image} alt={product.name} className='h-16 w-16 rounded-lg object-cover' />
                <div className='flex-1'>
                  <p className='text-sm font-semibold text-foreground'>{product.name}</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {t('returnWarranty.order.quantity', { qty: product.quantity })} |{' '}
                    {t('returnWarranty.order.price', { price: product.price })}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
