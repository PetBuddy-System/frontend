import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { getShipperSuggestionsApi, assignShipperApi } from '../../services/shipper-assignment/shipper-assignment-api'
import type { ShipperSuggestionResponse } from '~/shared/lib/order'

interface ShipperSuggestionListProps {
  orderId: number
  onAssignSuccess: () => void
}

export function ShipperSuggestionList({ orderId, onAssignSuccess }: ShipperSuggestionListProps) {
  const { t } = useTranslation('staff')
  const [suggestions, setSuggestions] = useState<ShipperSuggestionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [assignError, setAssignError] = useState<string | null>(null)

  const [pendingWarningShipper, setPendingWarningShipper] = useState<ShipperSuggestionResponse | null>(null)

  useEffect(() => {
    async function loadSuggestions() {
      setIsLoading(true)
      setError(null)
      setAssignError(null)
      try {
        const res = await getShipperSuggestionsApi(orderId)
        if (res.success && Array.isArray(res.data)) {
          const shipperOnly = res.data.filter((s) => s.staffTask === 'SHIPPER')
          setSuggestions(shipperOnly)
        } else {
          setError(res.message || t('shipperAssignment.errors.loadSuggestionsFailed'))
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : t('shipperAssignment.errors.unknownError'))
      } finally {
        setIsLoading(false)
      }
    }
    void loadSuggestions()
  }, [orderId, t])

  async function handleAssign(staffId: string) {
    setAssigningId(staffId)
    setAssignError(null)
    try {
      const res = await assignShipperApi(orderId, staffId)
      if (res.success) {
        onAssignSuccess()
      } else {
        setAssignError(res.message || t('shipperAssignment.errors.assignFailed'))
      }
    } catch (err: unknown) {
      setAssignError(err instanceof Error ? err.message : t('shipperAssignment.errors.unknownError'))
    } finally {
      setAssigningId(null)
      setPendingWarningShipper(null)
    }
  }

  function onAssignClick(shipper: ShipperSuggestionResponse) {
    const isFar = (shipper.distanceToClusterKm ?? 0) > 10
    const isOverloaded = shipper.currentLoad >= shipper.maxCapacity
    if (isFar || isOverloaded) {
      setPendingWarningShipper(shipper)
    } else {
      void handleAssign(shipper.staffId)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center gap-3 py-6 px-4 justify-center text-muted-foreground'>
        <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        <span className='text-sm font-medium'>
          {t('shipperAssignment.loadingSuggestions', 'Đang tải gợi ý shipper...')}
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center gap-2 py-4 px-4 text-destructive bg-destructive/10 rounded-xl text-sm'>
        <MaterialIcon name='error' className='shrink-0' />
        <p className='font-semibold'>{error}</p>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className='text-center py-8 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/80'>
        <MaterialIcon name='sentiment_dissatisfied' className='text-3xl mb-1 opacity-55' />
        <p className='text-sm font-semibold'>
          {t('shipperAssignment.noSuggestions', 'Không tìm thấy shipper nào hoạt động trong hôm nay.')}
        </p>
      </div>
    )
  }

  const pendingIsFar = pendingWarningShipper ? (pendingWarningShipper.distanceToClusterKm ?? 0) > 10 : false
  const pendingIsOverloaded = pendingWarningShipper ? pendingWarningShipper.currentLoad >= pendingWarningShipper.maxCapacity : false

  return (
    <div className='mt-3'>
      {assignError && (
        <div className='flex items-center gap-2 py-3 px-4 text-destructive bg-destructive/10 rounded-xl text-sm mb-4 border border-destructive/20'>
          <MaterialIcon name='error_outline' className='shrink-0 text-[18px]' />
          <p className='font-semibold'>{assignError}</p>
        </div>
      )}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {suggestions.map((shipper, index) => {
          const isFirst = index === 0
          const isFar = (shipper.distanceToClusterKm ?? 0) > 10
          const loadPercentage = Math.min(100, (shipper.currentLoad / shipper.maxCapacity) * 100)
          const isFull = shipper.currentLoad >= shipper.maxCapacity
          const hasWarning = isFar || isFull

          return (
            <div
              key={shipper.staffId}
              className={cn(
                'relative flex flex-col justify-between rounded-2xl p-4 bg-background shadow-sm hover:shadow-md transition-all duration-200',
                isFirst
                  ? 'border-2 border-primary ring-2 ring-primary/10 mt-2'
                  : isFull
                  ? 'border border-destructive/60 bg-destructive/5'
                  : isFar
                  ? 'border border-amber-400/80 dark:border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border border-border/70'
              )}
            >
              {isFirst && (
                <div className='absolute -top-3.5 left-4 inline-flex items-center gap-1 bg-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary-foreground shadow-sm uppercase tracking-wider'>
                  <MaterialIcon name='stars' className='text-[12px] shrink-0' />
                  {t('shipperAssignment.recommendedShipper', 'Shipper quản lý khu vực (Đề xuất)')}
                </div>
              )}
              {!isFirst && hasWarning && (
                <div
                  className={cn(
                    'absolute -top-3.5 right-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm uppercase tracking-wider',
                    isFull ? 'bg-destructive' : 'bg-amber-500'
                  )}
                >
                  <MaterialIcon name='warning' className='text-[12px] shrink-0' />
                  {isFull && isFar
                    ? t('shipperAssignment.overAndFarBadge', 'Quá tải & Xa')
                    : isFull
                    ? t('shipperAssignment.overloadedBadge', 'Quá tải')
                    : t('shipperAssignment.farShipperBadge', 'Khoảng cách xa')}
                </div>
              )}
              <div className='space-y-3'>
                <div className='flex items-start justify-between mt-1'>
                  <div>
                    <h4 className='font-bold text-foreground line-clamp-1'>{shipper.staffName}</h4>
                    <p className='text-xs text-muted-foreground'>{shipper.staffEmail}</p>
                  </div>
                  <div className='h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0'>
                    <MaterialIcon name='person' className='text-[18px]' />
                  </div>
                </div>
                <div className='flex items-center gap-2 text-sm font-semibold'>
                  <MaterialIcon name='explore' className={cn('text-[18px]', isFar ? 'text-amber-500' : 'text-teal-500')} />
                  <span className={isFar ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}>
                    {shipper.distanceToClusterKm !== null && shipper.distanceToClusterKm !== undefined
                      ? `${shipper.distanceToClusterKm.toFixed(2)} km`
                      : t('shipperAssignment.unknownDistance', 'Khoảng cách: N/A')}
                  </span>
                </div>

                <div className='space-y-1'>
                  <div className='flex items-center justify-between text-xs font-semibold'>
                    <span className='text-muted-foreground'>
                      {t('shipperAssignment.currentLoadLabel', 'Tải trọng:')}
                    </span>
                    <span className={isFull ? 'text-destructive font-bold' : 'text-primary'}>
                      {shipper.currentLoad} / {shipper.maxCapacity} đơn
                    </span>
                  </div>
                  <div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull ? 'bg-destructive' : 'bg-primary'
                      }`}
                      style={{ width: `${loadPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action button — quá tải vẫn bấm được, sẽ mở popup cảnh báo thay vì bị disable */}
              <button
                type='button'
                onClick={() => onAssignClick(shipper)}
                disabled={assigningId !== null}
                className={cn(
                  'mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
                  isFull
                    ? 'bg-destructive hover:bg-destructive/90 text-white active:scale-95'
                    : isFar
                    ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                    : 'bg-primary hover:bg-primary/95 text-primary-foreground active:scale-95'
                )}
              >
                {assigningId === shipper.staffId ? (
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                ) : (
                  <MaterialIcon name={hasWarning ? 'warning' : 'assignment_ind'} className='text-[16px]' />
                )}
                <span>
                  {isFirst
                    ? t('shipperAssignment.confirmAssignBtn', 'Xác nhận phân công')
                    : t('shipperAssignment.assignBtn', 'Phân công')}
                </span>
              </button>
            </div>
          )
        })}
      </div>

      {/* Warning Modal — dùng chung cho cả cảnh báo khoảng cách xa và quá tải */}
      {pendingWarningShipper && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn'>
          <div className='relative w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border text-center'>
            <div
              className={cn(
                'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
                pendingIsOverloaded
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
              )}
            >
              <MaterialIcon name='warning' className='text-[40px]' />
            </div>
            <h3 className='font-display text-lg font-bold text-foreground'>
              {pendingIsOverloaded && pendingIsFar
                ? t('shipperAssignment.overAndFarWarningTitle', 'Cảnh báo: Shipper quá tải & ở xa')
                : pendingIsOverloaded
                ? t('shipperAssignment.overWarningTitle', 'Cảnh báo shipper đã quá tải')
                : t('shipperAssignment.farWarningTitle', 'Cảnh báo khoảng cách shipper xa')}
            </h3>
            <p className='mt-2 text-sm text-muted-foreground'>
              {pendingIsOverloaded && pendingIsFar
                ? t('shipperAssignment.overAndFarWarningDesc', {
                    name: pendingWarningShipper.staffName,
                    load: pendingWarningShipper.currentLoad,
                    max: pendingWarningShipper.maxCapacity,
                    distance: pendingWarningShipper.distanceToClusterKm?.toFixed(1) ?? 'N/A',
                    defaultValue: `Shipper ${pendingWarningShipper.staffName} đã nhận ${pendingWarningShipper.currentLoad}/${pendingWarningShipper.maxCapacity} đơn (quá tải) và đang ở xa khu vực giao hàng (${pendingWarningShipper.distanceToClusterKm?.toFixed(1)} km). Bạn có chắc chắn muốn phân công không?`
                  })
                : pendingIsOverloaded
                ? t('shipperAssignment.overWarningDesc', {
                    name: pendingWarningShipper.staffName,
                    load: pendingWarningShipper.currentLoad,
                    max: pendingWarningShipper.maxCapacity,
                    defaultValue: `Shipper ${pendingWarningShipper.staffName} đã nhận ${pendingWarningShipper.currentLoad}/${pendingWarningShipper.maxCapacity} đơn, vượt quá tải trọng cho phép. Bạn có chắc chắn muốn phân công thêm không?`
                  })
                : t('shipperAssignment.farWarningDesc', {
                    name: pendingWarningShipper.staffName,
                    distance: pendingWarningShipper.distanceToClusterKm?.toFixed(1) ?? 'N/A',
                    defaultValue: `Shipper ${pendingWarningShipper.staffName} ở vị trí xa khu vực giao hàng (${pendingWarningShipper.distanceToClusterKm?.toFixed(1)} km). Bạn có chắc chắn muốn phân công không?`
                  })}
            </p>
            <div className='mt-6 flex items-center justify-end gap-3'>
              <button
                type='button'
                onClick={() => setPendingWarningShipper(null)}
                className='flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted'
              >
                {t('common.cancel', 'Hủy')}
              </button>
              <button
                type='button'
                onClick={() => void handleAssign(pendingWarningShipper.staffId)}
                className={cn(
                  'flex-1 rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95',
                  pendingIsOverloaded ? 'bg-destructive hover:bg-destructive/90' : 'bg-amber-500 hover:bg-amber-600'
                )}
              >
                {t('shipperAssignment.confirmAssignBtn', 'Xác nhận phân công')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}