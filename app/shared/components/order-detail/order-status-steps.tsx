import { useTranslation } from 'react-i18next'
import type { OrderDetailFull } from '~/shared/lib/order'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

interface OrderStatusStepsProps {
  order: OrderDetailFull
  formatDateTime: (dateStr: string) => string
}

export function OrderStatusSteps({ order, formatDateTime }: OrderStatusStepsProps) {
  const { t } = useTranslation('profile')

  const statusLevels: Record<string, number> = {
    'PENDING': 0,
    'CONFIRMED': 1,
    'PICKING': 1,
    'SHIPPING': 2,
    'DELIVERED': 3,
    'COMPLETED': 4,
    'CANCEL_REQUESTED': 1,
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
