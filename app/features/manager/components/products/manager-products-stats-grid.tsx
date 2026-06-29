// app/features/manager/components/products/manager-products-stats-grid.tsx
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

interface ManagerProductsStatsGridProps {
  totalProducts: number
  inStock: number
  lowStock: number
  isLoading?: boolean
}

export function ManagerProductsStatsGrid({
  totalProducts,
  inStock,
  lowStock,
  isLoading = false
}: ManagerProductsStatsGridProps) {
  const { t } = useTranslation('manager')

  const PRODUCT_STATS = [
    { key: 'total', icon: 'inventory', value: totalProducts },
    { key: 'available', icon: 'check_circle', value: inStock },
    { key: 'lowStock', icon: 'warning', value: lowStock }
  ] as const

  return (
    <section className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      {PRODUCT_STATS.map((stat) => (
        <article
          key={stat.key}
          className='flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md'
        >
          <div>
            <p className='text-xs font-bold uppercase tracking-wide text-muted-foreground'>
              {t(`productManagement.stats.${stat.key}`)}
            </p>
            <p className='mt-1 font-display text-3xl font-extrabold text-card-foreground'>
              {isLoading ? '...' : stat.value.toLocaleString()}
            </p>
          </div>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-primary'>
            <MaterialIcon name={stat.icon} filled className='text-3xl' />
          </div>
        </article>
      ))}
    </section>
  )
}