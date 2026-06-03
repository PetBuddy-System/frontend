import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

const BOOKING_STATS = [
  { key: 'total', icon: 'analytics', value: '1,284', accentClassName: 'border-primary text-primary' },
  {
    key: 'pending',
    icon: 'pending_actions',
    value: '42',
    accentClassName: 'border-secondary text-secondary-foreground'
  },
  { key: 'completed', icon: 'task_alt', value: '1,120', accentClassName: 'border-success text-success' },
  { key: 'cancelled', icon: 'cancel', value: '122', accentClassName: 'border-destructive text-destructive' }
] as const

export function AdminServiceBookingsStatsGrid() {
  const { t } = useTranslation('admin')

  return (
    <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {BOOKING_STATS.map((stat) => (
        <article
          key={stat.key}
          className={cn('rounded-xl border border-l-4 bg-card p-6 shadow-sm', stat.accentClassName)}
        >
          <p className='mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground'>
            {t(`serviceBookings.stats.${stat.key}`)}
          </p>
          <div className='flex items-center justify-between'>
            <span className='font-display text-3xl font-bold text-card-foreground'>{stat.value}</span>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary'>
              <MaterialIcon name={stat.icon} />
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
