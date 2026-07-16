import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { BookingStatsByPeriodResponse } from '../../services'

const CHART_WIDTH = 550
const CHART_HEIGHT = 250
const CHART_LEFT = 44
const CHART_TOP = 14
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

interface ChartPoint {
  label: string
  value: number
  x: number
  y: number
}

export interface AdminBookingRevenueChartCardProps {
  data: BookingStatsByPeriodResponse[]
  isLoading: boolean
  errorMessage?: string | null
  formatMoney: (value: number) => string
}

function getPointLabel(period: string, t: (key: string) => string): string {
  const date = new Date(period)

  if (Number.isNaN(date.getTime())) {
    return period
  }

  return t(`charts.bookingRevenueTrend.days.${DAY_KEYS[date.getDay()]}`)
}

function buildLinePath(points: ChartPoint[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0].x} ${points[0].y}`

  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ')
}

function buildYAxisLabels(maxValue: number) {
  return Array.from({ length: 6 }, (_, index) => {
    const ratio = index / 5
    const value = maxValue * (1 - ratio)

    return {
      label: value,
      y: CHART_HEIGHT * ratio
    }
  })
}

export function AdminBookingRevenueChartCard({
  data,
  isLoading,
  errorMessage,
  formatMoney
}: AdminBookingRevenueChartCardProps) {
  const { t } = useTranslation('admin')

  const chart = useMemo(() => {
    const maxRevenue = Math.max(...data.map((item) => Number(item.revenue ?? 0)), 0)
    const maxValue = maxRevenue > 0 ? maxRevenue : 1
    const points = data.map((item, index) => {
      const x = data.length === 1 ? CHART_WIDTH / 2 : (CHART_WIDTH / (data.length - 1)) * index
      const revenue = Number(item.revenue ?? 0)
      const y = CHART_HEIGHT - (revenue / maxValue) * CHART_HEIGHT

      return {
        label: getPointLabel(item.period, t),
        value: revenue,
        x,
        y
      }
    })
    const linePath = buildLinePath(points)
    const areaPath =
      points.length > 0 ? `${linePath} L${points.at(-1)?.x ?? 0} ${CHART_HEIGHT} L${points[0].x} ${CHART_HEIGHT} Z` : ''

    return {
      areaPath,
      linePath,
      points,
      yAxisLabels: buildYAxisLabels(maxValue)
    }
  }, [data, t])

  return (
    <section className='rounded-lg border border-border bg-card p-5 shadow-sm lg:col-span-2'>
      <div className='mb-5'>
        <h2 className='font-display text-xl font-bold text-card-foreground'>{t('charts.bookingRevenueTrend.title')}</h2>
        <p className='mt-1 text-sm text-muted-foreground'>{t('charts.bookingRevenueTrend.subtitle')}</p>
      </div>

      <div className='h-[300px]'>
        {isLoading ? (
          <div className='h-full animate-pulse rounded-xl bg-muted' />
        ) : errorMessage ? (
          <div className='flex h-full items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center text-sm font-semibold text-destructive'>
            {t('charts.bookingRevenueTrend.error')}
          </div>
        ) : data.length === 0 ? (
          <div className='flex h-full items-center justify-center rounded-xl border border-border bg-background p-6 text-center text-sm text-muted-foreground'>
            {t('charts.bookingRevenueTrend.empty')}
          </div>
        ) : (
          <svg
            viewBox='0 0 640 310'
            className='h-full w-full overflow-visible'
            role='img'
            aria-label={t('charts.bookingRevenueTrend.title')}
          >
            <defs>
              <linearGradient id='admin-booking-revenue-fill' x1='0' x2='0' y1='0' y2='1'>
                <stop offset='0%' className='text-primary' stopColor='currentColor' stopOpacity='0.2' />
                <stop offset='100%' className='text-primary' stopColor='currentColor' stopOpacity='0.02' />
              </linearGradient>
            </defs>
            <g transform={`translate(${CHART_LEFT} ${CHART_TOP})`}>
              {chart.yAxisLabels.map((item) => (
                <g key={`${item.label}-${item.y}`}>
                  <text x='-10' y={item.y + 4} textAnchor='end' className='fill-muted-foreground text-[11px]'>
                    {formatMoney(item.label)}
                  </text>
                  <line x1='0' y1={item.y} x2={CHART_WIDTH} y2={item.y} className='stroke-border' strokeWidth='1' />
                </g>
              ))}
              <path d={chart.areaPath} fill='url(#admin-booking-revenue-fill)' />
              <path d={chart.linePath} className='fill-none stroke-primary' strokeWidth='3' strokeLinecap='round' />
              {chart.points.map((point) => (
                <g key={`${point.label}-${point.x}`}>
                  <circle cx={point.x} cy={point.y} r='4.5' className='fill-card stroke-primary' strokeWidth='2.5' />
                  <text x={point.x} y={point.y - 12} textAnchor='middle' className='fill-primary text-[11px] font-bold'>
                    {formatMoney(point.value)}
                  </text>
                  <text x={point.x} y='275' textAnchor='middle' className='fill-muted-foreground text-[12px]'>
                    {point.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        )}
      </div>
    </section>
  )
}
