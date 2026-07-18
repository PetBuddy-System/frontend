import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

const COLOR_CLASSES = ['bg-primary', 'bg-secondary', 'bg-success', 'bg-warning', 'bg-info'] as const

export interface RevenueBreakdownItem {
  key: string
  label: string
  percent: number
}

interface AdminRevenueBreakdownCardProps {
  items?: RevenueBreakdownItem[]
  isLoading?: boolean
}

export function AdminRevenueBreakdownCard({ items = [], isLoading }: AdminRevenueBreakdownCardProps) {
  const { t } = useTranslation('admin')

  let cumulative = 0
  const gradientStops = items.map((item, index) => {
    const colorVar = `var(--color-${COLOR_CLASSES[index % COLOR_CLASSES.length].replace('bg-', '')})`
    const start = cumulative
    cumulative += item.percent
    return `${colorVar} ${start}% ${cumulative}%`
  })
  const gradient = gradientStops.length ? `conic-gradient(${gradientStops.join(', ')})` : 'var(--color-muted)'

  return (
    <section className='rounded-lg border border-border bg-card p-5 shadow-sm'>
      <h2 className='mb-6 font-display text-xl font-bold text-card-foreground'>{t('charts.breakdown.title')}</h2>

      {isLoading ? (
        <div className='mb-5 flex justify-center'>
          <div className='h-48 w-48 animate-pulse rounded-full bg-muted' />
        </div>
      ) : (
        <div className='mb-5 flex justify-center'>
          <div
            className='flex h-48 w-48 items-center justify-center rounded-full'
            style={{ background: gradient }}
          >
            <div className='h-32 w-32 rounded-full bg-card' />
          </div>
        </div>
      )}

      <div className='space-y-3'>
        {items.length === 0 && !isLoading && (
          <p className='text-sm text-muted-foreground'>{t('charts.breakdown.empty', 'Chưa có dữ liệu')}</p>
        )}
        {items.map((item, index) => (
          <div key={item.key} className='flex items-center justify-between gap-4 text-sm'>
            <div className='flex min-w-0 items-center gap-2'>
              <span className={cn('h-3 w-3 shrink-0 rounded-full', COLOR_CLASSES[index % COLOR_CLASSES.length])} />
              <span className='truncate'>{item.label}</span>
            </div>
            <span className='font-semibold text-card-foreground'>{item.percent}%</span>
          </div>
        ))}
      </div>
    </section>
  )
}