import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

interface ReturnTimelineProps {
  type: string
  status: string
  createdAt: string
  approvedAt?: string | null
  pickingUpAt?: string | null
  pickedUpAt?: string | null
  returnedToStoreAt?: string | null
  readyToDeliverAt?: string | null
  deliveringAt?: string | null
  deliveringFailedAt?: string | null
  completedAt?: string | null
  rejectedAt?: string | null
  cancelledAt?: string | null
  restockedAt?: string | null
}

function formatTime(dateString?: string | null) {
  if (!dateString) return null
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return dateString
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${min} ${dd}/${mm}/${yyyy}`
}

export function ReturnTimeline({
  status,
  createdAt,
  approvedAt,
  pickingUpAt,
  pickedUpAt,
  returnedToStoreAt,
  readyToDeliverAt,
  deliveringAt,
  deliveringFailedAt,
  completedAt,
  rejectedAt,
  cancelledAt
}: ReturnTimelineProps) {
  const { t } = useTranslation('returns')

  const allMilestones = [
    { key: 'PENDING', labelKey: 'status.PENDING', icon: 'pending_actions', time: createdAt },
    { key: 'APPROVED', labelKey: 'status.APPROVED', icon: 'check_circle', time: approvedAt },
    { key: 'PICKING_UP', labelKey: 'status.PICKING_UP', icon: 'directions_car', time: pickingUpAt },
    { key: 'PICKED_UP', labelKey: 'status.PICKED_UP', icon: 'inventory', time: pickedUpAt },
    { key: 'RETURNED_TO_STORE', labelKey: 'status.RETURNED_TO_STORE', icon: 'store', time: returnedToStoreAt },
    { key: 'READY_TO_DELIVER', labelKey: 'status.READY_TO_DELIVER', icon: 'inventory_2', time: readyToDeliverAt },
    { key: 'DELIVERING', labelKey: 'status.DELIVERING', icon: 'local_shipping', time: deliveringAt },
    { key: 'DELIVERING_FAILED', labelKey: 'status.DELIVERING_FAILED', icon: 'error', time: deliveringFailedAt },
    { key: 'COMPLETED', labelKey: 'status.COMPLETED', icon: 'done_all', time: completedAt },
    { key: 'REJECTED', labelKey: 'status.REJECTED', icon: 'cancel', time: rejectedAt },
    { key: 'CANCELLED', labelKey: 'status.CANCELLED', icon: 'close', time: cancelledAt }
  ]

  // Only display milestones with non-null timestamp or matching current status
  const steps = allMilestones.filter((m) => Boolean(m.time) || m.key === status)

  const currentStepIndex = steps.findIndex((s) => s.key === status)
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : steps.length - 1

  if (steps.length === 0) return null

  return (
    <div className='py-4'>
      <div className='relative pl-4 sm:pl-0'>
        {/* Mobile vertical line */}
        <div className='absolute left-8 top-4 bottom-4 w-0.5 bg-border sm:hidden' />

        <div className='flex flex-col sm:flex-row justify-between gap-6 sm:gap-2'>
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex
            const isActive = idx === activeIndex

            return (
              <div key={step.key} className='relative flex flex-row sm:flex-col items-center gap-4 sm:gap-2 sm:flex-1'>
                {/* Desktop line */}
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      'hidden sm:block absolute top-5 left-[50%] right-[-50%] h-0.5 w-full z-0',
                      isCompleted ? 'bg-primary' : 'bg-border'
                    )}
                  />
                )}

                {/* Circle & Icon */}
                <div
                  className={cn(
                    'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300',
                    isCompleted
                      ? 'border-primary bg-primary text-white'
                      : isActive
                        ? 'border-primary bg-background text-primary'
                        : 'border-border bg-background text-muted-foreground',
                    isActive && 'ring-4 ring-primary/20'
                  )}
                >
                  <MaterialIcon name={step.icon} className='text-[20px]' />
                </div>

                {/* Label & Time */}
                <div className='flex flex-col sm:items-center sm:text-center mt-1 sm:mt-2 w-full'>
                  <span
                    className={cn(
                      'text-xs font-bold uppercase tracking-wide',
                      isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {t(step.labelKey)}
                  </span>
                  {step.time && (
                    <span className='text-[10px] text-muted-foreground mt-0.5'>
                      {formatTime(step.time)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
