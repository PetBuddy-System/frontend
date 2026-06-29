import { useTranslation } from 'react-i18next'

const REVENUE_BARS = [40, 65, 55, 85, 45, 70, 60] as const

export function ManagerDashboardRevenueChart() {
  const { t } = useTranslation('manager')

  return (
    <article className='xl:col-span-2 rounded-xl border border-border/70 bg-card p-6 shadow-sm'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='font-display text-2xl font-bold text-primary'>
            {t('managerDashboard.chart.title')}
          </h2>
          <p className='text-sm text-muted-foreground'>{t('managerDashboard.chart.subtitle')}</p>
        </div>
        <div className='inline-flex items-center rounded-full bg-muted px-4 py-2 text-sm font-semibold text-foreground'>
          {t('managerDashboard.chart.period')}
        </div>
      </div>

      <div className='flex h-72 items-end gap-3 rounded-xl bg-muted/40 px-4 pb-4 pt-6 md:gap-4'>
        {REVENUE_BARS.map((height, index) => (
          <div key={`${height}-${index}`} className='flex flex-1 flex-col items-center justify-end gap-2'>
            <div className='text-xs font-medium text-muted-foreground'>
              {index === 0 && t('managerDashboard.chart.values.mon')}
              {index === 1 && t('managerDashboard.chart.values.tue')}
              {index === 3 && t('managerDashboard.chart.values.thu')}
            </div>
            <div
              className={
                index === 3
                  ? 'w-full rounded-t-xl bg-primary shadow-sm transition-transform duration-300 hover:-translate-y-1'
                  : 'w-full rounded-t-xl bg-border/70 transition-transform duration-300 hover:-translate-y-1 hover:bg-primary/30'
              }
              style={{ height: `${height}%` }}
            />
          </div>
        ))}
      </div>

      <div className='mt-4 grid grid-cols-7 gap-3 text-center font-mono text-xs text-muted-foreground md:text-sm'>
        <span>{t('managerDashboard.chart.days.mon')}</span>
        <span>{t('managerDashboard.chart.days.tue')}</span>
        <span>{t('managerDashboard.chart.days.wed')}</span>
        <span>{t('managerDashboard.chart.days.thu')}</span>
        <span>{t('managerDashboard.chart.days.fri')}</span>
        <span>{t('managerDashboard.chart.days.sat')}</span>
        <span>{t('managerDashboard.chart.days.sun')}</span>
      </div>
    </article>
  )
}
