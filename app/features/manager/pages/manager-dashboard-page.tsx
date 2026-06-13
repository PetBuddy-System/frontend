import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'

const REVENUE_BARS = [40, 65, 55, 85, 45, 70, 60] as const
const TASK_ITEMS = ['shiftSwap', 'cancellationApproval', 'restock'] as const
const APPOINTMENT_ROWS = ['nguyenHoang', 'tranVan', 'quocMinh'] as const

export function ManagerDashboardPage() {
  const { t } = useTranslation('manager')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='dashboard' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='managerDashboard.title' subtitleKey='managerDashboard.subtitle' />
        <main className='flex-1 overflow-y-auto bg-background p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-3'>
              <h1 className='flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-3xl font-extrabold tracking-tight text-primary md:text-5xl'>
                <span>{t('managerDashboard.hero.leading')}</span>
                <span>{t('managerDashboard.hero.middle')}</span>
                <span className='inline-flex h-10 w-16 items-center justify-center overflow-hidden rounded-full bg-secondary/20 shadow-sm ring-2 ring-card md:h-11 md:w-20'>
                  <img
                    src='https://lh3.googleusercontent.com/aida-public/AB6AXuD8FE4Zdc8tWzM6xi1hOjqR_r7UepkhtSDolWvvVVQD3CmQdOgRrbaqOqhQO5LhAkUKPHpNnP2uf5E8D3me8WNZS5fceEIH0BrKxll6fQwI069fVunFXQ9fuTJeTrD_YVNyL0OPp43wRskao5YAh5TD8JDrT6xFsk4yURijd1DheVaptCV1D0cjJA-wqrzw5JEy3tmeADiHuRzQpQcbNmRhWu01MCPOeinjdifFebT8jMZnURPHGjuqbVfm1ZyioyKZJoD1B8mPwNM'
                    alt={t('managerDashboard.hero.dogAlt')}
                    className='h-full w-full object-cover'
                  />
                </span>
                <span>{t('managerDashboard.hero.trailing')}</span>
                <span className='inline-flex h-10 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/15 shadow-sm ring-2 ring-card md:h-11 md:w-20'>
                  <img
                    src='https://lh3.googleusercontent.com/aida-public/AB6AXuC8N5AJrUbeK8XQVkHVpmNcwIOm-x64HYwscdliIs-qK-Y0OxRg_rmz3O1rwGStze2uJPEjnNxz8bg23BWgv9YOO_kt7DR823cNQDtf1MwyW8ZF75QWbdP6X_V0ysrtDliisoxdNG53U1aXoirtu3br8TAajlvfIqjS8-qoBstY3FHqJ4bzQPm_zia5Zo5OjLzWPzntZKcUYZIo1N3lRjb_B4DR0ov_h4ETKwR9V8opxVZadDraBjKhK1nn5wkNXN8J_gvVONnmoDs'
                    alt={t('managerDashboard.hero.catAlt')}
                    className='h-full w-full object-cover'
                  />
                </span>
              </h1>
              <p className='max-w-3xl text-base text-muted-foreground md:text-lg'>
                {t('managerDashboard.hero.description')}
              </p>
            </section>

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

            <section className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
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

              <article className='flex flex-col rounded-xl border border-border/70 bg-card p-6 shadow-sm'>
                <h2 className='font-display text-2xl font-bold text-primary'>{t('managerDashboard.tasks.title')}</h2>
                <div className='mt-6 space-y-4'>
                  {TASK_ITEMS.map((taskKey, index) => (
                    <button
                      key={taskKey}
                      type='button'
                      className={
                        index === 2
                          ? 'flex w-full items-start gap-4 rounded-xl border-l-2 border-l-primary bg-muted px-4 py-4 text-left transition-colors hover:bg-muted/80'
                          : 'flex w-full items-start gap-4 rounded-xl bg-muted px-4 py-4 text-left transition-colors hover:bg-muted/80'
                      }
                    >
                      <span
                        className={
                          taskKey === 'shiftSwap'
                            ? 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary-foreground'
                            : taskKey === 'cancellationApproval'
                              ? 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive'
                              : 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'
                        }
                      >
                        <MaterialIcon
                          name={
                            taskKey === 'shiftSwap'
                              ? 'swap_horiz'
                              : taskKey === 'cancellationApproval'
                                ? 'cancel'
                                : 'inventory_2'
                          }
                        />
                      </span>
                      <span className='flex-1'>
                        <span className='block text-sm font-bold text-foreground'>
                          {t(`managerDashboard.tasks.items.${taskKey}.title`)}
                        </span>
                        <span className='mt-1 block text-sm text-muted-foreground'>
                          {t(`managerDashboard.tasks.items.${taskKey}.subtitle`)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type='button'
                  className='mt-6 inline-flex w-full items-center justify-center rounded-full bg-muted px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
                >
                  {t('managerDashboard.tasks.viewAll')}
                </button>
              </article>
            </section>

            <section className='overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm'>
              <div className='flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between'>
                <h2 className='font-display text-2xl font-bold text-primary'>
                  {t('managerDashboard.appointments.title')}
                </h2>
                <button
                  type='button'
                  className='inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
                >
                  <MaterialIcon name='add' className='text-lg' />
                  <span>{t('managerDashboard.appointments.create')}</span>
                </button>
              </div>

              <div className='overflow-x-auto'>
                <table className='min-w-full text-left'>
                  <thead className='bg-muted/70'>
                    <tr>
                      <th className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                        {t('managerDashboard.appointments.columns.customer')}
                      </th>
                      <th className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                        {t('managerDashboard.appointments.columns.pet')}
                      </th>
                      <th className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                        {t('managerDashboard.appointments.columns.service')}
                      </th>
                      <th className='px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                        {t('managerDashboard.appointments.columns.status')}
                      </th>
                      <th className='px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                        {t('managerDashboard.appointments.columns.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {APPOINTMENT_ROWS.map((rowKey) => {
                      const statusTone =
                        rowKey === 'nguyenHoang'
                          ? 'bg-success/10 text-success'
                          : rowKey === 'tranVan'
                            ? 'bg-secondary/20 text-secondary-foreground'
                            : 'bg-primary/10 text-primary'

                      return (
                        <tr key={rowKey} className='group transition-colors hover:bg-muted/40'>
                          <td className='px-6 py-5'>
                            <div className='flex items-center gap-3'>
                              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-primary'>
                                {t(`managerDashboard.appointments.rows.${rowKey}.initials`)}
                              </div>
                              <div>
                                <p className='text-sm font-semibold text-foreground'>
                                  {t(`managerDashboard.appointments.rows.${rowKey}.customerName`)}
                                </p>
                                <p className='text-sm text-muted-foreground'>
                                  {t(`managerDashboard.appointments.rows.${rowKey}.customerPhone`)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-5 text-sm text-foreground'>
                            <div className='flex items-center gap-2'>
                              <MaterialIcon name='pets' className='text-lg text-secondary-foreground' />
                              <span>{t(`managerDashboard.appointments.rows.${rowKey}.pet`)}</span>
                            </div>
                          </td>
                          <td className='px-6 py-5 text-sm text-foreground'>
                            {t(`managerDashboard.appointments.rows.${rowKey}.service`)}
                          </td>
                          <td className='px-6 py-5'>
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusTone}`}>
                              {t(`managerDashboard.appointments.rows.${rowKey}.status`)}
                            </span>
                          </td>
                          <td className='px-6 py-5'>
                            <div className='flex justify-end gap-2'>
                              <button
                                type='button'
                                className='rounded-full p-2 text-primary transition-colors hover:bg-primary/10'
                                aria-label={t('managerDashboard.appointments.view')}
                              >
                                <MaterialIcon name={rowKey === 'tranVan' ? 'check_circle' : 'visibility'} />
                              </button>
                              <button
                                type='button'
                                className='rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted'
                                aria-label={t('managerDashboard.appointments.more')}
                              >
                                <MaterialIcon name='more_vert' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
