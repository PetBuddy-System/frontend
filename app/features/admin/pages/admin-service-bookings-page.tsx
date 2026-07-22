import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

import { AdminFooter } from '../components/layout/admin-footer'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import {
  BookingStatus,
  getBookingManagementDetail,
  getBookingManagementList,
  updateBookingManagementStatus,
  type BookingResponse
} from '../services'

type BookingStatusTab = 'ALL' | BookingStatus
type ToastState = { type: 'success' | 'error'; message: string } | null
type PendingStatusChange = { booking: BookingResponse; nextStatus: BookingStatus } | null

const BOOKING_STATUS_TABS: BookingStatusTab[] = [
  'ALL',
  BookingStatus.PENDING_PAYMENT,
  BookingStatus.FAILED,
  BookingStatus.WAITING_STAFF,
  BookingStatus.PENDING_ACCEPTANCE,
  BookingStatus.ACCEPTED,
  BookingStatus.ON_THE_WAY,
  BookingStatus.IN_PROGRESS,
  BookingStatus.READY_FOR_PICKUP,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED
]

const STATUS_BADGE_CLASS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING_PAYMENT]: 'bg-warning/10 text-warning border-warning/30',
  [BookingStatus.FAILED]: 'bg-destructive/10 text-destructive border-destructive/30',
  [BookingStatus.WAITING_STAFF]: 'bg-warning/10 text-warning border-warning/30',
  [BookingStatus.PENDING_ACCEPTANCE]: 'bg-secondary text-secondary-foreground border-secondary',
  [BookingStatus.ACCEPTED]: 'bg-primary/10 text-primary border-primary/30',
  [BookingStatus.ON_THE_WAY]: 'bg-info/10 text-info border-info/30',
  [BookingStatus.IN_PROGRESS]: 'bg-info/10 text-info border-info/30',
  [BookingStatus.READY_FOR_PICKUP]: 'bg-warning/10 text-warning border-warning/30',
  [BookingStatus.COMPLETED]: 'bg-success/10 text-success border-success/30',
  [BookingStatus.CANCELLED]: 'bg-destructive text-destructive-foreground border-destructive'
}

const STATUS_ACTIONS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  [BookingStatus.WAITING_STAFF]: [BookingStatus.CANCELLED],
  [BookingStatus.PENDING_ACCEPTANCE]: [BookingStatus.ACCEPTED, BookingStatus.CANCELLED],
  [BookingStatus.ACCEPTED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  [BookingStatus.ON_THE_WAY]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.READY_FOR_PICKUP, BookingStatus.CANCELLED],
  [BookingStatus.READY_FOR_PICKUP]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value || 0)
}

function formatDateTime(value: string): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

function getBookingStatus(booking: BookingResponse): BookingStatus {
  return booking.bookingStatus as BookingStatus
}

function getBookingPets(booking: BookingResponse): string {
  return booking.bookingDetails
    .map((detail) => detail.petName)
    .filter(Boolean)
    .join(', ')
}

function getBookingServices(booking: BookingResponse): string {
  return Array.from(new Set(booking.bookingDetails.map((detail) => detail.catalogName).filter(Boolean))).join(', ')
}

function getBookingTime(booking: BookingResponse): string {
  return booking.bookingDetails.find((detail) => detail.timeSlot)?.timeSlot ?? ''
}

export interface AdminServiceBookingsPageProps {
  sidebar?: ReactNode
  topNav?: ReactNode
  canManageStatus?: boolean
}

export function AdminServiceBookingsPage({
  sidebar,
  topNav,
  canManageStatus = true
}: AdminServiceBookingsPageProps = {}) {
  const { t } = useTranslation('admin')
  const [activeStatus, setActiveStatus] = useState<BookingStatusTab>('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null)
  const [pendingStatusChange, setPendingStatusChange] = useState<PendingStatusChange>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [openActionBookingId, setOpenActionBookingId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)

  const stats = useMemo(() => {
    const countByStatus = BOOKING_STATUS_TABS.reduce<Record<string, number>>((acc, status) => {
      acc[status] =
        status === 'ALL' ? bookings.length : bookings.filter((booking) => getBookingStatus(booking) === status).length
      return acc
    }, {})

    return countByStatus
  }, [bookings])

  async function loadBookings() {
    try {
      setIsLoading(true)
      const results = await getBookingManagementList({
        status: activeStatus === 'ALL' ? undefined : activeStatus,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      })
      setBookings(results)
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : t('serviceBookings.feedback.loadFailed')
      })
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadBookings()
    }, 0)

    return () => window.clearTimeout(timerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStatus, fromDate, toDate])

  useEffect(() => {
    if (!toast) return

    const timerId = window.setTimeout(() => setToast(null), 3600)
    return () => window.clearTimeout(timerId)
  }, [toast])

  async function handleViewDetail(bookingId: number) {
    try {
      setIsDetailLoading(true)
      setSelectedBooking(await getBookingManagementDetail(bookingId))
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : t('serviceBookings.feedback.detailFailed')
      })
    } finally {
      setIsDetailLoading(false)
    }
  }

  async function handleStatusChange(booking: BookingResponse, nextStatus: BookingStatus) {
    setOpenActionBookingId(null)

    if (nextStatus === BookingStatus.CANCELLED) {
      setCancelReason('')
      setPendingStatusChange({ booking, nextStatus })
      return
    }

    await submitStatusChange(booking, nextStatus)
  }

  async function submitStatusChange(booking: BookingResponse, nextStatus: BookingStatus, reason?: string) {
    try {
      setIsUpdatingStatus(true)
      const updatedBooking = await updateBookingManagementStatus(booking.bookingId, {
        status: nextStatus,
        cancelReason: nextStatus === BookingStatus.CANCELLED ? reason : undefined
      })

      setBookings((current) =>
        current.map((currentBooking) =>
          currentBooking.bookingId === updatedBooking.bookingId ? updatedBooking : currentBooking
        )
      )
      setSelectedBooking((current) => (current?.bookingId === updatedBooking.bookingId ? updatedBooking : current))
      setPendingStatusChange(null)
      setToast({ type: 'success', message: t('serviceBookings.feedback.updateSuccess') })
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : t('serviceBookings.feedback.updateFailed')
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  function handleCancelSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!pendingStatusChange) return
    if (!cancelReason.trim()) {
      setToast({ type: 'error', message: t('serviceBookings.cancelModal.reasonRequired') })
      return
    }

    void submitStatusChange(pendingStatusChange.booking, BookingStatus.CANCELLED, cancelReason.trim())
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      {sidebar ?? <AdminSidebar />}
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        {topNav ?? <AdminTopNav titleKey='serviceBookings.title' subtitleKey='serviceBookings.subtitle' />}
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
              <div>
                <h1 className='mb-2 font-display text-2xl font-bold text-primary md:text-3xl'>
                  {t('serviceBookings.title')}
                </h1>
                <p className='text-muted-foreground'>{t('serviceBookings.subtitle')}</p>
              </div>
              <Button type='button' variant='outline' onClick={() => void loadBookings()} disabled={isLoading}>
                <MaterialIcon
                  name={isLoading ? 'progress_activity' : 'refresh'}
                  className={cn(isLoading && 'animate-spin')}
                />
                {t('serviceBookings.actions.refresh')}
              </Button>
            </section>

            <BookingStatsGrid stats={stats} activeStatus={activeStatus} onStatusChange={setActiveStatus} />

            <section className='rounded-xl border border-border bg-card p-4 shadow-sm'>
              <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
                <StatusTabs activeStatus={activeStatus} onStatusChange={setActiveStatus} />
                <DateRangeFilter
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromDateChange={setFromDate}
                  onToDateChange={setToDate}
                  onClear={() => {
                    setFromDate('')
                    setToDate('')
                  }}
                />
              </div>
            </section>

            <BookingManagementTable
              bookings={bookings}
              isLoading={isLoading}
              openActionBookingId={openActionBookingId}
              onOpenActions={setOpenActionBookingId}
              onViewDetail={(bookingId) => void handleViewDetail(bookingId)}
              onStatusChange={(booking, nextStatus) => void handleStatusChange(booking, nextStatus)}
              canManageStatus={canManageStatus}
            />

            <AdminFooter />
          </div>
        </main>
      </div>

      <BookingDetailModal
        booking={selectedBooking}
        isLoading={isDetailLoading}
        onClose={() => setSelectedBooking(null)}
      />
      <CancelReasonModal
        pendingStatusChange={pendingStatusChange}
        cancelReason={cancelReason}
        isSubmitting={isUpdatingStatus}
        onReasonChange={setCancelReason}
        onClose={() => setPendingStatusChange(null)}
        onSubmit={handleCancelSubmit}
      />
      {toast && <Toast toast={toast} />}
    </div>
  )
}

interface BookingStatsGridProps {
  stats: Record<string, number>
  activeStatus: BookingStatusTab
  onStatusChange: (status: BookingStatusTab) => void
}

function BookingStatsGrid({ stats, activeStatus, onStatusChange }: BookingStatsGridProps) {
  const { t } = useTranslation('admin')
  const featuredTabs: BookingStatusTab[] = [
    'ALL',
    BookingStatus.PENDING_ACCEPTANCE,
    BookingStatus.WAITING_STAFF,
    BookingStatus.IN_PROGRESS,
    BookingStatus.COMPLETED
  ]

  return (
    <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {featuredTabs.map((status) => (
        <button
          key={status}
          type='button'
          onClick={() => onStatusChange(status)}
          className={cn(
            'rounded-xl border border-l-4 bg-card p-5 text-left shadow-sm transition-colors hover:bg-muted',
            activeStatus === status ? 'border-primary ring-2 ring-ring' : 'border-border'
          )}
        >
          <p className='mb-3 text-xs font-bold uppercase tracking-normal text-muted-foreground'>
            {t(`serviceBookings.tabs.${status}`)}
          </p>
          <div className='flex items-center justify-between'>
            <span className='font-display text-2xl font-bold text-card-foreground'>{stats[status] ?? 0}</span>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary'>
              <MaterialIcon name={status === 'ALL' ? 'analytics' : getStatusIcon(status as BookingStatus)} />
            </div>
          </div>
        </button>
      ))}
    </section>
  )
}

interface StatusTabsProps {
  activeStatus: BookingStatusTab
  onStatusChange: (status: BookingStatusTab) => void
}

function StatusTabs({ activeStatus, onStatusChange }: StatusTabsProps) {
  const { t } = useTranslation('admin')

  return (
    <div className='min-w-0 flex-1'>
      <p className='mb-2 text-sm font-semibold text-muted-foreground'>{t('serviceBookings.filters.status')}</p>
      <div className='flex gap-2 overflow-x-auto pb-1'>
        {BOOKING_STATUS_TABS.map((status) => (
          <button
            key={status}
            type='button'
            onClick={() => onStatusChange(status)}
            className={cn(
              'shrink-0 rounded-md border px-3 py-2 text-sm font-semibold transition-colors',
              activeStatus === status
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {t(`serviceBookings.tabs.${status}`)}
          </button>
        ))}
      </div>
    </div>
  )
}

interface DateRangeFilterProps {
  fromDate: string
  toDate: string
  onFromDateChange: (value: string) => void
  onToDateChange: (value: string) => void
  onClear: () => void
}

function DateRangeFilter({ fromDate, toDate, onFromDateChange, onToDateChange, onClear }: DateRangeFilterProps) {
  const { t } = useTranslation('admin')

  return (
    <div className='grid gap-3 sm:grid-cols-[1fr_1fr_auto]'>
      <label className='block'>
        <span className='mb-2 block text-sm font-semibold text-muted-foreground'>
          {t('serviceBookings.filters.fromDate')}
        </span>
        <input
          type='date'
          value={fromDate}
          onChange={(event) => onFromDateChange(event.target.value)}
          className='h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring'
        />
      </label>
      <label className='block'>
        <span className='mb-2 block text-sm font-semibold text-muted-foreground'>
          {t('serviceBookings.filters.toDate')}
        </span>
        <input
          type='date'
          value={toDate}
          min={fromDate || undefined}
          onChange={(event) => onToDateChange(event.target.value)}
          className='h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring'
        />
      </label>
      <Button type='button' variant='outline' className='self-end' onClick={onClear} disabled={!fromDate && !toDate}>
        <MaterialIcon name='filter_alt_off' className='text-[18px]' />
        {t('serviceBookings.filters.clear')}
      </Button>
    </div>
  )
}

interface BookingManagementTableProps {
  bookings: BookingResponse[]
  isLoading: boolean
  openActionBookingId: number | null
  onOpenActions: (bookingId: number | null) => void
  onViewDetail: (bookingId: number) => void
  onStatusChange: (booking: BookingResponse, nextStatus: BookingStatus) => void
  canManageStatus: boolean
}

function BookingManagementTable({
  bookings,
  isLoading,
  openActionBookingId,
  onOpenActions,
  onViewDetail,
  onStatusChange,
  canManageStatus
}: BookingManagementTableProps) {
  const { t } = useTranslation('admin')

  return (
    <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[1120px] border-collapse text-left'>
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
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={8} className='px-4 py-3'>
                    <div className='h-12 animate-pulse rounded-md bg-muted' />
                  </td>
                </tr>
              ))}

            {!isLoading &&
              bookings.map((booking) => {
                const status = getBookingStatus(booking)
                const actions = canManageStatus ? (STATUS_ACTIONS[status] ?? []) : []

                return (
                  <tr key={booking.bookingId} className='transition-colors hover:bg-muted/70'>
                    <td className='px-4 py-3'>
                      <div className='flex flex-col'>
                        <span className='font-bold text-primary'>{booking.bookingCode}</span>
                        <span className='text-xs text-muted-foreground'>ID {booking.bookingId}</span>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex flex-col'>
                        <span className='font-bold text-card-foreground'>{booking.customerName}</span>
                        <span className='text-sm text-muted-foreground'>{booking.customerPhone}</span>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='line-clamp-2 text-sm font-semibold text-card-foreground'>
                        {getBookingServices(booking) || t('serviceBookings.table.emptyValue')}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <div className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-primary'>
                          <MaterialIcon name='pets' className='text-lg' />
                        </div>
                        <span className='font-semibold text-card-foreground'>
                          {getBookingPets(booking) || t('serviceBookings.table.emptyValue')}
                        </span>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex flex-col'>
                        <span className='font-semibold'>{formatDateTime(booking.scheduledAt)}</span>
                        <span className='text-sm text-muted-foreground'>
                          {getBookingTime(booking) || t('serviceBookings.table.emptyValue')} ·{' '}
                          {t(`serviceBookings.bookingTypes.${booking.bookingType}`)}
                        </span>
                        {booking.estimatedEndAt ? (
                          <span className='text-xs font-semibold text-muted-foreground'>
                            {t('serviceBookings.table.estimatedEndAt', {
                              value: formatDateTime(booking.estimatedEndAt)
                            })}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex flex-col'>
                        <span className='font-bold text-card-foreground'>{formatCurrency(booking.depositAmount)}</span>
                        <span className='text-xs text-muted-foreground'>
                          {t('serviceBookings.table.remaining', { value: formatCurrency(booking.remainingAmount) })}
                        </span>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={cn(
                          'inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase',
                          STATUS_BADGE_CLASS[status]
                        )}
                      >
                        {t(`serviceBookings.status.${status}`)}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <div className='relative inline-flex justify-end gap-2'>
                        <Button
                          type='button'
                          size='icon'
                          variant='ghost'
                          aria-label={t('serviceBookings.actions.view')}
                          onClick={() => onViewDetail(booking.bookingId)}
                        >
                          <MaterialIcon name='visibility' className='text-primary' />
                        </Button>
                        {canManageStatus ? (
                          <Button
                            type='button'
                            size='icon'
                            variant='outline'
                            aria-label={t('serviceBookings.actions.openActions')}
                            onClick={() =>
                              onOpenActions(openActionBookingId === booking.bookingId ? null : booking.bookingId)
                            }
                            disabled={actions.length === 0}
                          >
                            <MaterialIcon name='more_vert' />
                          </Button>
                        ) : null}
                        {openActionBookingId === booking.bookingId && (
                          <div className='absolute right-0 top-11 z-20 w-52 overflow-hidden rounded-md border border-border bg-card p-1 text-left shadow-lg'>
                            {actions.map((nextStatus) => (
                              <button
                                key={nextStatus}
                                type='button'
                                className={cn(
                                  'flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted',
                                  nextStatus === BookingStatus.CANCELLED && 'text-destructive'
                                )}
                                onClick={() => onStatusChange(booking, nextStatus)}
                              >
                                <MaterialIcon name={getActionIcon(nextStatus)} className='text-[18px]' />
                                {t(`serviceBookings.actionsByStatus.${nextStatus}`)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {!isLoading && bookings.length === 0 && (
        <div className='flex flex-col items-center justify-center px-4 py-14 text-center'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-muted text-primary'>
            <MaterialIcon name='event_busy' className='text-[28px]' />
          </div>
          <h3 className='mt-4 font-display text-xl font-bold'>{t('serviceBookings.feedback.emptyTitle')}</h3>
          <p className='mt-2 max-w-md text-sm text-muted-foreground'>{t('serviceBookings.feedback.emptyText')}</p>
        </div>
      )}

      <div className='border-t border-border px-4 py-3 text-sm text-muted-foreground'>
        {t('serviceBookings.pagination.showing', {
          from: bookings.length > 0 ? 1 : 0,
          to: bookings.length,
          total: bookings.length
        })}
      </div>
    </section>
  )
}

interface BookingDetailModalProps {
  booking: BookingResponse | null
  isLoading: boolean
  onClose: () => void
}

function BookingDetailModal({ booking, isLoading, onClose }: BookingDetailModalProps) {
  const { t } = useTranslation('admin')

  if (!booking && !isLoading) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label={t('serviceBookings.detail.close')}
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
        onClick={onClose}
      />
      <section className='relative w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-xl'>
        {isLoading || !booking ? (
          <div className='space-y-4 p-6'>
            <div className='h-8 w-56 animate-pulse rounded-md bg-muted' />
            <div className='grid gap-4 md:grid-cols-2'>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className='h-24 animate-pulse rounded-md bg-muted' />
              ))}
            </div>
          </div>
        ) : (
          <>
            <header className='flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-xs font-bold uppercase tracking-normal text-muted-foreground'>
                  {booking.bookingCode}
                </p>
                <h2 className='font-display text-2xl font-bold text-card-foreground'>
                  {t('serviceBookings.detail.title')}
                </h2>
                <p className='mt-1 text-sm text-muted-foreground'>
                  {booking.customerName} · {booking.customerPhone}
                </p>
              </div>
              <Button type='button' variant='outline' onClick={onClose}>
                {t('serviceBookings.detail.cancel')}
              </Button>
            </header>
            <div className='grid max-h-[calc(100vh-12rem)] gap-5 overflow-y-auto p-5 lg:grid-cols-[1fr_18rem]'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <InfoCard label={t('serviceBookings.detail.fields.service')} value={getBookingServices(booking)} />
                <InfoCard label={t('serviceBookings.detail.fields.pet')} value={getBookingPets(booking)} />
                <InfoCard
                  label={t('serviceBookings.detail.fields.schedule')}
                  value={`${formatDateTime(booking.scheduledAt)} · ${getBookingTime(booking) || '-'}`}
                />
                {booking.estimatedEndAt ? (
                  <InfoCard
                    label={t('serviceBookings.detail.fields.estimatedEndAt')}
                    value={formatDateTime(booking.estimatedEndAt)}
                  />
                ) : null}
                <InfoCard
                  label={t('serviceBookings.detail.fields.bookingType')}
                  value={t(`serviceBookings.bookingTypes.${booking.bookingType}`)}
                />
                <InfoCard
                  label={t('serviceBookings.detail.fields.totalAmount')}
                  value={formatCurrency(booking.totalAmount)}
                />
                <InfoCard
                  label={t('serviceBookings.detail.fields.status')}
                  value={t(`serviceBookings.status.${getBookingStatus(booking)}`)}
                />
                {booking.address && (
                  <InfoCard label={t('serviceBookings.detail.fields.address')} value={booking.address} />
                )}
                {booking.cancelReason && (
                  <InfoCard label={t('serviceBookings.detail.fields.cancelReason')} value={booking.cancelReason} />
                )}
              </div>
              <aside className='rounded-xl border border-border bg-muted p-5'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground'>
                  <MaterialIcon name='payments' className='text-2xl' />
                </div>
                <h3 className='mt-4 font-bold text-card-foreground'>{t('serviceBookings.detail.paymentTitle')}</h3>
                <dl className='mt-4 space-y-3 text-sm'>
                  <DetailRow
                    label={t('serviceBookings.detail.fields.depositAmount')}
                    value={formatCurrency(booking.depositAmount)}
                  />
                  <DetailRow
                    label={t('serviceBookings.detail.fields.remainingAmount')}
                    value={formatCurrency(booking.remainingAmount)}
                  />
                  <DetailRow
                    label={t('serviceBookings.detail.fields.staff')}
                    value={booking.staffName || t('serviceBookings.detail.unassigned')}
                  />
                </dl>
              </aside>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

interface CancelReasonModalProps {
  pendingStatusChange: PendingStatusChange
  cancelReason: string
  isSubmitting: boolean
  onReasonChange: (value: string) => void
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function CancelReasonModal({
  pendingStatusChange,
  cancelReason,
  isSubmitting,
  onReasonChange,
  onClose,
  onSubmit
}: CancelReasonModalProps) {
  const { t } = useTranslation('admin')

  if (!pendingStatusChange) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label={t('serviceBookings.cancelModal.close')}
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
        onClick={onClose}
      />
      <form
        onSubmit={onSubmit}
        className='relative w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-xl'
      >
        <div className='flex items-start gap-3'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive'>
            <MaterialIcon name='cancel' />
          </div>
          <div>
            <h2 className='font-display text-xl font-bold'>{t('serviceBookings.cancelModal.title')}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              {t('serviceBookings.cancelModal.subtitle', { code: pendingStatusChange.booking.bookingCode })}
            </p>
          </div>
        </div>
        <label className='mt-5 block'>
          <span className='mb-2 block text-sm font-semibold text-card-foreground'>
            {t('serviceBookings.cancelModal.reasonLabel')}
          </span>
          <textarea
            rows={4}
            value={cancelReason}
            onChange={(event) => onReasonChange(event.target.value)}
            className='w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'
            placeholder={t('serviceBookings.cancelModal.reasonPlaceholder')}
          />
        </label>
        <div className='mt-5 flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={onClose} disabled={isSubmitting}>
            {t('serviceBookings.cancelModal.keep')}
          </Button>
          <Button type='submit' variant='destructive' disabled={isSubmitting}>
            <MaterialIcon
              name={isSubmitting ? 'progress_activity' : 'cancel'}
              className={cn(isSubmitting && 'animate-spin')}
            />
            {isSubmitting ? t('serviceBookings.cancelModal.submitting') : t('serviceBookings.cancelModal.confirm')}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Toast({ toast }: { toast: Exclude<ToastState, null> }) {
  return (
    <div
      role='alert'
      className={cn(
        'fixed right-4 top-4 z-[60] flex max-w-sm items-start gap-3 rounded-md border px-4 py-3 shadow-lg',
        toast.type === 'success'
          ? 'border-success bg-success text-success-foreground'
          : 'border-destructive bg-destructive text-destructive-foreground'
      )}
    >
      <MaterialIcon name={toast.type === 'success' ? 'check_circle' : 'error'} className='text-[22px]' />
      <p className='text-sm font-medium'>{toast.message}</p>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border border-border bg-background p-4'>
      <p className='text-xs font-bold uppercase tracking-normal text-muted-foreground'>{label}</p>
      <p className='mt-1 font-semibold text-card-foreground'>{value || '-'}</p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='text-right font-bold text-card-foreground'>{value}</dd>
    </div>
  )
}

function getStatusIcon(status: BookingStatus): string {
  if (status === BookingStatus.PENDING_PAYMENT) return 'payments'
  if (status === BookingStatus.FAILED) return 'error'
  if (status === BookingStatus.WAITING_STAFF) return 'assignment_ind'
  if (status === BookingStatus.PENDING_ACCEPTANCE) return 'pending_actions'
  if (status === BookingStatus.ACCEPTED) return 'event_available'
  if (status === BookingStatus.ON_THE_WAY) return 'directions_bike'
  if (status === BookingStatus.IN_PROGRESS) return 'spa'
  if (status === BookingStatus.READY_FOR_PICKUP) return 'inventory_2'
  if (status === BookingStatus.COMPLETED) return 'task_alt'
  return 'cancel'
}

function getActionIcon(status: BookingStatus): string {
  if (status === BookingStatus.ACCEPTED) return 'check_circle'
  if (status === BookingStatus.IN_PROGRESS) return 'play_circle'
  if (status === BookingStatus.READY_FOR_PICKUP) return 'inventory_2'
  if (status === BookingStatus.COMPLETED) return 'task_alt'
  return 'cancel'
}
