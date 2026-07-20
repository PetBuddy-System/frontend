import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

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
  'ACCEPTED' | 'IN_PROGRESS' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED'
>

const STATUS_TABS = ['ACCEPTED', 'IN_PROGRESS', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'] as const

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

function getNextStatus(status: GroomerBookingStatus): GroomerBookingStatus | null {
  if (status === 'ACCEPTED') return 'IN_PROGRESS'
  if (status === 'IN_PROGRESS') return 'READY_FOR_PICKUP'
  if (status === 'READY_FOR_PICKUP') return 'COMPLETED'
  return null
}

function getStatusTone(status: GroomerBookingStatus): string {
  if (status === 'ACCEPTED') return 'bg-info/10 text-info'
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

function getUploadType(status: GroomerBookingStatus): BookingMediaType | null {
  if (status === 'ACCEPTED') return 'BEFORE_SERVICE'
  if (status === 'IN_PROGRESS') return 'AFTER_SERVICE'
  return null
}

function canMoveToNextStatus(booking: BookingResponse, nextStatus: GroomerBookingStatus | null) {
  if (!nextStatus) return false
  if (nextStatus === 'IN_PROGRESS') return hasBookingMediaType(booking, 'BEFORE_SERVICE')
  if (nextStatus === 'READY_FOR_PICKUP') return hasBookingMediaType(booking, 'AFTER_SERVICE')
  return true
}

function replaceBooking(bookings: BookingResponse[], nextBooking: BookingResponse) {
  const exists = bookings.some((booking) => booking.bookingId === nextBooking.bookingId)
  if (!exists) return [nextBooking, ...bookings]

  return bookings.map((booking) => (booking.bookingId === nextBooking.bookingId ? nextBooking : booking))
}

export function StaffGroomerBookingsPage() {
  const { t } = useTranslation('staff')
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [activeStatus, setActiveStatus] = useState<GroomerBookingStatus>('ACCEPTED')
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pendingStatus, setPendingStatus] = useState<GroomerBookingStatus | null>(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [previewByDetailId, setPreviewByDetailId] = useState<Record<number, { file: File; url: string }>>({})

  const filteredBookings = useMemo(
    () => bookings.filter((booking) => booking.bookingType === 'AT_STORE' && booking.bookingStatus === activeStatus),
    [activeStatus, bookings]
  )
  const selectedBooking = bookings.find((booking) => booking.bookingId === selectedBookingId) ?? null
  const nextStatus = selectedBooking ? getNextStatus(selectedBooking.bookingStatus as GroomerBookingStatus) : null
  const isNextAllowed = selectedBooking ? canMoveToNextStatus(selectedBooking, nextStatus) : false

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text })
    window.setTimeout(() => setMessage(null), 3500)
  }

  const loadBookings = useCallback(
    async (preferredStatus = activeStatus) => {
      setIsLoading(true)
      try {
        const lists = await Promise.all(STATUS_TABS.map((status) => fetchStaffBookings({ status })))
        const nextBookings = lists.flat().filter((booking) => booking.bookingType === 'AT_STORE')
        setBookings(nextBookings)
        setSelectedBookingId((currentId) => {
          if (currentId && nextBookings.some((booking) => booking.bookingId === currentId)) {
            return currentId
          }

          if (preferredStatus !== activeStatus) {
            return nextBookings.find((booking) => booking.bookingStatus === preferredStatus)?.bookingId ?? null
          }

          return null
        })
      } catch (error) {
        showMessage('error', error instanceof Error ? error.message : t('groomerBookings.messages.loadFailed'))
      } finally {
        setIsLoading(false)
      }
    },
    [activeStatus, t]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial API sync for this staff workspace.
    void loadBookings()
  }, [loadBookings])

  async function reloadSelectedBooking(bookingId: number) {
    const detail = await fetchStaffBookingDetail(bookingId)
    setBookings((current) => replaceBooking(current, detail))
    setSelectedBookingId(detail.bookingId)
    return detail
  }

  async function handleSelectBooking(bookingId: number) {
    setSelectedBookingId(bookingId)
    setIsLoading(true)

    try {
      const detail = await fetchStaffBookingDetail(bookingId)
      setBookings((current) => replaceBooking(current, detail))
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : t('groomerBookings.messages.loadDetailFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  async function updateBookingStatus(status: GroomerBookingStatus, reason?: string) {
    if (!selectedBooking) return

    setIsLoading(true)
    try {
      const updated = await updateStaffBookingStatus(selectedBooking.bookingId, {
        cancelReason: status === 'CANCELLED' ? reason : undefined,
        status
      })
      setBookings((current) => replaceBooking(current, updated))
      setActiveStatus(status)
      setSelectedBookingId(updated.bookingId)
      setPendingStatus(null)
      setIsCancelModalOpen(false)
      setCancelReason('')
      await loadBookings(status)
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
    if (!selectedBooking) return

    const preview = previewByDetailId[detailId]
    if (!preview) {
      showMessage('error', t('groomerBookings.messages.noPreview'))
      return
    }

    setIsLoading(true)
    try {
      await uploadBookingDetailMedia(detailId, type, preview.file)
      await reloadSelectedBooking(selectedBooking.bookingId)
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
                      setSelectedBookingId(null)
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

            <section
              className={cn(
                'grid grid-cols-1 gap-6',
                selectedBooking && 'xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)]'
              )}
            >
              <div className='flex flex-col gap-4'>
                {isLoading && bookings.length === 0 && (
                  <div className='rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm'>
                    {t('groomerBookings.actions.loading')}
                  </div>
                )}

                {!isLoading && filteredBookings.length === 0 && (
                  <div className='rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm'>
                    {t('groomerBookings.empty')}
                  </div>
                )}

                {filteredBookings.map((booking) => (
                  <article
                    key={booking.bookingId}
                    role='button'
                    tabIndex={0}
                    onClick={() => void handleSelectBooking(booking.bookingId)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        void handleSelectBooking(booking.bookingId)
                      }
                    }}
                    className={cn(
                      'cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring',
                      selectedBooking?.bookingId === booking.bookingId && 'border-primary ring-2 ring-primary/20'
                    )}
                  >
                    <div className='flex items-start justify-between gap-4'>
                      <div>
                        <p className='font-display text-lg font-bold text-card-foreground'>{booking.bookingCode}</p>
                        <p className='mt-1 text-sm text-muted-foreground'>{formatDateTime(booking.scheduledAt)}</p>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-semibold',
                          getStatusTone(booking.bookingStatus as GroomerBookingStatus)
                        )}
                      >
                        {t(`groomerBookings.status.${booking.bookingStatus}`)}
                      </span>
                    </div>
                    <div className='mt-4 grid grid-cols-2 gap-3 text-sm'>
                      <InfoPill label={t('groomerBookings.card.customer')} value={booking.customerName} />
                      <InfoPill label={t('groomerBookings.card.phone')} value={booking.customerPhone} />
                      <InfoPill
                        label={t('groomerBookings.card.petCount')}
                        value={String(booking.bookingDetails.length)}
                      />
                      <InfoPill
                        label={t('groomerBookings.card.serviceCount')}
                        value={String(booking.bookingDetails.length)}
                      />
                      <InfoPill
                        label={t('groomerBookings.card.duration')}
                        value={t('groomerBookings.card.minutesValue', { value: getTotalDuration(booking) })}
                      />
                      <InfoPill
                        label={t('groomerBookings.card.type')}
                        value={t(`groomerBookings.bookingTypes.${booking.bookingType}`, {
                          defaultValue: booking.bookingType
                        })}
                      />
                    </div>
                    <Button
                      className='mt-4 w-full'
                      variant='outline'
                      onClick={(event) => {
                        event.stopPropagation()
                        void handleSelectBooking(booking.bookingId)
                      }}
                    >
                      <MaterialIcon name='visibility' className='text-[18px]' />
                      {t('groomerBookings.actions.viewDetail')}
                    </Button>
                  </article>
                ))}
              </div>

              {selectedBooking && (
                <BookingDetailPanel
                  booking={selectedBooking}
                  isLoading={isLoading}
                  isNextAllowed={isNextAllowed}
                  nextStatus={nextStatus}
                  previewByDetailId={previewByDetailId}
                  onCancelClick={() => setIsCancelModalOpen(true)}
                  onFileChange={handleFileChange}
                  onRequestStatus={(status) => setPendingStatus(status)}
                  onUpload={handleUpload}
                  t={t}
                />
              )}
            </section>
          </div>
        </main>
      </div>

      {pendingStatus && selectedBooking && (
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
  previewByDetailId: Record<number, { file: File; url: string }>
  onCancelClick: () => void
  onFileChange: (detailId: number, event: ChangeEvent<HTMLInputElement>) => void
  onRequestStatus: (status: GroomerBookingStatus) => void
  onUpload: (detailId: number, type: BookingMediaType) => void
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const status = booking.bookingStatus as GroomerBookingStatus
  const uploadType = getUploadType(status)

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

      <Timeline status={status} t={t} />

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
              disabled={isLoading || !nextStatus || !isNextAllowed}
              onClick={() => nextStatus && onRequestStatus(nextStatus)}
            >
              <MaterialIcon name='play_circle' className='text-[18px]' />
              {t('groomerBookings.actions.start')}
            </Button>
            <Button variant='destructive' disabled={isLoading} onClick={onCancelClick}>
              <MaterialIcon name='cancel' className='text-[18px]' />
              {t('groomerBookings.actions.cancelBooking')}
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
              {t('groomerBookings.actions.readyForPickup')}
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

function Timeline({ status, t }: { status: GroomerBookingStatus; t: (key: string) => string }) {
  const steps: GroomerBookingStatus[] = ['ACCEPTED', 'IN_PROGRESS', 'READY_FOR_PICKUP', 'COMPLETED']
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
