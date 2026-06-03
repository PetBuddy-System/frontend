import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

const STEPS = [
  { key: 'ordered', icon: 'receipt_long' },
  { key: 'processing', icon: 'settings' },
  { key: 'shipping', icon: 'local_shipping' },
  { key: 'delivered', icon: 'inventory_2' }
] as const

export interface OrderTrackingStepperProps {
  /** 0-indexed current step (0 = ordered, 1 = processing, 2 = shipping, 3 = delivered) */
  currentStep?: number
}

export function OrderTrackingStepper({ currentStep = 2 }: OrderTrackingStepperProps) {
  const { t } = useTranslation('profile')

  const progressWidth = currentStep > 0 ? `${(currentStep / (STEPS.length - 1)) * 100}%` : '0%'

  return (
    <div className='rounded-2xl bg-card p-6 shadow-sm md:p-6'>
      <div className='relative flex items-center justify-between'>
        {/* Background dashed line (inactive) */}
        <div className='stepper-line absolute left-0 top-5 -z-0 h-1 w-full' />
        {/* Solid active line */}
        <div
          className='stepper-line-active absolute left-0 top-5 -z-0 h-1 transition-all duration-500'
          style={{ width: progressWidth }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStep
          const isActive = idx === currentStep
          const isPending = idx > currentStep

          return (
            <div key={step.key} className='relative z-10 flex flex-col items-center gap-3'>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full shadow-md',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isActive &&
                    'animate-pulse-soft border-4 border-primary/20 bg-primary text-primary-foreground shadow-lg',
                  isPending && 'bg-muted text-muted-foreground opacity-40'
                )}
              >
                <MaterialIcon name={isCompleted ? 'check' : step.icon} filled={isCompleted} className='text-[20px]' />
              </div>
              <span
                className={cn(
                  'text-center text-xs font-semibold sm:text-sm',
                  (isCompleted || isActive) && 'font-bold text-primary',
                  isPending && 'font-medium text-muted-foreground'
                )}
              >
                {t(`orderTracking.stepper.${step.key}`)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
