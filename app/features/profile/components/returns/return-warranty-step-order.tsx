import { type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

export interface ReturnProduct {
  id: string // maps to orderDetailId or string identifier
  name: string
  quantity: number // maximum order quantity
  price: string // formatted price
  image: string
}

export interface ReturnOrder {
  id: string // maps to orderId
  orderCode: string // human-readable order code
  date: string // formatted order date
  products: ReturnProduct[]
}

export interface ReturnWarrantyStepOrderProps {
  selectedOrderId: string
  selectedProducts: Record<string, boolean>
  selectedQuantities: Record<string, number>
  orders: ReturnOrder[]
  onOrderChange: (e: ChangeEvent<HTMLSelectElement>) => void
  onProductToggle: (productId: string) => void
  onQuantityChange: (productId: string, quantity: number) => void
}

export function ReturnWarrantyStepOrder({
  selectedOrderId,
  selectedProducts,
  selectedQuantities,
  orders,
  onOrderChange,
  onProductToggle,
  onQuantityChange
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
              Đơn hàng #{order.orderCode} - {order.date} ({order.products.length} sản phẩm)
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
            {selectedOrder.products.map((product) => {
              const isChecked = !!selectedProducts[product.id]
              const currentQty = selectedQuantities[product.id] || 1

              return (
                <div
                  key={product.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors',
                    isChecked && 'border-primary bg-primary/5'
                  )}
                >
                  <label className='flex flex-1 items-center gap-4 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={isChecked}
                      onChange={() => onProductToggle(product.id)}
                      className='h-5 w-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 shrink-0'
                    />
                    {product.image && (
                      <img src={product.image} alt={product.name} className='h-16 w-16 rounded-lg object-cover shrink-0' />
                    )}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold text-foreground break-words'>{product.name}</p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Số lượng đã mua: {product.quantity} | Đơn giá: {product.price}
                      </p>
                    </div>
                  </label>

                  {/* Quantity modifier when checked */}
                  {isChecked && (
                    <div className='flex items-center gap-3 self-end sm:self-center bg-card border border-border rounded-lg p-1 shrink-0 shadow-sm'>
                      <span className='text-xs text-muted-foreground px-1.5'>Số lượng trả:</span>
                      <div className='flex items-center gap-1'>
                        <button
                          type='button'
                          onClick={() => onQuantityChange(product.id, Math.max(1, currentQty - 1))}
                          disabled={currentQty <= 1}
                          className='flex h-7 w-7 items-center justify-center rounded bg-muted text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:pointer-events-none transition-colors'
                        >
                          <MaterialIcon name='remove' className='text-sm' />
                        </button>
                        <span className='w-8 text-center text-xs font-bold text-foreground'>{currentQty}</span>
                        <button
                          type='button'
                          onClick={() => onQuantityChange(product.id, Math.min(product.quantity, currentQty + 1))}
                          disabled={currentQty >= product.quantity}
                          className='flex h-7 w-7 items-center justify-center rounded bg-muted text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:pointer-events-none transition-colors'
                        >
                          <MaterialIcon name='add' className='text-sm' />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
