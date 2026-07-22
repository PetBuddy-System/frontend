import { useTranslation } from 'react-i18next'
import type { TrendPoint } from '../../services/dashboard/dashboard-api'

interface AdminRevenueChartCardProps {
  trendPoints?: TrendPoint[]
  isLoading?: boolean
}

export function AdminRevenueChartCard({ trendPoints = [], isLoading }: AdminRevenueChartCardProps) {
  const { t } = useTranslation('admin')

  const pointsCount = trendPoints.length
  const maxRevenue = trendPoints.reduce((max, p) => Math.max(max, p.revenue), 0)

  const mappedPoints = trendPoints.map((point, index) => {
  const x = pointsCount > 1 ? 46 + index * (504 / (pointsCount - 1)) : 46
  const y = maxRevenue > 0 ? 250 - (point.revenue / maxRevenue) * 250 : 250
  return {
    key: point.date + index,
    label: point.label,
    x,
    y
  }
})

  // Generate paths
  const linePath = mappedPoints.map((p, idx) => (idx === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`)).join(' ')
  const areaPath = mappedPoints.length ? `${linePath} L${mappedPoints[mappedPoints.length - 1].x} 250 L${mappedPoints[0].x} 250 Z` : ''

  // Generate Y-axis labels
  const yAxisSteps = 6
  const labelMax = maxRevenue > 0 ? maxRevenue : 30000000
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
    const val = labelMax - (labelMax / yAxisSteps) * i
    const y = (250 / yAxisSteps) * i
    
    let label = ''
    if (val >= 1000000) {
      const millions = Math.round((val / 1000000) * 10) / 10
      label = `${millions}M`
    } else if (val >= 1000) {
      label = `${Math.round(val / 1000)}K`
    } else {
      label = `${Math.round(val)}`
    }
    return { label, y }
  })

  return (
    <section className='rounded-lg border border-border bg-card p-5 shadow-sm lg:col-span-2'>
      <div className='mb-5'>
        <h2 className='font-display text-xl font-bold text-card-foreground'>{t('charts.revenueTrend.title')}</h2>
      </div>

      <div className='h-[300px]'>
        {isLoading ? (
          <div className='flex h-full w-full animate-pulse items-center justify-center rounded bg-muted text-muted-foreground'>
            {t('feedback.loading', 'Loading...')}
          </div>
        ) : (
          <svg
            viewBox='0 0 640 310'
            className='h-full w-full overflow-visible'
            role='img'
            aria-label={t('charts.revenueTrend.title')}
          >
            <defs>
              <linearGradient id='admin-revenue-fill' x1='0' x2='0' y1='0' y2='1'>
                <stop offset='0%' className='text-primary' stopColor='currentColor' stopOpacity='0.2' />
                <stop offset='100%' className='text-primary' stopColor='currentColor' stopOpacity='0.02' />
              </linearGradient>
            </defs>
            <g transform='translate(44 14)'>
              {yAxisLabels.map((item) => (
                <g key={item.label + item.y}>
                  <text x='-10' y={item.y + 4} textAnchor='end' className='fill-muted-foreground text-[11px]'>
                    {item.label}
                  </text>
                  <line x1='0' y1={item.y} x2='550' y2={item.y} className='stroke-border' strokeWidth='1' />
                </g>
              ))}
              {areaPath && <path d={areaPath} fill='url(#admin-revenue-fill)' />}
              {linePath && <path d={linePath} className='fill-none stroke-primary' strokeWidth='3' strokeLinecap='round' />}
              {mappedPoints.map((point) => {
                const hasTranslation = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(point.label)
                const displayLabel = hasTranslation ? t(`charts.revenueTrend.days.${point.label}`) : point.label

                return (
                  <g key={point.key}>
                    <circle cx={point.x} cy={point.y} r='4.5' className='fill-card stroke-primary' strokeWidth='2.5' />
                    <text x={point.x} y='275' textAnchor='middle' className='fill-muted-foreground text-[12px]'>
                      {displayLabel}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        )}
      </div>
    </section>
  )
}
