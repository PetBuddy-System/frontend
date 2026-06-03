import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const VOUCHER_STATS = [
  { key: 'activeVouchers', icon: 'confirmation_number', value: '124', tone: 'primary' },
  { key: 'issuedPoints', icon: 'stars', value: '45.200', tone: 'secondary' },
  { key: 'redeemedPoints', icon: 'redeem', value: '18.750', tone: 'success' }
] as const

const STAT_TONE_CLASS_BY_TONE = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/10 text-success'
} as const

export function AdminVoucherStatsGrid() {
  const { t } = useTranslation('admin')

  return (
    <section className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      {VOUCHER_STATS.map((stat) => (
        <article
          key={stat.key}
          className='flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm'
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${STAT_TONE_CLASS_BY_TONE[stat.tone]}`}
          >
            <MaterialIcon name={stat.icon} filled className='text-3xl' />
          </div>
          <div>
            <p className='text-sm font-semibold text-muted-foreground'>
              {t(`voucherManagement.stats.${stat.key}.label`)}
            </p>
            <p className='font-display text-3xl font-extrabold text-card-foreground'>{stat.value}</p>
            <p className='mt-1 text-xs font-medium text-muted-foreground'>
              {t(`voucherManagement.stats.${stat.key}.note`)}
            </p>
          </div>
        </article>
      ))}
    </section>
  )
}
