import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function AttendanceMonthPicker() {
  const { t } = useTranslation('staff')
  const [monthIndex, setMonthIndex] = useState(0)

  const MONTHS = ['attendance.months.oct2024', 'attendance.months.sep2024', 'attendance.months.aug2024'] as const

  const handlePrevious = () => {
    setMonthIndex((prev) => Math.min(prev + 1, MONTHS.length - 1))
  }

  const handleNext = () => {
    setMonthIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className='flex items-center rounded-xl border border-border bg-card p-1'>
      <button
        type='button'
        onClick={handlePrevious}
        disabled={monthIndex >= MONTHS.length - 1}
        className='rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40'
        aria-label={t('attendance.previousMonth')}
      >
        <MaterialIcon name='chevron_left' />
      </button>
      <span className='min-w-[8rem] px-4 text-center text-sm font-bold'>{t(MONTHS[monthIndex])}</span>
      <button
        type='button'
        onClick={handleNext}
        disabled={monthIndex <= 0}
        className='rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40'
        aria-label={t('attendance.nextMonth')}
      >
        <MaterialIcon name='chevron_right' />
      </button>
    </div>
  )
}
