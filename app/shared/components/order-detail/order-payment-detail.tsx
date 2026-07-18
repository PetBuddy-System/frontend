import { useTranslation } from 'react-i18next'
import type { OrderDetailFull } from '~/shared/lib/order'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

interface OrderPaymentDetailProps {
  order: OrderDetailFull
  formatPrice: (value: number) => string
  subtotal: number
  shippingFee: number
  discount: number
  isShipper?: boolean
}

export function OrderPaymentDetail({
  order,
  formatPrice,
  subtotal,
  shippingFee,
  discount,
  isShipper = false,
}: OrderPaymentDetailProps) {
  const { t } = useTranslation('profile')

  // Shipper cannot see prices for prepaid (CARD/MOMO) orders
  const isOnlinePayment = order.payment?.paymentMethod === 'CARD' || order.payment?.paymentMethod === 'MOMO'
  const hidePrice = isShipper && isOnlinePayment
  const displayPrice = hidePrice ? () => '0đ' : formatPrice

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <MaterialIcon name="receipt_long" className="text-[18px]" />
        </div>
        <h2 className="font-bold text-base text-foreground">
          {t('orderDetail.paymentDetail', 'Chi tiết thanh toán')}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-bold">
              {t('orderDetail.paymentMethod', 'Phương thức thanh toán')}
            </p>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border/40">
              <MaterialIcon
                name={
                  order.payment?.paymentMethod === 'CARD'
                    ? 'credit_card'
                    : order.payment?.paymentMethod === 'MOMO'
                    ? 'qr_code_2'
                    : 'payments'
                }
                className="text-primary text-[28px]"
              />
              <div>
                <p className="font-bold text-sm text-foreground">
                  {order.payment?.paymentMethod === 'CARD'
                    ? t('orderDetail.cardPayment', 'Thanh toán thẻ')
                    : order.payment?.paymentMethod === 'MOMO'
                    ? t('orderDetail.momoPayment', 'Ví MoMo')
                    : t('orderDetail.cashPayment', 'Tiền mặt')}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {order.payment?.paymentMethod === 'CARD'
                    ? t('orderDetail.viaGateway', 'Qua cổng thanh toán')
                    : order.payment?.paymentMethod === 'MOMO'
                    ? t('orderDetail.viaMomo', 'Qua ví điện tử MoMo')
                    : t('orderDetail.payOnDelivery', 'Thanh toán khi nhận hàng')}
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 font-bold">
              {t('orderDetail.paymentStatus', 'Trạng thái thanh toán')}
            </p>
            <div
              className={cn(
                'flex items-center gap-1.5 font-bold text-sm',
                order.payment?.status === 'PAID' ? 'text-success' :
                order.payment?.status === 'REFUNDED' ? 'text-success' :
                order.payment?.status === 'FAILED' ? 'text-destructive' :
                'text-amber-500'
              )}
            >
              <MaterialIcon
                name={
                  order.payment?.status === 'PAID' ? 'verified_user' :
                  order.payment?.status === 'REFUNDED' ? 'assignment_return' :
                  order.payment?.status === 'FAILED' ? 'cancel' :
                  'schedule'
                }
                className="text-[18px]"
              />
              <span>
                {order.payment?.status === 'PAID'
                  ? t('orderDetail.paid', 'Đã thanh toán')
                  : order.payment?.status === 'REFUNDED'
                  ? t('orderDetail.refunded', 'Đã hoàn tiền')
                  : order.payment?.status === 'FAILED'
                  ? t('orderDetail.paymentFailed', 'Thanh toán thất bại')
                  : t('orderDetail.pendingPayment', 'Chờ thanh toán')}
              </span>
            </div>
          </div>
        </div>

          <div className="bg-muted/40 p-4 rounded-xl border border-border/40 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">
              {t('orderDetail.subtotal', 'Tổng giá trị sản phẩm')}
            </span>
            <span className="font-semibold text-foreground">{displayPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">
              {t('orderDetail.shippingFee', 'Phí giao hàng')}
            </span>
            <span className="font-semibold text-foreground">{displayPrice(shippingFee)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center text-xs">
              <div className="flex flex-col">
                <span className="text-muted-foreground">
                  {t('orderDetail.voucherDiscount', 'Mã giảm giá')}
                </span>
                {order.voucherCode && (
                  <span className="text-[9px] font-mono text-destructive uppercase font-bold">
                    {order.voucherCode}
                  </span>
                )}
              </div>
              <span className="text-destructive font-bold">-{hidePrice ? '0đ' : formatPrice(discount)}</span>
            </div>
          )}
          <div className="h-px bg-border my-1" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">
              {t('orderDetail.totalOrder', 'Tổng đơn hàng')}
            </span>
            <span className="text-lg font-black text-primary">{displayPrice(order.finalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}