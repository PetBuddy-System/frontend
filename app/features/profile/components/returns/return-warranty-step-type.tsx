import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import type { ReturnType } from '~/shared/lib/returns'

export interface ReturnWarrantyStepTypeProps {
  requestType: ReturnType
  onChange: (type: ReturnType) => void
}

export function ReturnWarrantyStepType({ requestType, onChange }: ReturnWarrantyStepTypeProps) {
  const { t } = useTranslation('profile')

  return (
    <div className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-center gap-3'>
        <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground'>
          2
        </span>
        <h3 className='font-display text-lg font-bold text-foreground'>{t('returnWarranty.step.type')}</h3>
      </div>

      <div className='flex flex-col gap-4 sm:flex-row'>
        {/* RETURN */}
        <label
          onClick={() => onChange('RETURN')}
          className={cn(
            'flex flex-1 cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-4 transition-all hover:bg-muted',
            requestType === 'RETURN' && 'border-primary bg-primary/5 text-primary'
          )}
        >
          <input
            type='radio'
            name='request_type'
            checked={requestType === 'RETURN'}
            onChange={() => onChange('RETURN')}
            className='sr-only'
          />
          <MaterialIcon name='keyboard_return' className='text-3xl' />
          <span className='text-sm font-bold'>Trả hàng hoàn tiền</span>
        </label>

        {/* EXCHANGE */}
        <label
          onClick={() => onChange('EXCHANGE')}
          className={cn(
            'flex flex-1 cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-4 transition-all hover:bg-muted',
            requestType === 'EXCHANGE' && 'border-primary bg-primary/5 text-primary'
          )}
        >
          <input
            type='radio'
            name='request_type'
            checked={requestType === 'EXCHANGE'}
            onChange={() => onChange('EXCHANGE')}
            className='sr-only'
          />
          <MaterialIcon name='swap_horiz' className='text-3xl' />
          <span className='text-sm font-bold'>Đổi hàng</span>
        </label>
      </div>
    </div>
  )
}
