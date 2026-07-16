import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const METRICS = [
  { key: 'revenue', icon: 'payments', value: '0 đ', trend: 'positive' },
  { key: 'profit', icon: 'account_balance_wallet', value: '0 đ', trend: 'positive' },
  { key: 'services', icon: 'medical_services', value: '0 đ', trend: 'positive' },
  { key: 'averageOrder', icon: 'receipt_long', value: '0 đ', trend: 'positive' }
] as const

interface AdminMetricsGridProps {
  totalRevenueValue?: number
  totalRevenueChangePercent?: number | null
  profitValue?: number
  profitChangePercent?: number | null
  bookingRevenueValue?: number
  bookingCount?: number
  averageOrderValue?: number
  hasBookingStatsError?: boolean
  isLoading?: boolean
  isBookingStatsLoading?: boolean
}

function formatMoney(value: number): string {
  const amount = Number(value ?? 0)

  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace('.0', '')}M đ`
  }

  if (Math.abs(amount) >= 1_000) {
    return `${Math.round(amount / 1_000)}K đ`
  }

  return `${new Intl.NumberFormat('vi-VN').format(amount)} đ`
}

export function AdminMetricsGrid({
  totalRevenueValue,
  totalRevenueChangePercent,
  profitValue,
  profitChangePercent,
  bookingRevenueValue,
  bookingCount,
  averageOrderValue,
  hasBookingStatsError,
  isLoading,
  isBookingStatsLoading
}: AdminMetricsGridProps) {
  const { t } = useTranslation('admin')

  return (
    <section className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {METRICS.map((metric) => {
        const isStoreDynamic = metric.key === 'revenue' || metric.key === 'profit'
        const isBookingDynamic = metric.key === 'services' || metric.key === 'averageOrder'

        if ((isStoreDynamic && isLoading) || (isBookingDynamic && isBookingStatsLoading)) {
          return (
            <article key={metric.key} className='animate-pulse rounded-xl border border-border bg-card p-5 shadow-sm'>
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
          displayValue = formatMoney(totalRevenueValue)
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
          displayValue = formatMoney(profitValue)
          if (profitChangePercent !== undefined && profitChangePercent !== null) {
            isPositive = profitChangePercent >= 0
            const formattedPercent = profitChangePercent > 0 ? `+${profitChangePercent}` : `${profitChangePercent}`
            changeText = t('metrics.profit.change_dynamic', { percent: formattedPercent })
          } else {
            changeText = ''
          }
        }

        if (metric.key === 'services') {
          if (hasBookingStatsError) {
            displayValue = '--'
            changeText = t('metrics.services.error')
            isPositive = false
          } else if (bookingRevenueValue !== undefined) {
            displayValue = formatMoney(bookingRevenueValue)
            changeText = t('metrics.services.change', { count: bookingCount ?? 0 })
          }
        }

        if (metric.key === 'averageOrder' && averageOrderValue !== undefined) {
          displayValue = formatMoney(averageOrderValue)
          changeText = t('metrics.averageOrder.change')
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
