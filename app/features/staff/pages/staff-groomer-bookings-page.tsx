import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import {
  fetchStaffBookingDetail,
  fetchStaffBookings,
  updateStaffBookingStatus,
  uploadBookingDetailMedia,
  type BookingDetailResponse,
  type BookingMediaType,
  type BookingResponse,
  type BookingStatus
} from '../services'

type GroomerBookingStatus = Extract<
  BookingStatus,
  'ACCEPTED' | 'ON_THE_WAY' | 'IN_PROGRESS' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED'
>

const STATUS_TABS = ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'] as const

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

function formatTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value : '-'

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function getEstimatedTravelMinute(booking: BookingResponse): number {
  const travelMinute = Number(booking.estimatedTravelMinute ?? 0)
  return Number.isFinite(travelMinute) && travelMinute > 0 ? travelMinute : 30
}

function getEarliestDepartureAt(booking: BookingResponse): Date | null {
  const scheduledAt = new Date(booking.scheduledAt)

  if (Number.isNaN(scheduledAt.getTime())) {
    return null
  }

  const travelBufferMinute = getEstimatedTravelMinute(booking) + 15
  return new Date(scheduledAt.getTime() - travelBufferMinute * 60_000)
}

function getNextStatus(booking: BookingResponse): GroomerBookingStatus | null {
  const status = booking.bookingStatus as GroomerBookingStatus
  const isAtHome = booking.bookingType === 'AT_HOME'

  if (status === 'ACCEPTED') return isAtHome ? 'ON_THE_WAY' : 'IN_PROGRESS'
  if (status === 'ON_THE_WAY') return 'IN_PROGRESS'
  if (status === 'IN_PROGRESS') return isAtHome ? 'COMPLETED' : 'READY_FOR_PICKUP'
  if (status === 'READY_FOR_PICKUP') return 'COMPLETED'
  return null
}

function getStatusTone(status: GroomerBookingStatus): string {
  if (status === 'ACCEPTED') return 'bg-info/10 text-info'
  if (status === 'ON_THE_WAY') return 'bg-primary/10 text-primary'
  if (status === 'IN_PROGRESS') return 'bg-warning/10 text-warning'
  if (status === 'READY_FOR_PICKUP') return 'bg-primary/10 text-primary'
  if (status === 'COMPLETED') return 'bg-success/10 text-success'
  return 'bg-destructive/10 text-destructive'
}

function getTotalDuration(booking: BookingResponse) {
  return booking.bookingDetails.reduce((total, detail) => total + detail.durationMinute, 0)
}

function getMediaByType(detail: BookingDetailResponse, type: BookingMediaType) {
  return detail.mediaFiles.filter((media) => media.bookingMediaType === type)
}

function hasBookingMediaType(booking: BookingResponse, type: BookingMediaType) {
  return booking.bookingDetails.some((detail) => getMediaByType(detail, type).length > 0)
}

function getUploadType(booking: BookingResponse): BookingMediaType | null {
  const status = booking.bookingStatus as GroomerBookingStatus
  if (booking.bookingType === 'AT_HOME' && status === 'ON_THE_WAY') return 'BEFORE_SERVICE'
  if (booking.bookingType === 'AT_STORE' && status === 'ACCEPTED') return 'BEFORE_SERVICE'
  if (status === 'IN_PROGRESS') return 'AFTER_SERVICE'
  return null
}

function canMoveToNextStatus(booking: BookingResponse, nextStatus: GroomerBookingStatus | null) {
  if (!nextStatus) return false
  if (nextStatus === 'IN_PROGRESS') return hasBookingMediaType(booking, 'BEFORE_SERVICE')
  if (nextStatus === 'READY_FOR_PICKUP' || (booking.bookingType === 'AT_HOME' && nextStatus === 'COMPLETED')) {
    return hasBookingMediaType(booking, 'AFTER_SERVICE')
  }
  return true
}

export function StaffGroomerBookingsPage() {
  const { t } = useTranslation('staff')
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [activeStatus, setActiveStatus] = useState<GroomerBookingStatus>('ACCEPTED')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const filteredBookings = useMemo(
    () => bookings.filter((booking) => booking.bookingStatus === activeStatus),
    [activeStatus, bookings]
  )
  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text })
    window.setTimeout(() => setMessage(null), 3500)
  }

  const loadBookings = useCallback(async () => {
    setIsLoading(true)
    try {
      const lists = await Promise.all(STATUS_TABS.map((status) => fetchStaffBookings({ status })))
      const nextBookings = lists.flat()
      setBookings(nextBookings)
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : t('groomerBookings.messages.loadFailed'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial API sync for this staff workspace.
    void loadBookings()
  }, [loadBookings])

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='groomerBookings' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav titleKey='groomerBookings.title' subtitleKey='groomerBookings.subtitle' />
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
                    {t('groomerBookings.kicker')}
                  </p>
                  <h1 className='mt-2 font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                    {t('groomerBookings.heading')}
                  </h1>
                  <p className='mt-2 max-w-3xl text-sm text-muted-foreground'>{t('groomerBookings.description')}</p>
                </div>
                <Button variant='outline' disabled={isLoading} onClick={() => void loadBookings()}>
                  <MaterialIcon name='refresh' className='text-[18px]' />
                  {isLoading ? t('groomerBookings.actions.loading') : t('groomerBookings.actions.reload')}
                </Button>
              </div>
            </section>

            <section className='grid grid-cols-2 gap-3 lg:grid-cols-5'>
              {STATUS_TABS.map((status) => {
                const count = bookings.filter((booking) => booking.bookingStatus === status).length
                const isActive = status === activeStatus

                return (
                  <button
                    key={status}
                    type='button'
                    onClick={() => {
                      setActiveStatus(status)
                    }}
                    className={cn(
                      'rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
                      isActive && 'border-primary ring-2 ring-primary/20'
                    )}
                  >
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', getStatusTone(status))}>
                      {t(`groomerBookings.status.${status}`)}
                    </span>
                    <p className='mt-3 text-2xl font-bold text-card-foreground'>{count}</p>
                  </button>
                )
              })}
            </section>

            <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
              <div className='overflow-x-auto'>
                <table className='min-w-full text-left text-sm'>
                  <thead className='bg-muted/70 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    <tr>
                      <th className='px-4 py-3'>{t('groomerBookings.table.code')}</th>
                      <th className='px-4 py-3'>{t('groomerBookings.table.customer')}</th>
                      <th className='px-4 py-3'>{t('groomerBookings.table.schedule')}</th>
                      <th className='px-4 py-3'>{t('groomerBookings.table.workload')}</th>
                      <th className='px-4 py-3'>{t('groomerBookings.table.status')}</th>
                      <th className='px-4 py-3 text-right'>{t('groomerBookings.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {isLoading && bookings.length === 0 && (
                      <tr>
                        <td className='px-4 py-6 text-center text-muted-foreground' colSpan={6}>
                          {t('groomerBookings.actions.loading')}
                        </td>
                      </tr>
                    )}

                    {!isLoading && filteredBookings.length === 0 && (
                      <tr>
                        <td className='px-4 py-8 text-center text-muted-foreground' colSpan={6}>
                          {t('groomerBookings.empty')}
                        </td>
                      </tr>
                    )}

                    {filteredBookings.map((booking) => (
                      <tr key={booking.bookingId} className='transition-colors hover:bg-muted/35'>
                        <td className='px-4 py-4 align-top'>
                          <p className='font-display font-bold text-card-foreground'>{booking.bookingCode}</p>
                          <p className='mt-1 text-xs text-muted-foreground'>
                            {t(`groomerBookings.bookingTypes.${booking.bookingType}`, {
                              defaultValue: booking.bookingType
                            })}
                          </p>
                        </td>
                        <td className='px-4 py-4 align-top'>
                          <p className='font-semibold text-card-foreground'>{booking.customerName}</p>
                          <p className='mt-1 text-xs text-muted-foreground'>{booking.customerPhone}</p>
                        </td>
                        <td className='px-4 py-4 align-top text-card-foreground'>
                          {formatDateTime(booking.scheduledAt)}
                        </td>
                        <td className='px-4 py-4 align-top text-muted-foreground'>
                          <p>
                            {t('groomerBookings.table.petAndServiceCount', {
                              pets: booking.bookingDetails.length,
                              services: booking.bookingDetails.length
                            })}
                          </p>
                          <p className='mt-1'>
                            {t('groomerBookings.card.minutesValue', { value: getTotalDuration(booking) })}
                          </p>
                        </td>
                        <td className='px-4 py-4 align-top'>
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                              getStatusTone(booking.bookingStatus as GroomerBookingStatus)
                            )}
                          >
                            {t(`groomerBookings.status.${booking.bookingStatus}`)}
                          </span>
                        </td>
                        <td className='px-4 py-4 text-right align-top'>
                          <Link
                            to={`/staff/groomer-bookings/${booking.bookingId}`}
                            className='inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-transparent px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
                          >
                            <MaterialIcon name='visibility' className='text-[18px]' />
                            {t('groomerBookings.actions.viewDetail')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export function StaffGroomerBookingDetailPage() {
  const { t } = useTranslation('staff')
  const { bookingId } = useParams()
  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pendingStatus, setPendingStatus] = useState<GroomerBookingStatus | null>(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [previewByDetailId, setPreviewByDetailId] = useState<Record<number, { file: File; url: string }>>({})
  const [nowMs, setNowMs] = useState(() => Date.now())

  const nextStatus = booking ? getNextStatus(booking) : null
  const isNextAllowed = booking ? canMoveToNextStatus(booking, nextStatus) : false

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text })
    window.setTimeout(() => setMessage(null), 3500)
  }

  const loadBooking = useCallback(async () => {
    if (!bookingId) {
      return
    }

    setIsLoading(true)
    try {
      const detail = await fetchStaffBookingDetail(bookingId)
      setBooking(detail)
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : t('groomerBookings.messages.loadDetailFailed'))
    } finally {
      setIsLoading(false)
    }
  }, [bookingId, t])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Detail route loads the booking payload on entry.
    void loadBooking()
  }, [loadBooking])

  useEffect(() => {
    const timerId = window.setInterval(() => setNowMs(Date.now()), 30_000)
    return () => window.clearInterval(timerId)
  }, [])

  async function reloadBooking() {
    if (!booking) return null

    const detail = await fetchStaffBookingDetail(booking.bookingId)
    setBooking(detail)
    return detail
  }

  async function updateBookingStatus(status: GroomerBookingStatus, reason?: string) {
    if (!booking) return

    setIsLoading(true)
    try {
      const updated = await updateStaffBookingStatus(booking.bookingId, {
        cancelReason: status === 'CANCELLED' ? reason : undefined,
        status
      })
      setBooking(updated)
      setPendingStatus(null)
      setIsCancelModalOpen(false)
      setCancelReason('')
      await reloadBooking()
      showMessage('success', t('groomerBookings.messages.statusUpdated'))
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : t('groomerBookings.messages.statusUpdateFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  function handleCancelSubmit() {
    if (!cancelReason.trim()) {
      showMessage('error', t('groomerBookings.messages.cancelReasonRequired'))
      return
    }

    void updateBookingStatus('CANCELLED', cancelReason.trim())
  }

  function handleFileChange(detailId: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!file.type.startsWith('image/')) {
      showMessage('error', t('groomerBookings.messages.imageOnly'))
      return
    }

    setPreviewByDetailId((current) => ({
      ...current,
      [detailId]: {
        file,
        url: URL.createObjectURL(file)
      }
    }))
  }

  async function handleUpload(detailId: number, type: BookingMediaType) {
    if (!booking) return

    const preview = previewByDetailId[detailId]
    if (!preview) {
      showMessage('error', t('groomerBookings.messages.noPreview'))
      return
    }

    setIsLoading(true)
    try {
      await uploadBookingDetailMedia(detailId, type, preview.file)
      await reloadBooking()
      setPreviewByDetailId((current) => {
        const next = { ...current }
        delete next[detailId]
        return next
      })
      showMessage('success', t('groomerBookings.messages.uploaded'))
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : t('groomerBookings.messages.uploadFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='groomerBookings' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav titleKey='groomerBookings.detail.title' subtitleKey='groomerBookings.subtitle' />
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

            <div>
              <Link
                to='/staff/groomer-bookings'
                className='inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <MaterialIcon name='arrow_back' className='text-[18px]' />
                {t('groomerBookings.actions.backToList')}
              </Link>
            </div>

            {isLoading && !booking ? (
              <section className='rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm'>
                {t('groomerBookings.actions.loading')}
              </section>
            ) : null}

            {!isLoading && !booking ? (
              <section className='rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm'>
                {t('groomerBookings.messages.loadDetailFailed')}
              </section>
            ) : null}

            {booking ? (
              <BookingDetailPanel
                booking={booking}
                isLoading={isLoading}
                isNextAllowed={isNextAllowed}
                nextStatus={nextStatus}
                nowMs={nowMs}
                previewByDetailId={previewByDetailId}
                onCancelClick={() => setIsCancelModalOpen(true)}
                onFileChange={handleFileChange}
                onRequestStatus={(status) => setPendingStatus(status)}
                onUpload={handleUpload}
                t={t}
              />
            ) : null}
          </div>
        </main>
      </div>

      {pendingStatus && booking && (
        <ConfirmModal
          description={t(`groomerBookings.confirm.${pendingStatus}.description`)}
          isLoading={isLoading}
          title={t(`groomerBookings.confirm.${pendingStatus}.title`)}
          onCancel={() => setPendingStatus(null)}
          onConfirm={() => void updateBookingStatus(pendingStatus)}
          cancelText={t('groomerBookings.actions.close')}
          confirmText={t('groomerBookings.actions.confirm')}
        />
      )}

      {isCancelModalOpen && (
        <ConfirmModal
          description={t('groomerBookings.confirm.CANCELLED.description')}
          isLoading={isLoading}
          title={t('groomerBookings.confirm.CANCELLED.title')}
          onCancel={() => setIsCancelModalOpen(false)}
          onConfirm={handleCancelSubmit}
          cancelText={t('groomerBookings.actions.close')}
          confirmText={t('groomerBookings.actions.confirm')}
        >
          <label className='mt-4 block text-sm font-semibold text-card-foreground'>
            {t('groomerBookings.detail.cancelReason')}
          </label>
          <textarea
            className='mt-2 min-h-28 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
          />
        </ConfirmModal>
      )}
    </div>
  )
}

function BookingDetailPanel({
  booking,
  isLoading,
  isNextAllowed,
  nextStatus,
  nowMs,
  previewByDetailId,
  onCancelClick,
  onFileChange,
  onRequestStatus,
  onUpload,
  t
}: {
  booking: BookingResponse
  isLoading: boolean
  isNextAllowed: boolean
  nextStatus: GroomerBookingStatus | null
  nowMs: number
  previewByDetailId: Record<number, { file: File; url: string }>
  onCancelClick: () => void
  onFileChange: (detailId: number, event: ChangeEvent<HTMLInputElement>) => void
  onRequestStatus: (status: GroomerBookingStatus) => void
  onUpload: (detailId: number, type: BookingMediaType) => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const status = booking.bookingStatus as GroomerBookingStatus
  const uploadType = getUploadType(booking)
  const isAtHome = booking.bookingType === 'AT_HOME'
  const earliestDepartureAt = isAtHome ? getEarliestDepartureAt(booking) : null
  const canDepartAtHome = !earliestDepartureAt || nowMs >= earliestDepartureAt.getTime()
  const shouldGateDeparture = isAtHome && status === 'ACCEPTED'

  return (
    <aside className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-primary'>
            {t('groomerBookings.detail.title')}
          </p>
          <h2 className='mt-2 font-display text-2xl font-bold text-card-foreground'>{booking.bookingCode}</h2>
        </div>
        <span className={cn('w-fit rounded-full px-3 py-1 text-xs font-semibold', getStatusTone(status))}>
          {t(`groomerBookings.status.${status}`)}
        </span>
      </div>

      <Timeline bookingType={booking.bookingType} status={status} t={t} />

      <div className='mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <InfoGroup
          title={t('groomerBookings.detail.bookingInfo')}
          items={[
            [t('groomerBookings.detail.scheduledAt'), formatDateTime(booking.scheduledAt)],
            [t('groomerBookings.detail.totalAmount'), formatCurrency(booking.totalAmount)],
            [t('groomerBookings.detail.depositAmount'), formatCurrency(booking.depositAmount)],
            [t('groomerBookings.detail.remainingAmount'), formatCurrency(booking.remainingAmount)],
            [t('groomerBookings.detail.note'), booking.note || '-']
          ]}
        />
        <InfoGroup
          title={t('groomerBookings.detail.customerInfo')}
          items={[
            [t('groomerBookings.detail.customerName'), booking.customerName],
            [t('groomerBookings.detail.customerPhone'), booking.customerPhone]
          ]}
        />
      </div>

      {isAtHome && (
        <section className='mt-4 rounded-2xl border border-border bg-background p-4'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <h3 className='font-semibold text-card-foreground'>{t('groomerBookings.detail.travelTimingTitle')}</h3>
            {shouldGateDeparture && earliestDepartureAt ? (
              <span
                className={cn(
                  'w-fit rounded-full px-3 py-1 text-xs font-semibold',
                  canDepartAtHome ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                )}
              >
                {canDepartAtHome
                  ? t('groomerBookings.detail.departureAvailable')
                  : t('groomerBookings.detail.departureWaiting')}
              </span>
            ) : null}
          </div>
          <div className='mt-3 grid gap-2 md:grid-cols-2'>
            <InfoLine
              label={t('groomerBookings.detail.serviceAppointmentAt')}
              value={formatDateTime(booking.scheduledAt)}
            />
            <InfoLine
              label={t('groomerBookings.detail.estimatedTravelMinute')}
              value={t('groomerBookings.card.minutesValue', { value: getEstimatedTravelMinute(booking) })}
            />
            <InfoLine
              label={t('groomerBookings.detail.earliestDepartureAt')}
              value={earliestDepartureAt ? formatDateTime(earliestDepartureAt.toISOString()) : '-'}
            />
            <InfoLine
              label={t('groomerBookings.detail.estimatedArrivalAt')}
              value={formatDateTime(booking.scheduledAt)}
            />
            <InfoLine
              label={t('groomerBookings.detail.estimatedEndAt')}
              value={booking.estimatedEndAt ? formatDateTime(booking.estimatedEndAt) : '-'}
            />
          </div>
          {shouldGateDeparture && earliestDepartureAt && !canDepartAtHome ? (
            <p className='mt-3 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground'>
              {t('groomerBookings.detail.departureHelper', { time: formatTime(earliestDepartureAt) })}
            </p>
          ) : null}
        </section>
      )}

      {status === 'CANCELLED' && (
        <div className='mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
          <p className='font-semibold'>{t('groomerBookings.detail.cancelReason')}</p>
          <p className='mt-1'>{booking.cancelReason || '-'}</p>
        </div>
      )}

      <div className='mt-6 flex flex-wrap gap-3'>
        {status === 'ACCEPTED' && (
          <>
            <Button
              disabled={isLoading || !nextStatus || !isNextAllowed || (shouldGateDeparture && !canDepartAtHome)}
              onClick={() => nextStatus && onRequestStatus(nextStatus)}
            >
              <MaterialIcon name={isAtHome ? 'directions_bike' : 'play_circle'} className='text-[18px]' />
              {isAtHome ? t('groomerBookings.actions.onTheWay') : t('groomerBookings.actions.start')}
            </Button>
            <Button variant='destructive' disabled={isLoading} onClick={onCancelClick}>
              <MaterialIcon name='cancel' className='text-[18px]' />
              {t('groomerBookings.actions.cancelBooking')}
            </Button>
            {!isNextAllowed && (
              <p className='w-full text-sm text-muted-foreground'>{t('groomerBookings.messages.beforeRequired')}</p>
            )}
            {shouldGateDeparture && !canDepartAtHome && earliestDepartureAt ? (
              <p className='w-full text-sm text-muted-foreground'>
                {t('groomerBookings.detail.departureHelper', { time: formatTime(earliestDepartureAt) })}
              </p>
            ) : null}
          </>
        )}
        {status === 'ON_THE_WAY' && nextStatus && (
          <>
            <Button disabled={isLoading || !isNextAllowed} onClick={() => onRequestStatus(nextStatus)}>
              <MaterialIcon name='play_circle' className='text-[18px]' />
              {t('groomerBookings.actions.start')}
            </Button>
            {!isNextAllowed && (
              <p className='w-full text-sm text-muted-foreground'>{t('groomerBookings.messages.beforeRequired')}</p>
            )}
          </>
        )}
        {status === 'IN_PROGRESS' && nextStatus && (
          <>
            <Button disabled={isLoading || !isNextAllowed} onClick={() => onRequestStatus(nextStatus)}>
              <MaterialIcon name='task_alt' className='text-[18px]' />
              {isAtHome ? t('groomerBookings.actions.completeHome') : t('groomerBookings.actions.readyForPickup')}
            </Button>
            {!isNextAllowed && (
              <p className='w-full text-sm text-muted-foreground'>{t('groomerBookings.messages.afterRequired')}</p>
            )}
          </>
        )}
        {status === 'READY_FOR_PICKUP' && nextStatus && (
          <Button disabled={isLoading} onClick={() => onRequestStatus(nextStatus)}>
            <MaterialIcon name='verified' className='text-[18px]' />
            {t('groomerBookings.actions.complete')}
          </Button>
        )}
      </div>

      <div className='mt-6 space-y-4'>
        <h3 className='font-display text-lg font-bold text-card-foreground'>
          {t('groomerBookings.detail.detailList')}
        </h3>
        {booking.bookingDetails.map((detail) => (
          <BookingDetailCard
            key={detail.bookingDetailId}
            detail={detail}
            isLoading={isLoading}
            preview={previewByDetailId[detail.bookingDetailId]}
            uploadType={uploadType}
            onFileChange={onFileChange}
            onUpload={onUpload}
            t={t}
          />
        ))}
      </div>
    </aside>
  )
}

function BookingDetailCard({
  detail,
  isLoading,
  preview,
  uploadType,
  onFileChange,
  onUpload,
  t
}: {
  detail: BookingDetailResponse
  isLoading: boolean
  preview?: { file: File; url: string }
  uploadType: BookingMediaType | null
  onFileChange: (detailId: number, event: ChangeEvent<HTMLInputElement>) => void
  onUpload: (detailId: number, type: BookingMediaType) => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const beforeMedia = getMediaByType(detail, 'BEFORE_SERVICE')
  const afterMedia = getMediaByType(detail, 'AFTER_SERVICE')
  const canUpload = Boolean(uploadType)

  return (
    <article className='rounded-2xl border border-border bg-background p-4'>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]'>
        <div>
          <p className='font-semibold text-card-foreground'>{detail.petName}</p>
          <p className='mt-1 text-sm text-muted-foreground'>
            {t(`petSpeciesLabels.${detail.petSpecies}`, { defaultValue: detail.petSpecies })} - {detail.petWeight}kg
          </p>
          <div className='mt-3 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning'>
            <p className='font-semibold'>{t('groomerBookings.detail.healthNote')}</p>
            <p className='mt-1'>{detail.petHealthNote || t('groomerBookings.detail.noHealthNote')}</p>
          </div>
        </div>
        <div className='space-y-2 text-sm'>
          <InfoLine label={t('groomerBookings.detail.catalogName')} value={detail.catalogName} />
          <InfoLine
            label={t('groomerBookings.detail.duration')}
            value={t('groomerBookings.card.minutesValue', { value: detail.durationMinute })}
          />
          <InfoLine label={t('groomerBookings.detail.unitPrice')} value={formatCurrency(detail.unitPrice)} />
          <InfoLine label={t('groomerBookings.detail.privateNote')} value={detail.note || '-'} />
        </div>
      </div>

      <MediaStrip
        label={t('groomerBookings.detail.beforeMedia')}
        mediaFiles={beforeMedia}
        emptyText={t('groomerBookings.detail.noMedia')}
      />
      <MediaStrip
        label={t('groomerBookings.detail.afterMedia')}
        mediaFiles={afterMedia}
        emptyText={t('groomerBookings.detail.noMedia')}
      />

      <div className='mt-3 flex flex-wrap items-center gap-2'>
        <label
          className={cn(
            'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition-colors',
            canUpload ? 'hover:bg-muted' : 'cursor-not-allowed opacity-50'
          )}
        >
          <MaterialIcon name='image' className='text-[18px]' />
          {uploadType === 'AFTER_SERVICE'
            ? t('groomerBookings.actions.chooseAfterImage')
            : t('groomerBookings.actions.chooseBeforeImage')}
          <input
            className='hidden'
            type='file'
            accept='image/*'
            disabled={!canUpload}
            onChange={(event) => onFileChange(detail.bookingDetailId, event)}
          />
        </label>
        <Button
          variant='outline'
          disabled={!canUpload || !preview || isLoading}
          onClick={() => uploadType && onUpload(detail.bookingDetailId, uploadType)}
        >
          <MaterialIcon name='cloud_upload' className='text-[18px]' />
          {t('groomerBookings.actions.upload')}
        </Button>
        {preview && (
          <img
            src={preview.url}
            alt={preview.file.name}
            className='h-16 w-16 rounded-xl border-2 border-primary object-cover'
          />
        )}
      </div>
    </article>
  )
}

function MediaStrip({
  emptyText,
  label,
  mediaFiles
}: {
  emptyText: string
  label: string
  mediaFiles: Array<{ mediaFileId: number; fileUrl: string; fileKey?: string }>
}) {
  return (
    <div className='mt-4'>
      <p className='text-sm font-semibold text-card-foreground'>{label}</p>
      <div className='mt-2 flex flex-wrap gap-3'>
        {mediaFiles.length === 0 && <span className='text-sm text-muted-foreground'>{emptyText}</span>}
        {mediaFiles.map((media) => (
          <img
            key={media.mediaFileId}
            src={media.fileUrl}
            alt={media.fileKey || String(media.mediaFileId)}
            className='h-20 w-20 rounded-xl border border-border object-cover'
          />
        ))}
      </div>
    </div>
  )
}

function Timeline({
  bookingType,
  status,
  t
}: {
  bookingType: string
  status: GroomerBookingStatus
  t: (key: string) => string
}) {
  const steps: GroomerBookingStatus[] =
    bookingType === 'AT_HOME'
      ? ['ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED']
      : ['ACCEPTED', 'IN_PROGRESS', 'READY_FOR_PICKUP', 'COMPLETED']
  const activeIndex = status === 'CANCELLED' ? -1 : steps.indexOf(status)

  return (
    <div className='mt-6 grid grid-cols-4 gap-2'>
      {steps.map((step, index) => (
        <div key={step} className='flex flex-col gap-2'>
          <div className={cn('h-2 rounded-full', index <= activeIndex ? 'bg-primary' : 'bg-muted')} />
          <p className={cn('text-xs font-semibold', index <= activeIndex ? 'text-primary' : 'text-muted-foreground')}>
            {t(`groomerBookings.timeline.${step}`)}
          </p>
        </div>
      ))}
    </div>
  )
}

function InfoGroup({ items, title }: { items: Array<[string, string]>; title: string }) {
  return (
    <section className='rounded-2xl border border-border bg-background p-4'>
      <h3 className='font-semibold text-card-foreground'>{title}</h3>
      <div className='mt-3 space-y-2'>
        {items.map(([label, value]) => (
          <InfoLine key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-start justify-between gap-4 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='max-w-[60%] text-right font-medium text-card-foreground'>{value}</span>
    </div>
  )
}

function ConfirmModal({
  children,
  cancelText,
  confirmText,
  description,
  isLoading,
  title,
  onCancel,
  onConfirm
}: {
  cancelText: string
  children?: ReactNode
  confirmText: string
  description: string
  isLoading: boolean
  title: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl'>
        <h2 className='font-display text-xl font-bold text-card-foreground'>{title}</h2>
        <p className='mt-2 text-sm text-muted-foreground'>{description}</p>
        {children}
        <div className='mt-6 flex justify-end gap-3'>
          <Button variant='outline' disabled={isLoading} onClick={onCancel}>
            {cancelText}
          </Button>
          <Button disabled={isLoading} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
