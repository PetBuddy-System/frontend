/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  fetchMyReturnsApi,
  cancelReturnRequestApi,
  fetchReturnDetailApi
} from '~/features/profile/services'
import type { ReturnRequestResponse } from '~/shared/lib/returns'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

import { ReturnCancelDialog } from './return-cancel-dialog'
import { ReturnItemsSection } from './return-items-section'
import { ReturnMediaGallery } from './return-media-gallery'
import { ReturnProcessingSection } from './return-processing-section'
import { ReturnRefundSection } from './return-refund-section'
import { ReturnStatusBadge } from './return-status-badge'
import {
  formatPrice,
  formatReturnDateTime,
  isReturnCancellable
} from './lib/return-labels'

export function ReturnHistoryList() {
  const { t } = useTranslation('returns')

  const [returns, setReturns] = useState<ReturnRequestResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [detailData, setDetailData] = useState<Record<number, ReturnRequestResponse>>({})
  const [isLoadingDetail, setIsLoadingDetail] = useState<number | null>(null)

  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)

  async function loadReturns() {
    setIsLoading(true)
    try {
      const res = await fetchMyReturnsApi({ page: 0, size: 100 })
      if (res.success && res.data) {
        setReturns(res.data.content)
      }
    } catch (err) {
      console.error('Failed to load return requests', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadReturns()
  }, [])

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }

    if (!detailData[id]) {
      setIsLoadingDetail(id)
      try {
        const res = await fetchReturnDetailApi(id)
        if (res.success && res.data) {
          setDetailData(prev => ({ ...prev, [id]: res.data }))
        }
      } catch (err) {
        console.error('Failed to load return detail', err)
      } finally {
        setIsLoadingDetail(null)
      }
    }

    setExpandedId(id)
  }

  async function handleCancelRequest(returnId: number) {
    setIsCanceling(true)
    try {
      const res = await cancelReturnRequestApi(returnId)
      if (res.success) {
        setConfirmCancelId(null)
        void loadReturns()
        setDetailData(prev => {
          const next = { ...prev }
          delete next[returnId]
          return next
        })
      } else {
        alert(res.message || t('cancel.error.generic'))
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : t('cancel.error.system'))
    } finally {
      setIsCanceling(false)
    }
  }

  const getDetailData = (id: number) => {
    return detailData[id] || returns.find(r => r.returnRequestId === id)
  }

  if (isLoading) {
    return (
      <div className='rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground animate-pulse'>
        {t('list.loading')}
      </div>
    )
  }

  if (returns.length === 0) {
    return (
      <div className='rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground'>
        {t('list.empty')}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {returns.map((req) => {
        const isExpanded = expandedId === req.returnRequestId
        const canCancel = isReturnCancellable(req.status)
        const isLoadingThis = isLoadingDetail === req.returnRequestId
        const detail = getDetailData(req.returnRequestId)
        const mediaFiles = detail?.mediaFiles || req.mediaFiles || []

        return (
          <div
            key={req.returnRequestId}
            className='rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md'
          >
            <ReturnCardHeader
              request={req}
              isExpanded={isExpanded}
              onToggle={() => void toggleExpand(req.returnRequestId)}
            />

            {isExpanded ? (
              <div className='border-t border-border bg-muted/10 p-5 space-y-5 animate-in slide-in-from-top-1 duration-200'>
                {isLoadingThis ? (
                  <div className='text-center text-muted-foreground py-8 animate-pulse'>
                    {t('list.header.loadingDetail')}
                  </div>
                ) : detail ? (
                  <>
                    <ReturnReasonBlock detail={detail} />
                    {detail.type === 'RETURN' ? <ReturnRefundSection detail={detail} /> : null}
                    <ReturnItemsSection detail={detail} />
                    <ReturnMediaGallery mediaFiles={mediaFiles} />
                    <ReturnProcessingSection detail={detail} />
                    {canCancel ? (
                      <div className='flex justify-end pt-2'>
                        <button
                          type='button'
                          onClick={() => setConfirmCancelId(req.returnRequestId)}
                          className='flex items-center gap-1.5 rounded-lg border border-destructive bg-destructive/5 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive hover:text-white active:scale-95 transition-all duration-150'
                        >
                          <MaterialIcon name='cancel' className='text-sm' />
                          {t('list.detail.actions.cancel')}
                        </button>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        )
      })}

      <ReturnCancelDialog
        open={confirmCancelId !== null}
        isSubmitting={isCanceling}
        onClose={() => setConfirmCancelId(null)}
        onConfirm={() => {
          if (confirmCancelId !== null) void handleCancelRequest(confirmCancelId)
        }}
      />
    </div>
  )
}

interface ReturnCardHeaderProps {
  request: ReturnRequestResponse
  isExpanded: boolean
  onToggle: () => void
}

function ReturnCardHeader({ request, isExpanded, onToggle }: ReturnCardHeaderProps) {
  const { t } = useTranslation('returns')
  const typeLabel = t(`type.${request.type}`, { defaultValue: request.type })

  return (
    <div
      onClick={onToggle}
      className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer bg-card hover:bg-muted/30 transition-colors'
    >
      <div className='space-y-1.5 min-w-0'>
        <div className='flex flex-wrap items-center gap-2.5'>
          <span className='font-display font-bold text-foreground'>#{request.returnCode}</span>
          <span className='text-xs text-muted-foreground'>
            {t('list.header.orderRef', { orderCode: request.orderCode })}
          </span>
          <ReturnStatusBadge status={request.status} />
        </div>
        <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
          <span>
            {t('list.header.type')} <strong className='text-foreground'>{typeLabel}</strong>
          </span>
          <span>
            {t('list.header.createdAt')} {formatReturnDateTime(request.createdAt)}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-4 shrink-0 justify-between sm:justify-end'>
        {request.type === 'RETURN' ? (
          <div className='text-left sm:text-right'>
            <p className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground'>
              {t('list.header.expectedRefund')}
            </p>
            <p className='text-lg font-extrabold text-primary'>{formatPrice(request.refundAmount)}</p>
          </div>
        ) : null}
        <MaterialIcon
          name='expand_more'
          className={cn(
            'text-2xl text-muted-foreground transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </div>
    </div>
  )
}

interface ReturnReasonBlockProps {
  detail: ReturnRequestResponse
}

function ReturnReasonBlock({ detail }: ReturnReasonBlockProps) {
  const { t } = useTranslation('returns')
  const reasonLabel = t(`reason.${detail.reason}`, { defaultValue: detail.reason })

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <div>
        <h5 className='text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1'>
          {t('list.detail.reason')}
        </h5>
        <p className='text-sm text-foreground font-semibold'>{reasonLabel}</p>
      </div>
      {detail.description ? (
        <div>
          <h5 className='text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1'>
            {t('list.detail.description')}
          </h5>
          <p className='text-sm text-foreground whitespace-pre-line bg-muted/40 p-3 rounded-lg border border-border'>
            {detail.description}
          </p>
        </div>
      ) : null}
    </div>
  )
}