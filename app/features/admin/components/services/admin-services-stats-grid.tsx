import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const SERVICE_STATS = [
  { key: 'total', icon: 'medical_services', value: '24' },
  { key: 'active', icon: 'check_circle', value: '18' },
  { key: 'promotions', icon: 'campaign', value: '06' }
] as const

export function AdminServicesStatsGrid() {
  const { t } = useTranslation('admin')

  return (
    <section className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      {SERVICE_STATS.map((stat) => (
        <article
          key={stat.key}
          className='flex items-center gap-5 rounded-xl border border-border bg-card p-5 shadow-sm'
        >
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-muted text-primary'>
            <MaterialIcon name={stat.icon} filled className='text-3xl' />
          </div>
          <div>
            <p className='text-xs font-bold uppercase tracking-wide text-muted-foreground'>
              {t(`serviceManagement.stats.${stat.key}`)}
            </p>
            <p className='font-display text-2xl font-bold text-card-foreground'>{stat.value}</p>
          </div>
        </article>
      ))}
    </section>
  )
}
