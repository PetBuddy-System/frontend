import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

const METRICS = [
  { key: 'revenue', icon: 'payments', value: '124.5M đ', trend: 'positive' },
  { key: 'orders', icon: 'shopping_cart', value: '342', trend: 'positive' },
  { key: 'services', icon: 'medical_services', value: '45.2M đ', trend: 'negative' },
  { key: 'averageOrder', icon: 'receipt_long', value: '364K đ', trend: 'positive' }
] as const

export function AdminMetricsGrid() {
  const { t } = useTranslation('admin')

  return (
    <section className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {METRICS.map((metric) => {
        const isPositive = metric.trend === 'positive'

        return (
          <article
            key={metric.key}
            className='rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md'
          >
            <div className='mb-4 flex items-center gap-3 text-muted-foreground'>
              <div className='flex h-11 w-11 items-center justify-center rounded-full bg-muted text-primary'>
                <MaterialIcon name={metric.icon} />
              </div>
              <span className='font-semibold'>{t(`metrics.${metric.key}.label`)}</span>
            </div>
            <p className='mb-2 font-display text-2xl font-bold text-card-foreground'>{metric.value}</p>
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-semibold',
                isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              <MaterialIcon name={isPositive ? 'trending_up' : 'trending_down'} className='text-base' />
              <span>{t(`metrics.${metric.key}.change`)}</span>
            </div>
          </article>
        )
      })}
    </section>
  )
}
