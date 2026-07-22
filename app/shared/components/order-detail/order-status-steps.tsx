import { useTranslation } from 'react-i18next'
import type { OrderDetailFull } from '~/shared/lib/order'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

interface OrderStatusStepsProps {
  order: OrderDetailFull
  formatDate: (dateStr: string) => string
  formatTime: (dateStr: string) => string
}

export function OrderStatusSteps({ order, formatDate, formatTime }: OrderStatusStepsProps) {
  const { t } = useTranslation('profile')

  const statusLevels: Record<string, number> = {
    'PENDING': 0,
    'CONFIRMED': 1,
    'PICKING': 2,
    'PICKED': 2,
    'SHIPPING': 3,
    'AWAITING_REDELIVERY': 3,
    'COORDINATOR_REVIEW': 3,
    'DELIVERY_FAILED': 3,
    'DELIVERED': 4,
    'RETURNED_TO_WAREHOUSE': 4,
    'COMPLETED': 5,
    'CANCEL_REQUESTED': 1,
  }
  const currentLevel = statusLevels[order.status] ?? 0

  const steps = [
    {
      icon: 'receipt_long',
      label: t('orderDetail.steps.ordered', 'Đã đặt hàng'),
      rawTime: order.createdAt,
      show: true,
    },
    {
      icon: 'payments',
      label: t('orderDetail.steps.confirmed', 'Xác nhận đơn hàng'),
      rawTime: order.updatedAt || order.createdAt,
      show: currentLevel >= 1,
    },
    {
      icon: 'inventory_2',
      label: t('orderDetail.steps.picking', 'Giao xuất kho'),
      rawTime: order.updatedAt || order.createdAt,
      show: currentLevel >= 2,
    },
    {
      icon: 'local_shipping',
      label: t('orderDetail.steps.onTheWay', 'Đang giao'),
      rawTime: order.updatedAt || order.createdAt,
      show: currentLevel >= 3,
    },
    {
      icon: 'move_to_inbox',
      label: t('orderDetail.steps.delivered', 'Đã giao hàng'),
      rawTime: order.updatedAt || order.createdAt,
      show: currentLevel >= 4,
    },
    {
      icon: 'grade',
      label: t('orderDetail.steps.completed', 'Hoàn thành'),
      rawTime: order.updatedAt || order.createdAt,
      show: currentLevel >= 5,
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
                {step.show ? (
                  <div className="flex flex-col text-[10px] text-muted-foreground mt-0.5">
                    <span>{formatDate(step.rawTime)}</span>
                    <span>{formatTime(step.rawTime)}</span>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground mt-0.5">—</p>
                )}
              </div>
            </div>

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
}