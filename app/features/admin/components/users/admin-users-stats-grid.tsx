import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export interface AdminUsersStats {
  active: number
  coordinator: number
  groomer: number
  managers: number
  shipper: number
  staff: number
  suspended: number
  total: number
}

const USER_STATS = [
  { key: 'total', icon: 'groups' },
  { key: 'managers', icon: 'admin_panel_settings' },
  { key: 'staff', icon: 'badge' },
  { key: 'groomer', icon: 'content_cut' },
  { key: 'shipper', icon: 'local_shipping' },
  { key: 'coordinator', icon: 'support_agent' },
  { key: 'active', icon: 'how_to_reg' },
  { key: 'suspended', icon: 'block' }
] as const

export interface AdminUsersStatsGridProps {
  isLoading: boolean
  stats: AdminUsersStats
}

export function AdminUsersStatsGrid({ isLoading, stats }: AdminUsersStatsGridProps) {
  const { t } = useTranslation('admin')

  return (
    <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {USER_STATS.map((stat) => (
        <article key={stat.key} className='rounded-xl border border-border bg-card p-5 shadow-sm'>
          <div className='flex items-center justify-between text-muted-foreground'>
            <span className='text-sm font-semibold'>{t(`users.stats.${stat.key}.label`)}</span>
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-primary'>
              <MaterialIcon name={stat.icon} className='text-lg' />
            </div>
          </div>
          <p className='mt-3 font-display text-2xl font-bold text-card-foreground'>
            {isLoading ? '-' : stats[stat.key].toLocaleString('vi-VN')}
          </p>
          <p className='mt-2 text-sm text-muted-foreground'>{t(`users.stats.${stat.key}.note`)}</p>
        </article>
      ))}
    </section>
  )
}
