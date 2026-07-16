import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

const METRICS = [
  { key: 'revenue', icon: 'payments', value: '0 M đ', trend: 'positive' },
  { key: 'profit', icon: 'account_balance_wallet', value: '0 M đ', trend: 'positive' },
  { key: 'services', icon: 'medical_services', value: '45.2M đ', trend: 'positive' },
  { key: 'averageOrder', icon: 'receipt_long', value: '364K đ', trend: 'positive' }
] as const

interface AdminMetricsGridProps {
  totalRevenueValue?: number
  totalRevenueChangePercent?: number | null
  profitValue?: number
  profitChangePercent?: number | null
  isLoading?: boolean
}

function formatMillion(value: number): string {
  return `${(value / 1_000_000).toFixed(1)}M đ`
}

export function AdminMetricsGrid({
  totalRevenueValue,
  totalRevenueChangePercent,
  profitValue,
  profitChangePercent,
  isLoading
}: AdminMetricsGridProps) {
  const { t } = useTranslation('admin')

  return (
    <section className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {METRICS.map((metric) => {
        const isDynamic = metric.key === 'revenue' || metric.key === 'profit'

        if (isDynamic && isLoading) {
          return (
            <article
              key={metric.key}
              className='animate-pulse rounded-xl border border-border bg-card p-5 shadow-sm'
            >
              <div className='mb-4 flex items-center gap-3'>
                <div className='h-11 w-11 rounded-full bg-muted' />
                <div className='h-4 w-20 rounded bg-muted' />
              </div>
              <div className='mb-2 h-8 w-24 rounded bg-muted' />
              <div className='h-4 w-32 rounded bg-muted' />
            </article>
          )
        }

        let displayValue: string = metric.value
        let isPositive = metric.trend === 'positive'
        let changeText = t(`metrics.${metric.key}.change`)

        if (metric.key === 'revenue' && totalRevenueValue !== undefined) {
          displayValue = formatMillion(totalRevenueValue)
          if (totalRevenueChangePercent !== undefined && totalRevenueChangePercent !== null) {
            isPositive = totalRevenueChangePercent >= 0
            const formattedPercent =
              totalRevenueChangePercent > 0 ? `+${totalRevenueChangePercent}` : `${totalRevenueChangePercent}`
            changeText = t('metrics.revenue.change_dynamic', { percent: formattedPercent })
          } else {
            changeText = ''
          }
        }

        if (metric.key === 'profit' && profitValue !== undefined) {
          displayValue = formatMillion(profitValue)
          if (profitChangePercent !== undefined && profitChangePercent !== null) {
            isPositive = profitChangePercent >= 0
            const formattedPercent = profitChangePercent > 0 ? `+${profitChangePercent}` : `${profitChangePercent}`
            changeText = t('metrics.profit.change_dynamic', { percent: formattedPercent })
          } else {
            changeText = ''
          }
        }

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
            <p className='mb-2 font-display text-2xl font-bold text-card-foreground'>{displayValue}</p>
            {changeText && (
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-semibold',
                  isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                <MaterialIcon name={isPositive ? 'trending_up' : 'trending_down'} className='text-base' />
                <span>{changeText}</span>
              </div>
            )}
          </article>
        )
      })}
    </section>
  )
}