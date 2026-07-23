// app/features/manager/components/restock/restock-detail-dialog.tsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { restockApi, type RestockInfoResponse, type RestockRequest } from '../../services/restock/restock-api'

interface RestockDetailDialogProps {
  returnRequestId: number
  onClose: () => void
  onSuccess: () => void
  isViewOnly?: boolean
}

function formatDate(dateString?: string | null) {
  if (!dateString) return '—'
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return dateString
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${min} ${dd}/${mm}/${yyyy}`
}

export function RestockDetailDialog({
  returnRequestId,
  onClose,
  onSuccess,
  isViewOnly = false
}: RestockDetailDialogProps) {
  const { t } = useTranslation('manager')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [restockInfo, setRestockInfo] = useState<RestockInfoResponse | null>(null)
  const [restockData, setRestockData] = useState<RestockRequest>({ items: [] })

  useEffect(() => {
    async function loadRestockInfo() {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        const data = await restockApi.getRestockInfo(returnRequestId)
        console.log('🔍 Restock Info Data:', JSON.stringify(data, null, 2))

        // ✅ Lọc duplicate batches theo batchId
        const uniqueItems = data.items.map((item) => ({
          ...item,
          batches: item.batches.filter(
            (batch, index, self) => index === self.findIndex((b) => b.batchId === batch.batchId)
          )
        }))

        const cleanedData = { ...data, items: uniqueItems }
        setRestockInfo(cleanedData)

        // ✅ Chỉ tạo restockData cho các batch chưa được restock
        const items = cleanedData.items.map((item) => ({
          orderDetailId: item.orderDetailId,
          batches: item.batches
            .filter((batch) => batch.restockQuantity === 0) // Chỉ lấy batch chưa nhập
            .map((batch) => ({
              batchId: batch.batchId,
              restockQuantity: batch.availableToRestock
            }))
        }))
        setRestockData({ items })
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : t('restock.errors.loadFailed'))
      } finally {
        setIsLoading(false)
      }
    }
    void loadRestockInfo()
  }, [returnRequestId, t])

  function handleQuantityChange(itemIndex: number, batchIndex: number, value: number) {
    if (isViewOnly) return
    const newData = { ...restockData }
    newData.items[itemIndex].batches[batchIndex].restockQuantity = value
    setRestockData(newData)
  }

  async function handleSubmitRestock() {
    if (isViewOnly) return
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await restockApi.restock(returnRequestId, restockData)
      onSuccess()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t('restock.errors.submitFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function getTotalRestockedQuantity() {
    if (!restockInfo) return 0
    let total = 0
    restockInfo.items.forEach((item) => {
      item.batches.forEach((batch) => {
        total += batch.restockQuantity
      })
    })
    return total
  }

  function getTotalSelectedQuantity() {
    if (!restockData) return 0
    let total = 0
    restockData.items.forEach((item) => {
      item.batches.forEach((batch) => {
        total += batch.restockQuantity
      })
    })
    return total
  }

  function getUniqueProductCount() {
    if (!restockInfo) return 0
    return restockInfo.items.length
  }

  function isRestocked() {
    if (!restockInfo) return false
    for (const item of restockInfo.items) {
      for (const batch of item.batches) {
        if (batch.restockQuantity > 0) return true
      }
    }
    return false
  }

  if (isLoading) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
        <div className='rounded-2xl border border-border bg-card p-8 shadow-2xl'>
          <div className='flex flex-col items-center gap-4'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
            <p className='text-muted-foreground'>{t('restock.detail.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!restockInfo) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
        <div className='rounded-2xl border border-border bg-card p-8 shadow-2xl max-w-md w-full'>
          <div className='text-center'>
            <MaterialIcon name='error' className='text-5xl text-destructive mx-auto mb-4' />
            <p className='text-foreground font-semibold'>{t('restock.detail.loadFailed')}</p>
            <button
              type='button'
              onClick={onClose}
              className='mt-4 rounded-xl bg-primary px-6 py-2 text-white font-bold'
            >
              {t('restock.detail.close')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hasRestocked = isRestocked()
  const isViewMode = isViewOnly || hasRestocked
  const totalRestocked = getTotalRestockedQuantity()
  const totalSelected = getTotalSelectedQuantity()

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200'>
      <div className='flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border px-6 py-4'>
          <div className='flex items-center gap-3'>
            <span className='rounded-lg bg-primary/10 p-2 text-primary'>
              <MaterialIcon name='inventory_2' className='text-xl' />
            </span>
            <div>
              <h3 className='font-display text-lg font-bold text-card-foreground'>
                {isViewMode ? t('restock.detail.title.view') : t('restock.detail.title.restock')} #{restockInfo.returnCode}
              </h3>
              <p className='text-xs text-muted-foreground'>
                {t('restock.detail.requestCode')}: #{restockInfo.returnCode}
                {hasRestocked && (
                  <span className='ml-2 inline-flex items-center gap-1 text-emerald-600'>
                    <MaterialIcon name='check_circle' className='text-sm' />
                    {t('restock.detail.status.restocked')}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
          >
            <MaterialIcon name='close' className='text-xl' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6 space-y-6'>
          {errorMessage && (
            <div className='rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive flex items-center gap-2'>
              <MaterialIcon name='error' className='text-lg' />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Danh sách sản phẩm */}
          <div className='space-y-4'>
            <h4 className='text-sm font-bold text-card-foreground border-b border-border pb-2'>
              {t('restock.detail.productList')}
            </h4>

            {restockInfo.items.map((item, itemIndex) => (
              <div key={item.orderDetailId} className='rounded-xl border border-border bg-card p-4 space-y-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='font-semibold text-card-foreground'>{item.productName}</p>
                    <p className='text-xs text-muted-foreground'>{t('restock.detail.id')}: #{item.orderDetailId}</p>
                  </div>
                </div>

                {/* Batches */}
                <div className='space-y-2'>
                  <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                    {t('restock.detail.batches')}:
                  </p>
                  {item.batches.map((batch, batchIndex) => {
                    const selectedQuantity = restockData.items[itemIndex]?.batches[batchIndex]?.restockQuantity || 0
                    const isRestockedBatch = batch.restockQuantity > 0

                    return (
                      <div key={batch.batchId} className='grid grid-cols-4 gap-3 rounded-lg bg-muted/20 p-3'>
                        <div className='col-span-1'>
                          <p className='text-xs text-muted-foreground'>{t('restock.detail.batchCode')}</p>
                          <p className='font-semibold text-foreground'>{batch.batchCode}</p>
                        </div>
                        <div className='col-span-1'>
                          <p className='text-xs text-muted-foreground'>
                            {isViewMode ? t('restock.detail.restocked') : t('restock.detail.availableToRestock')}
                          </p>
                          <p className={cn('font-semibold', isViewMode ? 'text-primary' : 'text-emerald-600')}>
                            {isViewMode ? batch.restockQuantity : batch.availableToRestock}
                          </p>
                        </div>
                        <div className='col-span-1'>
                          <label className='text-xs text-muted-foreground block'>
                            {isViewMode ? t('restock.detail.quantityRestocked') : t('restock.detail.quantityToRestock')}
                          </label>
                          {isViewMode ? (
                            <p className='font-bold text-primary text-lg'>{batch.restockQuantity}</p>
                          ) : (
                            <input
                              type='number'
                              min={0}
                              max={batch.availableToRestock}
                              value={selectedQuantity}
                              onChange={(e) => handleQuantityChange(itemIndex, batchIndex, Number(e.target.value))}
                              className='w-full rounded-lg border border-border bg-card px-2 py-1 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none'
                              disabled={isRestockedBatch}
                            />
                          )}
                        </div>
                        {/* ✅ Cột hiển thị người nhập và thời gian */}
                        <div className='col-span-1'>
                          {isViewMode && isRestockedBatch && (
                            <div>
                              <p className='text-xs text-muted-foreground'>{t('restock.detail.restockedBy')}</p>
                              <p className='font-semibold text-foreground text-sm'>{batch.restockedBy || '—'}</p>
                              <p className='text-xs text-muted-foreground mt-1'>{formatDate(batch.restockedAt)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Tổng kết */}
          <div className='rounded-xl border border-border bg-muted/10 p-4 space-y-2'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>
                {isViewMode ? t('restock.detail.totalRestocked') : t('restock.detail.totalToRestock')}
              </span>
              <strong className='text-primary text-lg'>{isViewMode ? totalRestocked : totalSelected}</strong>
            </div>
            {isViewMode && (
              <div className='flex justify-between border-t border-border pt-2 text-xs text-muted-foreground'>
                <span>
                  {t('restock.detail.restockedBy')}: {restockInfo.items[0]?.batches[0]?.restockedBy || '—'}
                </span>
                <span>
                  {t('restock.detail.restockedAt')}: {formatDate(restockInfo.items[0]?.batches[0]?.restockedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-muted/10'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-card-foreground hover:bg-muted transition-colors active:scale-95'
          >
            {t('restock.detail.close')}
          </button>
          {!isViewMode && (
            <button
              type='button'
              onClick={handleSubmitRestock}
              disabled={isSubmitting}
              className='inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all'
            >
              {isSubmitting ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  {t('restock.detail.processing')}
                </>
              ) : (
                <>
                  <MaterialIcon name='check_circle' className='text-lg' />
                  {t('restock.detail.confirmRestock')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}