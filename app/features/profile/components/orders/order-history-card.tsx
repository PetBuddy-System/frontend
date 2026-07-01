import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { updateOrderStatusApi } from '~/features/profile/services'
import { getPaymentByOrderIdApi } from '~/features/products/services/payment/payment-api'

export interface OrderHistoryCardProps {
  order: {
    orderId: number
    orderCode: string
    status: string
    finalAmount: number
    createdAt: string
    paymentMethod?: string
    paymentStatus?: string
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

const STATUS_ICON: Record<string, string> = {
  PENDING: 'schedule',
  CONFIRMED: 'check_circle',
  PICKING: 'inventory',
  SHIPPING: 'local_shipping',
  DELIVERED: 'check_circle',
  COMPLETED: 'task_alt',
  CANCELED: 'cancel'
}

function getStatusClassName(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'text-success'
    case 'DELIVERED':
      return 'text-purple-600 dark:text-purple-400'
    case 'SHIPPING':
      return 'text-info'
    case 'PICKING':
      return 'text-cyan-600 dark:text-cyan-400'
    case 'CONFIRMED':
      return 'text-blue-600 dark:text-blue-400'
    case 'PENDING':
      return 'text-warning'
    case 'CANCELED':
      return 'text-destructive'
    default:
      return 'text-muted-foreground'
  }
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
      return 'Đang giao hàng'
    case 'DELIVERED':
      return 'Đã giao (Chờ nhận)'
    case 'COMPLETED':
      return 'Giao hàng thành công'
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

  // Robustly extract order items in consistent format
  const products = (() => {
    if (order.orderDetails && order.orderDetails.length > 0) {
      return order.orderDetails.map(d => ({
        productId: d.productId,
        name: d.productName,
        price: d.unitPrice,
        quantity: d.quantity,
        imageUrl: d.productImage,
      }))
    }
    if (order.items && order.items.length > 0) {
      return order.items.map(i => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        imageUrl: i.imageUrl,
      }))
    }
    return []
  })()

  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0)

  // Payment Status checks
  const isCard = order.payment?.paymentMethod === 'CARD' || order.paymentMethod === 'CARD'
  const isPaid = order.payment?.status === 'PAID' || order.paymentStatus === 'PAID'
  const canPayAgain = isCard && !isPaid && order.status !== 'CANCELED'

  return (
    <>
      <article
        onClick={() => navigate(`/profile/orders/${order.orderId}`)}
        className={cn(
          'overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/40 p-5 flex flex-col gap-4 cursor-pointer',
          order.status === 'CANCELED' && 'opacity-85 grayscale-[0.3]'
        )}
      >
        {/* Shop Header Block (Image 1 Shopee style) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Shop Name */}
            <span className="text-sm font-bold text-foreground">
              PetBuddy Store
            </span>
          </div>

          {/* Right Status Label */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className={cn("flex items-center gap-1", getStatusClassName(order.status))}>
              <MaterialIcon
                name={STATUS_ICON[order.status] || 'schedule'}
                filled={order.status === 'COMPLETED'}
                className="text-[16px]"
              />
              <span>{getStatusLabel(order.status)}</span>
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-destructive font-bold uppercase">{order.status}</span>
          </div>
        </div>

        {/* Product Items List */}
        <div className="flex flex-col divide-y divide-border/50">
          {products.map((product, idx) => (
            <div key={idx} className="flex gap-4 py-4 first:pt-1 last:pb-1">
              {/* Product Image */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/products/${product.productId}`)
                }}
                className="w-20 h-20 rounded-xl border border-border/80 bg-muted shrink-0 overflow-hidden hover:opacity-90 transition-opacity"
              >
                <img
                  src={product.imageUrl || '/placeholder-product.png'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.onerror = null
                    target.src = '/placeholder-product.png'
                  }}
                />
              </button>
              {/* Name & Variation */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/products/${product.productId}`)
                    }}
                    className="font-bold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors text-left hover:underline"
                  >
                    {product.name}
                  </button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Phân loại: Dành cho thú cưng
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    x{product.quantity}
                  </p>
                </div>
              </div>
              {/* Price Details */}
              <div className="text-right shrink-0 flex flex-col justify-center gap-0.5">
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.price * 1.2)}
                </span>
                <span className="text-sm font-bold text-destructive">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Summary & Action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-border mt-1">
          {/* Order Code */}
          <span className="text-xs text-muted-foreground font-semibold">
            Mã đơn hàng: #{order.orderCode}
          </span>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 ml-auto">
            {/* Total Paid */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MaterialIcon name="payments" className="text-[16px] text-success" />
              <span>Thành tiền ({totalQuantity} sản phẩm):</span>
              <span className="text-base font-extrabold text-destructive">
                {formatPrice(order.finalAmount)}
              </span>
            </div>

            {/* Buttons Row */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/profile/orders/${order.orderId}`)
                }}
                className="rounded-lg border border-primary px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/5 shadow-sm active:scale-95"
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
                        navigate('/payment', {
                          state: {
                            orderId: order.orderId,
                            clientSecret,
                            amount: order.finalAmount
                          }
                        })
                      } else {
                        alert(res.message || 'Không thể lấy thông tin thanh toán.')
                      }
                    } catch (err) {
                      alert('Có lỗi xảy ra khi lấy thông tin thanh toán.')
                    } finally {
                      setIsLoadingPayment(false)
                    }
                  }}
                  disabled={isLoadingPayment}
                  className="rounded-lg bg-success text-success-foreground px-4 py-2 text-xs font-bold shadow-sm transition-colors hover:opacity-90 active:scale-95 disabled:opacity-50"
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
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:opacity-90 active:scale-95"
                >
                  Đã nhận được hàng
                </button>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h4 className="font-display text-lg font-bold text-foreground mb-2">
              Xác nhận nhận hàng
            </h4>
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
