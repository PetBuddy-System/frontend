import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const STAFF_STAT_CARDS = [
  {
    icon: 'schedule',
    iconClassName: 'bg-primary/10 text-primary',
    key: 'hours'
  },
  {
    icon: 'task_alt',
    iconClassName: 'bg-secondary text-secondary-foreground',
    key: 'completed'
  },
  {
    icon: 'verified',
    iconClassName: 'bg-success/10 text-success',
    key: 'violations'
  },
  {
    icon: 'calendar_month',
    iconClassName: 'bg-info/10 text-info',
    key: 'workDays'
  }
] as const

export function StaffStatsGrid() {
  const { t } = useTranslation('staff')

  return (
    <section>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='font-display text-2xl font-bold text-foreground'>{t('stats.title')}</h2>
      </div>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {STAFF_STAT_CARDS.map((card) => (
          <article key={card.key} className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0'>
                <p className='text-sm font-medium text-muted-foreground'>{t(`stats.${card.key}.label`)}</p>
                <div className='mt-3 flex items-end gap-2'>
                  <p className='font-display text-2xl font-bold text-primary'>{t(`stats.${card.key}.value`)}</p>
                  <p className='pb-1 text-sm font-semibold text-muted-foreground'>{t(`stats.${card.key}.unit`)}</p>
                </div>
                <p className='mt-2 text-sm text-muted-foreground'>{t(`stats.${card.key}.note`)}</p>
              </div>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconClassName}`}>
                <MaterialIcon name={card.icon} filled className='text-2xl' />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
