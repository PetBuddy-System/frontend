import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const STAFF_NOTIFICATION_ITEMS = [
  {
    icon: 'campaign',
    iconClassName: 'bg-info/10 text-info',
    key: 'process'
  },
  {
    icon: 'swap_horiz',
    iconClassName: 'bg-success/10 text-success',
    key: 'shift'
  },
  {
    icon: 'workspace_premium',
    iconClassName: 'bg-secondary text-secondary-foreground',
    key: 'reward'
  }
] as const

export function StaffNotificationsCard() {
  const { t } = useTranslation('staff')

  return (
    <section className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
      <div className='mb-6 flex items-center justify-between gap-4'>
        <h2 className='font-display text-2xl font-bold'>{t('notifications.title')}</h2>
        <MaterialIcon name='notifications_active' filled className='text-primary' />
      </div>

      <div className='space-y-4'>
        {STAFF_NOTIFICATION_ITEMS.map((item) => (
          <article key={item.key} className='flex gap-3 rounded-xl bg-background p-4'>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconClassName}`}>
              <MaterialIcon name={item.icon} filled />
            </div>
            <div className='min-w-0'>
              <p className='font-display font-bold'>{t(`notifications.items.${item.key}.title`)}</p>
              <p className='mt-1 text-sm text-muted-foreground'>{t(`notifications.items.${item.key}.description`)}</p>
              <p className='mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                {t(`notifications.items.${item.key}.time`)}
              </p>
            </div>
          </article>
        ))}
      </div>

      <button className='mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 font-display font-bold text-primary transition-colors hover:bg-muted'>
        {t('notifications.viewAll')}
        <MaterialIcon name='arrow_forward' />
      </button>
    </section>
  )
}
