import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { updateOrderStatusApi } from '~/features/profile/services'
import { OrderDetailModal } from '~/shared/components'

export interface OrderHistoryCardProps {
  order: {
    orderId: number
    orderCode: string
    status: string
    finalAmount: number
    createdAt: string
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
      return 'bg-success/10 text-success'
    case 'DELIVERED':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
    case 'SHIPPING':
      return 'bg-info/10 text-info'
    case 'PICKING':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
    case 'PENDING':
      return 'bg-warning/10 text-warning'
    case 'CANCELED':
      return 'bg-destructive/10 text-destructive'
    default:
      return 'bg-muted text-muted-foreground'
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
      return 'Hoàn thành'
    case 'CANCELED':
      return 'Đã hủy'
    default:
      return status
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  const normalized = dateStr.includes('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z'
  const d = new Date(normalized)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${d.getFullYear()}`
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

function formatPrice(value: number) {
  if (value == null || isNaN(Number(value))) return '—'
  return `${new Intl.NumberFormat('vi-VN').format(Number(value))}đ`
}

export function OrderHistoryCard({ order, onRefresh }: OrderHistoryCardProps) {
  const { t } = useTranslation('profile')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

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

  return (
    <>
      <article
        className={cn(
          'overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/40',
          order.status === 'CANCELED' && 'opacity-75 grayscale-[0.5]'
        )}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3 md:px-5'>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-bold text-foreground'>#{order.orderCode}</span>
            <span className='text-xs text-muted-foreground'>
              {t('orderHistory.orderDate', { date: formatDate(order.createdAt) })}
            </span>
          </div>
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold',
              getStatusClassName(order.status)
            )}
          >
            <MaterialIcon
              name={STATUS_ICON[order.status] || 'schedule'}
              filled={order.status === 'COMPLETED'}
              className='text-sm'
            />
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* Order summary (no product images) */}
        <div className='flex items-center gap-4 px-4 py-4 md:px-5'>
          <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10'>
            <MaterialIcon name='shopping_bag' className='text-[24px] text-primary' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-semibold text-foreground'>Mã đơn: #{order.orderCode}</p>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              Ngày đặt: {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className='text-right'>
            <p className='text-xs text-muted-foreground'>Tổng tiền</p>
            <p className={cn(
              'font-display text-base font-bold',
              order.status === 'CANCELED' ? 'text-muted-foreground' : 'text-primary'
            )}>
              {formatPrice(order.finalAmount)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='flex flex-col items-center justify-end gap-3 border-t border-border px-4 py-3 sm:flex-row md:px-5'>
          <button
            type='button'
            onClick={() => setShowDetailModal(true)}
            className='rounded-xl border border-primary px-5 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-accent/10'
          >
            {t('orderHistory.actions.viewDetails', 'Xem chi tiết')}
          </button>

          {order.status === 'DELIVERED' && (
            <button
              type='button'
              onClick={() => setShowConfirmModal(true)}
              className='rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:opacity-90'
            >
              Đã nhận được hàng
            </button>
          )}

          {order.status === 'SHIPPING' && (
            <button
              type='button'
              onClick={() => alert('Đang theo dõi đơn hàng trên bản đồ...')}
              className='rounded-xl bg-muted px-5 py-2.5 text-xs font-bold text-foreground shadow-sm transition-colors hover:opacity-90'
            >
              {t('orderHistory.actions.track', 'Theo dõi')}
            </button>
          )}
        </div>
      </article>

      {/* Order Detail Modal */}
      {showDetailModal && (
        <OrderDetailModal
          orderId={order.orderId}
          orderCode={order.orderCode}
          isStaff={false}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150'>
            <h4 className='font-display text-lg font-bold text-foreground mb-2'>
              Xác nhận nhận hàng
            </h4>
            <p className='text-sm text-muted-foreground mb-6'>
              Bạn xác nhận đã nhận đầy đủ sản phẩm cho đơn hàng #{order.orderCode} và muốn hoàn tất đơn hàng?
            </p>
            <div className='flex items-center justify-end gap-3'>
              <button
                type='button'
                onClick={() => setShowConfirmModal(false)}
                className='rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted'
              >
                Hủy
              </button>
              <button
                type='button'
                onClick={() => void handleConfirmReceipt()}
                disabled={isConfirming}
                className='rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50'
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
