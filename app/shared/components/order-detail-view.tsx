import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { fetchOrderDetailApi, updateOrderStatusApi } from '~/features/profile/services/order/order-api'
import type { OrderDetailFull } from '~/shared/lib/order'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { OrderShippingLabelModal } from './order-shipping-label-modal'
import { useAuth } from '~/providers/auth-provider'
import { DeliveryProofDialog } from '~/features/staff/components/orders/delivery-proof-dialog'

interface OrderDetailViewProps {
  orderId: number
  isStaff: boolean
}

function formatPrice(value: number) {
  if (value == null || isNaN(Number(value))) return '0đ'
  return `${new Intl.NumberFormat('vi-VN').format(Number(value))}đ`
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '—'
  const normalized = dateStr.includes('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z'
  const d = new Date(normalized)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
}

function getSecondsUntil(isoStr?: string): number {
  if (!isoStr) return 0
  const d = new Date(isoStr) 
  const diff = Math.floor((d.getTime() - Date.now()) / 1000)
  return Math.max(0, diff)
}

function formatCountdown(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

export function OrderDetailView({ orderId, isStaff }: OrderDetailViewProps) {
  const { t } = useTranslation('profile')
  const [order, setOrder] = useState<OrderDetailFull | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isProofOpen, setIsProofOpen] = useState(false)
  const { user } = useAuth()
  const isShipper = user?.role === 'STAFF' && user?.staffTask === 'SHIPPER'
  const navigate = useNavigate()

  // Derived: has the countdown hit 0 while still rendering as PENDING?
  const isCountdownExpired = order?.status === 'PENDING' && countdown === 0 && Boolean(order?.paymentExpiredAt)

  const loadDetail = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetchOrderDetailApi(orderId)
      if (res.success && res.data) {
        setOrder(res.data)
        if (res.data.status === 'PENDING') {
          setCountdown(getSecondsUntil(res.data.paymentExpiredAt))
        }
      } else {
        setError(res.message || t('orderDetail.error', 'Không thể tải chi tiết đơn hàng.'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('orderDetail.unexpectedError', 'Có lỗi xảy ra.'))
    } finally {
      setIsLoading(false)
    }
  }, [orderId, t])

  useEffect(() => {
    if (orderId) {
      void loadDetail()
    }
  }, [orderId, loadDetail])

  // Countdown tick for PENDING orders
  useEffect(() => {
    if (order?.status !== 'PENDING' || !order?.paymentExpiredAt) return
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [order?.status, order?.paymentExpiredAt, countdown])

  async function handleCancelOrder() {
    if (!window.confirm(t('orderDetail.cancelConfirm', 'Bạn có chắc chắn muốn hủy đơn hàng này không?'))) return
    setIsCanceling(true)
    try {
      const res = await updateOrderStatusApi(orderId, 'CANCELLED')
      if (res.success) {
        void loadDetail()
      } else {
        alert(res.message || t('orderDetail.cancelFailed', 'Hủy đơn hàng thất bại'))
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : t('orderDetail.unexpectedError', 'Có lỗi xảy ra khi hủy đơn hàng'))
    } finally {
      setIsCanceling(false)
    }
  }

  function handleRetryPayment() {
    if (!order?.clientSecret) return
    navigate('/payment', {
      state: {
        orderId: order.orderId,
        clientSecret: order.clientSecret,
        amount: order.finalAmount,
        shippingFee: order.shippingFee ?? 0,
        isFreeShipping: false,
      },
    })
  }

  function getStatusLabel(status: string) {
    const key = status.toLowerCase()
    return t(`orderDetail.status.${key}`, status)
  }

  const subtotal = order?.orderDetails?.reduce((sum, item) => sum + item.totalPrice, 0) ?? 0
  const shippingFee = order?.shippingFee ?? (subtotal > 500000 ? 0 : 30000)
  const hasVoucher = Boolean(order?.voucherCode || order?.voucher)
  const rawDiscount = hasVoucher
    ? (order?.voucher?.discountValue ?? (subtotal + shippingFee - (order?.finalAmount ?? subtotal)))
    : 0
  const discount = rawDiscount > subtotal ? subtotal : rawDiscount

  const isExpired = order?.status === 'EXPIRED' || isCountdownExpired

  const canCancel = (() => {
    if (!order) return false
    if (order.status === 'CANCELLED' || order.status === 'COMPLETED' || order.status === 'EXPIRED') return false
    if (isStaff) return true
    return order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PICKING'
  })()

  const canRetryPayment =
    !isStaff &&
    order?.status === 'PENDING' &&
    order?.payment?.paymentMethod === 'CARD' &&
    !isExpired

  const isTerminal = order?.status === 'CANCELLED' || order?.status === 'EXPIRED'

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="max-w-5xl mx-auto flex flex-col gap-6 py-6 pb-24">

        {/* ─── Expired Banner ─── */}
        {order && isExpired && !isLoading && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-destructive">
            <MaterialIcon name="warning" filled className="text-[22px] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">{t('orderDetail.expiredBanner')}</p>
            </div>
          </div>
        )}

        {order && order.status === 'PENDING' && order.payment?.paymentMethod === 'CARD' && !isExpired && !isLoading && (
          <div className="flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 px-5 py-4 text-warning">
            <MaterialIcon name="schedule" className="text-[22px] shrink-0" />
            <p className="font-semibold text-sm">
              {t('orderDetail.pendingBanner', { time: formatCountdown(countdown) })}
            </p>
          </div>
        )}

        {/* Back and Status Bar */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(isStaff ? '/staff/orders' : '/profile/orders')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <MaterialIcon name="chevron_left" className="text-[20px]" />
              <span className="font-semibold uppercase tracking-wider text-sm">
                {t('orderDetail.back', 'Quay lại')}
              </span>
            </button>
            <div className="flex items-center gap-4 text-sm font-medium">
              {order && <span className="text-muted-foreground">ORDER CODE. {order.orderCode}</span>}
              <span className="text-border">|</span>
              {order && (
                <span
                  className={cn(
                    'font-bold uppercase tracking-wider',
                    order.status === 'COMPLETED' ? 'text-success' :
                    order.status === 'CANCELLED' ? 'text-destructive' :
                    order.status === 'EXPIRED' || isExpired ? 'text-destructive' :
                    'text-primary'
                  )}
                >
                  {isExpired && order.status === 'PENDING'
                    ? t('orderDetail.status.expired', 'Hết hạn')
                    : getStatusLabel(order.status)}
                </span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : error || !order ? (
            <div className="text-center py-16 text-destructive">
              <p className="font-semibold">{error ?? t('orderDetail.notFound', 'Không tìm thấy thông tin đơn hàng')}</p>
            </div>
          ) : isTerminal ? (
            <div className="mt-8 flex flex-col items-center gap-3 py-8">
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center",
                order.status === 'EXPIRED' ? 'bg-destructive/10 text-destructive' : 'bg-destructive/10 text-destructive'
              )}>
                <MaterialIcon
                  name={order.status === 'EXPIRED' ? 'hourglass_disabled' : 'close'}
                  className="text-[28px]"
                />
              </div>
              <p className="font-bold text-destructive">
                {order.status === 'EXPIRED'
                  ? t('orderDetail.expiredBanner')
                  : t('orderDetail.cancelledMessage', 'Đơn hàng đã bị hủy')}
              </p>
              <p className="text-xs text-muted-foreground">{formatDateTime(order.updatedAt || order.createdAt)}</p>
            </div>
          ) : (
            <div className="mt-12 px-2 pb-4">
              {(() => {
                const statusLevels: Record<string, number> = {
                  'PENDING': 0,
                  'CONFIRMED': 1,
                  'PICKING': 1,
                  'SHIPPING': 2,
                  'DELIVERED': 3,
                  'COMPLETED': 4,
                }
                const currentLevel = statusLevels[order.status] ?? 0

                const steps = [
                  {
                    icon: 'receipt_long',
                    label: t('orderDetail.steps.ordered', 'Đã đặt hàng'),
                    time: formatDateTime(order.createdAt),
                  },
                  {
                    icon: 'payments',
                    label: t('orderDetail.steps.confirmed', 'Xác nhận đơn hàng'),
                    time: currentLevel >= 1 ? formatDateTime(order.updatedAt || order.createdAt) : null,
                  },
                  {
                    icon: 'local_shipping',
                    label: t('orderDetail.steps.shipping', 'Giao xuất kho'),
                    time: currentLevel >= 2 ? formatDateTime(order.updatedAt || order.createdAt) : null,
                  },
                  {
                    icon: 'move_to_inbox',
                    label: t('orderDetail.steps.delivered', 'Đã giao hàng'),
                    time: currentLevel >= 3 ? formatDateTime(order.updatedAt || order.createdAt) : null,
                  },
                  {
                    icon: 'grade',
                    label: t('orderDetail.steps.completed', 'Hoàn thành'),
                    time: currentLevel >= 4 ? formatDateTime(order.updatedAt || order.createdAt) : null,
                  },
                ]

                return (
                  <div className="flex items-start">
                    {steps.map((step, i) => {
                      const isDone = i < currentLevel
                      const isCurrent = i === currentLevel
                      const isUpcoming = i > currentLevel
                      const isLast = i === steps.length - 1

                      return (
                        <div key={step.label} className={cn('flex items-center', !isLast && 'flex-1')}>
                          {/* Circle + label */}
                          <div className="flex flex-col items-center gap-2 flex-shrink-0 w-20 sm:w-24">
                            <div
                              className={cn(
                                'w-11 h-11 rounded-full flex items-center justify-center transition-colors',
                                (isDone || isCurrent) && 'bg-primary text-primary-foreground shadow-sm',
                                isCurrent && 'ring-4 ring-primary/20',
                                isUpcoming && 'bg-muted border-2 border-dashed border-border text-muted-foreground/40'
                              )}
                            >
                              <MaterialIcon name={isDone ? 'check' : step.icon} className="text-[20px]" />
                            </div>
                            <div className="text-center">
                              <p
                                className={cn(
                                  'text-xs font-bold',
                                  isUpcoming ? 'text-muted-foreground/50' : 'text-foreground'
                                )}
                              >
                                {step.label}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{step.time ?? '—'}</p>
                            </div>
                          </div>

                          {/* Connector line */}
                          {!isLast && (
                            <div
                              className={cn(
                                'flex-1 h-0.5 mx-1 -mt-9',
                                i < currentLevel ? 'bg-primary' : 'border-t-2 border-dashed border-border'
                              )}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        {order && !isLoading && (
          <>
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MaterialIcon name="local_shipping" className="text-[18px]" />
                </div>
                <h2 className="font-bold text-base text-foreground">
                  {t('orderDetail.shippingInfo', 'Thông tin nhận hàng')}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">
                      {t('orderDetail.recipient', 'Người nhận')}
                    </p>
                    <p className="font-bold text-foreground text-lg">
                      {order.recipientName || t('orderDetail.notProvided', 'Chưa cung cấp')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">
                      {t('orderDetail.phone', 'Số điện thoại')}
                    </p>
                    <p className="font-semibold text-foreground text-sm">
                      {order.phoneNumber || t('orderDetail.notProvided', 'Chưa cung cấp')}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">
                      {t('orderDetail.address', 'Địa chỉ giao hàng')}
                    </p>
                    <p className="text-sm text-foreground leading-relaxed font-medium">
                      {order.address || t('orderDetail.notProvided', 'Chưa cung cấp')}
                    </p>
                  </div>
                  {order.note && (
                    <div className="p-3 bg-muted rounded-lg border border-border/40">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">
                        {t('orderDetail.note', 'Ghi chú')}
                      </p>
                      <p className="text-xs italic text-muted-foreground">"{order.note}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product List Section */}
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
                            className="font-bold text-base text-foreground leading-tight hover:text-primary transition-colors text-left truncate hover:underline"
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

            {/* Payment Status & Detail */}
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
                        name={order.payment?.paymentMethod === 'CARD' ? 'credit_card' : 'payments'}
                        className="text-primary text-[28px]"
                      />
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {order.payment?.paymentMethod === 'CARD'
                            ? t('orderDetail.cardPayment', 'Thanh toán thẻ')
                            : t('orderDetail.cashPayment', 'Tiền mặt')}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {order.payment?.paymentMethod === 'CARD'
                            ? t('orderDetail.viaGateway', 'Qua cổng thanh toán')
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
                        order.payment?.status === 'FAILED' ? 'text-destructive' :
                        'text-amber-500'
                      )}
                    >
                      <MaterialIcon
                        name={
                          order.payment?.status === 'PAID' ? 'verified_user' :
                          order.payment?.status === 'FAILED' ? 'cancel' :
                          'schedule'
                        }
                        className="text-[18px]"
                      />
                      <span>
                        {order.payment?.status === 'PAID'
                          ? t('orderDetail.paid', 'Đã thanh toán')
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
                    <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      {t('orderDetail.shippingFee', 'Phí giao hàng')}
                    </span>
                    <span className="font-semibold text-foreground">{formatPrice(shippingFee)}</span>
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
                      <span className="text-destructive font-bold">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="h-px bg-border my-1" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">
                      {t('orderDetail.totalOrder', 'Tổng đơn hàng')}
                    </span>
                    <span className="text-lg font-black text-primary">{formatPrice(order.finalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {(isStaff || canCancel || canRetryPayment) && (
              <div className="flex justify-end gap-3 flex-wrap">
                {isStaff && (
                  <button
                    onClick={() => setIsPrintOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm transition-colors hover:bg-primary/90"
                  >
                    <MaterialIcon name="print" className="text-[18px]" />
                    <span>{t('orderDetail.printOrder', 'In đơn hàng')}</span>
                  </button>
                )}

                {/* Shipper Actions */}
                {isStaff && isShipper && order.status === 'CONFIRMED' && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await updateOrderStatusApi(orderId, 'PICKING')
                        if (res.success) {
                          void loadDetail()
                        } else {
                          alert(res.message || 'Lỗi khi nhận giao hàng')
                        }
                      } catch (err: any) {
                        alert(err?.message || 'Có lỗi xảy ra')
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm transition-colors shadow-sm"
                  >
                    <MaterialIcon name="local_shipping" className="text-[18px]" />
                    <span>{t('orderDetail.startShipping', 'Giao hàng')}</span>
                  </button>
                )}

                {isStaff && isShipper && order.status === 'PICKING' && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await updateOrderStatusApi(orderId, 'SHIPPING')
                        if (res.success) {
                          void loadDetail()
                        } else {
                          alert(res.message || 'Lỗi khi bắt đầu giao hàng')
                        }
                      } catch (err: any) {
                        alert(err?.message || 'Có lỗi xảy ra')
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-colors shadow-sm"
                  >
                    <MaterialIcon name="inventory_2" className="text-[18px]" />
                    <span>{t('orderDetail.startShipping', 'Giao hàng')}</span>
                  </button>
                )}

                {isStaff && isShipper && order.status === 'SHIPPING' && (
                  <button
                    type="button"
                    onClick={() => setIsProofOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors shadow-sm"
                  >
                    <MaterialIcon name="check_circle" className="text-[18px]" />
                    <span>{t('orderDetail.confirmDelivered', 'Đã giao')}</span>
                  </button>
                )}

                {/* Pay Again – only for customer on PENDING CARD orders, disabled if expired */}
                {!isStaff && order.status === 'PENDING' && order.payment?.paymentMethod === 'CARD' && (
                  <button
                    onClick={handleRetryPayment}
                    disabled={isExpired}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-lg bg-success text-success-foreground font-bold text-sm transition-colors',
                      'hover:bg-success/90',
                      isExpired && 'opacity-50 cursor-not-allowed hover:bg-success'
                    )}
                  >
                    <MaterialIcon name="credit_card" className="text-[18px]" />
                    <span>{t('orderDetail.payAgain', 'Thanh toán lại')}</span>
                  </button>
                )}

                {canCancel && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCanceling}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-destructive text-destructive font-bold text-sm transition-colors',
                      'hover:bg-destructive hover:text-destructive-foreground',
                      isCanceling && 'opacity-60 cursor-not-allowed hover:bg-transparent hover:text-destructive'
                    )}
                  >
                    {isCanceling ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>{t('orderDetail.canceling', 'Đang hủy...')}</span>
                      </>
                    ) : (
                      <>
                        <MaterialIcon name="cancel" className="text-[18px]" />
                        <span>{t('orderDetail.cancelOrder', 'Hủy đơn hàng')}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {order && isPrintOpen && (
        <OrderShippingLabelModal
          order={order}
          onClose={() => setIsPrintOpen(false)}
        />
      )}

      {order && isProofOpen && (
        <DeliveryProofDialog
          orderId={order.orderId}
          orderCode={order.orderCode}
          isOpen={isProofOpen}
          onClose={() => setIsProofOpen(false)}
          onSuccess={() => void loadDetail()}
        />
      )}
    </div>
  )
}