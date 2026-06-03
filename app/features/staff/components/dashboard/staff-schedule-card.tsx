import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const STAFF_SHIFT_ITEMS = [
  {
    key: 'morning',
    statusClassName: 'bg-success/10 text-success'
  },
  {
    key: 'afternoon',
    statusClassName: 'bg-warning/10 text-warning'
  }
] as const

export function StaffScheduleCard() {
  const { t } = useTranslation('staff')

  return (
    <section className='rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2'>
      <div className='mb-6 flex items-start justify-between gap-4'>
        <div>
          <h2 className='font-display text-2xl font-bold'>{t('schedule.title')}</h2>
          <p className='mt-1 text-sm text-muted-foreground'>{t('schedule.date')}</p>
        </div>
        <div className='rounded-xl bg-primary/10 p-3 text-primary'>
          <MaterialIcon name='event' filled />
        </div>
      </div>

      <div className='space-y-4'>
        {STAFF_SHIFT_ITEMS.map((shift) => (
          <article key={shift.key} className='rounded-xl border border-border bg-background p-4'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
              <div className='flex gap-4'>
                <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-primary'>
                  <MaterialIcon name='schedule' />
                </div>
                <div>
                  <p className='font-display text-lg font-bold'>{t(`schedule.shifts.${shift.key}.title`)}</p>
                  <p className='mt-1 text-sm font-semibold text-primary'>{t(`schedule.shifts.${shift.key}.time`)}</p>
                  <p className='mt-1 text-sm text-muted-foreground'>{t(`schedule.shifts.${shift.key}.area`)}</p>
                </div>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${shift.statusClassName}`}>
                {t(`schedule.shifts.${shift.key}.status`)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
