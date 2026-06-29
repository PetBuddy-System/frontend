import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

const BREAKDOWN_ITEMS = [
  { key: 'products', percent: 65, colorClassName: 'bg-primary' },
  { key: 'medical', percent: 25, colorClassName: 'bg-secondary' },
  { key: 'grooming', percent: 10, colorClassName: 'bg-success' }
] as const

export function AdminRevenueBreakdownCard() {
  const { t } = useTranslation('admin')

  return (
    <section className='rounded-lg border border-border bg-card p-5 shadow-sm'>
      <h2 className='mb-6 font-display text-xl font-bold text-card-foreground'>{t('charts.breakdown.title')}</h2>
      <div className='mb-5 flex justify-center'>
        <div
          className='flex h-48 w-48 items-center justify-center rounded-full'
          style={{
            background:
              'conic-gradient(var(--color-primary) 0 65%, var(--color-secondary) 65% 90%, var(--color-success) 90% 100%)'
          }}
        >
          <div className='h-32 w-32 rounded-full bg-card' />
        </div>
      </div>
      <div className='space-y-3'>
        {BREAKDOWN_ITEMS.map((item) => (
          <div key={item.key} className='flex items-center justify-between gap-4 text-sm'>
            <div className='flex min-w-0 items-center gap-2'>
              <span className={cn('h-3 w-3 shrink-0 rounded-full', item.colorClassName)} />
              <span className='truncate'>{t(`charts.breakdown.items.${item.key}`)}</span>
            </div>
            <span className='font-semibold text-card-foreground'>{item.percent}%</span>
          </div>
        ))}
      </div>
    </section>
  )
}
