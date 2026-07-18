import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'

import { AdminBookingRevenueChartCard } from '../components/dashboard/admin-booking-revenue-chart-card'
import { AdminBookingRevenueStructureCard } from '../components/dashboard/admin-booking-revenue-structure-card'
import { AdminMetricsGrid } from '../components/dashboard/admin-metrics-grid'
import { AdminRevenueBreakdownCard, type RevenueBreakdownItem } from '../components/dashboard/admin-revenue-breakdown-card'
import { AdminRevenueChartCard } from '../components/dashboard/admin-revenue-chart-card'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { fetchRevenueDashboardApi } from '../services/dashboard'
import { fetchBookingStatsByPeriod, fetchBookingStatsByService, fetchBookingStatsSummary } from '../services/statistics'

type FilterKey = 'today' | 'week' | 'year'

const FILTER_KEYS: FilterKey[] = ['today', 'week', 'year']

const periodTypeMap = {
  today: 'DAY',
  week: 'WEEK',
  year: 'YEAR'
} as const

function formatDateParam(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDateRange(filter: FilterKey) {
  const now = new Date()
  const from = new Date(now)
  const to = new Date(now)

  if (filter === 'week') {
    const day = now.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    from.setDate(now.getDate() + mondayOffset)
    to.setDate(from.getDate() + 6)
  }

  if (filter === 'year') {
    from.setMonth(0, 1)
    to.setMonth(11, 31)
  }

  return {
    from: formatDateParam(from),
    to: formatDateParam(to)
  }
}

function formatDashboardMoney(value: number): string {
  const amount = Number(value ?? 0)
  const sign = amount < 0 ? '-' : ''
  const abs = Math.abs(amount)

  if (abs >= 1_000_000) {
    const millions = Math.floor((abs / 1_000_000) * 10) / 10 
    return `${sign}${millions}M đ`
  }

  if (abs >= 1_000) {
    return `${sign}${Math.floor(abs / 1_000)}K đ`
  }

  return `${sign}${new Intl.NumberFormat('vi-VN').format(abs)} đ`
}

export function AdminDashboardPage() {
  const { t } = useTranslation('admin')
  const [filter, setFilter] = useState<FilterKey>('today')

  const periodType = periodTypeMap[filter]
  const bookingStatsRange = getDateRange(filter)

  const { data, isLoading } = useQuery({
    queryKey: ['adminRevenueDashboard', periodType],
    queryFn: () => fetchRevenueDashboardApi(periodType)
  })

  const {
    data: bookingSummary,
    isLoading: isBookingSummaryLoading,
    error: bookingSummaryError
  } = useQuery({
    queryKey: ['adminBookingStatsSummary', bookingStatsRange.from, bookingStatsRange.to],
    queryFn: () => fetchBookingStatsSummary(bookingStatsRange)
  })

  const combinedTotalRevenue = (Number(data?.totalRevenue?.value) || 0) + (Number(bookingSummary?.totalRevenue) || 0)
  const {
    data: bookingTrend = [],
    isLoading: isBookingTrendLoading,
    error: bookingTrendError
  } = useQuery({
    queryKey: ['adminBookingStatsByPeriod', bookingStatsRange.from, bookingStatsRange.to],
    queryFn: () => fetchBookingStatsByPeriod(bookingStatsRange)
  })

  const {
    data: bookingStructure = [],
    isLoading: isBookingStructureLoading,
    error: bookingStructureError
  } = useQuery({
    queryKey: ['adminBookingStatsByService', bookingStatsRange.from, bookingStatsRange.to],
    queryFn: () => fetchBookingStatsByService(bookingStatsRange)
  })

  const productRevenue = Number(data?.totalRevenue?.value) || 0
  const serviceRevenue = bookingStructure.reduce((sum, s) => sum + (Number(s.revenue) || 0), 0)
  const breakdownTotal = productRevenue + serviceRevenue

  const revenueBreakdownItems: RevenueBreakdownItem[] =
    breakdownTotal > 0
      ? [
          {
            key: 'products',
            label: t('charts.breakdown.items.products'),
            percent: Math.round((productRevenue / breakdownTotal) * 1000) / 10
          },
          ...bookingStructure.map((service) => ({
            key: service.serviceName,
            label: service.serviceName,
            percent: Math.round(((Number(service.revenue) || 0) / breakdownTotal) * 1000) / 10
          }))
        ]
      : []

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
                      onClick={() => setFilter(key)}
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

            <AdminMetricsGrid
              totalRevenueValue={combinedTotalRevenue}
              totalRevenueChangePercent={data?.totalRevenue?.changePercent}
              profitValue={data?.profit?.value}
              profitChangePercent={data?.profit?.changePercent}
              bookingRevenueValue={bookingSummary?.totalRevenue}
              bookingCount={bookingSummary?.totalBookings}
              averageOrderValue={bookingSummary?.averageOrderValue}
              hasBookingStatsError={Boolean(bookingSummaryError)}
              isLoading={isLoading || isBookingSummaryLoading}
              isBookingStatsLoading={isBookingSummaryLoading}
            />
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <AdminRevenueChartCard trendPoints={data?.revenueTrend} isLoading={isLoading} />
              <AdminRevenueBreakdownCard
                items={revenueBreakdownItems}
                isLoading={isLoading || isBookingStructureLoading}
              />
              <AdminBookingRevenueChartCard
                data={bookingTrend}
                isLoading={isBookingTrendLoading}
                errorMessage={bookingTrendError instanceof Error ? bookingTrendError.message : null}
                formatMoney={formatDashboardMoney}
              />
              <AdminBookingRevenueStructureCard
                data={bookingStructure}
                isLoading={isBookingStructureLoading}
                errorMessage={bookingStructureError instanceof Error ? bookingStructureError.message : null}
                formatMoney={formatDashboardMoney}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
