import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

export function ManagerDashboardStats() {
  const { t } = useTranslation('manager')

  return (
    <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      <article className='rounded-xl border border-border/70 bg-card p-5 shadow-sm'>
        <div className='mb-3 flex items-start justify-between gap-3'>
          <span className='inline-flex rounded-xl bg-primary/10 p-2 text-primary'>
            <MaterialIcon name='payments' className='text-xl' />
          </span>
          <span className='inline-flex items-center gap-1 text-sm font-semibold text-success'>
            {t('managerDashboard.stats.revenue.change')}
            <MaterialIcon name='trending_up' className='text-base' />
          </span>
        </div>
        <p className='text-sm text-muted-foreground'>{t('managerDashboard.stats.revenue.label')}</p>
        <p className='mt-2 font-mono text-2xl font-semibold text-primary md:text-3xl'>
          {t('managerDashboard.stats.revenue.value')}
        </p>
      </article>

      <article className='rounded-xl border border-border/70 border-l-4 border-l-destructive bg-card p-5 shadow-sm'>
        <div className='mb-3 flex items-start justify-between gap-3'>
          <span className='inline-flex rounded-xl bg-destructive/10 p-2 text-destructive'>
            <MaterialIcon name='calendar_clock' className='text-xl' />
          </span>
          <span className='text-sm font-semibold text-destructive'>
            {t('managerDashboard.stats.pending.badge')}
          </span>
        </div>
        <p className='text-sm text-muted-foreground'>{t('managerDashboard.stats.pending.label')}</p>
        <p className='mt-2 font-mono text-2xl font-semibold text-foreground md:text-3xl'>
          {t('managerDashboard.stats.pending.value')}
        </p>
      </article>

      <article className='rounded-xl border border-border/70 bg-card p-5 shadow-sm'>
        <div className='mb-3 flex items-start justify-between gap-3'>
          <span className='inline-flex rounded-xl bg-secondary/15 p-2 text-secondary-foreground'>
            <MaterialIcon name='badge' className='text-xl' />
          </span>
          <span className='text-sm font-semibold text-muted-foreground'>
            {t('managerDashboard.stats.staff.badge')}
          </span>
        </div>
        <p className='text-sm text-muted-foreground'>{t('managerDashboard.stats.staff.label')}</p>
        <p className='mt-2 font-mono text-2xl font-semibold text-foreground md:text-3xl'>
          {t('managerDashboard.stats.staff.value')}
        </p>
      </article>

      <article className='rounded-xl border border-border/70 border-l-4 border-l-secondary bg-card p-5 shadow-sm'>
        <div className='mb-3 flex items-start justify-between gap-3'>
          <span className='inline-flex rounded-xl bg-secondary/20 p-2 text-secondary-foreground'>
            <MaterialIcon name='inventory' className='text-xl' />
          </span>
          <span className='text-sm font-semibold text-secondary-foreground'>
            {t('managerDashboard.stats.stock.badge')}
          </span>
        </div>
        <p className='text-sm text-muted-foreground'>{t('managerDashboard.stats.stock.label')}</p>
        <p className='mt-2 font-mono text-2xl font-semibold text-foreground md:text-3xl'>
          {t('managerDashboard.stats.stock.value')}
        </p>
      </article>
    </section>
  )
}
