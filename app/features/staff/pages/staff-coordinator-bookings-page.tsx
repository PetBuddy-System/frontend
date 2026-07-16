import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'
import type { UserResponse } from '~/shared/lib/auth'

import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import { assignBookingGroomer, fetchStaffBookings, fetchStaffUsers, type BookingResponse } from '../services'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    currency: 'VND',
    maximumFractionDigits: 0,
    style: 'currency'
  }).format(value)
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

function getTotalDuration(booking: BookingResponse) {
  return booking.bookingDetails.reduce((total, detail) => total + detail.durationMinute, 0)
}

export function StaffCoordinatorBookingsPage() {
  const { t } = useTranslation('staff')
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [groomers, setGroomers] = useState<UserResponse[]>([])
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [selectedGroomerId, setSelectedGroomerId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const selectedBooking = bookings.find((booking) => booking.bookingId === selectedBookingId) ?? bookings[0]
  const groomerOptions = useMemo(() => groomers.filter((user) => user.staffTask === 'GROOMER'), [groomers])

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text })
    window.setTimeout(() => setMessage(null), 3500)
  }

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [bookingList, staffList] = await Promise.all([
        fetchStaffBookings({ status: 'PENDING_ACCEPTANCE' }),
        fetchStaffUsers()
      ])
      setBookings(bookingList)
      setGroomers(staffList)
      setSelectedBookingId(bookingList[0]?.bookingId ?? null)
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : t('coordinatorBookings.messages.loadFailed'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial API sync for this staff workspace.
    void loadData()
  }, [loadData])

  async function handleAssign() {
    if (!selectedBooking) return

    if (!selectedGroomerId) {
      showMessage('error', t('coordinatorBookings.messages.chooseGroomer'))
      return
    }

    setIsLoading(true)
    try {
      await assignBookingGroomer(selectedBooking.bookingId, selectedGroomerId)
      await loadData()
      setSelectedGroomerId('')
      showMessage('success', t('coordinatorBookings.messages.assigned'))
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : t('coordinatorBookings.messages.assignFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='coordinatorBookings' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav titleKey='coordinatorBookings.title' subtitleKey='coordinatorBookings.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            {message && (
              <div
                className={cn(
                  'fixed right-4 top-24 z-50 rounded-2xl border bg-card px-4 py-3 text-sm shadow-xl',
                  message.type === 'success'
                    ? 'border-success/40 text-success'
                    : 'border-destructive/40 text-destructive'
                )}
              >
                {message.text}
              </div>
            )}

            <section className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
              <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
                    {t('coordinatorBookings.kicker')}
                  </p>
                  <h1 className='mt-2 font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                    {t('coordinatorBookings.heading')}
                  </h1>
                  <p className='mt-2 max-w-3xl text-sm text-muted-foreground'>{t('coordinatorBookings.description')}</p>
                </div>
                <Button variant='outline' disabled={isLoading} onClick={() => void loadData()}>
                  <MaterialIcon name='refresh' className='text-[18px]' />
                  {isLoading ? t('coordinatorBookings.actions.loading') : t('coordinatorBookings.actions.reload')}
                </Button>
              </div>
            </section>

            <section className='grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)]'>
              <div className='flex flex-col gap-4'>
                {isLoading && bookings.length === 0 && (
                  <div className='rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm'>
                    {t('coordinatorBookings.actions.loading')}
                  </div>
                )}
                {!isLoading && bookings.length === 0 && (
                  <div className='rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm'>
                    {t('coordinatorBookings.empty')}
                  </div>
                )}
                {bookings.map((booking) => (
                  <article
                    key={booking.bookingId}
                    className={cn(
                      'rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md',
                      selectedBooking?.bookingId === booking.bookingId && 'border-primary ring-2 ring-primary/20'
                    )}
                  >
                    <div className='flex items-start justify-between gap-4'>
                      <div>
                        <p className='font-display text-lg font-bold text-card-foreground'>{booking.bookingCode}</p>
                        <p className='mt-1 text-sm text-muted-foreground'>{formatDateTime(booking.scheduledAt)}</p>
                      </div>
                      <span className='rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning'>
                        {t('coordinatorBookings.pendingStatus')}
                      </span>
                    </div>
                    <div className='mt-4 grid grid-cols-2 gap-3 text-sm'>
                      <InfoPill label={t('coordinatorBookings.card.customer')} value={booking.customerName} />
                      <InfoPill label={t('coordinatorBookings.card.phone')} value={booking.customerPhone} />
                      <InfoPill
                        label={t('coordinatorBookings.card.petCount')}
                        value={String(booking.bookingDetails.length)}
                      />
                      <InfoPill
                        label={t('coordinatorBookings.card.duration')}
                        value={t('coordinatorBookings.card.minutesValue', { value: getTotalDuration(booking) })}
                      />
                    </div>
                    <Button
                      className='mt-4 w-full'
                      variant='outline'
                      onClick={() => setSelectedBookingId(booking.bookingId)}
                    >
                      <MaterialIcon name='visibility' className='text-[18px]' />
                      {t('coordinatorBookings.actions.viewDetail')}
                    </Button>
                  </article>
                ))}
              </div>

              {selectedBooking && (
                <aside className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
                  <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
                        {t('coordinatorBookings.detail.title')}
                      </p>
                      <h2 className='mt-2 font-display text-2xl font-bold text-card-foreground'>
                        {selectedBooking.bookingCode}
                      </h2>
                      <p className='mt-1 text-sm text-muted-foreground'>
                        {formatDateTime(selectedBooking.scheduledAt)}
                      </p>
                    </div>
                    <span className='w-fit rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning'>
                      {t('coordinatorBookings.pendingStatus')}
                    </span>
                  </div>

                  <div className='mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2'>
                    <InfoGroup
                      title={t('coordinatorBookings.detail.bookingInfo')}
                      items={[
                        [t('coordinatorBookings.detail.totalAmount'), formatCurrency(selectedBooking.totalAmount)],
                        [t('coordinatorBookings.detail.depositAmount'), formatCurrency(selectedBooking.depositAmount)],
                        [
                          t('coordinatorBookings.detail.remainingAmount'),
                          formatCurrency(selectedBooking.remainingAmount)
                        ],
                        [t('coordinatorBookings.detail.note'), selectedBooking.note || '-']
                      ]}
                    />
                    <InfoGroup
                      title={t('coordinatorBookings.detail.customerInfo')}
                      items={[
                        [t('coordinatorBookings.detail.customerName'), selectedBooking.customerName],
                        [t('coordinatorBookings.detail.customerPhone'), selectedBooking.customerPhone],
                        [t('coordinatorBookings.detail.address'), selectedBooking.address || '-']
                      ]}
                    />
                  </div>

                  <div className='mt-6 rounded-2xl border border-border bg-background p-4'>
                    <label className='text-sm font-semibold text-card-foreground'>
                      {t('coordinatorBookings.assignment.groomer')}
                    </label>
                    <select
                      className='mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring'
                      value={selectedGroomerId}
                      onChange={(event) => setSelectedGroomerId(event.target.value)}
                    >
                      <option value=''>{t('coordinatorBookings.assignment.placeholder')}</option>
                      {groomerOptions.map((groomer) => (
                        <option key={groomer.userId} value={groomer.userId}>
                          {groomer.fullName} - {groomer.email}
                        </option>
                      ))}
                    </select>
                    <Button className='mt-3 w-full' disabled={isLoading || !selectedGroomerId} onClick={handleAssign}>
                      <MaterialIcon name='assignment_ind' className='text-[18px]' />
                      {t('coordinatorBookings.actions.assign')}
                    </Button>
                  </div>

                  <div className='mt-6 space-y-4'>
                    <h3 className='font-display text-lg font-bold text-card-foreground'>
                      {t('coordinatorBookings.detail.detailList')}
                    </h3>
                    {selectedBooking.bookingDetails.map((detail) => (
                      <article
                        key={detail.bookingDetailId}
                        className='rounded-2xl border border-border bg-background p-4'
                      >
                        <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
                          <div>
                            <p className='font-semibold text-card-foreground'>{detail.petName}</p>
                            <p className='mt-1 text-sm text-muted-foreground'>
                              {t(`petSpeciesLabels.${detail.petSpecies}`, { defaultValue: detail.petSpecies })} -{' '}
                              {detail.petWeight}kg
                            </p>
                            {detail.petHealthNote && (
                              <p className='mt-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning'>
                                {detail.petHealthNote}
                              </p>
                            )}
                          </div>
                          <div className='space-y-1 text-sm text-muted-foreground lg:text-right'>
                            <p className='font-semibold text-card-foreground'>{detail.catalogName}</p>
                            <p>{t('coordinatorBookings.card.minutesValue', { value: detail.durationMinute })}</p>
                            <p>{formatCurrency(detail.unitPrice)}</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </aside>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl bg-muted/70 px-3 py-2'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className='mt-1 truncate font-semibold text-card-foreground'>{value}</p>
    </div>
  )
}

function InfoGroup({ items, title }: { items: Array<[string, string]>; title: string }) {
  return (
    <section className='rounded-2xl border border-border bg-background p-4'>
      <h3 className='font-semibold text-card-foreground'>{title}</h3>
      <div className='mt-3 space-y-2'>
        {items.map(([label, value]) => (
          <div key={label} className='flex items-start justify-between gap-4 text-sm'>
            <span className='text-muted-foreground'>{label}</span>
            <span className='max-w-[60%] text-right font-medium text-card-foreground'>{value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
