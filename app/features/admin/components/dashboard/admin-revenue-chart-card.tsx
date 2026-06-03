import { useTranslation } from 'react-i18next'

const REVENUE_POINTS = [
  { key: 'mon', value: 12.5, x: 46, y: 147 },
  { key: 'tue', value: 15.2, x: 130, y: 125 },
  { key: 'wed', value: 11.8, x: 214, y: 153 },
  { key: 'thu', value: 18.5, x: 298, y: 98 },
  { key: 'fri', value: 14.2, x: 382, y: 134 },
  { key: 'sat', value: 25.4, x: 466, y: 42 },
  { key: 'sun', value: 28.9, x: 550, y: 13 }
] as const

const LINE_PATH =
  'M46 147 C78 146 96 125 130 125 C164 125 178 153 214 153 C250 153 262 98 298 98 C334 98 346 134 382 134 C418 134 430 42 466 42 C502 42 514 13 550 13'
const AREA_PATH = `${LINE_PATH} L550 250 L46 250 Z`

const Y_AXIS_LABELS = [
  { label: '30M', y: 0 },
  { label: '25M', y: 42 },
  { label: '20M', y: 83 },
  { label: '15M', y: 125 },
  { label: '10M', y: 167 },
  { label: '5M', y: 208 },
  { label: '0M', y: 250 }
] as const

export function AdminRevenueChartCard() {
  const { t } = useTranslation('admin')

  return (
    <section className='rounded-lg border border-border bg-card p-5 shadow-sm lg:col-span-2'>
      <div className='mb-5'>
        <h2 className='font-display text-xl font-bold text-card-foreground'>{t('charts.revenueTrend.title')}</h2>
      </div>

      <div className='h-[300px]'>
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
            {Y_AXIS_LABELS.map((item) => (
              <g key={item.label}>
                <text x='-10' y={item.y + 4} textAnchor='end' className='fill-muted-foreground text-[11px]'>
                  {item.label}
                </text>
                <line x1='0' y1={item.y} x2='550' y2={item.y} className='stroke-border' strokeWidth='1' />
              </g>
            ))}
            <path d={AREA_PATH} fill='url(#admin-revenue-fill)' />
            <path d={LINE_PATH} className='fill-none stroke-primary' strokeWidth='3' strokeLinecap='round' />
            {REVENUE_POINTS.map((point) => (
              <g key={point.key}>
                <circle cx={point.x} cy={point.y} r='4.5' className='fill-card stroke-primary' strokeWidth='2.5' />
                <text x={point.x} y='275' textAnchor='middle' className='fill-muted-foreground text-[12px]'>
                  {t(`charts.revenueTrend.days.${point.key}`)}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </section>
  )
}
