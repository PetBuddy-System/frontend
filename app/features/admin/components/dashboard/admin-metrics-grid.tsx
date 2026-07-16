import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

const METRICS = [
  { key: 'revenue', icon: 'payments', value: '124.5M đ', trend: 'positive' },
  { key: 'orders', icon: 'shopping_cart', value: '342', trend: 'positive' },
  { key: 'services', icon: 'medical_services', value: '45.2M đ', trend: 'positive' },
  { key: 'averageOrder', icon: 'receipt_long', value: '364K đ', trend: 'positive' }
] as const

export interface AdminMetricsGridProps {
  bookingRevenueValue?: string
  bookingRevenueBookings?: number
  isBookingRevenueLoading?: boolean
  hasBookingRevenueError?: boolean
}

export function AdminMetricsGrid({
  bookingRevenueValue = '0 đ',
  bookingRevenueBookings = 0,
  isBookingRevenueLoading = false,
  hasBookingRevenueError = false
}: AdminMetricsGridProps) {
  const { t } = useTranslation('admin')

  return (
    <section className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {METRICS.map((metric) => {
        const isPositive = metric.trend === 'positive'
        const isServicesMetric = metric.key === 'services'
        const value = isServicesMetric ? bookingRevenueValue : metric.value

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
            {isServicesMetric && isBookingRevenueLoading ? (
              <>
                <div className='mb-3 h-8 w-28 animate-pulse rounded-lg bg-muted' />
                <div className='h-5 w-36 animate-pulse rounded-lg bg-muted' />
              </>
            ) : (
              <>
                <p className='mb-2 font-display text-2xl font-bold text-card-foreground'>
                  {isServicesMetric && hasBookingRevenueError ? '--' : value}
                </p>
                <div
                  className={cn(
                    'flex items-center gap-1 text-sm font-semibold',
                    isServicesMetric && hasBookingRevenueError
                      ? 'text-destructive'
                      : isPositive
                        ? 'text-success'
                        : 'text-destructive'
                  )}
                >
                  <MaterialIcon
                    name={
                      isServicesMetric && hasBookingRevenueError
                        ? 'error'
                        : isPositive
                          ? 'trending_up'
                          : 'trending_down'
                    }
                    className='text-base'
                  />
                  <span>
                    {isServicesMetric && hasBookingRevenueError
                      ? t('metrics.services.error')
                      : t(`metrics.${metric.key}.change`, { count: bookingRevenueBookings })}
                  </span>
                </div>
              </>
            )}
          </article>
        )
      })}
    </section>
  )
}
