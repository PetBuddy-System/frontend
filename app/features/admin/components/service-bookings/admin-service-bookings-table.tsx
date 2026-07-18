import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

type BookingStatus = 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'IN_PROGRESS' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED'

type AdminBooking = {
  key: string
  bookingId: number
  code: string
  customerPhone: string
  service: string
  pet: string
  scheduledAt: string
  timeSlot: string
  bookingType: 'IN_STORE' | 'AT_HOME'
  status: BookingStatus
  totalAmount: number
  depositAmount: number
  remainingAmount: number
  staffName?: string
  note?: string
}

const BOOKINGS: AdminBooking[] = [
  {
    key: 'cj9921',
    bookingId: 9921,
    code: '#CJ-9921',
    customerPhone: '090 123 4567',
    service: 'styling',
    pet: 'bo',
    scheduledAt: '15/10/2026',
    timeSlot: '09:00',
    bookingType: 'IN_STORE',
    status: 'PENDING_ACCEPTANCE',
    totalAmount: 450000,
    depositAmount: 90000,
    remainingAmount: 360000,
    note: 'Bé hơi nhạy cảm với tiếng máy sấy.'
  },
  {
    key: 'cj9920',
    bookingId: 9920,
    code: '#CJ-9920',
    customerPhone: '091 888 7777',
    service: 'bathDry',
    pet: 'lu',
    scheduledAt: '14/10/2026',
    timeSlot: '14:30',
    bookingType: 'AT_HOME',
    status: 'ACCEPTED',
    totalAmount: 350000,
    depositAmount: 70000,
    remainingAmount: 280000,
    staffName: 'Mai Anh'
  },
  {
    key: 'cj9918',
    bookingId: 9918,
    code: '#CJ-9918',
    customerPhone: '093 555 1122',
    service: 'hygieneCombo',
    pet: 'mochi',
    scheduledAt: '14/10/2026',
    timeSlot: '10:00',
    bookingType: 'IN_STORE',
    status: 'COMPLETED',
    totalAmount: 520000,
    depositAmount: 104000,
    remainingAmount: 416000,
    staffName: 'Quốc Bảo'
  },
  {
    key: 'cj9915',
    bookingId: 9915,
    code: '#CJ-9915',
    customerPhone: '088 222 3333',
    service: 'furTrim',
    pet: 'bong',
    scheduledAt: '13/10/2026',
    timeSlot: '16:00',
    bookingType: 'IN_STORE',
    status: 'CANCELLED',
    totalAmount: 280000,
    depositAmount: 56000,
    remainingAmount: 224000,
    note: 'Khách đổi lịch sang tuần sau.'
  }
]

const STATUS_CLASS_BY_STATUS: Record<BookingStatus, string> = {
  ACCEPTED: 'bg-primary text-primary-foreground',
  CANCELLED: 'bg-destructive text-destructive-foreground',
  COMPLETED: 'bg-success text-success-foreground',
  IN_PROGRESS: 'bg-info text-info-foreground',
  PENDING_ACCEPTANCE: 'bg-secondary text-secondary-foreground',
  READY_FOR_PICKUP: 'bg-warning text-warning-foreground'
}

const BOOKING_STATUSES: BookingStatus[] = [
  'PENDING_ACCEPTANCE',
  'ACCEPTED',
  'IN_PROGRESS',
  'READY_FOR_PICKUP',
  'COMPLETED',
  'CANCELLED'
]

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value)

export function AdminServiceBookingsTable() {
  const { t } = useTranslation('admin')
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null)

  return (
    <>
      <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[1080px] border-collapse text-left'>
            <thead>
              <tr className='border-b border-border bg-muted text-sm font-semibold text-muted-foreground'>
                <th className='px-4 py-3'>{t('serviceBookings.table.columns.code')}</th>
                <th className='px-4 py-3'>{t('serviceBookings.table.columns.customer')}</th>
                <th className='px-4 py-3'>{t('serviceBookings.table.columns.service')}</th>
                <th className='px-4 py-3'>{t('serviceBookings.table.columns.pet')}</th>
                <th className='px-4 py-3'>{t('serviceBookings.table.columns.dateTime')}</th>
                <th className='px-4 py-3'>{t('serviceBookings.table.columns.deposit')}</th>
                <th className='px-4 py-3'>{t('serviceBookings.table.columns.status')}</th>
                <th className='px-4 py-3 text-right'>{t('serviceBookings.table.columns.actions')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {BOOKINGS.map((booking) => (
                <tr key={booking.key} className='transition-colors hover:bg-muted'>
                  <td className='px-4 py-3'>
                    <div className='flex flex-col'>
                      <span className='font-bold text-primary'>{booking.code}</span>
                      <span className='text-xs text-muted-foreground'>ID {booking.bookingId}</span>
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex flex-col'>
                      <span className='font-bold text-card-foreground'>
                        {t(`serviceBookings.table.rows.${booking.key}.customer`)}
                      </span>
                      <span className='text-sm text-muted-foreground'>{booking.customerPhone}</span>
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <span className='inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary'>
                      {t(`serviceBookings.services.${booking.service}`)}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-primary'>
                        <MaterialIcon name='pets' className='text-lg' />
                      </div>
                      <span className='font-semibold text-card-foreground'>
                        {t(`serviceBookings.table.rows.${booking.key}.pet`)}
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex flex-col'>
                      <span className='font-semibold'>{booking.scheduledAt}</span>
                      <span className='text-sm text-muted-foreground'>
                        {booking.timeSlot} · {t(`serviceBookings.bookingTypes.${booking.bookingType}`)}
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex flex-col'>
                      <span className='font-bold text-card-foreground'>{formatCurrency(booking.depositAmount)}đ</span>
                      <span className='text-xs text-muted-foreground'>
                        {t('serviceBookings.table.remaining', { value: `${formatCurrency(booking.remainingAmount)}đ` })}
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase',
                        STATUS_CLASS_BY_STATUS[booking.status]
                      )}
                    >
                      {t(`serviceBookings.status.${booking.status}`)}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        type='button'
                        size='icon'
                        variant='ghost'
                        aria-label={t('serviceBookings.actions.view')}
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <MaterialIcon name='visibility' className='text-primary' />
                      </Button>
                      <Button
                        type='button'
                        size='icon'
                        variant='ghost'
                        aria-label={t('serviceBookings.actions.edit')}
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <MaterialIcon name='edit' className='text-muted-foreground' />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='flex flex-col gap-4 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-muted-foreground'>
            {t('serviceBookings.pagination.showing', { from: 1, to: 4, total: '1,284' })}
          </p>
          <nav aria-label={t('serviceBookings.pagination.label')} className='flex items-center gap-2'>
            <Button type='button' size='icon' variant='outline' disabled>
              <MaterialIcon name='chevron_left' />
            </Button>
            {[1, 2, 3].map((page) => (
              <Button key={page} type='button' size='icon' variant={page === 1 ? 'primary' : 'outline'}>
                {page}
              </Button>
            ))}
            <span className='px-1 text-muted-foreground'>...</span>
            <Button type='button' variant='outline' className='h-9 px-3 font-bold'>
              321
            </Button>
            <Button type='button' size='icon' variant='outline'>
              <MaterialIcon name='chevron_right' />
            </Button>
          </nav>
        </div>
      </section>

      <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
    </>
  )
}

function BookingDetailModal({ booking, onClose }: { booking: AdminBooking | null; onClose: () => void }) {
  const { t } = useTranslation('admin')

  if (!booking) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label={t('serviceBookings.detail.close')}
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
        onClick={onClose}
      />
      <section className='relative w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-xl'>
        <header className='flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>{booking.code}</p>
            <h2 className='font-display text-2xl font-bold text-card-foreground'>
              {t('serviceBookings.detail.title')}
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              {t(`serviceBookings.table.rows.${booking.key}.customer`)} · {booking.customerPhone}
            </p>
          </div>
          <div className='flex gap-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              {t('serviceBookings.detail.cancel')}
            </Button>
            <Button type='button'>
              <MaterialIcon name='save' />
              {t('serviceBookings.detail.save')}
            </Button>
          </div>
        </header>

        <div className='grid max-h-[calc(100vh-12rem)] gap-5 overflow-y-auto p-5 lg:grid-cols-[1fr_18rem]'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <InfoCard
              label={t('serviceBookings.detail.fields.service')}
              value={t(`serviceBookings.services.${booking.service}`)}
            />
            <InfoCard
              label={t('serviceBookings.detail.fields.pet')}
              value={t(`serviceBookings.table.rows.${booking.key}.pet`)}
            />
            <InfoCard
              label={t('serviceBookings.detail.fields.schedule')}
              value={`${booking.scheduledAt} · ${booking.timeSlot}`}
            />
            <InfoCard
              label={t('serviceBookings.detail.fields.bookingType')}
              value={t(`serviceBookings.bookingTypes.${booking.bookingType}`)}
            />
            <InfoCard
              label={t('serviceBookings.detail.fields.totalAmount')}
              value={`${formatCurrency(booking.totalAmount)}đ`}
            />
            <InfoCard
              label={t('serviceBookings.detail.fields.depositAmount')}
              value={`${formatCurrency(booking.depositAmount)}đ`}
            />
            <label className='space-y-2 md:col-span-2'>
              <span className='text-sm font-semibold text-card-foreground'>
                {t('serviceBookings.detail.fields.status')}
              </span>
              <select
                defaultValue={booking.status}
                className='h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
              >
                {BOOKING_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(`serviceBookings.status.${status}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className='space-y-2 md:col-span-2'>
              <span className='text-sm font-semibold text-card-foreground'>
                {t('serviceBookings.detail.fields.note')}
              </span>
              <textarea
                rows={4}
                defaultValue={booking.note}
                className='w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
              />
            </label>
          </div>

          <aside className='rounded-xl border border-border bg-muted p-5'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground'>
              <MaterialIcon name='payments' className='text-2xl' />
            </div>
            <h3 className='mt-4 font-bold text-card-foreground'>{t('serviceBookings.detail.paymentTitle')}</h3>
            <dl className='mt-4 space-y-3 text-sm'>
              <div className='flex justify-between gap-4'>
                <dt className='text-muted-foreground'>{t('serviceBookings.detail.fields.depositAmount')}</dt>
                <dd className='font-bold text-card-foreground'>{formatCurrency(booking.depositAmount)}đ</dd>
              </div>
              <div className='flex justify-between gap-4'>
                <dt className='text-muted-foreground'>{t('serviceBookings.detail.fields.remainingAmount')}</dt>
                <dd className='font-bold text-card-foreground'>{formatCurrency(booking.remainingAmount)}đ</dd>
              </div>
              <div className='flex justify-between gap-4 border-t border-border pt-3'>
                <dt className='text-muted-foreground'>{t('serviceBookings.detail.fields.staff')}</dt>
                <dd className='font-bold text-card-foreground'>
                  {booking.staffName || t('serviceBookings.detail.unassigned')}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border border-border bg-background p-4'>
      <p className='text-xs font-bold uppercase tracking-wide text-muted-foreground'>{label}</p>
      <p className='mt-1 font-semibold text-card-foreground'>{value}</p>
    </div>
  )
}
