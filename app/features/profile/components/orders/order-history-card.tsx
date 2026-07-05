import { useState } from 'react'
import { useNavigate } from 'react-router'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { updateOrderStatusApi } from '~/features/profile/services'
import { getPaymentByOrderIdApi } from '~/features/products/services/payment/payment-api'
import type { VoucherResponse } from '~/shared/lib/voucher'

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

// Badge style per status: "Nhãn tiếng Việt | STATUS" pill, matching reference design
const STATUS_BADGE_STYLE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-sky-100 text-sky-800',
  PICKING: 'bg-cyan-100 text-cyan-800',
  SHIPPING: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800'
}

function getStatusBadgeClassName(status: string) {
  return STATUS_BADGE_STYLE[status] || 'bg-muted text-muted-foreground'
}

function getStatusLabel(status: string) {
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
      return 'Đã giao (Chờ nhận)'
    case 'COMPLETED':
      return 'Đã giao'
    case 'CANCELED':
      return 'Đã hủy'
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

export function OrderHistoryCard({ order, onRefresh }: OrderHistoryCardProps) {
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

  const isCard = order.payment?.paymentMethod === 'CARD' || order.paymentMethod === 'CARD'
  const isPaid = order.payment?.status === 'PAID' || order.paymentStatus === 'PAID'
  const canPayAgain = isCard && !isPaid && order.status !== 'CANCELED'

  return (
    <>
      <article
        onClick={() => navigate(`/profile/orders/${order.orderId}`)}
        className={cn(
          'order-card flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer',
          order.status === 'CANCELED' && 'opacity-75'
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
              {getStatusLabel(order.status)} | {order.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Ngày đặt: {formatDate(order.createdAt)}</p>
        </div>

        <div className="flex items-center justify-between gap-6 md:justify-end md:gap-8 w-full md:w-auto">
          <div className="text-left md:text-right">
            <p className="text-xs text-muted-foreground">Tổng thanh toán</p>
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
              Xem chi tiết
            </button>

            {canPayAgain && (
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation()
                  setIsLoadingPayment(true)
                  try {
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
                          isFreeShipping: orderIsFreeShipping
                        }
                      })
                    } else {
                      alert(res.message || 'Không thể lấy thông tin thanh toán.')
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
                {isLoadingPayment ? 'Đang tải...' : 'Thanh toán lại'}
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
                Đã nhận được hàng
              </button>
            )}
          </div>
        </div>
      </article>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h4 className="font-display text-lg font-bold text-foreground mb-2">Xác nhận nhận hàng</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Bạn xác nhận đã nhận đầy đủ sản phẩm và muốn hoàn tất đơn hàng?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmReceipt()}
                disabled={isConfirming}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}