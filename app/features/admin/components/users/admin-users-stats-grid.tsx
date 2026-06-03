import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const USER_STATS = [
  { key: 'total', icon: 'groups', value: '1,248' },
  { key: 'active', icon: 'how_to_reg', value: '1,120' },
  { key: 'newToday', icon: 'person_add', value: '15' }
] as const

export function AdminUsersStatsGrid() {
  const { t } = useTranslation('admin')

  return (
    <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {USER_STATS.map((stat) => (
        <article key={stat.key} className='rounded-xl border border-border bg-card p-6 shadow-sm'>
          <div className='flex items-center justify-between text-muted-foreground'>
            <span className='font-semibold'>{t(`users.stats.${stat.key}.label`)}</span>
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-primary'>
              <MaterialIcon name={stat.icon} className='text-lg' />
            </div>
          </div>
          <p className='mt-3 font-display text-3xl font-bold text-card-foreground'>{stat.value}</p>
          <div className='mt-2 flex items-center gap-1 text-sm font-semibold text-primary'>
            <MaterialIcon name={stat.key === 'newToday' ? 'update' : 'trending_up'} className='text-base' />
            <span>{t(`users.stats.${stat.key}.note`)}</span>
          </div>
        </article>
      ))}
    </section>
  )
}
