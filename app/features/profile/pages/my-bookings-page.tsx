import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import {
  BookingStatus,
  getCustomerBookingDetail,
  getMyCustomerBookings,
  retryCustomerBookingPayment,
  type BookingResponse,
  type PaymentResponse
} from '../services'

import { env } from '~/shared/config/env'
import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

const stripePromise = env.STRIPE_PK ? loadStripe(env.STRIPE_PK) : null

type BookingStatusFilter = 'ALL' | BookingStatus

const STATUS_FILTERS: BookingStatusFilter[] = [
  'ALL',
  BookingStatus.PENDING_PAYMENT,
  BookingStatus.FAILED,
  BookingStatus.PENDING_ACCEPTANCE,
  BookingStatus.WAITING_STAFF,
  BookingStatus.ACCEPTED,
  BookingStatus.IN_PROGRESS,
  BookingStatus.READY_FOR_PICKUP,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED
]

const RETRYABLE_STATUSES = new Set<string>([BookingStatus.PENDING_PAYMENT, BookingStatus.FAILED])
const CUSTOMER_BOOKINGS_SYNC_INTERVAL_MS = 5000
const PAYMENT_SYNC_ATTEMPTS = 6
const PAYMENT_SYNC_DELAY_MS = 1200

const stripeElementStyle = {
  base: {
    color: '#1a1a1a',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '15px',
    '::placeholder': {
      color: '#78716c'
    }
  },
  invalid: {
    color: '#dc2626'
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function MyBookingsPage() {
  const { t, i18n } = useTranslation('profile')
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [selectedStatus, setSelectedStatus] = useState<BookingStatusFilter>('ALL')
  const [paymentModal, setPaymentModal] = useState<{ booking: BookingResponse; payment: PaymentResponse } | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [retryingBookingId, setRetryingBookingId] = useState<number | null>(null)
  const isSyncingBookingsRef = useRef(false)

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
      }),
    [i18n.language]
  )

  const filteredBookings = useMemo(() => {
    if (selectedStatus === 'ALL') {
      return bookings
    }

    return bookings.filter((booking) => booking.bookingStatus === selectedStatus)
  }, [bookings, selectedStatus])

  const statusCounts = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        const status = booking.bookingStatus as BookingStatus
        acc.ALL += 1
        acc[status] = (acc[status] ?? 0) + 1
        return acc
      },
      { ALL: 0 } as Record<BookingStatusFilter, number>
    )
  }, [bookings])

  const loadBookings = useCallback(
    async (options?: { quiet?: boolean; silent?: boolean }) => {
      if (isSyncingBookingsRef.current) {
        return
      }

      isSyncingBookingsRef.current = true

      if (!options?.silent) {
        if (options?.quiet) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }
      }

      try {
        const data = await getMyCustomerBookings()
        setBookings(sortBookings(data))
      } catch {
        if (!options?.silent) {
          setToast({ type: 'error', message: t('myBookings.feedback.loadFailed') })
        }
      } finally {
        isSyncingBookingsRef.current = false
        if (!options?.silent) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    },
    [t]
  )

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadBookings()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [loadBookings])

  useEffect(() => {
    function syncVisibleBookings() {
      if (document.visibilityState === 'visible') {
        void loadBookings({ silent: true })
      }
    }

    const intervalId = window.setInterval(syncVisibleBookings, CUSTOMER_BOOKINGS_SYNC_INTERVAL_MS)
    window.addEventListener('focus', syncVisibleBookings)
    document.addEventListener('visibilitychange', syncVisibleBookings)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', syncVisibleBookings)
      document.removeEventListener('visibilitychange', syncVisibleBookings)
    }
  }, [loadBookings])

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timerId = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timerId)
  }, [toast])

  async function handleRetryPayment(booking: BookingResponse) {
    setRetryingBookingId(booking.bookingId)

    try {
      const payment = await retryCustomerBookingPayment(booking.bookingId)
      if (!payment.stripeClientSecret) {
        throw new Error('Missing Stripe client secret.')
      }
      setPaymentModal({ booking, payment })
    } catch {
      setToast({ type: 'error', message: t('myBookings.feedback.retryFailed') })
    } finally {
      setRetryingBookingId(null)
    }
  }

  function updateBookingInList(updatedBooking: BookingResponse) {
    setBookings((currentBookings) =>
      sortBookings(
        currentBookings.map((booking) => (booking.bookingId === updatedBooking.bookingId ? updatedBooking : booking))
      )
    )
  }

  async function waitForBookingPaymentSync(bookingId: number): Promise<BookingResponse | null> {
    for (let attempt = 0; attempt < PAYMENT_SYNC_ATTEMPTS; attempt += 1) {
      if (attempt > 0) {
        await wait(PAYMENT_SYNC_DELAY_MS)
      }

      const detail = await getCustomerBookingDetail(bookingId)
      updateBookingInList(detail)

      if (!RETRYABLE_STATUSES.has(detail.bookingStatus)) {
        return detail
      }
    }

    return null
  }

  async function handlePaymentSuccess() {
    const paidBookingId = paymentModal?.booking.bookingId
    setPaymentModal(null)
    setToast({ type: 'success', message: t('myBookings.payment.syncing') })

    if (!paidBookingId) {
      void loadBookings({ quiet: true })
      return
    }

    try {
      const syncedBooking = await waitForBookingPaymentSync(paidBookingId)
      if (syncedBooking) {
        setToast({ type: 'success', message: t('myBookings.payment.success') })
        return
      }

      setToast({ type: 'success', message: t('myBookings.payment.pendingSync') })
      void loadBookings({ quiet: true })
    } catch {
      setToast({ type: 'success', message: t('myBookings.payment.pendingSync') })
      void loadBookings({ quiet: true })
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='services' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ProfilePageHeader titleKey='myBookings.headerTitle' subtitleKey='myBookings.headerSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 pb-24 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
              <div className='flex flex-col gap-5 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between'>
                <div>
                  <p className='text-sm font-semibold uppercase tracking-wide text-primary'>
                    {t('myBookings.eyebrow')}
                  </p>
                  <h1 className='mt-1 font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                    {t('myBookings.title')}
                  </h1>
                  <p className='mt-2 max-w-2xl text-sm text-muted-foreground'>{t('myBookings.subtitle')}</p>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => void loadBookings({ quiet: true })}
                  disabled={isRefreshing || isLoading}
                  className='w-full justify-center gap-2 lg:w-auto'
                >
                  <MaterialIcon name={isRefreshing ? 'progress_activity' : 'refresh'} className='text-[20px]' />
                  {t('myBookings.actions.refresh')}
                </Button>
              </div>

              <div className='grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4'>
                <BookingStat icon='event_available' label={t('myBookings.stats.all')} value={statusCounts.ALL} />
                <BookingStat
                  icon='payments'
                  label={t('myBookings.stats.pendingPayment')}
                  value={(statusCounts[BookingStatus.PENDING_PAYMENT] ?? 0) + (statusCounts[BookingStatus.FAILED] ?? 0)}
                />
                <BookingStat
                  icon='spa'
                  label={t('myBookings.stats.inProgress')}
                  value={(statusCounts[BookingStatus.ACCEPTED] ?? 0) + (statusCounts[BookingStatus.IN_PROGRESS] ?? 0)}
                />
                <BookingStat
                  icon='task_alt'
                  label={t('myBookings.stats.completed')}
                  value={statusCounts[BookingStatus.COMPLETED] ?? 0}
                />
              </div>
            </section>

            <div className='overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-sm'>
              <div className='flex min-w-max gap-2'>
                {STATUS_FILTERS.map((status) => (
                  <button
                    key={status}
                    type='button'
                    onClick={() => setSelectedStatus(status)}
                    className={cn(
                      'rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
                      selectedStatus === status
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {t(`myBookings.tabs.${status}`)}
                    <span className='ml-2 rounded-full bg-background/70 px-2 py-0.5 text-xs text-foreground'>
                      {statusCounts[status] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <BookingSkeletonList />
            ) : filteredBookings.length > 0 ? (
              <BookingTable
                bookings={filteredBookings}
                formatCurrency={(value) => currencyFormatter.format(value)}
                retryingBookingId={retryingBookingId}
                onRetryPayment={handleRetryPayment}
              />
            ) : (
              <EmptyBookings />
            )}
          </div>
        </main>
      </div>

      <ProfileFloatingSupport />

      {toast ? <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}

      {paymentModal ? (
        <PaymentModal
          booking={paymentModal.booking}
          payment={paymentModal.payment}
          formatCurrency={(value) => currencyFormatter.format(value)}
          onClose={() => setPaymentModal(null)}
          onSuccess={handlePaymentSuccess}
        />
      ) : null}
    </div>
  )
}

interface BookingTableProps {
  bookings: BookingResponse[]
  formatCurrency: (value: number) => string
  onRetryPayment: (booking: BookingResponse) => void
  retryingBookingId: number | null
}

function BookingTable({ bookings, formatCurrency, onRetryPayment, retryingBookingId }: BookingTableProps) {
  const { t } = useTranslation('profile')

  return (
    <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[1040px] border-collapse text-left'>
          <thead className='bg-muted/60 text-xs font-bold uppercase tracking-wide text-muted-foreground'>
            <tr>
              <th className='px-4 py-3'>{t('myBookings.table.booking')}</th>
              <th className='px-4 py-3'>{t('myBookings.table.schedule')}</th>
              <th className='px-4 py-3'>{t('myBookings.table.service')}</th>
              <th className='px-4 py-3'>{t('myBookings.table.pets')}</th>
              <th className='px-4 py-3'>{t('myBookings.table.status')}</th>
              <th className='px-4 py-3 text-right'>{t('myBookings.table.total')}</th>
              <th className='px-4 py-3 text-right'>{t('myBookings.table.actions')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {bookings.map((booking) => {
              const firstDetail = booking.bookingDetails[0]
              const serviceNames = Array.from(
                new Set(booking.bookingDetails.map((detail) => detail.catalogName).filter(Boolean))
              )
              const petNames = Array.from(
                new Set(booking.bookingDetails.map((detail) => detail.petName).filter(Boolean))
              )
              const canRetryPayment = RETRYABLE_STATUSES.has(booking.bookingStatus)
              const isRetrying = retryingBookingId === booking.bookingId

              return (
                <tr key={booking.bookingId} className='align-top transition-colors hover:bg-muted/30'>
                  <td className='px-4 py-4'>
                    <div className='flex min-w-0 items-center gap-3'>
                      <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground'>
                        <MaterialIcon name='spa' className='text-[22px]' />
                      </span>
                      <div className='min-w-0'>
                        <p className='font-display text-sm font-bold text-card-foreground'>
                          {booking.bookingCode || `#${booking.bookingId}`}
                        </p>
                        <p className='mt-1 text-xs text-muted-foreground'>
                          {t(`myBookings.bookingTypes.${booking.bookingType}`, { defaultValue: booking.bookingType })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-4 text-sm text-foreground'>
                    <p className='font-semibold'>{formatDateTime(booking.scheduledAt)}</p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {firstDetail?.timeSlot ? formatTime(firstDetail.timeSlot) : '-'}
                    </p>
                  </td>
                  <td className='max-w-[260px] px-4 py-4 text-sm font-medium text-foreground'>
                    <p className='line-clamp-2'>
                      {serviceNames.length > 0 ? serviceNames.join(', ') : t('myBookings.card.noService')}
                    </p>
                  </td>
                  <td className='max-w-[220px] px-4 py-4 text-sm text-muted-foreground'>
                    <p className='line-clamp-2'>{petNames.join(', ') || '-'}</p>
                  </td>
                  <td className='px-4 py-4'>
                    <StatusBadge status={booking.bookingStatus} />
                  </td>
                  <td className='px-4 py-4 text-right'>
                    <p className='font-bold text-primary'>{formatCurrency(booking.totalAmount ?? 0)}</p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {t('myBookings.card.deposit')}: {formatCurrency(booking.depositAmount ?? 0)}
                    </p>
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex justify-end gap-2'>
                      <Link
                        to={`/my-bookings/${booking.bookingId}`}
                        className='inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
                      >
                        <MaterialIcon name='visibility' className='text-[18px]' />
                        {t('myBookings.actions.viewDetail')}
                      </Link>
                      {canRetryPayment ? (
                        <Button
                          type='button'
                          onClick={() => onRetryPayment(booking)}
                          disabled={isRetrying}
                          className='gap-2 whitespace-nowrap'
                        >
                          <MaterialIcon
                            name={isRetrying ? 'progress_activity' : 'credit_card'}
                            className='text-[18px]'
                          />
                          {booking.bookingStatus === BookingStatus.FAILED
                            ? t('myBookings.actions.retryPayment')
                            : t('myBookings.actions.payNow')}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface BookingStatProps {
  icon: string
  label: string
  value: number
}

function BookingStat({ icon, label, value }: BookingStatProps) {
  return (
    <div className='rounded-2xl border border-border bg-background p-4'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-sm text-muted-foreground'>{label}</p>
          <p className='mt-1 text-2xl font-bold text-foreground'>{value}</p>
        </div>
        <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
          <MaterialIcon name={icon} className='text-[24px]' />
        </span>
      </div>
    </div>
  )
}

interface StatusBadgeProps {
  status: string
}

function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation('profile')

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
        getStatusBadgeClassName(status)
      )}
    >
      {t(`myBookings.status.${status}`, { defaultValue: status })}
    </span>
  )
}

interface PaymentModalProps {
  booking: BookingResponse
  payment: PaymentResponse
  formatCurrency: (value: number) => string
  onClose: () => void
  onSuccess: () => Promise<void>
}

function PaymentModal({ booking, payment, formatCurrency, onClose, onSuccess }: PaymentModalProps) {
  const { t } = useTranslation('profile')

  return (
    <ModalShell title={t('myBookings.payment.title')} onClose={onClose}>
      <div className='mb-5 rounded-2xl border border-border bg-muted/40 p-4'>
        <p className='text-sm text-muted-foreground'>
          {t('myBookings.payment.subtitle', { code: booking.bookingCode || `#${booking.bookingId}` })}
        </p>
        <p className='mt-2 text-2xl font-bold text-primary'>
          {formatCurrency(payment.amount || booking.depositAmount || 0)}
        </p>
      </div>

      {stripePromise ? (
        <Elements stripe={stripePromise} options={{ clientSecret: payment.stripeClientSecret }}>
          <CustomerBookingPaymentForm
            clientSecret={payment.stripeClientSecret}
            amount={payment.amount || booking.depositAmount || 0}
            formatCurrency={formatCurrency}
            onSuccess={onSuccess}
          />
        </Elements>
      ) : (
        <div className='rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
          {t('myBookings.payment.stripeMissing')}
        </div>
      )}
    </ModalShell>
  )
}

interface CustomerBookingPaymentFormProps {
  clientSecret: string
  amount: number
  formatCurrency: (value: number) => string
  onSuccess: () => Promise<void>
}

function CustomerBookingPaymentForm({
  clientSecret,
  amount,
  formatCurrency,
  onSuccess
}: CustomerBookingPaymentFormProps) {
  const { t } = useTranslation('profile')
  const stripe = useStripe()
  const elements = useElements()
  const [cardholderName, setCardholderName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!cardholderName.trim()) {
      setErrorMessage(t('myBookings.payment.cardholderMissing'))
      return
    }

    if (!stripe || !elements) {
      setErrorMessage(t('myBookings.payment.cardElementMissing'))
      return
    }

    const cardNumberElement = elements.getElement(CardNumberElement)
    if (!cardNumberElement) {
      setErrorMessage(t('myBookings.payment.cardElementMissing'))
      return
    }

    setIsSubmitting(true)

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumberElement,
        billing_details: {
          name: cardholderName.trim()
        }
      }
    })

    setIsSubmitting(false)

    if (result.error) {
      setErrorMessage(result.error.message || t('myBookings.payment.failed'))
      return
    }

    if (result.paymentIntent?.status === 'succeeded') {
      await onSuccess()
      return
    }

    setErrorMessage(t('myBookings.payment.failed'))
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <label className='block'>
        <span className='mb-2 block text-sm font-semibold text-foreground'>{t('myBookings.payment.cardholder')}</span>
        <input
          value={cardholderName}
          onChange={(event) => setCardholderName(event.target.value)}
          className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30'
        />
      </label>

      <div>
        <span className='mb-2 block text-sm font-semibold text-foreground'>{t('myBookings.payment.cardInfo')}</span>
        <div className='rounded-xl border border-border bg-background p-4'>
          <CardNumberElement options={{ style: stripeElementStyle }} />
        </div>
        <div className='mt-3 grid gap-3 sm:grid-cols-2'>
          <div className='rounded-xl border border-border bg-background p-4'>
            <CardExpiryElement options={{ style: stripeElementStyle }} />
          </div>
          <div className='rounded-xl border border-border bg-background p-4'>
            <CardCvcElement options={{ style: stripeElementStyle }} />
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className='rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
          {errorMessage}
        </div>
      ) : null}

      <Button type='submit' disabled={!stripe || isSubmitting} className='w-full gap-2'>
        <MaterialIcon name={isSubmitting ? 'progress_activity' : 'lock'} className='text-[18px]' />
        {isSubmitting
          ? t('myBookings.payment.processing')
          : t('myBookings.payment.pay', { amount: formatCurrency(amount) })}
      </Button>
    </form>
  )
}

interface ModalShellProps {
  title: string
  children: ReactNode
  onClose: () => void
}

function ModalShell({ title, children, onClose }: ModalShellProps) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm'>
      <section className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-xl'>
        <div className='sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4'>
          <h2 className='font-display text-xl font-bold text-card-foreground'>{title}</h2>
          <button
            type='button'
            onClick={onClose}
            className='rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            aria-label='Close'
          >
            <MaterialIcon name='close' className='text-[20px]' />
          </button>
        </div>
        <div className='p-5'>{children}</div>
      </section>
    </div>
  )
}

interface ToastProps {
  type: 'success' | 'error'
  message: string
  onClose: () => void
}

function Toast({ type, message, onClose }: ToastProps) {
  return (
    <div className='fixed right-4 top-4 z-[60] max-w-sm rounded-2xl border border-border bg-card p-4 shadow-xl'>
      <div className='flex items-start gap-3'>
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            type === 'success' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
          )}
        >
          <MaterialIcon name={type === 'success' ? 'check' : 'error'} className='text-[19px]' />
        </span>
        <p className='flex-1 text-sm font-medium text-card-foreground'>{message}</p>
        <button type='button' onClick={onClose} className='text-muted-foreground hover:text-foreground'>
          <MaterialIcon name='close' className='text-[18px]' />
        </button>
      </div>
    </div>
  )
}

function BookingSkeletonList() {
  return (
    <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
      <div className='space-y-0 divide-y divide-border'>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className='grid gap-4 p-5 md:grid-cols-6'>
            {Array.from({ length: 6 }).map((__, cellIndex) => (
              <div key={cellIndex} className='h-9 animate-pulse rounded-xl bg-muted' />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyBookings() {
  const { t } = useTranslation('profile')

  return (
    <section className='rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm'>
      <span className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-primary'>
        <MaterialIcon name='event_busy' className='text-[32px]' />
      </span>
      <h2 className='mt-4 font-display text-xl font-bold text-card-foreground'>
        {t('myBookings.feedback.emptyTitle')}
      </h2>
      <p className='mx-auto mt-2 max-w-md text-sm text-muted-foreground'>{t('myBookings.feedback.emptyText')}</p>
    </section>
  )
}

function getStatusBadgeClassName(status: string): string {
  if (status === BookingStatus.COMPLETED) return 'bg-success/15 text-success'
  if (status === BookingStatus.CANCELLED || status === BookingStatus.FAILED) return 'bg-destructive/15 text-destructive'
  if (status === BookingStatus.PENDING_PAYMENT) return 'bg-warning/15 text-warning'
  if (status === BookingStatus.PENDING_ACCEPTANCE || status === BookingStatus.WAITING_STAFF) {
    return 'bg-info/15 text-info'
  }
  return 'bg-primary/15 text-primary'
}

function sortBookings(bookings: BookingResponse[]): BookingResponse[] {
  return [...bookings].sort((first, second) => {
    const firstTime = new Date(first.scheduledAt).getTime()
    const secondTime = new Date(second.scheduledAt).getTime()
    return secondTime - firstTime
  })
}

function formatDateTime(value: string) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

function formatTime(value: string) {
  return value ? value.slice(0, 5) : '-'
}
