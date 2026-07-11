import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import type { OrderDetailFull } from '~/shared/lib/order'

interface OrderProductListProps {
  order: OrderDetailFull
  formatPrice: (value: number) => string
}

export function OrderProductList({ order, formatPrice }: OrderProductListProps) {
  const { t } = useTranslation('profile')
  const navigate = useNavigate()

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
        <h2 className="font-bold text-base text-foreground">
          {t('orderDetail.productsOrdered', 'Sản phẩm đã đặt')}
        </h2>
        <span className="text-xs text-muted-foreground font-semibold">
          {t('orderDetail.productCount', '{{count}} sản phẩm', { count: order.orderDetails?.length || 0 })}
        </span>
      </div>
      <div className="divide-y divide-border">
        {order.orderDetails?.length ? (
          order.orderDetails.map((detail) => (
            <div key={detail.orderDetailId} className="p-6 flex items-center gap-5">
              <button
                onClick={() => navigate(`/products/${detail.productId}`)}
                className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 border border-border overflow-hidden hover:opacity-85 transition-opacity"
              >
                <img
                  src={detail.productImage || ''}
                  alt={detail.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.onerror = null
                    target.src = 'https://placehold.co/300'
                  }}
                />
              </button>
              <div className="flex-grow flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => navigate(`/products/${detail.productId}`)}
                    className="font-bold text-base text-foreground leading-tight hover:text-primary transition-colors text-left truncate hover:underline text-wrap"
                  >
                    {detail.productName}
                  </button>
                  {((detail.price && detail.unitPrice < detail.price) || (detail.salePrice && detail.price && detail.salePrice < detail.price)) && (
                    <span className="bg-destructive/10 text-destructive text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
                      {t('orderDetail.discountBadge', 'Giảm giá')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('orderDetail.quantity', 'Số lượng: x{{count}}', { count: detail.quantity })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('orderDetail.unitPrice', 'Đơn giá')}:{' '}
                  {((detail.price && detail.unitPrice < detail.price) || (detail.salePrice && detail.price && detail.salePrice < detail.price)) ? (
                    <>
                      <span className="line-through mr-1 text-[11px] text-muted-foreground">
                        {formatPrice(detail.price ?? detail.unitPrice)}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatPrice(detail.unitPrice)}
                      </span>
                    </>
                  ) : (
                    formatPrice(detail.unitPrice)
                  )}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-primary">{formatPrice(detail.totalPrice)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            {t('orderDetail.noProducts', 'Không có sản phẩm nào.')}
          </p>
        )}
      </div>

      <div className="bg-muted/30 px-6 py-3 border-t border-border flex justify-between items-center text-xs font-semibold text-muted-foreground">
        <span>{t('orderDetail.paymentMethod', 'Phương thức thanh toán')}</span>
        <span className="text-foreground">
          {order.payment?.paymentMethod === 'CARD'
            ? t('orderDetail.paymentOnline', 'Thanh toán trực tuyến')
            : t('orderDetail.paymentCOD', 'Thanh toán khi nhận hàng')}
        </span>
      </div>
    </div>
  )
}
