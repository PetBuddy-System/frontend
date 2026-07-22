import { useState } from 'react'
import { useNavigate } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { updateOrderStatusApi } from '~/features/profile/services'
import { getPaymentByOrderIdApi, retryMomoPaymentApi, retryVnPayPaymentApi } from '~/features/products/services/payment/payment-api'
import type { VoucherResponse } from '~/shared/lib/voucher'
import { formatDateOnly, formatTimeOnly } from '~/shared/lib/date'

export interface OrderHistoryCardProps {
  order: {
    orderId: number
    orderCode: string
    status: string
    finalAmount: number
    shippingFee?: number
    createdAt: string
    paymentMethod?: string
    paymentStatus?: string
    voucher?: VoucherResponse | null
    items?: Array<{
      productId: string
      name: string
      price: number
      quantity: number
      imageUrl?: string
    }>
    orderDetails?: Array<{
      orderDetailId: number
      productId: string
      productName: string
      productImage?: string
      unitPrice: number
      quantity: number
      totalPrice: number
      createdAt: string
    }>
    payment?: {
      paymentMethod: string
      status: string
    }
  }
  onRefresh: () => void
}
const STATUS_BADGE_STYLE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-sky-100 text-sky-800',
  PICKING: 'bg-cyan-100 text-cyan-800',
  SHIPPING: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-200 text-gray-600',
  CANCEL_REQUESTED: 'bg-amber-100 text-amber-800'
}

function getStatusBadgeClassName(status: string) {
  return STATUS_BADGE_STYLE[status] || 'bg-muted text-muted-foreground'
}

function getStatusLabel(status: string, t: (key: string) => string) {
  const key = status.toLowerCase()
  // Using the translations defined in orderDetail.status
  const translated = t(`orderDetail.status.${key}`)
  
  if (translated && !translated.startsWith('orderDetail.status')) {
    return translated
  }

  // Fallback map if translation is missing
  switch (status) {
    case 'PENDING':
      return 'Chờ xử lý'
    case 'CONFIRMED':
      return 'Đã xác nhận'
    case 'PICKING':
      return 'Đang lấy hàng'
    case 'SHIPPING':
      return 'Đang giao'
    case 'DELIVERED':
    case 'COMPLETED':
      return 'Đã giao'
    case 'CANCELLED':
      return 'Đã hủy'
    case 'EXPIRED':
      return 'Hết hạn'
    case 'CANCEL_REQUESTED':
      return 'Chờ hoàn tiền'
    case 'DELIVERY_FAILED':
    case 'RETURNED_TO_WAREHOUSE':
    case 'AWAITING_REDELIVERY':
    case 'COORDINATOR_REVIEW':
      return t('orderDetail.status.delivery_failed') || 'Giao thất bại'
    default:
      return status
  }
}

function formatPrice(value: number) {
  if (value == null || isNaN(Number(value))) return '—'
  return `${new Intl.NumberFormat('vi-VN').format(Number(value))}đ`
}

function formatDate(dateString: string) {
  if (!dateString) return ''
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return dateString
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

import { useTranslation } from 'react-i18next'

export function OrderHistoryCard({ order, onRefresh }: OrderHistoryCardProps) {
  const { t } = useTranslation('profile')
  const navigate = useNavigate()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)

  async function handleConfirmReceipt() {
    setIsConfirming(true)
    try {
      const res = await updateOrderStatusApi(order.orderId, 'COMPLETED')
      if (res.success) {
        setShowConfirmModal(false)
        onRefresh()
      } else {
        alert(res.message || 'Xác nhận nhận hàng thất bại')
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái')
    } finally {
      setIsConfirming(false)
    }
  }

  const isOnlinePayment =
    order.payment?.paymentMethod === 'CARD' ||
    order.payment?.paymentMethod === 'MOMO' ||
    order.payment?.paymentMethod === 'VNPAY' ||
    order.paymentMethod === 'CARD' ||
    order.paymentMethod === 'MOMO' ||
    order.paymentMethod === 'VNPAY'
  const isPaid = order.payment?.status === 'PAID' || order.paymentStatus === 'PAID'
  const canPayAgain =
    isOnlinePayment &&
    !isPaid &&
    order.status === 'PENDING'

  return (
    <>
      <article
        onClick={() => navigate(`/profile/orders/${order.orderId}`)}
        className={cn(
          'order-card flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer',
          (order.status === 'CANCELLED' || order.status === 'EXPIRED' || order.status === 'DELIVERY_FAILED' || order.status === 'RETURNED_TO_WAREHOUSE') && 'opacity-75'
        )}
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-foreground">#{order.orderCode}</span>
            <span
              className={cn(
                'rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                getStatusBadgeClassName(order.status)
              )}
            >
              {getStatusLabel(order.status, t)}
            </span>
          </div>
          <span>{t('orderHistory.orderDate', { date: formatDateOnly(order.createdAt) })}</span>
          <span className='text-xs text-muted-foreground'>{formatTimeOnly(order.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between gap-6 md:justify-end md:gap-8 w-full md:w-auto">
          <div className="text-left md:text-right">
            <p className="text-xs text-muted-foreground">{t('orderDetail.totalOrder', { defaultValue: 'Tổng thanh toán' })}</p>
            <p className="text-xl font-extrabold text-primary">{formatPrice(order.finalAmount)}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/profile/orders/${order.orderId}`)
              }}
              className="rounded-lg border-2 border-primary px-6 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-95"
            >
              {t('orderHistory.actions.viewDetails')}
            </button>

            {canPayAgain && (
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation()
                  setIsLoadingPayment(true)
                  try {
                    const isMomo =
                      order.payment?.paymentMethod === 'MOMO' ||
                      order.paymentMethod === 'MOMO'
                    const isVnPay =
                      order.payment?.paymentMethod === 'VNPAY' ||
                      order.paymentMethod === 'VNPAY'

                    if (isMomo) {
                      const res = await retryMomoPaymentApi(order.orderId)
                      if (res.success && res.data?.momoPayUrl) {
                        sessionStorage.setItem('pendingMomoOrderId', String(order.orderId))
                        sessionStorage.setItem('isMomoRetry', 'true')
                        window.location.href = res.data.momoPayUrl
                      } else {
                        alert(res.message || 'Không tìm thấy liên kết thanh toán MoMo.')
                      }
                    } else if (isVnPay) {
                      const res = await retryVnPayPaymentApi(order.orderId)
                      if (res.success && res.data?.vnpayPayUrl) {
                        sessionStorage.setItem('pendingVnPayOrderId', String(order.orderId))
                        sessionStorage.setItem('isVnPayRetry', 'true')
                        window.location.href = res.data.vnpayPayUrl
                      } else {
                        alert(res.message || 'Không tìm thấy liên kết thanh toán VNPAY.')
                      }
                    } else {
                      const res = await getPaymentByOrderIdApi(order.orderId)
                      if (res.success && res.data) {
                        const clientSecret = res.data.stripeClientSecret || ''
                        const orderShippingFee = order.shippingFee ?? 0
                        const orderIsFreeShipping = orderShippingFee === 0
                        navigate('/payment', {
                          state: {
                            orderId: order.orderId,
                            clientSecret,
                            amount: order.finalAmount,
                            shippingFee: orderShippingFee,
                            isFreeShipping: orderIsFreeShipping,
                            isRetry: true,
                          }
                        })
                      } else {
                        alert(res.message || 'Không thể lấy thông tin thanh toán.')
                      }
                    }
                  } catch {
                    alert('Có lỗi xảy ra khi lấy thông tin thanh toán.')
                  } finally {
                    setIsLoadingPayment(false)
                  }
                }}
                disabled={isLoadingPayment}
                className="rounded-lg bg-success px-4 py-2.5 text-sm font-bold text-success-foreground shadow-sm transition-colors hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                {isLoadingPayment ? t('orderCancel.loading', { defaultValue: 'Đang tải...' }) : t('orderDetail.payAgain', { defaultValue: 'Thanh toán lại' })}
              </button>
            )}

            {order.status === 'DELIVERED' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowConfirmModal(true)
                }}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:opacity-90 active:scale-95"
              >
                {t('orderDetail.confirmDelivered', { defaultValue: 'Đã nhận được hàng' })}
              </button>
            )}
          </div>
        </div>
      </article>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h4 className="font-display text-lg font-bold text-foreground mb-2">{t('orderDetail.deliveryProofTitle', { defaultValue: 'Xác nhận nhận hàng' })}</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Bạn xác nhận đã nhận đầy đủ sản phẩm và muốn hoàn tất đơn hàng?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
              >
                {t('orderDetail.cancel', { defaultValue: 'Hủy' })}
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmReceipt()}
                disabled={isConfirming}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                {t('orderDetail.confirm', { defaultValue: 'Xác nhận' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}