import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'

import { AdminBookingRevenueChartCard } from '../components/dashboard/admin-booking-revenue-chart-card'
import { AdminBookingRevenueStructureCard } from '../components/dashboard/admin-booking-revenue-structure-card'
import { AdminMetricsGrid } from '../components/dashboard/admin-metrics-grid'
import { AdminRevenueBreakdownCard } from '../components/dashboard/admin-revenue-breakdown-card'
import { AdminRevenueChartCard } from '../components/dashboard/admin-revenue-chart-card'
import { AdminTopSalesTable } from '../components/dashboard/admin-top-sales-table'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { fetchRevenueDashboardApi } from '../services/dashboard'

type FilterKey = 'today' | 'week' | 'year'
import {
  fetchBookingStatsByPeriod,
  fetchBookingStatsByService,
  fetchBookingStatsSummary,
  type BookingStatsByPeriodResponse,
  type BookingStatsByServiceResponse,
  type BookingStatsSummaryResponse
} from '../services'

const FILTER_KEYS = ['today', 'week', 'month', 'custom'] as const

export function AdminDashboardPage() {
  const { t } = useTranslation('admin')
  const [filter, setFilter] = useState<FilterKey>('today')

  const periodType = periodTypeMap[filter]

  const { data, isLoading } = useQuery({
    queryKey: ['adminRevenueDashboard', periodType],
    queryFn: () => fetchRevenueDashboardApi(periodType),
  })
  const [activeFilter, setActiveFilter] = useState<FilterKey>('today')
  const dateRange = useMemo(() => getDashboardDateRange(activeFilter), [activeFilter])
  const [bookingStats, setBookingStats] = useState<BookingStatsState>({
    summary: null,
    trend: [],
    structure: [],
    isLoading: true,
    errorMessage: null
  })

  const loadBookingStats = useCallback(async () => {
    setBookingStats((current) => ({ ...current, isLoading: true, errorMessage: null }))

    try {
      const [summary, trend, structure] = await Promise.all([
        fetchBookingStatsSummary(dateRange),
        fetchBookingStatsByPeriod(dateRange),
        fetchBookingStatsByService(dateRange)
      ])

      setBookingStats({
        summary,
        trend,
        structure,
        isLoading: false,
        errorMessage: null
      })
    } catch (error) {
      setBookingStats((current) => ({
        ...current,
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : t('charts.bookingStatsError')
      }))
    }
  }, [dateRange, t])

  useEffect(() => {
    void loadBookingStats()
  }, [loadBookingStats])

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav titleKey='dashboard.title' subtitleKey='dashboard.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
              <div>
                <h1 className='mb-2 font-display text-2xl font-bold text-primary md:text-3xl'>
                  {t('dashboard.title')}
                </h1>
                <p className='text-muted-foreground'>{t('dashboard.subtitle')}</p>
              </div>
              <div className='flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-1 shadow-sm'>
                {FILTER_KEYS.map((key) => {
                  const isActive = key === filter

                  return (
                    <button
                      key={key}
                      type='button'
                      aria-pressed={isActive}
                      className={
                        isActive
                          ? 'rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground'
                          : 'rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
                      }
                      onClick={() => setActiveFilter(key)}
                    >
                      {t(`filters.${key}`)}
                    </button>
                  )
                })}
              </div>
            </section>

           <AdminMetricsGrid
              totalRevenueValue={data?.totalRevenue?.value}
              totalRevenueChangePercent={data?.totalRevenue?.changePercent}
              profitValue={data?.profit?.value}
              profitChangePercent={data?.profit?.changePercent}
              isLoading={isLoading}
            />
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <AdminRevenueChartCard
                trendPoints={data?.revenueTrend}
                isLoading={isLoading}
              />
              <AdminRevenueBreakdownCard />
            </div>
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <AdminBookingRevenueChartCard
                data={bookingStats.trend}
                errorMessage={bookingStats.errorMessage}
                formatMoney={formatCompactVnd}
                isLoading={bookingStats.isLoading}
              />
              <AdminBookingRevenueStructureCard
                data={bookingStats.structure}
                errorMessage={bookingStats.errorMessage}
                formatMoney={formatCompactVnd}
                isLoading={bookingStats.isLoading}
              />
            </div>
            <AdminTopSalesTable />
          </div>
        </main>
      </div>
    </div>
  )
}
