import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

const STATS = [
  { key: 'imports', icon: 'arrow_downward', value: '2,450', tone: 'success' },
  { key: 'exports', icon: 'arrow_upward', value: '1,820', tone: 'primary' },
  { key: 'discrepancies', icon: 'warning', value: '14', tone: 'destructive' }
] as const

const TONE_CLASS = {
  destructive: 'text-destructive',
  primary: 'text-primary',
  success: 'text-success'
} as const

export function ManagerInventoryStatsGrid() {
  const { t } = useTranslation('manager')

  return (
    <section className='grid grid-cols-1 gap-6 md:grid-cols-3'>
      {STATS.map((stat) => (
        <article
          key={stat.key}
          className='relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md'
        >
          <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full bg-muted', TONE_CLASS[stat.tone])} />
          <div className='relative z-10 flex items-start justify-between'>
            <div>
              <p className='mb-1 text-sm font-semibold text-muted-foreground'>{t(`stats.${stat.key}.label`)}</p>
              <p className='font-display text-2xl font-bold text-card-foreground'>{stat.value}</p>
            </div>
            <div
              className={cn('flex h-12 w-12 items-center justify-center rounded-full bg-muted', TONE_CLASS[stat.tone])}
            >
              <MaterialIcon name={stat.icon} />
            </div>
          </div>
          <div
            className={cn(
              'relative z-10 mt-4 flex items-center gap-2 text-sm font-semibold',
              stat.tone === 'destructive' ? 'text-muted-foreground' : TONE_CLASS[stat.tone]
            )}
          >
            {stat.tone !== 'destructive' && <MaterialIcon name='trending_up' className='text-base' />}
            <span>{t(`stats.${stat.key}.note`)}</span>
          </div>
        </article>
      ))}
    </section>
  )
}
