import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

export interface CartItem {
  key: string
  cartItemId: string
  productId: string
  title: string
  description?: string
  category?: string
  image: string
  price: number
  salePrice?: number | null
  quantity: number
  subtotal: number
}

export interface CartItemsListProps {
  items: CartItem[]
  formatPrice: (value: number) => string
  onDecrease: (key: string) => void
  onIncrease: (key: string) => void
  onRemove?: (item: CartItem) => void
  mutatingItemId?: string | null
}

export function CartItemsList({
  items,
  formatPrice,
  onDecrease,
  onIncrease,
  onRemove,
  mutatingItemId = null
}: CartItemsListProps) {
  const { t } = useTranslation('products')

  return (
    <div className="lg:col-span-8 space-y-6">
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                <th className="px-4 py-4 text-left">Sản phẩm</th>
                <th className="px-4 py-4 text-center">Đơn giá</th>
                <th className="px-4 py-4 text-center">Số lượng</th>
                <th className="px-4 py-4 text-center">Thành tiền</th>
                <th className="px-4 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
                  {items.map((item) => {
                const hasSale = item.salePrice !== undefined && item.salePrice !== null && item.salePrice < item.price
                const effectivePrice = hasSale ? item.salePrice! : item.price
                const effectiveSubtotal = effectivePrice * item.quantity
                return (
                  <tr key={item.key} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3 w-full min-w-0">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h3
                            title={item.title}
                            className="font-bold text-foreground text-base leading-snug line-clamp-2"
                          >
                            {item.title}
                          </h3>
                          {item.description && (
                            <p
                              title={item.description}
                              className="text-sm mt-1 line-clamp-2 text-muted-foreground"
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center align-middle">
                      {hasSale ? (
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(item.price)}
                          </span>
                          <span className="font-medium text-foreground whitespace-nowrap">
                            {formatPrice(item.salePrice!)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-foreground whitespace-nowrap">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-5 text-center align-middle">
                      <div className="inline-flex h-10 items-center border rounded-lg">
                        <button
                          type="button"
                          className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-muted rounded transition-colors disabled:opacity-50"
                          onClick={() => onDecrease(item.key)}
                          disabled={mutatingItemId === item.key || item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="w-8 font-semibold text-foreground text-center">{item.quantity}</span>
                        <button
                          type="button"
                          className="w-9 h-9 flex items-center justify-center text-primary font-bold hover:bg-muted rounded transition-colors disabled:opacity-50"
                          onClick={() => onIncrease(item.key)}
                          disabled={mutatingItemId === item.key}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center align-middle">
                      <span className="text-base font-bold text-primary whitespace-nowrap">
                        {formatPrice(effectiveSubtotal)}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => onRemove?.(item)}
                        disabled={mutatingItemId === item.key}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10 disabled:opacity-50"
                      >
                        <MaterialIcon name="delete" className="text-[20px]" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}