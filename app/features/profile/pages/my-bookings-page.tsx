import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import {
  BookingStatus,
  getCustomerBookingDetail,
  getMyCustomerBookings,
  retryCustomerBookingPayment,
  type BookingDetailResponse,
  type BookingResponse,
  type MediaFileResponse,
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
  BookingStatus.ACCEPTED,
  BookingStatus.IN_PROGRESS,
  BookingStatus.READY_FOR_PICKUP,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED
]

const RETRYABLE_STATUSES = new Set<string>([BookingStatus.PENDING_PAYMENT, BookingStatus.FAILED])

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

export function MyBookingsPage() {
  const { t, i18n } = useTranslation('profile')
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [selectedStatus, setSelectedStatus] = useState<BookingStatusFilter>('ALL')
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null)
  const [paymentModal, setPaymentModal] = useState<{ booking: BookingResponse; payment: PaymentResponse } | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [retryingBookingId, setRetryingBookingId] = useState<number | null>(null)

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
    async (options?: { quiet?: boolean }) => {
      if (options?.quiet) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      try {
        const data = await getMyCustomerBookings()
        setBookings(sortBookings(data))
      } catch {
        setToast({ type: 'error', message: t('myBookings.feedback.loadFailed') })
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
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
    if (!toast) {
      return undefined
    }

    const timerId = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timerId)
  }, [toast])

  async function handleViewDetail(booking: BookingResponse) {
    setSelectedBooking(booking)
    setIsDetailLoading(true)

    try {
      const detail = await getCustomerBookingDetail(booking.bookingId)
      setSelectedBooking(detail)
    } catch {
      setToast({ type: 'error', message: t('myBookings.feedback.detailFailed') })
    } finally {
      setIsDetailLoading(false)
    }
  }

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

  function handlePaymentSuccess() {
    setPaymentModal(null)
    setToast({ type: 'success', message: t('myBookings.payment.success') })
    void loadBookings({ quiet: true })
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
              <div className='grid gap-4 xl:grid-cols-2'>
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.bookingId}
                    booking={booking}
                    formatCurrency={(value) => currencyFormatter.format(value)}
                    isRetrying={retryingBookingId === booking.bookingId}
                    onRetryPayment={handleRetryPayment}
                    onViewDetail={handleViewDetail}
                  />
                ))}
              </div>
            ) : (
              <EmptyBookings />
            )}
          </div>
        </main>
      </div>

      <ProfileFloatingSupport />

      {toast ? <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}

      {selectedBooking ? (
        <BookingDetailModal
          booking={selectedBooking}
          isLoading={isDetailLoading}
          formatCurrency={(value) => currencyFormatter.format(value)}
          onClose={() => setSelectedBooking(null)}
        />
      ) : null}

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

interface BookingCardProps {
  booking: BookingResponse
  formatCurrency: (value: number) => string
  isRetrying: boolean
  onRetryPayment: (booking: BookingResponse) => void
  onViewDetail: (booking: BookingResponse) => void
}

function BookingCard({ booking, formatCurrency, isRetrying, onRetryPayment, onViewDetail }: BookingCardProps) {
  const { t } = useTranslation('profile')
  const firstDetail = booking.bookingDetails[0]
  const serviceNames = Array.from(new Set(booking.bookingDetails.map((detail) => detail.catalogName).filter(Boolean)))
  const petNames = Array.from(new Set(booking.bookingDetails.map((detail) => detail.petName).filter(Boolean)))
  const canRetryPayment = RETRYABLE_STATUSES.has(booking.bookingStatus)

  return (
    <article className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md'>
      <div className='flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-start md:justify-between'>
        <div className='flex min-w-0 gap-4'>
          <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground'>
            <MaterialIcon name='spa' className='text-[28px]' />
          </div>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <h2 className='truncate font-display text-lg font-bold text-card-foreground'>
                {booking.bookingCode || `#${booking.bookingId}`}
              </h2>
              <StatusBadge status={booking.bookingStatus} />
            </div>
            <p className='mt-1 text-sm text-muted-foreground'>
              {formatDateTime(booking.scheduledAt)}{' '}
              {firstDetail?.timeSlot ? `• ${formatTime(firstDetail.timeSlot)}` : ''}
            </p>
            <p className='mt-1 text-sm font-medium text-foreground'>
              {serviceNames.length > 0 ? serviceNames.join(', ') : t('myBookings.card.noService')}
            </p>
          </div>
        </div>
        <div className='text-left md:text-right'>
          <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            {t('myBookings.card.total')}
          </p>
          <p className='mt-1 text-xl font-bold text-primary'>{formatCurrency(booking.totalAmount ?? 0)}</p>
        </div>
      </div>

      <div className='grid gap-4 p-5 md:grid-cols-3'>
        <BookingInfo icon='pets' label={t('myBookings.card.pets')} value={petNames.join(', ') || '-'} />
        <BookingInfo
          icon='account_balance_wallet'
          label={t('myBookings.card.deposit')}
          value={formatCurrency(booking.depositAmount ?? 0)}
        />
        <BookingInfo
          icon='receipt_long'
          label={t('myBookings.card.remaining')}
          value={formatCurrency(booking.remainingAmount ?? 0)}
        />
      </div>

      <div className='flex flex-col gap-3 border-t border-border bg-muted/40 p-5 sm:flex-row sm:items-center sm:justify-between'>
        <span className='inline-flex items-center gap-2 text-sm text-muted-foreground'>
          <MaterialIcon name={booking.bookingType === 'AT_HOME' ? 'home_pin' : 'storefront'} className='text-[19px]' />
          {t(`myBookings.bookingTypes.${booking.bookingType}`, { defaultValue: booking.bookingType })}
        </span>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button type='button' variant='outline' onClick={() => onViewDetail(booking)} className='gap-2'>
            <MaterialIcon name='visibility' className='text-[18px]' />
            {t('myBookings.actions.viewDetail')}
          </Button>
          {canRetryPayment ? (
            <Button type='button' onClick={() => onRetryPayment(booking)} disabled={isRetrying} className='gap-2'>
              <MaterialIcon name={isRetrying ? 'progress_activity' : 'credit_card'} className='text-[18px]' />
              {booking.bookingStatus === BookingStatus.FAILED
                ? t('myBookings.actions.retryPayment')
                : t('myBookings.actions.payNow')}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

interface BookingInfoProps {
  icon: string
  label: string
  value: string
}

function BookingInfo({ icon, label, value }: BookingInfoProps) {
  return (
    <div className='flex items-start gap-3'>
      <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground'>
        <MaterialIcon name={icon} className='text-[19px]' />
      </span>
      <div className='min-w-0'>
        <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{label}</p>
        <p className='mt-1 truncate text-sm font-semibold text-foreground'>{value}</p>
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

function getDetailMediaByType(
  detail: BookingDetailResponse,
  bookingMediaType: 'BEFORE_SERVICE' | 'AFTER_SERVICE'
): MediaFileResponse[] {
  return detail.mediaFiles?.filter((media) => media.bookingMediaType === bookingMediaType) ?? []
}

interface BookingDetailModalProps {
  booking: BookingResponse
  isLoading: boolean
  formatCurrency: (value: number) => string
  onClose: () => void
}

function BookingDetailModal({ booking, isLoading, formatCurrency, onClose }: BookingDetailModalProps) {
  const { t } = useTranslation('profile')

  return (
    <ModalShell title={t('myBookings.detail.title')} onClose={onClose}>
      <div className='space-y-5'>
        <div className='flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='font-display text-xl font-bold text-foreground'>{booking.bookingCode}</p>
            <p className='mt-1 text-sm text-muted-foreground'>{formatDateTime(booking.scheduledAt)}</p>
          </div>
          <StatusBadge status={booking.bookingStatus} />
        </div>

        {isLoading ? (
          <div className='h-32 animate-pulse rounded-2xl bg-muted' />
        ) : (
          <>
            <div className='grid gap-3 sm:grid-cols-2'>
              <DetailItem label={t('myBookings.detail.customer')} value={booking.customerName || '-'} />
              <DetailItem label={t('myBookings.detail.phone')} value={booking.customerPhone || '-'} />
              <DetailItem
                label={t('myBookings.detail.staff')}
                value={booking.staffName || t('myBookings.detail.unassigned')}
              />
              {booking.address ? <DetailItem label={t('myBookings.detail.address')} value={booking.address} /> : null}
            </div>

            {booking.cancelReason ? (
              <div className='rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
                <strong>{t('myBookings.detail.cancelReason')}:</strong> {booking.cancelReason}
              </div>
            ) : null}

            <div className='rounded-2xl border border-border'>
              <div className='border-b border-border p-4'>
                <h3 className='font-bold text-foreground'>{t('myBookings.card.services')}</h3>
              </div>
              <div className='divide-y divide-border'>
                {booking.bookingDetails.map((detail) => (
                  <div key={detail.bookingDetailId} className='grid gap-4 p-4'>
                    <div className='grid gap-3 sm:grid-cols-[1fr_auto]'>
                      <div>
                        <p className='font-semibold text-foreground'>{detail.catalogName}</p>
                        <p className='mt-1 text-sm text-muted-foreground'>
                          {detail.petName} • {formatTime(detail.timeSlot)} • {detail.durationMinute} min
                        </p>
                      </div>
                      <p className='font-bold text-primary'>
                        {formatCurrency(detail.totalPrice ?? detail.unitPrice ?? 0)}
                      </p>
                    </div>
                    <BookingDetailMediaGrid
                      beforeMedia={getDetailMediaByType(detail, 'BEFORE_SERVICE')}
                      afterMedia={getDetailMediaByType(detail, 'AFTER_SERVICE')}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className='rounded-2xl border border-border p-4'>
              <h3 className='font-bold text-foreground'>{t('myBookings.detail.paymentTitle')}</h3>
              <div className='mt-3 grid gap-3 sm:grid-cols-3'>
                <DetailItem label={t('myBookings.card.total')} value={formatCurrency(booking.totalAmount ?? 0)} />
                <DetailItem label={t('myBookings.card.deposit')} value={formatCurrency(booking.depositAmount ?? 0)} />
                <DetailItem
                  label={t('myBookings.card.remaining')}
                  value={formatCurrency(booking.remainingAmount ?? 0)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  )
}

interface BookingDetailMediaGridProps {
  beforeMedia: MediaFileResponse[]
  afterMedia: MediaFileResponse[]
}

function BookingDetailMediaGrid({ beforeMedia, afterMedia }: BookingDetailMediaGridProps) {
  const { t } = useTranslation('profile')

  return (
    <div className='grid gap-3 md:grid-cols-2'>
      <BookingMediaStrip
        title={t('myBookings.detail.beforeMedia')}
        emptyText={t('myBookings.detail.noMedia')}
        mediaFiles={beforeMedia}
      />
      <BookingMediaStrip
        title={t('myBookings.detail.afterMedia')}
        emptyText={t('myBookings.detail.noMedia')}
        mediaFiles={afterMedia}
      />
    </div>
  )
}

interface BookingMediaStripProps {
  title: string
  emptyText: string
  mediaFiles: MediaFileResponse[]
}

function BookingMediaStrip({ title, emptyText, mediaFiles }: BookingMediaStripProps) {
  const imageFiles = mediaFiles.filter((media) => !media.fileType || media.fileType.toUpperCase() === 'IMAGE')

  return (
    <section className='rounded-2xl border border-border bg-muted/30 p-3'>
      <p className='text-sm font-bold text-foreground'>{title}</p>
      {imageFiles.length > 0 ? (
        <div className='mt-3 grid grid-cols-3 gap-2'>
          {imageFiles.map((media) => (
            <a
              key={media.mediaFileId}
              href={media.fileUrl}
              target='_blank'
              rel='noreferrer'
              className='group block overflow-hidden rounded-xl border border-border bg-background'
            >
              <img
                src={media.fileUrl}
                alt={media.fileKey || title}
                className='aspect-square w-full object-cover transition-transform group-hover:scale-105'
              />
            </a>
          ))}
        </div>
      ) : (
        <p className='mt-3 rounded-xl border border-dashed border-border bg-background p-3 text-sm text-muted-foreground'>
          {emptyText}
        </p>
      )}
    </section>
  )
}

interface DetailItemProps {
  label: string
  value: string
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className='rounded-xl bg-muted/60 p-3'>
      <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{label}</p>
      <p className='mt-1 text-sm font-semibold text-foreground'>{value}</p>
    </div>
  )
}

interface PaymentModalProps {
  booking: BookingResponse
  payment: PaymentResponse
  formatCurrency: (value: number) => string
  onClose: () => void
  onSuccess: () => void
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
  onSuccess: () => void
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
      onSuccess()
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
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-semibold text-foreground'>{message}</p>
        </div>
        <button
          type='button'
          onClick={onClose}
          className='text-muted-foreground hover:text-foreground'
          aria-label='Close'
        >
          <MaterialIcon name='close' className='text-[18px]' />
        </button>
      </div>
    </div>
  )
}

function EmptyBookings() {
  const { t } = useTranslation('profile')

  return (
    <div className='rounded-2xl border border-dashed border-border bg-card p-10 text-center'>
      <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground'>
        <MaterialIcon name='event_busy' className='text-[32px]' />
      </div>
      <h2 className='mt-4 font-display text-xl font-bold text-foreground'>{t('myBookings.feedback.emptyTitle')}</h2>
      <p className='mx-auto mt-2 max-w-md text-sm text-muted-foreground'>{t('myBookings.feedback.emptyText')}</p>
    </div>
  )
}

function BookingSkeletonList() {
  return (
    <div className='grid gap-4 xl:grid-cols-2'>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className='rounded-2xl border border-border bg-card p-5'>
          <div className='flex gap-4'>
            <div className='h-14 w-14 animate-pulse rounded-2xl bg-muted' />
            <div className='flex-1 space-y-3'>
              <div className='h-5 w-2/3 animate-pulse rounded-full bg-muted' />
              <div className='h-4 w-1/2 animate-pulse rounded-full bg-muted' />
            </div>
          </div>
          <div className='mt-6 grid gap-3 md:grid-cols-3'>
            <div className='h-16 animate-pulse rounded-xl bg-muted' />
            <div className='h-16 animate-pulse rounded-xl bg-muted' />
            <div className='h-16 animate-pulse rounded-xl bg-muted' />
          </div>
        </div>
      ))}
    </div>
  )
}

function sortBookings(bookings: BookingResponse[]) {
  return [...bookings].sort((first, second) => {
    return new Date(second.scheduledAt).getTime() - new Date(first.scheduledAt).getTime()
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

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatTime(value: string) {
  if (!value) {
    return ''
  }

  return value.slice(0, 5)
}

function getStatusBadgeClassName(status: string) {
  switch (status) {
    case BookingStatus.COMPLETED:
      return 'bg-success/15 text-success'
    case BookingStatus.PENDING_PAYMENT:
    case BookingStatus.READY_FOR_PICKUP:
      return 'bg-warning/15 text-warning'
    case BookingStatus.FAILED:
    case BookingStatus.CANCELLED:
      return 'bg-destructive/15 text-destructive'
    case BookingStatus.IN_PROGRESS:
      return 'bg-info/15 text-info'
    case BookingStatus.ACCEPTED:
      return 'bg-primary/15 text-primary'
    default:
      return 'bg-accent text-accent-foreground'
  }
}
