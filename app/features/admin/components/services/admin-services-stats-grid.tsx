import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export interface AdminServicesStatsGridProps {
  stats: {
    total: number
    active: number
    promotions: number
  }
}

const SERVICE_STAT_ICONS = {
  total: 'medical_services',
  active: 'check_circle',
  promotions: 'pause_circle'
} as const

export function AdminServicesStatsGrid({ stats }: AdminServicesStatsGridProps) {
  const { t } = useTranslation('admin')

  return (
    <section className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      {Object.entries(stats).map(([key, value]) => (
        <article key={key} className='flex items-center gap-5 rounded-xl border border-border bg-card p-5 shadow-sm'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-muted text-primary'>
            <MaterialIcon
              name={SERVICE_STAT_ICONS[key as keyof typeof SERVICE_STAT_ICONS]}
              filled
              className='text-3xl'
            />
          </div>
          <div>
            <p className='text-xs font-bold uppercase tracking-wide text-muted-foreground'>
              {t(`serviceManagement.stats.${key}`)}
            </p>
            <p className='font-display text-2xl font-bold text-card-foreground'>{String(value).padStart(2, '0')}</p>
          </div>
        </article>
      ))}
    </section>
  )
}
