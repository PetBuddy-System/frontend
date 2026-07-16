// app/features/staff/components/orders/delivery-route-dialog.tsx
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { suggestDeliveryRouteApi } from '../../../manager/services/shipper-assignment/shipper-assignment-api'
import type { DeliveryStopResponse } from '~/shared/lib/order'

interface DeliveryRouteDialogProps {
  staffId: string
  isOpen: boolean
  onClose: () => void
}

export function DeliveryRouteDialog({
  staffId,
  isOpen,
  onClose
}: DeliveryRouteDialogProps) {
  const { t } = useTranslation('profile')
  const [stops, setStops] = useState<DeliveryStopResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRoute = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await suggestDeliveryRouteApi(staffId)
      if (res.success && Array.isArray(res.data)) {
        setStops(res.data)
      } else {
        setError(res.message || t('orderDetail.unexpectedError', 'Không thể tải đề xuất tuyến đường.'))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('orderDetail.unexpectedError', 'Có lỗi xảy ra.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && staffId) {
      void loadRoute()
    }
  }, [isOpen, staffId])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in'>
      <div className='bg-card rounded-2xl w-full max-w-lg overflow-hidden border border-border shadow-xl flex flex-col scale-in max-h-[90vh]'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border px-6 py-4 shrink-0 bg-card'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <MaterialIcon name='alt_route' className='text-[22px]' />
            </div>
            <div>
              <h3 className='font-bold text-foreground'>{t('orderDetail.routeModalTitle', 'Đề xuất Tuyến đường Giao hàng')}</h3>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors'
          >
            <MaterialIcon name='close' className='text-[20px]' />
          </button>
        </div>

        {/* Body */}
        <div className='p-6 overflow-y-auto space-y-6 flex-1 min-h-[250px]'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground'>
              <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
              <span className='text-sm font-medium'>Đang tính toán tuyến đường tối ưu...</span>
            </div>
          ) : error ? (
            <div className='space-y-4 py-8 text-center'>
              <div className='flex items-center gap-2 py-4 px-4 text-destructive bg-destructive/10 rounded-xl text-sm justify-center max-w-md mx-auto'>
                <MaterialIcon name='error' className='shrink-0' />
                <p className='font-semibold'>{error}</p>
              </div>
              <button
                type='button'
                onClick={() => void loadRoute()}
                className='px-4 py-2 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:opacity-95 transition-opacity active:scale-95 shadow-sm inline-flex items-center gap-1.5'
              >
                <MaterialIcon name='refresh' className='text-[18px]' />
                <span>Thử lại</span>
              </button>
            </div>
          ) : stops.length === 0 ? (
            <div className='text-center py-12 text-muted-foreground space-y-2'>
              <MaterialIcon name='emoji_transportation' className='text-4xl text-muted-foreground/50 animate-pulse' />
              <p className='text-sm font-semibold'>{t('orderDetail.noActiveDeliveryOrders', 'Không có đơn hàng nào đang giao (SHIPPING) cần đề xuất tuyến đường.')}</p>
            </div>
          ) : (
            <div className='relative pl-8 border-l border-border/80 ml-4 space-y-6 py-2'>
              {stops.map((stop) => {
                const isFirst = stop.sequence === 1
                const distText = isFirst
                  ? t('orderDetail.distanceFromStore', { distance: stop.distanceFromPreviousKm.toFixed(2) })
                  : t('orderDetail.distanceFromPrev', { distance: stop.distanceFromPreviousKm.toFixed(2) })

                return (
                  <div key={stop.orderId} className='relative group'>
                    {/* Circle sequence marker */}
                    <div className='absolute -left-[45px] top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-sm shadow-md border-2 border-background ring-2 ring-primary/20 transition-transform group-hover:scale-105'>
                      {stop.sequence}
                    </div>

                    <div className='bg-muted/30 border border-border hover:border-primary/40 rounded-xl p-4 transition-colors space-y-3'>
                      <div className='flex items-start justify-between flex-wrap gap-2'>
                        <div>
                          <span className='inline-flex items-center gap-1 text-xs font-bold text-primary mb-1 uppercase tracking-wider'>
                            {t('orderDetail.routeStop', { seq: stop.sequence })}
                          </span>
                          <h4 className='font-bold text-foreground text-sm flex items-center gap-1.5'>
                            <span>{stop.recipientName}</span>
                            <span className='text-xs text-muted-foreground font-normal'>({stop.phoneNumber})</span>
                          </h4>
                        </div>
                        <span className='text-xs font-bold text-foreground bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20 shrink-0'>
                          #{stop.orderCode}
                        </span>
                      </div>

                      <div className='space-y-1.5 text-xs text-muted-foreground'>
                        <div className='flex items-start gap-1.5'>
                          <MaterialIcon name='location_on' className='text-[16px] text-primary shrink-0 mt-0.5' />
                          <span className='leading-relaxed'>{stop.address}</span>
                        </div>
                        <div className='flex items-center gap-1.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400 mt-1 bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded w-fit'>
                          <MaterialIcon name='navigation' className='text-[12px] rotate-45 shrink-0' />
                          <span>{distText}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-2 border-t border-border px-6 py-4 bg-muted/10 shrink-0'>
          <button
            type='button'
            onClick={onClose}
            className='px-5 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-95 transition-opacity active:scale-95 shadow-sm'
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
