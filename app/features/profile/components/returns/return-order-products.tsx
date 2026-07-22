// app/features/profile/components/returns/return-order-products.tsx
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

export interface ReturnProductItem {
  id: string
  productId: string
  name: string
  quantity: number
  price: string
  image?: string
}

export interface ReturnOrderProductsProps {
  orderId: number
  orderCode?: string
  orderDate?: string
  items: ReturnProductItem[]
  selectedProducts: Record<string, boolean>
  selectedQuantities: Record<string, number>
  onProductToggle: (productId: string) => void
  onQuantityChange: (productId: string, quantity: number) => void
}

export function ReturnOrderProducts({
  orderId,
  orderCode,
  orderDate,
  items,
  selectedProducts,
  selectedQuantities,
  onProductToggle,
  onQuantityChange
}: ReturnOrderProductsProps) {
  return (
    <div className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-center gap-3'>
        <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground'>
          1
        </span>
        <h3 className='font-display text-lg font-bold text-foreground'>Chọn sản phẩm cần đổi trả</h3>
      </div>

      {/* Thông tin đơn hàng - readonly */}
      <div className='rounded-lg bg-muted/50 p-3 text-sm'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <span className='font-medium text-foreground'>Đơn hàng #{orderCode || orderId}</span>
          {orderDate && <span className='text-muted-foreground'>Ngày đặt: {orderDate}</span>}
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className='border-t border-border pt-4 space-y-3'>
        <p className='px-2 text-xs font-bold tracking-wider text-muted-foreground'>
          Chọn sản phẩm bạn muốn đổi trả hoặc bảo hành:
        </p>

        {items.length === 0 ? (
          <p className='py-8 text-center text-sm text-muted-foreground'>Không có sản phẩm nào trong đơn hàng này</p>
        ) : (
          <div className='space-y-3'>
            {items.map((item) => {
              const isChecked = !!selectedProducts[item.id]
              const currentQty = selectedQuantities[item.id] || 1

              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-background p-4 transition-colors',
                    isChecked && 'border-primary bg-primary/5'
                  )}
                >
                  <label className='flex flex-1 items-center gap-4 cursor-pointer select-none'>
                    <input
                      type='checkbox'
                      checked={isChecked}
                      onChange={() => onProductToggle(item.id)}
                      className='h-5 w-5 shrink-0 rounded border-border text-primary focus:ring-primary focus:ring-offset-0'
                    />
                    {item.image && (
                      <img src={item.image} alt={item.name} className='h-16 w-16 shrink-0 rounded-lg object-cover' />
                    )}
                    <div className='min-w-0 flex-1'>
                      <p className='break-words text-sm font-semibold text-foreground'>{item.name}</p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        Đã mua: {item.quantity} | Đơn giá:{' '}
                        <span className='font-semibold text-primary'>{item.price}</span>
                      </p>
                    </div>
                  </label>

                  {/* Chọn số lượng trả */}
                  {isChecked && (
                    <div className='flex items-center gap-3 self-end rounded-lg border border-border bg-card p-1 shadow-sm sm:self-center'>
                      <span className='px-1.5 text-xs text-muted-foreground'>SL trả:</span>
                      <div className='flex items-center gap-1'>
                        <button
                          type='button'
                          onClick={() => onQuantityChange(item.id, Math.max(1, currentQty - 1))}
                          disabled={currentQty <= 1}
                          className='flex h-7 w-7 items-center justify-center rounded bg-muted text-foreground transition-colors hover:bg-muted/80 disabled:pointer-events-none disabled:opacity-40'
                        >
                          <MaterialIcon name='remove' className='text-sm' />
                        </button>
                        <span className='w-8 text-center text-xs font-bold text-foreground'>{currentQty}</span>
                        <button
                          type='button'
                          onClick={() => onQuantityChange(item.id, Math.min(item.quantity, currentQty + 1))}
                          disabled={currentQty >= item.quantity}
                          className='flex h-7 w-7 items-center justify-center rounded bg-muted text-foreground transition-colors hover:bg-muted/80 disabled:pointer-events-none disabled:opacity-40'
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
        )}
      </div>
    </div>
  )
}
