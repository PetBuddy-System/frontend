import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

import { ManagerAssignmentModal } from './manager-assignment-modal'

const BOOKINGS = [
  { key: 'bk1024', category: 'grooming', status: 'pending', canAssign: true },
  { key: 'bk1025', category: 'vet', status: 'pending', canAssign: true },
  { key: 'bk1026', category: 'sitter', status: 'scheduled', canAssign: false }
] as const

const CATEGORY_CLASS_BY_CATEGORY = {
  grooming: 'bg-primary/10 text-primary',
  sitter: 'bg-secondary text-secondary-foreground',
  vet: 'bg-tertiary text-tertiary-foreground'
} as const

export function ManagerBookingAssignmentTable() {
  const { t } = useTranslation('manager')
  const [assignmentBookingCode, setAssignmentBookingCode] = useState<string | null>(null)

  return (
    <section className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='font-display text-2xl font-bold text-card-foreground'>{t('staffSchedule.bookingList.title')}</h2>
        <div className='flex gap-2'>
          <button className='inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary'>
            <MaterialIcon name='filter_list' className='text-lg' />
            <span>{t('staffSchedule.bookingList.filter')}</span>
          </button>
          <button className='inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-primary'>
            <MaterialIcon name='calendar_today' className='text-lg' />
            <span>{t('staffSchedule.bookingList.today')}</span>
          </button>
        </div>
      </div>

      <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[860px] border-collapse text-left'>
            <thead>
              <tr className='border-b border-border bg-muted text-sm font-semibold text-muted-foreground'>
                <th className='px-4 py-4'>{t('staffSchedule.table.columns.code')}</th>
                <th className='px-4 py-4'>{t('staffSchedule.table.columns.service')}</th>
                <th className='px-4 py-4'>{t('staffSchedule.table.columns.customerPet')}</th>
                <th className='px-4 py-4'>{t('staffSchedule.table.columns.time')}</th>
                <th className='px-4 py-4'>{t('staffSchedule.table.columns.status')}</th>
                <th className='px-4 py-4 text-center'>{t('staffSchedule.table.columns.actions')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {BOOKINGS.map((booking) => (
                <tr key={booking.key} className='transition-colors hover:bg-muted'>
                  <td className='px-4 py-5 font-bold text-primary'>
                    {t(`staffSchedule.table.rows.${booking.key}.code`)}
                  </td>
                  <td className='px-4 py-5'>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-1 text-xs font-bold uppercase',
                        CATEGORY_CLASS_BY_CATEGORY[booking.category]
                      )}
                    >
                      {t(`staffSchedule.categories.${booking.category}`)}
                    </span>
                    <p className='mt-1 text-sm font-semibold text-card-foreground'>
                      {t(`staffSchedule.table.rows.${booking.key}.service`)}
                    </p>
                  </td>
                  <td className='px-4 py-5'>
                    <p className='font-semibold text-card-foreground'>
                      {t(`staffSchedule.table.rows.${booking.key}.customer`)}
                    </p>
                    <p className='flex items-center gap-1 text-xs text-muted-foreground'>
                      <MaterialIcon name='pets' className='text-sm' />
                      {t(`staffSchedule.table.rows.${booking.key}.pet`)}
                    </p>
                  </td>
                  <td className='px-4 py-5'>
                    <p className='font-semibold text-card-foreground'>
                      {t(`staffSchedule.table.rows.${booking.key}.time`)}
                    </p>
                    <p className='text-xs text-muted-foreground'>{t(`staffSchedule.table.rows.${booking.key}.date`)}</p>
                  </td>
                  <td className='px-4 py-5'>
                    <span
                      className={
                        booking.status === 'pending'
                          ? 'inline-flex items-center gap-2 text-sm font-semibold text-destructive'
                          : 'inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground'
                      }
                    >
                      <span
                        className={
                          booking.status === 'pending'
                            ? 'h-2 w-2 rounded-full bg-destructive'
                            : 'h-2 w-2 rounded-full bg-muted-foreground'
                        }
                      />
                      {t(`staffSchedule.status.${booking.status}`)}
                    </span>
                  </td>
                  <td className='px-4 py-5 text-center'>
                    <button
                      type='button'
                      disabled={!booking.canAssign}
                      onClick={() => {
                        if (booking.canAssign) {
                          setAssignmentBookingCode(t(`staffSchedule.table.rows.${booking.key}.code`))
                        }
                      }}
                      className={
                        booking.canAssign
                          ? 'mx-auto inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
                          : 'mx-auto inline-flex h-9 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-muted px-4 text-sm font-semibold text-muted-foreground opacity-60'
                      }
                    >
                      <span>{t('staffSchedule.actions.assign')}</span>
                      <MaterialIcon name={booking.canAssign ? 'expand_more' : 'lock'} className='text-lg' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex flex-col gap-3 border-t border-border bg-muted px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <span className='text-sm text-muted-foreground'>{t('staffSchedule.pagination.showing')}</span>
          <div className='flex gap-1'>
            <button className='flex h-9 w-9 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:text-primary'>
              <MaterialIcon name='chevron_left' className='text-lg' />
            </button>
            <button className='flex h-9 w-9 items-center justify-center rounded border border-border bg-primary text-sm font-bold text-primary-foreground'>
              1
            </button>
            <button className='flex h-9 w-9 items-center justify-center rounded border border-border bg-card text-sm font-bold text-muted-foreground hover:text-primary'>
              2
            </button>
            <button className='flex h-9 w-9 items-center justify-center rounded border border-border bg-card text-muted-foreground hover:text-primary'>
              <MaterialIcon name='chevron_right' className='text-lg' />
            </button>
          </div>
        </div>
      </div>
      {assignmentBookingCode ? (
        <ManagerAssignmentModal bookingCode={assignmentBookingCode} onClose={() => setAssignmentBookingCode(null)} />
      ) : null}
    </section>
  )
}
