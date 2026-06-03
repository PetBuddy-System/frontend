import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const BOOKINGS = [
  {
    key: 'cj9921',
    code: '#CJ-9921',
    phone: '090 123 4567',
    service: 'styling',
    pet: 'bo',
    date: '15/10/2023',
    time: '09:00 AM',
    status: 'pending'
  },
  {
    key: 'cj9920',
    code: '#CJ-9920',
    phone: '091 888 7777',
    service: 'bathDry',
    pet: 'lu',
    date: '14/10/2023',
    time: '02:30 PM',
    status: 'confirmed'
  },
  {
    key: 'cj9918',
    code: '#CJ-9918',
    phone: '093 555 1122',
    service: 'hygieneCombo',
    pet: 'mochi',
    date: '14/10/2023',
    time: '10:00 AM',
    status: 'completed'
  },
  {
    key: 'cj9915',
    code: '#CJ-9915',
    phone: '088 222 3333',
    service: 'furTrim',
    pet: 'bong',
    date: '13/10/2023',
    time: '04:00 PM',
    status: 'cancelled'
  }
] as const

const STATUS_CLASS_BY_STATUS = {
  cancelled: 'bg-destructive text-destructive-foreground',
  completed: 'bg-success text-success-foreground',
  confirmed: 'bg-primary text-primary-foreground',
  pending: 'bg-secondary text-secondary-foreground'
} as const

export function AdminServiceBookingsTable() {
  const { t } = useTranslation('admin')

  return (
    <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[980px] border-collapse text-left'>
          <thead>
            <tr className='border-b border-border bg-muted text-sm font-semibold text-muted-foreground'>
              <th className='px-6 py-4'>{t('serviceBookings.table.columns.code')}</th>
              <th className='px-6 py-4'>{t('serviceBookings.table.columns.customer')}</th>
              <th className='px-6 py-4'>{t('serviceBookings.table.columns.service')}</th>
              <th className='px-6 py-4'>{t('serviceBookings.table.columns.pet')}</th>
              <th className='px-6 py-4'>{t('serviceBookings.table.columns.dateTime')}</th>
              <th className='px-6 py-4'>{t('serviceBookings.table.columns.status')}</th>
              <th className='px-6 py-4 text-right'>{t('serviceBookings.table.columns.actions')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {BOOKINGS.map((booking) => (
              <tr key={booking.key} className='transition-colors hover:bg-muted'>
                <td className='px-6 py-4 font-semibold text-primary'>{booking.code}</td>
                <td className='px-6 py-4'>
                  <div className='flex flex-col'>
                    <span className='font-bold text-card-foreground'>
                      {t(`serviceBookings.table.rows.${booking.key}.customer`)}
                    </span>
                    <span className='text-sm text-muted-foreground'>{booking.phone}</span>
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <span className='inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary'>
                    {t(`serviceBookings.services.${booking.service}`)}
                  </span>
                </td>
                <td className='px-6 py-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-primary'>
                      <MaterialIcon name='pets' className='text-lg' />
                    </div>
                    <span className='font-semibold text-card-foreground'>
                      {t(`serviceBookings.table.rows.${booking.key}.pet`)}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <div className='flex flex-col'>
                    <span className='font-semibold'>{booking.date}</span>
                    <span className='text-sm text-muted-foreground'>{booking.time}</span>
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase',
                      STATUS_CLASS_BY_STATUS[booking.status]
                    )}
                  >
                    {t(`serviceBookings.status.${booking.status}`)}
                  </span>
                </td>
                <td className='px-6 py-4'>
                  <div className='flex justify-end gap-2'>
                    <button
                      type='button'
                      aria-label={t('serviceBookings.actions.view')}
                      className='flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
                    >
                      <MaterialIcon name='visibility' />
                    </button>
                    <button
                      type='button'
                      aria-label={t('serviceBookings.actions.edit')}
                      className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring'
                    >
                      <MaterialIcon name='edit' />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='flex flex-col gap-4 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          {t('serviceBookings.pagination.showing', { from: 1, to: 4, total: '1,284' })}
        </p>
        <nav aria-label={t('serviceBookings.pagination.label')} className='flex items-center gap-2'>
          <button
            type='button'
            disabled
            className='flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground disabled:opacity-50'
          >
            <MaterialIcon name='chevron_left' />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              type='button'
              className={
                page === 1
                  ? 'flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground'
                  : 'flex h-10 w-10 items-center justify-center rounded-lg border border-border font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
              }
            >
              {page}
            </button>
          ))}
          <span className='px-1 text-muted-foreground'>...</span>
          <button
            type='button'
            className='flex h-10 min-w-10 items-center justify-center rounded-lg border border-border px-3 font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
          >
            321
          </button>
          <button
            type='button'
            className='flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
          >
            <MaterialIcon name='chevron_right' />
          </button>
        </nav>
      </div>
    </section>
  )
}
