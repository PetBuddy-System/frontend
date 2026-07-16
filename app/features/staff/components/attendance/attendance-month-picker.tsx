import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export interface AttendanceMonthPickerProps {
  monthLabel: string
  onNextMonth: () => void
  onPreviousMonth: () => void
}

export function AttendanceMonthPicker({ monthLabel, onNextMonth, onPreviousMonth }: AttendanceMonthPickerProps) {
  const { t } = useTranslation('staff')

  return (
    <div className='flex items-center rounded-xl border border-border bg-card p-1'>
      <button
        type='button'
        onClick={onPreviousMonth}
        className='rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40'
        aria-label={t('attendance.previousMonth')}
      >
        <MaterialIcon name='chevron_left' />
      </button>
      <span className='min-w-[8rem] px-4 text-center text-sm font-bold'>{monthLabel}</span>
      <button
        type='button'
        onClick={onNextMonth}
        className='rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40'
        aria-label={t('attendance.nextMonth')}
      >
        <MaterialIcon name='chevron_right' />
      </button>
    </div>
  )
}
