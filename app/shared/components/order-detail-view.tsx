import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { fetchOrderDetailApi, updateOrderStatusApi } from '~/features/profile/services/order/order-api'
import { retryMomoPaymentApi, retryVnPayPaymentApi } from '~/features/products/services/payment/payment-api'
import type { OrderDetailFull } from '~/shared/lib/order'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { OrderShippingLabelModal } from './order-shipping-label-modal'
import { useAuth } from '~/providers/auth-provider'
import { DeliveryProofDialog } from '~/features/staff/components/orders/delivery-proof-dialog'
import { DeliveryRouteDialog } from '~/features/staff/components/orders/delivery-route-dialog'

import { OrderStatusSteps } from './order-detail/order-status-steps'
import { OrderShippingInfo } from './order-detail/order-shipping-info'
import { OrderProductList } from './order-detail/order-product-list'
import { OrderPaymentDetail } from './order-detail/order-payment-detail'
import { OrderActionButtons } from './order-detail/order-action-buttons'
import { StaffOrderPickingDialog } from '~/features/staff/components/orders/staff-order-picking-dialog'
import { formatDateOnly, formatTimeOnly } from '~/shared/lib/date'

interface OrderDetailViewProps {
  orderId: number
  isStaff: boolean
  isAdmin?: boolean
}

function formatPrice(value: number) {
  if (value == null || isNaN(Number(value))) return '0đ'
  return `${new Intl.NumberFormat('vi-VN').format(Number(value))}đ`
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

export function OrderDetailView({ orderId, isStaff, isAdmin = false }: OrderDetailViewProps) {
  const { t } = useTranslation('profile')
  const [order, setOrder] = useState<OrderDetailFull | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isProofOpen, setIsProofOpen] = useState(false)
  const [isRouteOpen, setIsRouteOpen] = useState(false)
  const [isPickingOpen, setIsPickingOpen] = useState(false)
  const { user } = useAuth()
  const isShipper = user?.role === 'STAFF' && user?.staffTask === 'SHIPPER'
  const isCoordinator = user?.role === 'STAFF' && user?.staffTask === 'COORDINATOR'
  const navigate = useNavigate()

  const isCountdownExpired =
    order?.status === 'PENDING' &&
    (order?.payment?.paymentMethod === 'CARD' || order?.payment?.paymentMethod === 'MOMO' || order?.payment?.paymentMethod === 'VNPAY') &&
    order?.payment?.status !== 'PAID' &&
    countdown === 0 &&
    Boolean(order?.paymentExpiredAt)

  const isRefundPending = order?.status === 'CANCEL_REQUESTED'

  // Ảnh xác nhận giao hàng được BE gắn mediaPurpose = 'SHIPPING'.
  // Chỉ lấy các file còn active (phòng trường hợp BE soft-delete).
  const deliveryProofUrl = order?.mediaFiles?.find(
    (m) => m.mediaPurpose === 'SHIPPING' && m.mediaStatus !== 'DELETED'
  )?.fileUrl

  const loadDetail = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetchOrderDetailApi(orderId)
      if (res.success && res.data) {
        setOrder(res.data)
        if (res.data.status === 'PENDING' && res.data.payment?.status !== 'PAID') {
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

  useEffect(() => {
    if (order?.status !== 'PENDING' || !order?.paymentExpiredAt || order?.payment?.status === 'PAID') return
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [order?.status, order?.paymentExpiredAt, order?.payment?.status, countdown])


  async function handleCancelOrder() {
    // Staff redirects to a cancel reason page that directly cancels (no refund flow)
    if (isStaff) {
      navigate(`/staff/orders/${orderId}/cancel`)
      return
    }

    if (!isStaff && (order?.payment?.paymentMethod === 'CARD' || order?.payment?.paymentMethod === 'MOMO' || order?.payment?.paymentMethod === 'VNPAY')) {
      navigate(`/profile/orders/${orderId}/cancel`)
      return
    }

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

  async function handleRetryPayment() {
    if (!order) return
    if (order.payment?.paymentMethod === 'MOMO') {
      try {
        const res = await retryMomoPaymentApi(order.orderId)
        if (res.success && res.data?.momoPayUrl) {
          sessionStorage.setItem('pendingMomoOrderId', String(order.orderId))
          sessionStorage.setItem('isMomoRetry', 'true')
          window.location.href = res.data.momoPayUrl
        } else {
          alert(res.message || t('orderDetail.momoUrlMissing', 'Không tìm thấy liên kết thanh toán MoMo.'))
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      }
      return
    }

    if (order.payment?.paymentMethod === 'VNPAY') {
      try {
        const res = await retryVnPayPaymentApi(order.orderId)
        if (res.success && res.data?.vnpayPayUrl) {
          sessionStorage.setItem('pendingVnPayOrderId', String(order.orderId))
          sessionStorage.setItem('isVnPayRetry', 'true')
          window.location.href = res.data.vnpayPayUrl
        } else {
          alert(res.message || t('orderDetail.vnpayUrlMissing', 'Không tìm thấy liên kết thanh toán VNPAY.'))
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      }
      return
    }

    if (!order.clientSecret) return
    navigate('/payment', {
      state: {
        orderId: order.orderId,
        clientSecret: order.clientSecret,
        amount: order.finalAmount,
        shippingFee: order.shippingFee ?? 0,
        isFreeShipping: false,
        isRetry: true,
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
    if (
      order.status === 'CANCELLED' ||
      order.status === 'COMPLETED' ||
      order.status === 'EXPIRED' ||
      order.status === 'SHIPPING' ||
      order.status === 'DELIVERED' ||
      isRefundPending
    ) return false
    return order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PICKING'
  })()

  const showCancelButton = (() => {
    if (!order) return false
    if (isRefundPending) return false
    return (
      order.status === 'PENDING' ||
      order.status === 'CONFIRMED' ||
      order.status === 'PICKING' ||
      order.status === 'PICKED'
    )
  })()

  const isCancelDisabled = order?.status === 'PICKED'

  const canRetryPayment =
    !isStaff &&
    order?.status === 'PENDING' &&
    (order?.payment?.paymentMethod === 'CARD' || order?.payment?.paymentMethod === 'MOMO' || order?.payment?.paymentMethod === 'VNPAY') &&
    order?.payment?.status !== 'PAID' &&
    !isExpired

  const isTerminal = order?.status === 'CANCELLED' || order?.status === 'EXPIRED'

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="max-w-5xl mx-auto flex flex-col gap-6 py-6 pb-24">
        {order && isExpired && !isLoading && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-destructive">
            <MaterialIcon name="warning" filled className="text-[22px] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">{t('orderDetail.expiredBanner')}</p>
            </div>
          </div>
        )}

        {order && order.status === 'PENDING' && (order.payment?.paymentMethod === 'CARD' || order.payment?.paymentMethod === 'MOMO' || order.payment?.paymentMethod === 'VNPAY') && order.payment?.status !== 'PAID' && !isExpired && !isLoading && (
          <div className="flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 px-5 py-4 text-warning">
            <MaterialIcon name="schedule" className="text-[22px] shrink-0" />
            <p className="font-semibold text-sm">
              {t('orderDetail.pendingBanner', { time: formatCountdown(countdown) })}
            </p>
          </div>
        )}

        {order && isRefundPending && !isLoading && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-50 dark:bg-amber-950/20 px-5 py-4 text-amber-700 dark:text-amber-400">
            <MaterialIcon name="hourglass_top" className="text-[22px] shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-base">{t('orderDetail.refundPendingTitle', 'Yêu cầu hoàn tiền đang chờ xác nhận')}</p>
              {isStaff ? (
                <p className="text-sm font-medium opacity-90 mt-1.5">
                  <span className="font-semibold">{t('orderDetail.cancelReasonLabel', 'Lý do khách hủy:')}</span>{' '}
                  {order.payment?.cancelReason || t('orderDetail.noCancelReason', 'Khách hàng không cung cấp lý do')}
                </p>
              ) : (
                <p className="text-sm font-medium opacity-80 mt-1">
                  {t('orderDetail.refundPendingDesc', 'Nhân viên sẽ xem xét và xác nhận hoàn tiền cho bạn sớm nhất có thể.')}
                </p>
              )}
            </div>
          </div>
        )}

        {order && order.status === 'DELIVERY_FAILED' && order.cancelReason && !isLoading && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-destructive">
            <MaterialIcon name="error_outline" className="text-[22px] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">
                {t('orderDetail.deliveryFailedTitle', 'Giao hàng thất bại')}
              </p>
              <p className="text-sm font-medium opacity-90 mt-1">
                <span className="font-semibold">{t('orderDetail.reasonLabel', 'Lý do:')}</span> {order.cancelReason}
              </p>
            </div>
          </div>
        )}

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(isAdmin ? '/admin/orders' : isStaff ? '/staff/orders' : '/profile/orders')}
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
                          isRefundPending ? 'text-amber-600 dark:text-amber-400' :
                            'text-primary'
                  )}
                >
                  {isExpired && order.status === 'PENDING'
                    ? t('orderDetail.status.expired', 'Hết hạn')
                    : isRefundPending
                      ? t('orderDetail.status.cancel_requested', 'Chờ hoàn tiền')
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
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-destructive/10 text-destructive">
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
              {order.status === 'CANCELLED' && order.cancelReason && (
                <p className="text-sm text-destructive/80 font-medium mt-1 text-center max-w-md">
                  <span className="font-semibold">{t('orderDetail.reasonLabel', 'Lý do:')}</span> {order.cancelReason}
                </p>
              )}
              <div className="flex flex-col items-center text-xs text-muted-foreground">
                <span>{formatDateOnly(order.updatedAt || order.createdAt)}</span>
                <span>{formatTimeOnly(order.updatedAt || order.createdAt)}</span>
              </div>
            </div>
          ) : (
            <div className="mt-12 px-2 pb-4">
              <OrderStatusSteps order={order} formatDate={formatDateOnly} formatTime={formatTimeOnly} />
            </div>
          )}
        </div>

        {order && !isLoading && (
          <>
            <OrderShippingInfo order={order} />

            <OrderProductList order={order} formatPrice={formatPrice} isShipper={isShipper} />

            <OrderPaymentDetail
              order={order}
              formatPrice={formatPrice}
              subtotal={subtotal}
              shippingFee={shippingFee}
              discount={discount}
              isShipper={isShipper}
            />

            {/* Delivery Proof Image — only visible to staff/admin (customer never receives it from BE) */}
            {(isStaff || isAdmin) && deliveryProofUrl && (
              <div className='rounded-xl border border-border bg-card p-5 shadow-sm'>
                <div className='flex items-center gap-2 mb-4 border-b border-border pb-3'>
                  <div className='w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0'>
                    <MaterialIcon name='photo_camera' className='text-success text-[18px]' />
                  </div>
                  <h2 className='font-bold text-base text-foreground'>{t('orderDetail.deliveryProofImage', 'Ảnh xác nhận giao hàng')}</h2>
                </div>
                <div className='w-full max-w-md max-h-96 rounded-xl border border-border overflow-hidden'>
                  <img
                    src={deliveryProofUrl}
                    alt={t('orderDetail.deliveryProofImage', 'Ảnh xác nhận giao hàng')}
                    className='w-full h-full object-contain'
                    onError={(e) => { e.currentTarget.parentElement?.style.setProperty('display', 'none') }}
                  />
                </div>
              </div>
            )}

            {(isStaff || showCancelButton || canRetryPayment) && !isAdmin && (
              <OrderActionButtons
                order={order}
                isStaff={isStaff}
                isShipper={isShipper}
                isCoordinator={isCoordinator}
                showCancelButton={showCancelButton}
                isCancelDisabled={isCancelDisabled}
                isExpired={isExpired}
                isCanceling={isCanceling}
                onPrint={() => setIsPrintOpen(true)}
                onProofOpen={() => setIsProofOpen(true)}
                onOpenPicking={() => setIsPickingOpen(true)}
                onRetryPayment={handleRetryPayment}
                onCancelOrder={handleCancelOrder}
                onStatusUpdate={() => void loadDetail()}
              />
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
          onSuccess={() => {
            void loadDetail()
            setIsRouteOpen(true)
          }}
        />
      )}

      {order && isRouteOpen && isShipper && (
        <DeliveryRouteDialog
          staffId={user?.userId ?? ''}
          isOpen={isRouteOpen}
          onClose={() => setIsRouteOpen(false)}
        />
      )}
      {order && isPickingOpen && (
        <StaffOrderPickingDialog
          order={order}
          onClose={() => setIsPickingOpen(false)}
          onSuccess={() => void loadDetail()}
        />
      )}
    </div>
  )
}