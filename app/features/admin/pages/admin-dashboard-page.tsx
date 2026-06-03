import { useTranslation } from 'react-i18next'

import { AdminMetricsGrid } from '../components/dashboard/admin-metrics-grid'
import { AdminRevenueBreakdownCard } from '../components/dashboard/admin-revenue-breakdown-card'
import { AdminRevenueChartCard } from '../components/dashboard/admin-revenue-chart-card'
import { AdminTopSalesTable } from '../components/dashboard/admin-top-sales-table'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'

const FILTER_KEYS = ['today', 'week', 'month', 'custom'] as const

export function AdminDashboardPage() {
  const { t } = useTranslation('admin')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav />
        <main className='flex-1 overflow-y-auto p-4 md:p-8'>
          <div className='mx-auto flex max-w-7xl flex-col gap-8'>
            <section className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
              <div>
                <h1 className='mb-2 font-display text-3xl font-bold text-primary md:text-5xl'>
                  {t('dashboard.title')}
                </h1>
                <p className='text-muted-foreground'>{t('dashboard.subtitle')}</p>
              </div>
              <div className='flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-1 shadow-sm'>
                {FILTER_KEYS.map((key) => {
                  const isActive = key === 'today'

                  return (
                    <button
                      key={key}
                      type='button'
                      className={
                        isActive
                          ? 'rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground'
                          : 'rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
                      }
                    >
                      {t(`filters.${key}`)}
                    </button>
                  )
                })}
              </div>
            </section>

            <AdminMetricsGrid />
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <AdminRevenueChartCard />
              <AdminRevenueBreakdownCard />
            </div>
            <AdminTopSalesTable />
          </div>
        </main>
      </div>
    </div>
  )
}
