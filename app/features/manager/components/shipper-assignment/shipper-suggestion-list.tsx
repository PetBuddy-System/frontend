import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { getShipperSuggestionsApi, assignShipperApi } from '../../services/shipper-assignment/shipper-assignment-api'
import type { ShipperSuggestionResponse } from '~/shared/lib/order'

interface ShipperSuggestionListProps {
  orderId: number
  onAssignSuccess: () => void
}

export function ShipperSuggestionList({ orderId, onAssignSuccess }: ShipperSuggestionListProps) {
  const { t } = useTranslation('manager')
  const [suggestions, setSuggestions] = useState<ShipperSuggestionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [assignError, setAssignError] = useState<string | null>(null)

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
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center gap-3 py-6 px-4 justify-center text-muted-foreground'>
        <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        <span className='text-sm font-medium'>{t('shipperAssignment.loadingSuggestions', 'Đang tải gợi ý shipper...')}</span>
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
        <p className='text-sm font-semibold'>{t('shipperAssignment.noSuggestions', 'Không tìm thấy shipper nào hoạt động trong hôm nay.')}</p>
      </div>
    )
  }

  return (
    <div className='mt-3'>
      {assignError && (
        <div className='flex items-center gap-2 py-3 px-4 text-destructive bg-destructive/10 rounded-xl text-sm mb-4 border border-destructive/20'>
          <MaterialIcon name='error_outline' className='shrink-0 text-[18px]' />
          <p className='font-semibold'>{assignError}</p>
        </div>
      )}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {suggestions.map((shipper) => {
          const loadPercentage = Math.min(100, (shipper.currentLoad / shipper.maxCapacity) * 100)
          const isFull = shipper.currentLoad >= shipper.maxCapacity

          return (
            <div
              key={shipper.staffId}
              className='flex flex-col justify-between border border-border/70 rounded-2xl p-4 bg-background shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='space-y-3'>
                <div className='flex items-start justify-between'>
                  <div>
                    <h4 className='font-bold text-foreground line-clamp-1'>{shipper.staffName}</h4>
                    <p className='text-xs text-muted-foreground'>Email: {shipper.staffEmail}</p>
                  </div>
                  <div className='h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center'>
                    <MaterialIcon name='person' className='text-[18px]' />
                  </div>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground font-medium'>
                  <MaterialIcon name='explore' className='text-[18px] text-teal-500' />
                  <span>
                    {shipper.distanceToClusterKm !== null && shipper.distanceToClusterKm !== undefined
                      ? `${shipper.distanceToClusterKm.toFixed(2)} km`
                      : t('shipperAssignment.unknownDistance', 'Khoảng cách: N/A')}
                  </span>
                </div>

                <div className='space-y-1'>
                  <div className='flex items-center justify-between text-xs font-semibold'>
                    <span className='text-muted-foreground'>{t('shipperAssignment.currentLoadLabel', 'Tải trọng:')}</span>
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

              {/* Action button */}
              <button
                type='button'
                onClick={() => void handleAssign(shipper.staffId)}
                disabled={assigningId !== null || isFull}
                className={`mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isFull
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/95 text-primary-foreground active:scale-95'
                }`}
              >
                {assigningId === shipper.staffId ? (
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                ) : (
                  <MaterialIcon name='assignment_ind' className='text-[16px]' />
                )}
                <span>{t('shipperAssignment.assignBtn', 'Phân công')}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
