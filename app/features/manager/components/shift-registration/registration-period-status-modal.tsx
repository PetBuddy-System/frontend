import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, MaterialIcon } from '~/shared/ui'

import type { RegistrationPeriodResponse, RegistrationPeriodStatus } from '../../services'

const STATUS_OPTIONS: RegistrationPeriodStatus[] = ['OPEN', 'CLOSED']

export interface RegistrationPeriodStatusModalProps {
  isSubmitting: boolean
  period: RegistrationPeriodResponse | null
  onClose: () => void
  onSubmit: (status: RegistrationPeriodStatus) => void
}

export function RegistrationPeriodStatusModal({
  isSubmitting,
  onClose,
  onSubmit,
  period
}: RegistrationPeriodStatusModalProps) {
  const { t } = useTranslation('manager')
  const [status, setStatus] = useState<RegistrationPeriodStatus>(period?.status ?? 'OPEN')
  const isSameStatus = useMemo(() => Boolean(period && status === period.status), [period, status])

  if (!period) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className='font-display text-xl font-bold text-card-foreground'>
              {t('shiftRegistration.statusModal.title')}
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>{t('shiftRegistration.statusModal.description')}</p>
          </div>
          <button
            type='button'
            aria-label={t('shiftRegistration.statusModal.close')}
            onClick={onClose}
            className='rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring'
          >
            <MaterialIcon name='close' className='text-lg' />
          </button>
        </div>

        <label className='mt-5 grid gap-2'>
          <span className='text-sm font-bold text-card-foreground'>{t('shiftRegistration.statusModal.status')}</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as RegistrationPeriodStatus)}
            className='h-11 rounded-lg border border-input bg-muted px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`shiftRegistration.statuses.${option}`)}
              </option>
            ))}
          </select>
        </label>

        <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
          <Button type='button' variant='outline' disabled={isSubmitting} onClick={onClose}>
            {t('shiftRegistration.actions.cancel')}
          </Button>
          <Button type='button' disabled={isSubmitting || isSameStatus} onClick={() => onSubmit(status)}>
            <MaterialIcon name='save' className='text-lg' />
            {isSubmitting ? t('shiftRegistration.actions.saving') : t('shiftRegistration.actions.updateStatus')}
          </Button>
        </div>
      </div>
    </div>
  )
}
