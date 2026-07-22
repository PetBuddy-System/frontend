import { useTranslation } from 'react-i18next'
import type { OrderDetailFull } from '~/shared/lib/order'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { updateOrderStatusApi, confirmRefundApi } from '~/features/profile/services/order/order-api'

interface OrderActionButtonsProps {
  order: OrderDetailFull
  isStaff: boolean
  isShipper: boolean
  isCoordinator: boolean
  showCancelButton?: boolean
  isCancelDisabled?: boolean
  isExpired: boolean
  isCanceling: boolean
  onPrint: () => void
  onProofOpen: () => void
  onOpenPicking: () => void
  onRetryPayment: () => void
  onCancelOrder: () => void
  onStatusUpdate: () => void
}

export function OrderActionButtons({
  order,
  isStaff,
  isShipper,
  isCoordinator,
  showCancelButton,
  isCancelDisabled,
  isExpired,
  isCanceling,
  onPrint,
  onProofOpen,
  onOpenPicking,
  onRetryPayment,
  onCancelOrder,
  onStatusUpdate
}: OrderActionButtonsProps) {
  const { t } = useTranslation('profile')

  const isRefundPending = order.status === 'CANCEL_REQUESTED'
  if (isStaff && isCoordinator && isRefundPending) {
    return (
      <div className='flex flex-col items-end gap-3'>
        <button
          type='button'
          onClick={async () => {
            if (!window.confirm('Xác nhận hoàn tiền cho đơn hàng này?')) return
            try {
              const res = await confirmRefundApi(order.orderId)
              if (res.success) {
                onStatusUpdate()
              } else {
                alert(res.message || 'Lỗi khi xác nhận hoàn tiền')
              }
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Có lỗi xảy ra'
              alert(message)
            }
          }}
          className='flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors shadow-sm'
        >
          <MaterialIcon name='currency_exchange' className='text-[18px]' />
          <span>Xác nhận hoàn tiền</span>
        </button>
      </div>
    )
  }

  return (
    <div className='flex justify-end gap-3 flex-wrap'>
      {isStaff && !isRefundPending && order.status !== 'DELIVERED' && order.status !== 'COMPLETED' && (
        <button
          onClick={onPrint}
          className='flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm transition-colors hover:bg-primary/90'
        >
          <MaterialIcon name='print' className='text-[18px]' />
          <span>{t('orderDetail.printOrder', 'In đơn hàng')}</span>
        </button>
      )}

      {isStaff && isCoordinator && order.status === 'CONFIRMED' && (
        <button
          type='button'
          onClick={async () => {
            try {
              const res = await updateOrderStatusApi(order.orderId, 'PICKING')
              if (res.success) {
                onStatusUpdate()
              } else {
                alert(res.message || 'Lỗi khi bắt đầu xuất kho')
              }
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Có lỗi xảy ra'
              alert(message)
            }
          }}
          className='flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm transition-colors shadow-sm'
        >
          <MaterialIcon name='inventory_2' className='text-[18px]' />
          <span>{t('orderDetail.startPicking', 'Xuất kho')}</span>
        </button>
      )}

      {isStaff && isCoordinator && order.status === 'PICKING' && (
        <button
          type='button'
          onClick={onOpenPicking}
          className='flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-colors shadow-sm'
        >
          <MaterialIcon name='checklist' className='text-[18px]' />
          <span>{t('orderDetail.viewPicking', 'Xem lấy hàng')}</span>
        </button>
      )}

      {isStaff && isShipper && order.status === 'PICKED' && (
        <button
          type='button'
          onClick={async () => {
            try {
              const res = await updateOrderStatusApi(order.orderId, 'SHIPPING')
              if (res.success) {
                onStatusUpdate()
              } else {
                alert(res.message || 'Lỗi khi bắt đầu giao hàng')
              }
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Có lỗi xảy ra'
              alert(message)
            }
          }}
          className='flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-colors shadow-sm'
        >
          <MaterialIcon name='local_shipping' className='text-[18px]' />
          <span>{t('orderDetail.startShipping', 'Giao hàng')}</span>
        </button>
      )}

      {!isStaff &&
        order.status === 'PENDING' &&
        (order.payment?.paymentMethod === 'CARD' || order.payment?.paymentMethod === 'MOMO') &&
        order.payment?.status !== 'PAID' && (
          <button
            onClick={onRetryPayment}
            disabled={isExpired}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-lg bg-success text-success-foreground font-bold text-sm transition-colors',
              'hover:bg-success/90',
              isExpired && 'opacity-50 cursor-not-allowed hover:bg-success'
            )}
          >
            <MaterialIcon
              name={order.payment?.paymentMethod === 'MOMO' ? 'qr_code_2' : 'credit_card'}
              className='text-[18px]'
            />
            <span>{t('orderDetail.payAgain', 'Thanh toán lại')}</span>
          </button>
        )}

      {showCancelButton && !isRefundPending && (
        <button
          onClick={onCancelOrder}
          disabled={isCanceling || isCancelDisabled}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 font-bold text-sm transition-colors',
            isCancelDisabled
              ? 'border-muted text-muted-foreground bg-muted/20 cursor-not-allowed'
              : 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground',
            isCanceling && 'opacity-40 cursor-not-allowed'
          )}
        >
          {isCanceling ? (
            <>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
              <span>{t('orderDetail.canceling', 'Đang hủy...')}</span>
            </>
          ) : (
            <>
              <MaterialIcon name='cancel' className='text-[18px]' />
              <span>{t('orderDetail.cancelOrder', 'Hủy đơn hàng')}</span>
            </>
          )}
        </button>
      )}

      {isRefundPending && !(isStaff && isCoordinator) && (
        <div className='flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold text-sm'>
          <MaterialIcon name='hourglass_top' className='text-[18px] animate-pulse' />
          <span>Chờ nhân viên xác nhận hoàn tiền</span>
        </div>
      )}
    </div>
  )
}
