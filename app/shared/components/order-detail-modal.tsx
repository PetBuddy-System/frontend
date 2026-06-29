// app/shared/components/order-detail-modal.tsx
import { useState, useEffect } from 'react'
import { fetchOrderDetailApi } from '~/features/profile/services/order/order-api'
import type { OrderDetailFull } from '~/shared/lib/order'

interface OrderDetailModalProps {
  orderId: number
  orderCode: string
  isStaff: boolean
  onClose: () => void
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

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return {
        bg: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30',
        label: 'Chờ xử lý',
        svg: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        )
      }
    case 'CONFIRMED':
      return {
        bg: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
        label: 'Đã xác nhận',
        svg: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    case 'PICKING':
      return {
        bg: 'bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30',
        label: 'Đang lấy hàng',
        svg: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      }
    case 'SHIPPING':
      return {
        bg: 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/30',
        label: 'Đang giao hàng',
        svg: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        )
      }
    case 'DELIVERED':
      return {
        bg: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30',
        label: 'Đã giao (Chờ nhận)',
        svg: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        )
      }
    case 'COMPLETED':
      return {
        bg: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30',
        label: 'Hoàn thành',
        svg: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    case 'CANCELED':
      return {
        bg: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
        label: 'Đã hủy',
        svg: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
    default:
      return {
        bg: 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-900/30',
        label: status,
        svg: (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      }
  }
}

export function OrderDetailModal({ orderId, orderCode, isStaff, onClose }: OrderDetailModalProps) {
  const [order, setOrder] = useState<OrderDetailFull | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function loadDetail() {
      setIsLoading(true)
      try {
        const res = await fetchOrderDetailApi(orderId)
        if (active && res.success && res.data) {
          setOrder(res.data)
        } else if (active) {
          setError(res.message || 'Không thể tải chi tiết đơn hàng.')
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Có lỗi xảy ra.')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }
    void loadDetail()
    return () => {
      active = false
    }
  }, [orderId])

  // Resolve display name — backend uses recipientName, mock also stores userName
  const recipientName = order?.recipientName ?? order?.userName ?? ''

  const backdropClass = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.3s_ease-out]'
  const modalContainerClass = 'bg-white dark:bg-[#111a2e] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-[modalScale_0.3s_ease-out] border border-gray-100 dark:border-slate-800'

  return (
    <div className={backdropClass} data-purpose="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={modalContainerClass} data-purpose="order-detail-modal">
        {/* Modal Header */}
        <header className="relative px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Chi tiết đơn hàng</h2>
          <p className="text-sm text-gray-500 mt-1">#{orderCode}</p>
          <button
            aria-label="Đóng"
            onClick={onClose}
            className="absolute top-5 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto max-h-[65vh] custom-scrollbar p-5 space-y-5" data-purpose="modal-content">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : error || !order ? (
            <div className="text-center py-12 text-destructive">
              <p>{error ?? 'Không tìm thấy đơn hàng'}</p>
            </div>
          ) : (
            <>
              {/* Order Status Summary */}
              <section className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-gray-500 text-sm">Trạng thái</span>
                  {(() => {
                    const badge = getStatusBadge(order.status)
                    return (
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border w-fit ${badge.bg}`}>
                        {badge.svg}
                        <span className="text-sm font-semibold">{badge.label}</span>
                      </div>
                    )
                  })()}
                </div>
                <div className="space-y-1 md:text-right">
                  <span className="text-gray-500 text-sm block">Ngày đặt hàng</span>
                  <span className="text-gray-800 dark:text-slate-200 font-medium">{formatDateTime(order.createdAt)}</span>
                </div>
              </section>

              {/* Product List Section — uses orderDetails from Java DTO */}
              <section data-purpose="product-list">
                <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Danh sách sản phẩm
                </h3>
                <div className="space-y-4">
                  {order.orderDetails?.length ? order.orderDetails.map((detail) => (
                    <div className="flex items-center gap-3 py-2">
                    <img
                      src={detail.productImage || ''}
                      alt={detail.productName}
                      className="w-50 h-50 object-cover rounded-lg bg-gray-200 flex-shrink-0"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.onerror = null
                        target.src = '/placeholder-product.png'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-slate-200 line-clamp-1">{detail.productName}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Số lượng: {detail.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 flex-shrink-0">{formatPrice(detail.totalPrice)}</span>
                  </div>
                  )) : (
                    <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">Không có sản phẩm nào.</p>
                  )}
                </div>
              </section>

              {/* Shipping Info */}
              {/* Shipping Info */}
<section className="space-y-6" data-purpose="additional-details">
  <div className="p-4 bg-gray-50 dark:bg-slate-800/20 rounded-xl">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Thông tin giao hàng</p>
    <div className="space-y-2">
      {recipientName && (
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{recipientName}</p>
        </div>
      )}
      {order.phoneNumber && (
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <p className="text-sm text-gray-600 dark:text-slate-400">{order.phoneNumber}</p>
        </div>
      )}
      {order.address && (
        <div className="flex items-start gap-2">
          <svg className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{order.address}</p>
        </div>
      )}
      {order.note && (
        <p className="text-sm text-gray-500 dark:text-slate-500 italic pl-6">Ghi chú: {order.note}</p>
      )}
    </div>
  </div>
</section>

              {/* Payment Summary */}
              <section className="space-y-3 pt-6 border-t border-dashed border-gray-200 dark:border-slate-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Mã đơn hàng</span>
                  <span className="font-mono text-gray-800 dark:text-slate-200 font-medium">#{order.orderCode}</span>
                </div>
                {isStaff && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">ID hệ thống</span>
                    <span className="text-gray-800 dark:text-slate-200 font-medium">{order.orderId}</span>
                  </div>
                )}
                {order.voucherCode && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Mã giảm giá</span>
                    <span className="font-mono text-green-600 dark:text-green-400 font-medium">{order.voucherCode}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-bold text-gray-800 dark:text-slate-200">Tổng thanh toán</span>
                  <span className="text-xl font-black text-blue-600 dark:text-primary">{formatPrice(order.finalAmount)}</span>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="px-5 py-4 bg-gray-50 dark:bg-slate-800/40 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 text-sm"
            data-purpose="close-button"
          >
            Đóng
          </button>
        </footer>
      </div>
    </div>
  )
}
