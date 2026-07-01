import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

interface ManagerPromotionsStatsProps {
  total: number
  activeCount: number
  draftCount: number
  expiredCount: number
  isLoading?: boolean
}

export function ManagerPromotionsStats({
  total,
  activeCount,
  draftCount,
  expiredCount,
  isLoading = false
}: ManagerPromotionsStatsProps) {
  const { t } = useTranslation('manager')

  const STATS_ITEMS = [
    {
      key: 'total',
      label: t('promotions.stats.total', 'TỔNG CHƯƠNG TRÌNH'),
      value: total,
      icon: 'local_offer',
      iconColorClass: 'text-blue-600 dark:text-blue-400',
      bgColorClass: 'bg-blue-500/10'
    },
    {
      key: 'active',
      label: t('promotions.stats.active', 'ĐANG HOẠT ĐỘNG'),
      value: activeCount,
      icon: 'check_circle',
      iconColorClass: 'text-success',
      bgColorClass: 'bg-success/10'
    },
    {
      key: 'draft',
      label: t('promotions.stats.draft', 'BẢN NHÁP'),
      value: draftCount,
      icon: 'drafts',
      iconColorClass: 'text-warning',
      bgColorClass: 'bg-warning/10'
    },
    {
      key: 'expired',
      label: t('promotions.stats.expired', 'ĐÃ HẾT HẠN'),
      value: expiredCount,
      icon: 'schedule',
      iconColorClass: 'text-destructive',
      bgColorClass: 'bg-destructive/10'
    }
  ] as const

  return (
    <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {STATS_ITEMS.map((item) => (
        <article
          key={item.key}
          className='flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md'
        >
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bgColorClass} ${item.iconColorClass}`}>
            <MaterialIcon name={item.icon} filled className='text-2xl' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground line-clamp-1'>
              {item.label}
            </p>
            <p className='mt-0.5 font-display text-2xl font-extrabold text-card-foreground md:text-3xl'>
              {isLoading ? '...' : item.value.toLocaleString()}
            </p>
          </div>
        </article>
      ))}
    </section>
  )
}
