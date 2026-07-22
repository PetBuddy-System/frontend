import { useEffect, useMemo, useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import {
  BookingStatus,
  getCustomerBookingDetail,
  type BookingDetailResponse,
  type BookingResponse,
  type MediaFileResponse
} from '../services'

import { cn } from '~/shared/lib/cn'
import { Button, MaterialIcon } from '~/shared/ui'

interface ProfileBookingDetailPageProps {
  bookingId: number
}

export function ProfileBookingDetailPage({ bookingId }: ProfileBookingDetailPageProps) {
  const { t, i18n } = useTranslation('profile')
  const [booking, setBooking] = useState<BookingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
      }),
    [i18n.language]
  )

  useEffect(() => {
    let isMounted = true

    async function loadBookingDetail() {
      try {
        setIsLoading(true)
        setErrorMessage('')
        const detail = await getCustomerBookingDetail(bookingId)

        if (isMounted) {
          setBooking(detail)
        }
      } catch {
        if (isMounted) {
          setErrorMessage(t('myBookings.feedback.detailFailed'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadBookingDetail()

    return () => {
      isMounted = false
    }
  }, [bookingId, t])

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='services' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ProfilePageHeader titleKey='myBookings.detail.title' subtitleKey='myBookings.detail.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 pb-24 md:p-6'>
          <div className='mx-auto flex max-w-6xl flex-col gap-5'>
            <div>
              <Button type='button' variant='outline' className='gap-2' onClick={() => window.history.back()}>
                <MaterialIcon name='arrow_back' className='text-[18px]' />
                {t('myBookings.actions.backToList')}
              </Button>
            </div>

            {isLoading ? <BookingDetailSkeleton /> : null}

            {!isLoading && errorMessage ? (
              <section className='rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive'>
                {errorMessage}
              </section>
            ) : null}

            {!isLoading && booking ? (
              <BookingDetailContent booking={booking} formatCurrency={(value) => currencyFormatter.format(value)} />
            ) : null}
          </div>
        </main>
      </div>
      <ProfileFloatingSupport />
    </div>
  )
}

interface BookingDetailContentProps {
  booking: BookingResponse
  formatCurrency: (value: number) => string
}

function BookingDetailContent({ booking, formatCurrency }: BookingDetailContentProps) {
  const { t } = useTranslation('profile')
  const remainingAmount = getRemainingAmountForDisplay(booking)
  const pickupPaidAmount = getPickupPaidAmountForDisplay(booking)
  const firstDetail = booking.bookingDetails[0]

  return (
    <>
      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <div className='flex flex-col gap-4 border-b border-border bg-muted/30 p-5 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-primary'>{t('myBookings.detail.code')}</p>
            <h1 className='mt-1 font-display text-2xl font-bold text-card-foreground'>
              {booking.bookingCode || `#${booking.bookingId}`}
            </h1>
            <p className='mt-2 text-sm text-muted-foreground'>{formatDateTime(booking.scheduledAt)}</p>
          </div>
          <StatusBadge status={booking.bookingStatus} />
        </div>

        <BookingProgressStepper status={booking.bookingStatus} />

        <div className='grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3'>
          <DetailItem label={t('myBookings.detail.customer')} value={booking.customerName || '-'} />
          <DetailItem label={t('myBookings.detail.phone')} value={booking.customerPhone || '-'} />
          <DetailItem label={t('myBookings.detail.bookingDate')} value={getBookingDateText(booking, firstDetail)} />
          <DetailItem label={t('myBookings.detail.startTime')} value={getBookingStartTimeText(booking, firstDetail)} />
          <DetailItem label={t('myBookings.detail.endTime')} value={getBookingEndTimeText(booking)} />
          <DetailItem
            label={t('myBookings.detail.staff')}
            value={booking.staffName || t('myBookings.detail.staffUnassigned')}
          />
          {booking.address ? <DetailItem label={t('myBookings.detail.address')} value={booking.address} /> : null}
        </div>
      </section>

      {booking.cancelReason ? (
        <section className='rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive'>
          <strong>{t('myBookings.detail.cancelReason')}:</strong> {booking.cancelReason}
        </section>
      ) : null}

      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        <div className='border-b border-border p-5'>
          <h2 className='font-display text-xl font-bold text-card-foreground'>{t('myBookings.card.services')}</h2>
        </div>
        <div className='divide-y divide-border'>
          {booking.bookingDetails.map((detail) => (
            <article key={detail.bookingDetailId} className='grid gap-4 p-5'>
              <div className='min-w-0'>
                <p className='text-xs font-semibold uppercase tracking-wide text-primary'>
                  {t('myBookings.detail.servicePackage')}
                </p>
                <p className='mt-1 font-display text-lg font-bold text-foreground'>{detail.catalogName}</p>
                <BookingDetailServiceLines detail={detail} formatCurrency={formatCurrency} />
              </div>
              <BookingPetInfo detail={detail} />
              <BookingDetailMediaGrid
                beforeMedia={getDetailMediaByType(detail, 'BEFORE_SERVICE')}
                afterMedia={getDetailMediaByType(detail, 'AFTER_SERVICE')}
              />
            </article>
          ))}
        </div>
      </section>

      <section className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
        <h2 className='font-display text-xl font-bold text-card-foreground'>{t('myBookings.detail.paymentTitle')}</h2>
        <dl className='mt-3 divide-y divide-border text-sm'>
          <PaymentSummaryLine label={t('myBookings.card.total')} value={formatCurrency(booking.totalAmount ?? 0)} />
          <PaymentSummaryLine label={t('myBookings.card.deposit')} value={formatCurrency(booking.depositAmount ?? 0)} />
          {pickupPaidAmount > 0 ? (
            <PaymentSummaryLine label={t('myBookings.detail.pickupPayment')} value={formatCurrency(pickupPaidAmount)} />
          ) : null}
          <PaymentSummaryLine label={t('myBookings.card.remaining')} value={formatCurrency(remainingAmount)} strong />
        </dl>
      </section>
    </>
  )
}

interface BookingProgressStep {
  statuses: readonly BookingStatus[]
  icon: string
  labelKey: string
}

const BOOKING_PROGRESS_STEPS = [
  {
    statuses: [BookingStatus.PENDING_PAYMENT],
    icon: 'payments',
    labelKey: 'myBookings.progress.pendingPayment'
  },
  {
    statuses: [BookingStatus.PENDING_ACCEPTANCE, BookingStatus.WAITING_STAFF],
    icon: 'assignment_turned_in',
    labelKey: 'myBookings.progress.pendingAcceptance'
  },
  {
    statuses: [BookingStatus.ACCEPTED],
    icon: 'event_available',
    labelKey: 'myBookings.progress.accepted'
  },
  {
    statuses: [BookingStatus.ON_THE_WAY],
    icon: 'directions_bike',
    labelKey: 'myBookings.progress.onTheWay'
  },
  {
    statuses: [BookingStatus.IN_PROGRESS],
    icon: 'spa',
    labelKey: 'myBookings.progress.inProgress'
  },
  {
    statuses: [BookingStatus.READY_FOR_PICKUP],
    icon: 'inventory_2',
    labelKey: 'myBookings.progress.readyForPickup'
  },
  {
    statuses: [BookingStatus.COMPLETED],
    icon: 'task_alt',
    labelKey: 'myBookings.progress.completed'
  }
] as const satisfies readonly BookingProgressStep[]

interface BookingProgressStepperProps {
  status: string
}

function BookingProgressStepper({ status }: BookingProgressStepperProps) {
  const { t } = useTranslation('profile')
  const isTerminalIssue = status === BookingStatus.CANCELLED || status === BookingStatus.FAILED
  const currentIndex = BOOKING_PROGRESS_STEPS.findIndex((step) => (step.statuses as readonly string[]).includes(status))

  return (
    <div className='border-b border-border p-5'>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <h2 className='font-display text-lg font-bold text-card-foreground'>{t('myBookings.progress.title')}</h2>
        {isTerminalIssue ? <StatusBadge status={status} /> : null}
      </div>
      <div className='overflow-x-auto pb-1'>
        <div className='flex min-w-[720px] items-start'>
          {BOOKING_PROGRESS_STEPS.map((step, index) => {
            const isDone = !isTerminalIssue && currentIndex >= 0 && index < currentIndex
            const isCurrent = !isTerminalIssue && index === currentIndex
            const isActive = isDone || isCurrent
            const isLast = index === BOOKING_PROGRESS_STEPS.length - 1

            return (
              <div key={step.labelKey} className={cn('flex items-start', !isLast && 'flex-1')}>
                <div className='flex w-24 shrink-0 flex-col items-center gap-2 text-center'>
                  <span
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-full border transition-colors',
                      isDone && 'border-primary bg-primary text-primary-foreground',
                      isCurrent && 'border-primary bg-primary text-primary-foreground ring-4 ring-primary/15',
                      !isActive && 'border-border bg-muted text-muted-foreground'
                    )}
                  >
                    <MaterialIcon name={isDone ? 'check' : step.icon} className='text-[20px]' />
                  </span>
                  <span className={cn('text-xs font-bold', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                    {t(step.labelKey)}
                  </span>
                </div>

                {!isLast ? (
                  <span
                    className={cn(
                      'mt-5 h-0.5 flex-1',
                      !isTerminalIssue && index < currentIndex ? 'bg-primary' : 'border-t border-dashed border-border'
                    )}
                  />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BookingDetailSkeleton() {
  return (
    <div className='space-y-5'>
      <div className='h-40 animate-pulse rounded-2xl bg-muted' />
      <div className='h-72 animate-pulse rounded-2xl bg-muted' />
      <div className='h-36 animate-pulse rounded-2xl bg-muted' />
    </div>
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

interface BookingDetailServiceLinesProps {
  detail: BookingDetailResponse
  formatCurrency: (value: number) => string
}

function BookingDetailServiceLines({ detail, formatCurrency }: BookingDetailServiceLinesProps) {
  const { t } = useTranslation('profile')
  const baseDurationMinute = detail.baseDurationMinute ?? detail.durationMinute ?? 0
  const additionalDurationMinute = detail.additionalDurationMinute ?? 0
  const totalDurationMinute =
    detail.totalDurationMinute ?? Number(baseDurationMinute ?? 0) + Number(additionalDurationMinute ?? 0)
  const basePrice = detail.basePrice ?? detail.unitPrice ?? detail.totalPrice ?? 0
  const additionalPrice = detail.additionalPrice ?? 0
  const totalPrice = detail.totalPrice ?? Number(basePrice ?? 0) + Number(additionalPrice ?? 0)

  return (
    <dl className='mt-3 grid gap-2 rounded-2xl border border-border bg-muted/30 p-3 text-sm sm:grid-cols-2'>
      <div className='rounded-xl bg-background p-3'>
        <dt className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          {t('myBookings.detail.appointmentTime')}
        </dt>
        <dd className='mt-1 font-semibold text-foreground'>{formatTime(detail.timeSlot)}</dd>
      </div>
      <div className='rounded-xl bg-background p-3'>
        <dt className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          {t('myBookings.detail.baseDuration')}
        </dt>
        <dd className='mt-1 font-semibold text-foreground'>
          {t('myBookings.detail.durationMinute', { minutes: baseDurationMinute })}
        </dd>
      </div>
      {additionalDurationMinute > 0 ? (
        <div className='rounded-xl bg-background p-3'>
          <dt className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            {t('myBookings.detail.additionalDuration')}
          </dt>
          <dd className='mt-1 font-semibold text-foreground'>
            {t('myBookings.detail.durationMinute', { minutes: additionalDurationMinute })}
          </dd>
        </div>
      ) : null}
      <div className='rounded-xl bg-background p-3'>
        <dt className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          {t('myBookings.detail.totalDuration')}
        </dt>
        <dd className='mt-1 font-semibold text-foreground'>
          {t('myBookings.detail.durationMinute', { minutes: totalDurationMinute })}
        </dd>
      </div>
      <div className='rounded-xl bg-background p-3'>
        <dt>{t('myBookings.detail.basePrice')}</dt>
        <dd className='mt-1 font-semibold text-foreground'>{formatCurrency(basePrice)}</dd>
      </div>
      {additionalPrice > 0 ? (
        <div className='rounded-xl bg-background p-3'>
          <dt>{t('myBookings.detail.extraPrice')}</dt>
          <dd className='mt-1 font-semibold text-foreground'>{formatCurrency(additionalPrice)}</dd>
        </div>
      ) : null}
      <div className='rounded-xl bg-primary/10 p-3 sm:col-span-2'>
        <dt className='text-xs font-semibold uppercase tracking-wide text-primary'>
          {t('myBookings.detail.totalServicePrice')}
        </dt>
        <dd className='mt-1 font-display text-lg font-bold text-primary'>{formatCurrency(totalPrice)}</dd>
      </div>
    </dl>
  )
}

interface BookingPetInfoProps {
  detail: BookingDetailResponse
}

function BookingPetInfo({ detail }: BookingPetInfoProps) {
  const { t } = useTranslation('profile')
  const petInfoItems = getPetInfoItems(detail, t)
  const petAvatarUrl = getDetailPetAvatarUrl(detail)

  if (petInfoItems.length === 0) {
    return null
  }

  return (
    <section className='rounded-2xl border border-border bg-muted/30 p-4'>
      <div className='mb-3 flex items-center gap-3'>
        {petAvatarUrl ? (
          <img
            src={petAvatarUrl}
            alt={detail.petName}
            className='h-14 w-14 shrink-0 rounded-2xl border border-border object-cover'
          />
        ) : (
          <span className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-background text-primary'>
            <MaterialIcon name='pets' className='text-[24px]' />
          </span>
        )}
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-primary'>
            {t('myBookings.detail.petInfoTitle')}
          </p>
          <h3 className='font-display text-base font-bold text-foreground'>{detail.petName || '-'}</h3>
        </div>
      </div>
      <dl className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {petInfoItems.map((item) => (
          <div
            key={item.label}
            className={cn('rounded-xl bg-background p-3', item.highlight && 'border border-warning/30 bg-warning/10')}
          >
            <dt className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{item.label}</dt>
            <dd className={cn('mt-1 text-sm font-semibold text-foreground', item.highlight && 'text-warning')}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

interface PaymentSummaryLineProps {
  label: string
  value: string
  strong?: boolean
}

function PaymentSummaryLine({ label, value, strong }: PaymentSummaryLineProps) {
  return (
    <div className='flex items-center justify-between gap-4 py-3'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className={cn('text-right font-semibold text-foreground', strong && 'text-primary')}>{value}</dd>
    </div>
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

function getDetailPetAvatarUrl(detail: BookingDetailResponse): string | null {
  const detailWithImageAliases = detail as BookingDetailResponse & {
    avatarUrl?: string
    petAvatar?: string
    petImageUrl?: string
  }

  return (
    detail.petImage ||
    detailWithImageAliases.petImageUrl ||
    detailWithImageAliases.petAvatar ||
    detailWithImageAliases.avatarUrl ||
    null
  )
}

function getRemainingAmountForDisplay(booking: BookingResponse): number {
  return booking.bookingStatus === BookingStatus.COMPLETED ? 0 : (booking.remainingAmount ?? 0)
}

function getPickupPaidAmountForDisplay(booking: BookingResponse): number {
  return booking.bookingStatus === BookingStatus.COMPLETED ? (booking.remainingAmount ?? 0) : 0
}

function getBookingDateText(booking: BookingResponse, detail?: BookingDetailResponse): string {
  const startDate = getBookingStartDate(booking, detail)

  return startDate ? formatDateOnly(startDate) : formatDateTime(booking.scheduledAt)
}

function getBookingStartTimeText(booking: BookingResponse, detail?: BookingDetailResponse): string {
  const startDate = getBookingStartDate(booking, detail)

  return startDate ? formatClockTime(startDate) : '-'
}

function getBookingEndTimeText(booking: BookingResponse): string {
  const endDate = getBookingEndDate(booking)

  return endDate ? formatClockTime(endDate) : '-'
}

function getBookingEndDate(booking: BookingResponse): Date | null {
  const endAt =
    booking.estimatedEndAt ||
    (booking as BookingResponse & { expectedEndAt?: string | null; finishedAt?: string | null }).expectedEndAt ||
    null

  if (endAt) {
    const date = new Date(endAt)

    return Number.isNaN(date.getTime()) ? null : date
  }

  const startDate = getBookingStartDate(booking, booking.bookingDetails[0])
  if (!startDate) {
    return null
  }

  const longestDuration = booking.bookingDetails.reduce((maxDuration, detail) => {
    const duration = Number(detail.totalDurationMinute ?? detail.durationMinute ?? detail.baseDurationMinute ?? 0)

    return Number.isFinite(duration) && duration > maxDuration ? duration : maxDuration
  }, 0)

  if (longestDuration <= 0) {
    return null
  }

  const endDate = new Date(startDate)
  endDate.setMinutes(endDate.getMinutes() + longestDuration)

  return endDate
}

function getBookingStartDate(booking: BookingResponse, detail?: BookingDetailResponse): Date | null {
  if (!booking.scheduledAt) {
    return null
  }

  const datePart = booking.scheduledAt.slice(0, 10)
  const timePart =
    detail?.timeSlot || (booking.scheduledAt.includes('T') ? booking.scheduledAt.slice(11, 19) : '00:00:00')
  const [hour = 0, minute = 0, second = 0] = timePart.split(':').map((part) => Number(part))
  const date = new Date(`${datePart}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  date.setHours(hour, minute, second, 0)

  return date
}

function getPetInfoItems(detail: BookingDetailResponse, t: TFunction<'profile'>) {
  const detailWithAliases = detail as BookingDetailResponse & {
    breed?: string
    species?: string
    weight?: number
    healthNote?: string
    allergyNote?: string
    behaviorNote?: string
  }
  const species = detail.petSpecies || detailWithAliases.species
  const breed = detail.petBreed || detailWithAliases.breed
  const weight = detail.petWeight ?? detailWithAliases.weight
  const healthNote = detail.petHealthNote || detailWithAliases.healthNote
  const allergyNote = detail.petAllergyNote || detailWithAliases.allergyNote
  const behaviorNote = detail.petBehaviorNote || detailWithAliases.behaviorNote
  const items: { label: string; value: string; highlight?: boolean }[] = [
    {
      label: t('myBookings.detail.petName'),
      value: detail.petName || '-'
    }
  ]

  if (species) {
    items.push({
      label: t('myBookings.detail.petSpecies'),
      value: t(`petProfiles.species.${species}`, { defaultValue: species })
    })
  }

  if (breed) {
    items.push({
      label: t('myBookings.detail.petBreed'),
      value: breed
    })
  }

  if (typeof weight === 'number' && Number.isFinite(weight)) {
    items.push({
      label: t('myBookings.detail.petWeight'),
      value: t('petProfiles.values.weightKg', { value: weight })
    })
  }

  if (healthNote) {
    items.push({
      label: t('myBookings.detail.petHealthNote'),
      value: healthNote,
      highlight: true
    })
  }

  if (allergyNote) {
    items.push({
      label: t('myBookings.detail.petAllergyNote'),
      value: allergyNote,
      highlight: true
    })
  }

  if (behaviorNote) {
    items.push({
      label: t('myBookings.detail.petBehaviorNote'),
      value: behaviorNote
    })
  }

  return items
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

function formatDateOnly(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value : '-'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

function formatClockTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value : '-'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
