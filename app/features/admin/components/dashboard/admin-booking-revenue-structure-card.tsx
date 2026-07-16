import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

import type { BookingStatsByServiceResponse } from '../../services'

const DONUT_COLORS = [
  { dot: 'bg-primary', css: 'var(--color-primary)' },
  { dot: 'bg-secondary', css: 'var(--color-secondary)' },
  { dot: 'bg-success', css: 'var(--color-success)' },
  { dot: 'bg-info', css: 'var(--color-info)' },
  { dot: 'bg-warning', css: 'var(--color-warning)' }
] as const

export interface AdminBookingRevenueStructureCardProps {
  data: BookingStatsByServiceResponse[]
  isLoading: boolean
  errorMessage?: string | null
  formatMoney: (value: number) => string
}

function buildConicGradient(data: BookingStatsByServiceResponse[]): string {
  if (data.length === 0) {
    return 'conic-gradient(var(--color-muted) 0 100%)'
  }

  let current = 0
  const segments = data.map((item, index) => {
    const percentage = Math.max(0, Number(item.percentage ?? 0))
    const start = current
    const end = current + percentage
    current = end

    return `${DONUT_COLORS[index % DONUT_COLORS.length].css} ${start}% ${end}%`
  })

  if (current < 100) {
    segments.push(`var(--color-muted) ${current}% 100%`)
  }

  return `conic-gradient(${segments.join(', ')})`
}

export function AdminBookingRevenueStructureCard({
  data,
  isLoading,
  errorMessage,
  formatMoney
}: AdminBookingRevenueStructureCardProps) {
  const { t } = useTranslation('admin')
  const gradient = useMemo(() => buildConicGradient(data), [data])

  return (
    <section className='rounded-lg border border-border bg-card p-5 shadow-sm'>
      <h2 className='font-display text-xl font-bold text-card-foreground'>{t('charts.bookingStructure.title')}</h2>
      <p className='mt-1 text-sm text-muted-foreground'>{t('charts.bookingStructure.subtitle')}</p>

      {isLoading ? (
        <div className='mt-6 space-y-5'>
          <div className='mx-auto h-48 w-48 animate-pulse rounded-full bg-muted' />
          <div className='space-y-3'>
            <div className='h-5 animate-pulse rounded-lg bg-muted' />
            <div className='h-5 animate-pulse rounded-lg bg-muted' />
            <div className='h-5 animate-pulse rounded-lg bg-muted' />
          </div>
        </div>
      ) : errorMessage ? (
        <div className='mt-6 flex min-h-72 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center text-sm font-semibold text-destructive'>
          {t('charts.bookingStructure.error')}
        </div>
      ) : data.length === 0 ? (
        <div className='mt-6 flex min-h-72 items-center justify-center rounded-xl border border-border bg-background p-6 text-center text-sm text-muted-foreground'>
          {t('charts.bookingStructure.empty')}
        </div>
      ) : (
        <>
          <div className='my-5 flex justify-center'>
            <div
              className='flex h-48 w-48 items-center justify-center rounded-full'
              style={{
                background: gradient
              }}
            >
              <div className='flex h-32 w-32 flex-col items-center justify-center rounded-full bg-card text-center'>
                <span className='text-xs font-semibold uppercase tracking-normal text-muted-foreground'>
                  {t('charts.bookingStructure.centerLabel')}
                </span>
                <span className='mt-1 font-display text-lg font-bold text-primary'>
                  {formatMoney(data.reduce((total, item) => total + Number(item.revenue ?? 0), 0))}
                </span>
              </div>
            </div>
          </div>
          <div className='space-y-3'>
            {data.map((item, index) => (
              <div key={item.serviceName} className='flex items-center justify-between gap-4 text-sm'>
                <div className='flex min-w-0 items-center gap-2'>
                  <span
                    className={cn('h-3 w-3 shrink-0 rounded-full', DONUT_COLORS[index % DONUT_COLORS.length].dot)}
                  />
                  <span className='truncate'>{item.serviceName}</span>
                </div>
                <div className='shrink-0 text-right'>
                  <span className='font-semibold text-card-foreground'>{Number(item.percentage ?? 0).toFixed(1)}%</span>
                  <span className='ml-2 text-xs text-muted-foreground'>{formatMoney(Number(item.revenue ?? 0))}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
