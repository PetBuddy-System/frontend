import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import { fetchDeliveryRouteApi, type DeliveryStop} from '../services/order/delivery-route-api'
import { updateOrderStatusApi } from '../services/order/order-api'
import { useAuth } from '~/providers/auth-provider'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { formatDateTime } from '~/shared/lib/date'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

interface DeliveryProofDialogProps {
  stop: DeliveryStop
  onConfirm: (file: File) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

function DeliveryProofDialog({ stop, onConfirm, onCancel, isSubmitting }: DeliveryProofDialogProps) {
  const { t } = useTranslation('staff')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError(t('deliveryRoute.proof.uploadTypeError'))
      return
    }
    setError('')
    setProofFile(file)
  }

  async function handleConfirm() {
    if (!proofFile) {
      setError(t('deliveryRoute.proof.uploadError'))
      return
    }
    await onConfirm(proofFile)
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-5'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success'>
            <MaterialIcon name='local_shipping' className='text-[20px]' />
          </div>
          <div>
            <h3 className='font-bold text-foreground'>{t('deliveryRoute.proof.title')}</h3>
            <p className='text-xs text-muted-foreground'>{stop.orderCode}</p>
          </div>
        </div>

        <p className='text-sm text-muted-foreground'>{t('deliveryRoute.proof.desc')}</p>

        <div
          role='button'
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors',
            proofFile ? 'border-success bg-success/5' : 'border-border hover:border-primary hover:bg-muted'
          )}
        >
          <MaterialIcon
            name={proofFile ? 'check_circle' : 'upload'}
            className={cn('text-[36px]', proofFile ? 'text-success' : 'text-muted-foreground')}
          />
          {proofFile ? (
            <p className='text-sm font-semibold text-success'>{proofFile.name}</p>
          ) : (
            <>
              <p className='text-sm font-semibold text-foreground'>{t('deliveryRoute.proof.upload')}</p>
              <p className='text-xs text-muted-foreground'>{t('deliveryRoute.proof.uploadNote')}</p>
            </>
          )}
        </div>
        <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileChange} />

        {error && <p className='text-xs text-destructive'>{error}</p>}

        <div className='flex gap-3'>
          <button
            type='button'
            onClick={onCancel}
            disabled={isSubmitting}
            className='flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50'
          >
            {t('deliveryRoute.proof.cancel')}
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            disabled={isSubmitting}
            className='flex-1 rounded-xl bg-success py-2.5 text-sm font-bold text-success-foreground transition-opacity hover:opacity-90 disabled:opacity-50'
          >
            {isSubmitting ? (
              <span className='flex items-center justify-center gap-2'>
                <MaterialIcon name='progress_activity' className='animate-spin text-[18px]' />
              </span>
            ) : (
              t('deliveryRoute.proof.confirm')
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

interface StopCardProps {
  stop: DeliveryStop
  isActive: boolean
  onMarkDelivered: (stop: DeliveryStop) => void
}

function StopCard({ stop, isActive, onMarkDelivered }: StopCardProps) {
  const { t } = useTranslation('staff')
  const isDelivered = stop.status === 'DELIVERED'
  const isPaidByCard = stop.paymentMethod === 'CARD' && stop.paymentStatus === 'PAID'

  return (
    <div className='flex relative pb-8'>
      <div className='absolute left-5 top-10 bottom-0 w-0.5 bg-border last:hidden' aria-hidden='true' />
      <div
        className={cn(
          'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm',
          isActive
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
            : isDelivered
              ? 'bg-success text-success-foreground'
              : 'bg-muted text-muted-foreground'
        )}
      >
        {isDelivered ? <MaterialIcon name='check' className='text-[18px]' /> : stop.sequence}
      </div>

      <div
        className={cn(
          'ml-5 flex-1 rounded-2xl border p-5 transition-shadow',
          isActive
            ? 'border-primary/30 bg-primary/5 shadow-md'
            : 'border-border bg-card shadow-sm'
        )}
      >
        <div className='flex flex-wrap items-start justify-between gap-2 mb-3'>
          <div>
            <span
              className={cn(
                'inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              )}
            >
              {isActive ? t('deliveryRoute.timeline.statusDelivering') : t('deliveryRoute.timeline.statusPending')}
            </span>
            <h4 className={cn('mt-1.5 font-bold', isActive ? 'text-primary' : 'text-foreground')}>
              {stop.orderCode}
            </h4>
          </div>
          <div className='text-right'>
            <p className='font-bold text-foreground'>{formatCurrency(stop.finalAmount)}</p>
            <p className='text-xs text-muted-foreground'>
              {isPaidByCard ? t('deliveryRoute.timeline.paymentCard') : t('deliveryRoute.timeline.paymentCash')}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-3 text-sm md:grid-cols-2'>
          <div>
            <p className='text-xs text-muted-foreground mb-0.5'>{t('deliveryRoute.timeline.customer')}</p>
            <p className='font-semibold text-foreground'>{stop.recipientName} — {stop.phoneNumber}</p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground mb-0.5'>{t('deliveryRoute.timeline.address')}</p>
            <p className='font-semibold italic text-foreground text-sm'>{stop.address}</p>
          </div>
          {stop.estimatedDeliveryAt && (
            <div>
              <p className='text-xs text-muted-foreground mb-0.5'>{t('orderDetail.estimatedDeliveryAt', 'Dự kiến giao hàng', { ns: 'profile' })}</p>
              <p className='font-semibold text-foreground flex items-center gap-1'>
                <MaterialIcon name='event' className='text-primary text-[16px]' />
                {formatDateTime(stop.estimatedDeliveryAt)}
              </p>
            </div>
          )}
        </div>

        {isActive && !isDelivered && (
          <div className='mt-4 flex gap-3'>
            <button
              id={`delivered-btn-${stop.orderId}`}
              type='button'
              onClick={() => onMarkDelivered(stop)}
              className='flex-1 rounded-xl bg-success py-2.5 text-sm font-bold text-success-foreground transition-opacity hover:opacity-90'
            >
              {t('deliveryRoute.timeline.deliveredBtn')}
            </button>
            <a
              id={`call-btn-${stop.orderId}`}
              href={`tel:${stop.phoneNumber}`}
              className='flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted'
            >
              <MaterialIcon name='call' className='text-[18px] text-primary' />
              {t('deliveryRoute.timeline.callBtn')}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export function StaffDeliveryRoutePage() {
  const { t } = useTranslation('staff')
  const { user } = useAuth()

  const [stops, setStops] = useState<DeliveryStop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [proofTarget, setProofTarget] = useState<DeliveryStop | null>(null)
  const [isSubmittingProof, setIsSubmittingProof] = useState(false)

  async function loadRoute() {
  if (!user?.userId) return
  setIsLoading(true)
  setError('')
  try {
    const res = await fetchDeliveryRouteApi(user.userId)
    if (res.success && res.data) {
      setStops(res.data)          // res.data giờ LÀ mảng, không có .stops
    } else {
      setError(t('deliveryRoute.errors.loadFailed'))
    }
  } catch {
    setError(t('deliveryRoute.errors.loadFailed'))
  } finally {
    setIsLoading(false)
  }
}

  useEffect(() => { void loadRoute() }, [user?.userId])

  async function handleConfirmDelivered(file: File) {
    if (!proofTarget) return
    setIsSubmittingProof(true)
    try {
      await updateOrderStatusApi(proofTarget.orderId, 'DELIVERED', file)
      setProofTarget(null)
      await loadRoute()
    } catch {
    } finally {
      setIsSubmittingProof(false)
    }
  }

  const activeStop = stops.find((s) => s.status === 'SHIPPING') ?? stops[0]
  const nextStop = stops.find((s, i) => i > 0 && s.status !== 'DELIVERED')
  const completedCount = stops.filter((s) => s.status === 'DELIVERED').length

  const totalDistanceKm = stops.reduce((sum, s) => sum + (s.distanceFromPreviousKm ?? 0), 0)
  const totalDistanceLabel = totalDistanceKm > 0 ? `${totalDistanceKm.toFixed(1)} km` : '—'
  const durationLabel = '—'

  const googleMapsUrl = activeStop
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeStop.address)}`
    : 'https://maps.google.com'

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='deliveryRoute' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav
          titleKey='deliveryRoute.title'
          subtitleKey='deliveryRoute.subtitle'
        />
        <main className='flex-1 overflow-y-auto p-4 pb-20 md:p-6'>
          <div className='mx-auto max-w-7xl'>
            {isLoading && (
              <div className='flex h-64 items-center justify-center'>
                <div className='flex flex-col items-center gap-3 text-muted-foreground'>
                  <MaterialIcon name='progress_activity' className='animate-spin text-[40px] text-primary' />
                  <p className='text-sm'>{t('deliveryRoute.errors.loadFailed')}</p>
                </div>
              </div>
            )}
            {!isLoading && error && (
              <div className='flex h-64 flex-col items-center justify-center gap-4 text-center'>
                <MaterialIcon name='error_outline' className='text-[48px] text-destructive' />
                <p className='text-muted-foreground'>{error}</p>
                <button
                  type='button'
                  onClick={() => void loadRoute()}
                  className='rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground'
                >
                  Thử lại
                </button>
              </div>
            )}
            {!isLoading && !error && stops.length === 0 && (
              <div className='flex h-64 flex-col items-center justify-center gap-4 text-center'>
                <MaterialIcon name='local_shipping' className='text-[56px] text-muted-foreground/40' />
                <h3 className='font-bold text-foreground'>{t('deliveryRoute.map.noRouteTitle')}</h3>
                <p className='text-sm text-muted-foreground max-w-sm'>{t('deliveryRoute.map.noRouteDesc')}</p>
              </div>
            )}

            {!isLoading && !error && stops.length > 0 && (
              <>
                <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  <div className='flex items-center justify-between rounded-2xl bg-primary p-5 text-primary-foreground shadow-lg shadow-primary/20'>
                    <div>
                      <p className='text-sm opacity-80'>{t('deliveryRoute.stats.currentStop')}</p>
                      <h3 className='mt-0.5 text-2xl font-bold'>
                        {activeStop ? t('deliveryRoute.stats.sequence', { seq: activeStop.sequence }) : '—'}
                      </h3>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-white/20'>
                      <MaterialIcon name='location_on' className='text-[24px]' />
                    </div>
                  </div>
                  <div className='flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm'>
                    <div>
                      <p className='text-sm text-muted-foreground'>{t('deliveryRoute.stats.nextStop')}</p>
                      <h3 className='mt-0.5 text-2xl font-bold text-foreground'>
                        {nextStop ? t('deliveryRoute.stats.sequence', { seq: nextStop.sequence }) : '—'}
                      </h3>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-muted'>
                      <MaterialIcon name='skip_next' className='text-[24px] text-muted-foreground' />
                    </div>
                  </div>

                  <div className='flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm'>
                    <div>
                      <p className='text-sm text-muted-foreground'>{t('deliveryRoute.stats.completed')}</p>
                      <h3 className='mt-0.5 text-2xl font-bold text-foreground'>
                        {t('deliveryRoute.stats.completedCount', { done: completedCount, total: stops.length })}
                      </h3>
                    </div>
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-success/15'>
                      <MaterialIcon name='check_circle' className='text-[24px] text-success' />
                    </div>
                  </div>
                </div>

                <div className='flex flex-col gap-6 lg:flex-row'>
                  <div className='flex-1 min-w-0'>
                    <div className='rounded-2xl border border-border bg-card shadow-sm p-6'>
                      <div className='mb-6 flex items-center justify-between'>
                        <h2 className='font-bold text-lg text-foreground'>{t('deliveryRoute.timeline.title')}</h2>
                        <a
                          id='optimize-route-btn'
                          href={googleMapsUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90'
                        >
                          <MaterialIcon name='map' className='text-[18px]' />
                          {t('deliveryRoute.timeline.optimizeBtn')}
                        </a>
                      </div>

                      <div>
                        {stops.map((stop) => (
                          <StopCard
                            key={stop.orderId}
                            stop={stop}
                            isActive={stop.orderId === activeStop?.orderId && stop.status !== 'DELIVERED'}
                            onMarkDelivered={setProofTarget}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className='lg:w-80 xl:w-96 shrink-0'>
                    <div className='sticky top-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden'>
                      <div className='border-b border-border px-6 py-4'>
                        <h2 className='font-bold text-foreground'>{t('deliveryRoute.map.title')}</h2>
                      </div>

                      <div className='relative flex h-64 items-center justify-center bg-primary/5'>
                        <div className='z-10 text-center px-6'>
                          <MaterialIcon name='location_on' className='text-[48px] text-primary mb-2' />
                          <p className='text-sm text-muted-foreground'>
                            {t('deliveryRoute.map.currentLocation')}:{' '}
                            <strong className='text-foreground'>
                              {activeStop?.address?.split(',').slice(-2).join(',').trim() ?? '—'}
                            </strong>
                          </p>
                          {nextStop && (
                            <p className='mt-1.5 font-bold text-primary text-sm'>
                              {t('deliveryRoute.map.distanceToNext', {
                                dist: nextStop.distanceFromPreviousKm.toFixed(1)
                              })}
                            </p>
                          )}
                        </div>
                        <div className='absolute inset-0 opacity-10 pointer-events-none'
                          style={{ backgroundImage: 'repeating-linear-gradient(0deg, var(--color-border) 0, var(--color-border) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, var(--color-border) 0, var(--color-border) 1px, transparent 1px, transparent 40px)' }}
                        />
                      </div>
                      <div className='p-5 space-y-4'>
                        <div className='rounded-xl bg-muted p-4'>
                          <p className='mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                            {t('deliveryRoute.map.overview')}
                          </p>
                          <div className='flex justify-between text-sm'>
                            <span className='text-muted-foreground'>{t('deliveryRoute.map.totalDistance')}</span>
                            <span className='font-bold text-foreground'>{totalDistanceLabel}</span>
                          </div>
                          <div className='mt-2 flex justify-between text-sm'>
                            <span className='text-muted-foreground'>{t('deliveryRoute.map.estimatedTime')}</span>
                            <span className='font-bold text-foreground'>{durationLabel}</span>
                          </div>
                        </div>

                        <a
                          id='open-google-maps-btn'
                          href={googleMapsUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/20'
                        >
                          <MaterialIcon name='open_in_new' className='text-[18px]' />
                          {t('deliveryRoute.map.openMaps')}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {proofTarget && (
        <DeliveryProofDialog
          stop={proofTarget}
          onConfirm={handleConfirmDelivered}
          onCancel={() => setProofTarget(null)}
          isSubmitting={isSubmittingProof}
        />
      )}
    </div>
  )
}
