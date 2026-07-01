import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { fetchOrderDetailApi, updateOrderStatusApi } from '~/features/profile/services/order/order-api'
import type { OrderDetailFull } from '~/shared/lib/order'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

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

function getStatusLabel(status: string) {
  switch (status) {
    case 'PENDING': return 'CHỜ XỬ LÝ'
    case 'CONFIRMED': return 'ĐÃ XÁC NHẬN'
    case 'PICKING': return 'ĐANG LẤY HÀNG'
    case 'SHIPPING': return 'ĐANG GIAO HÀNG'
    case 'DELIVERED': return 'ĐÃ GIAO (CHỜ NHẬN)'
    case 'COMPLETED': return 'HOÀN THÀNH'
    case 'CANCELED': return 'ĐÃ HỦY'
    default: return status.toUpperCase()
  }
}

export function OrderDetailView({ orderId, isStaff }: OrderDetailViewProps) {
  const [order, setOrder] = useState<OrderDetailFull | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)
  const navigate = useNavigate()

  async function loadDetail() {
    setIsLoading(true)
    try {
      const res = await fetchOrderDetailApi(orderId)
      if (res.success && res.data) {
        setOrder(res.data)
      } else {
        setError(res.message || 'Không thể tải chi tiết đơn hàng.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      void loadDetail()
    }
  }, [orderId])

  async function handleCancelOrder() {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return
    setIsCanceling(true)
    try {
      const res = await updateOrderStatusApi(orderId, 'CANCELED')
      if (res.success) {
        alert('Hủy đơn hàng thành công')
        void loadDetail()
      } else {
        alert(res.message || 'Hủy đơn hàng thất bại')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra khi hủy đơn hàng')
    } finally {
      setIsCanceling(false)
    }
  }

  const getProgressWidth = (status: string) => {
    switch (status) {
      case 'PENDING': return 'w-[0%]'
      case 'CONFIRMED':
      case 'PICKING': return 'w-[25%]'
      case 'SHIPPING': return 'w-[50%]'
      case 'DELIVERED': return 'w-[75%]'
      case 'COMPLETED': return 'w-[100%]'
      default: return 'w-[0%]'
    }
  }

  const isStepActive = (stepIndex: number, status: string) => {
    const statusLevels: Record<string, number> = {
      'PENDING': 0,
      'CONFIRMED': 1,
      'PICKING': 1,
      'SHIPPING': 2,
      'DELIVERED': 3,
      'COMPLETED': 4,
      'CANCELED': -1
    }
    const currentLevel = statusLevels[status] ?? 0
    return currentLevel >= stepIndex
  }

  const subtotal = order?.orderDetails?.reduce((sum, item) => sum + item.totalPrice, 0) ?? 0
  const shippingFee = order?.shippingFee ?? (subtotal > 500000 ? 0 : 30000)
  const isFreeShipping = shippingFee === 0
  const discount = order?.voucher?.discountValue ?? (subtotal + shippingFee - (order?.finalAmount ?? subtotal))

  // Determine if the Cancel Order button should be visible
  const canCancel = (() => {
    if (!order) return false
    if (order.status === 'CANCELED' || order.status === 'COMPLETED') return false
    if (isStaff) return true // Staff can cancel if not completed/canceled
    // User can cancel if pending, confirmed, or picking
    return order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PICKING'
  })()

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="max-w-5xl mx-auto flex flex-col gap-6 py-6 pb-24">
        {/* Back and Status Bar */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(isStaff ? '/staff/orders' : '/profile/orders')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <MaterialIcon name="chevron_left" className="text-[20px]" />
              <span className="font-semibold uppercase tracking-wider text-sm">QUAY LẠI</span>
            </button>
            <div className="flex items-center gap-4 text-sm font-medium">
              {order && <span className="text-muted-foreground">ORDER ID. {order.orderCode}</span>}
              <span className="text-border">|</span>
              {order && (
                <span className={cn(
                  'font-bold uppercase tracking-wider',
                  order.status === 'COMPLETED' ? 'text-success' :
                  order.status === 'CANCELED' ? 'text-destructive' : 'text-primary'
                )}>
                  {getStatusLabel(order.status)}
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
              <p className="font-semibold">{error ?? 'Không tìm thấy thông tin đơn hàng'}</p>
            </div>
          ) : (
            /* Stepper progress */
            <div className="mt-12 relative px-4 pb-4">
              <div className="absolute top-6 left-0 w-full h-1 bg-border -translate-y-1/2 z-0"></div>
              <div className={cn(
                "absolute top-6 left-0 h-1 bg-success -translate-y-1/2 z-0 transition-all duration-500",
                getProgressWidth(order.status)
              )}></div>

              <div className="relative z-10 flex justify-between items-start">
                <div className="flex flex-col items-center gap-3 w-20 sm:w-32">
                  <div className={cn(
                    "w-12 h-12 rounded-full bg-card border-4 flex items-center justify-center shadow-sm transition-colors",
                    isStepActive(0, order.status) ? "border-success text-success" : "border-border text-muted-foreground"
                  )}>
                    <MaterialIcon name="receipt_long" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">Đã đặt hàng</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatDateTime(order.createdAt)}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 w-20 sm:w-32">
                  <div className={cn(
                    "w-12 h-12 rounded-full bg-card border-4 flex items-center justify-center shadow-sm transition-colors",
                    isStepActive(1, order.status) ? "border-success text-success" : "border-border text-muted-foreground"
                  )}>
                    <MaterialIcon name="payments" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">Xác nhận TT</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {isStepActive(1, order.status) ? formatDateTime(order.updatedAt || order.createdAt) : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 w-20 sm:w-32">
                  <div className={cn(
                    "w-12 h-12 rounded-full bg-card border-4 flex items-center justify-center shadow-sm transition-colors",
                    isStepActive(2, order.status) ? "border-success text-success" : "border-border text-muted-foreground"
                  )}>
                    <MaterialIcon name="local_shipping" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">Giao xuất kho</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {isStepActive(2, order.status) ? formatDateTime(order.updatedAt || order.createdAt) : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 w-20 sm:w-32">
                  <div className={cn(
                    "w-12 h-12 rounded-full bg-card border-4 flex items-center justify-center shadow-sm transition-colors",
                    isStepActive(3, order.status) ? "border-success text-success" : "border-border text-muted-foreground"
                  )}>
                    <MaterialIcon name="move_to_inbox" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">Đã giao hàng</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {isStepActive(3, order.status) ? formatDateTime(order.updatedAt || order.createdAt) : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 w-20 sm:w-32">
                  <div className={cn(
                    "w-12 h-12 rounded-full bg-card border-4 flex items-center justify-center shadow-sm transition-colors",
                    isStepActive(4, order.status) ? "border-success text-success" : "border-border text-muted-foreground"
                  )}>
                    <MaterialIcon name="grade" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">Hoàn thành</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {isStepActive(4, order.status) ? formatDateTime(order.updatedAt || order.createdAt) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {order && !isLoading && (
          <>
            {/* Shipping Address Section */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MaterialIcon name="local_shipping" className="text-[18px]" />
                </div>
                <h2 className="font-bold text-base text-foreground">Thông tin nhận hàng</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Người nhận</p>
                    <p className="font-bold text-foreground text-lg">{order.recipientName || 'Chưa cung cấp'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Số điện thoại</p>
                    <p className="font-semibold text-foreground text-sm">{order.phoneNumber || 'Chưa cung cấp'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Địa chỉ giao hàng</p>
                    <p className="text-sm text-foreground leading-relaxed font-medium">{order.address || 'Chưa cung cấp'}</p>
                  </div>
                  {order.note && (
                    <div className="p-3 bg-muted rounded-lg border border-border/40">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">Ghi chú</p>
                      <p className="text-xs italic text-muted-foreground">"{order.note}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product List Section */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
                <h2 className="font-bold text-base text-foreground">Sản phẩm đã đặt</h2>
                <span className="text-xs text-muted-foreground font-semibold">
                  {order.orderDetails?.length || 0} sản phẩm
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
                            target.src = '/placeholder-product.png'
                          }}
                        />
                      </button>
                      <div className="flex-grow flex flex-col gap-1 min-w-0">
                        <button
                          onClick={() => navigate(`/products/${detail.productId}`)}
                          className="font-bold text-base text-foreground leading-tight hover:text-primary transition-colors text-left truncate hover:underline"
                        >
                          {detail.productName}
                        </button>
                        <p className="text-xs text-muted-foreground">Số lượng: x{detail.quantity}</p>
                        <p className="text-xs text-muted-foreground">Đơn giá: {formatPrice(detail.unitPrice)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-primary">{formatPrice(detail.totalPrice)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">Không có sản phẩm nào.</p>
                )}
              </div>

              <div className="bg-muted/30 px-6 py-3 border-t border-border flex justify-between items-center text-xs font-semibold text-muted-foreground">
                <span>Phương thức thanh toán</span>
                <span className="text-foreground">
                  {order.payment?.paymentMethod === 'CARD' ? 'Thanh toán trực tuyến' : 'Thanh toán khi nhận hàng'}
                </span>
              </div>
            </div>

            {/* Payment Status & Detail */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MaterialIcon name="receipt_long" className="text-[18px]" />
                </div>
                <h2 className="font-bold text-base text-foreground">Chi tiết thanh toán</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-bold">Phương thức thanh toán</p>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border/40">
                      <MaterialIcon name={order.payment?.paymentMethod === 'CARD' ? 'credit_card' : 'payments'} className="text-primary text-[28px]" />
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {order.payment?.paymentMethod === 'CARD' ? 'Thanh toán thẻ' : 'Tiền mặt'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {order.payment?.paymentMethod === 'CARD' ? 'Qua cổng thanh toán Stripe' : 'Thanh toán COD khi nhận hàng'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 font-bold">Trạng thái thanh toán</p>
                    <div className={cn(
                      "flex items-center gap-1.5 font-bold text-sm",
                      order.payment?.status === 'PAID' ? "text-success" : "text-amber-500"
                    )}>
                      <MaterialIcon name={order.payment?.status === 'PAID' ? "verified_user" : "schedule"} className="text-[18px]" />
                      <span>
                        {order.payment?.status === 'PAID' ? "Đã thanh toán" : "Chờ thanh toán khi nhận hàng"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/40 p-4 rounded-xl border border-border/40 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Tổng giá trị sản phẩm</span>
                    <span className="font-semibold text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Phí giao hàng</span>
                    <span className="font-semibold text-foreground">{formatPrice(shippingFee)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Mã giảm giá</span>
                        {order.voucherCode && (
                          <span className="text-[9px] font-mono text-destructive uppercase font-bold">{order.voucherCode}</span>
                        )}
                      </div>
                      <span className="text-destructive font-bold">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="h-px bg-border my-1"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">Tổng đơn hàng</span>
                    <span className="text-lg font-black text-primary">{formatPrice(order.finalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
