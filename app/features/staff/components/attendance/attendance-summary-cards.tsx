import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const SUMMARY_ITEMS = [
  { key: 'totalDays', icon: 'calendar_month', colorClass: 'text-primary', bgClass: 'bg-primary/5' },
  { key: 'totalHours', icon: 'schedule', colorClass: 'text-secondary-foreground', bgClass: 'bg-secondary/10' },
  { key: 'lateEarly', icon: 'running_with_errors', colorClass: 'text-accent', bgClass: 'bg-accent/5' },
  { key: 'daysOff', icon: 'event_busy', colorClass: 'text-destructive', bgClass: 'bg-destructive/5' }
] as const

export function AttendanceSummaryCards() {
  const { t } = useTranslation('staff')

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {SUMMARY_ITEMS.map((item) => (
        <div
          key={item.key}
          className='group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm'
        >
          <div
            className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${item.bgClass} transition-transform duration-500 group-hover:scale-110`}
          />
          <div className='relative'>
            <div className='mb-2 flex items-center gap-3 text-muted-foreground'>
              <MaterialIcon name={item.icon} filled className={item.colorClass} />
              <span className='text-sm font-semibold'>
                {t(`attendance.summary.${item.key}.label`)}
              </span>
            </div>
            <div className='flex items-baseline gap-1'>
              <span className={`font-display text-4xl font-bold ${item.key === 'totalDays' ? 'text-primary' : item.key === 'daysOff' ? 'text-destructive' : item.key === 'lateEarly' ? 'text-accent' : 'text-foreground'}`}>
                {t(`attendance.summary.${item.key}.value`)}
              </span>
              <span className='text-base text-muted-foreground'>
                {t(`attendance.summary.${item.key}.unit`)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
