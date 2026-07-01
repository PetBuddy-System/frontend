import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { promotionApi, type Promotion } from '../../services/promotion/promotion-api'
import { MaterialIcon } from '~/shared/ui'

interface ManagerPromotionDetailDialogProps {
  promotionId: string | null
  onClose: () => void
}

export function ManagerPromotionDetailDialog({
  promotionId,
  onClose
}: ManagerPromotionDetailDialogProps) {
  const { t } = useTranslation('manager')
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!promotionId) return

    let active = true
    const currentPromotionId = promotionId

    async function loadPromotion() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await promotionApi.getPromotion(currentPromotionId)
        if (active) {
          setPromotion(data)
        }
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Không thể tải chi tiết khuyến mãi')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadPromotion()

    return () => {
      active = false
    }
  }, [promotionId])

  if (!promotionId) return null

  const formatDate = (value?: string) => {
    if (!value) return 'N/A'
    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) return value
    return parsedDate.toLocaleDateString('vi-VN')
  }

  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success/10 text-success border border-success/20'
      case 'DRAFT':
        return 'bg-warning/10 text-warning border border-warning/20'
      case 'EXPIRED':
        return 'bg-destructive/10 text-destructive border border-destructive/20'
      case 'CANCELLED':
        return 'bg-muted-foreground/15 text-muted-foreground border border-muted-foreground/20'
      case 'DELETED':
        return 'bg-destructive/15 text-destructive/80 border border-destructive/20'
      default:
        return 'bg-muted-foreground/10 text-muted-foreground'
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto'>
      <button
        type='button'
        aria-label='Close'
        className='absolute inset-0 bg-foreground/45 backdrop-blur-sm'
        onClick={onClose}
      />

      <section className='relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all'>
        <header className='flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4 shrink-0'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>Xem chi tiết chương trình</p>
            <h2 className='mt-1 font-display text-xl font-bold text-card-foreground'>
              {promotion?.name || 'Khuyến mãi'}
            </h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
          >
            <MaterialIcon name='close' className='text-xl' />
          </button>
        </header>

        <div className='flex-1 overflow-y-auto p-6 space-y-6'>
          {isLoading && (
            <div className='flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground'>
              <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
              <span className='text-sm font-semibold'>Đang tải thông tin chi tiết...</span>
            </div>
          )}
          {error && <p className='text-sm font-medium text-destructive'>{error}</p>}
          {promotion && !isLoading && !error && (
            <>
              {/* Basic Info */}
              <div className='grid gap-4 sm:grid-cols-2 rounded-xl border border-border bg-muted/20 p-4'>
                <div>
                  <h3 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Thời gian diễn ra</h3>
                  <p className='text-sm font-medium text-foreground mt-1'>
                    {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                  </p>
                </div>
                <div>
                  <h3 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Trạng thái</h3>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide mt-1 ${getStatusClass(promotion.status)}`}>
                    {promotion.status}
                  </span>
                </div>
                <div className='sm:col-span-2'>
                  <h3 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Mô tả chương trình</h3>
                  <p className='whitespace-pre-line text-sm leading-6 text-foreground mt-1'>
                    {promotion.description || 'Không có mô tả'}
                  </p>
                </div>
              </div>

              {/* Products Table */}
              <div className='space-y-3'>
                <h3 className='font-display text-lg font-bold text-foreground'>
                  Sản phẩm áp dụng khuyến mãi ({promotion.promotionDetails?.length || 0})
                </h3>
                <div className='overflow-auto rounded-xl border border-border'>
                  <table className='w-full min-w-[700px] border-collapse text-left text-sm'>
                    <thead>
                      <tr className='border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                        <th className='px-4 py-3'>Mã sản phẩm</th>
                        <th className='px-4 py-3'>Tên sản phẩm</th>
                        <th className='px-4 py-3 text-right'>Giá gốc</th>
                        <th className='px-4 py-3 text-center'>Mức giảm</th>
                        <th className='px-4 py-3 text-right'>Số tiền giảm</th>
                        <th className='px-4 py-3 text-right font-bold text-primary'>Giá khuyến mãi</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-border'>
                      {!promotion.promotionDetails || promotion.promotionDetails.length === 0 ? (
                        <tr>
                          <td colSpan={6} className='px-4 py-8 text-center text-muted-foreground'>
                            Không có sản phẩm nào được áp dụng trong chương trình này.
                          </td>
                        </tr>
                      ) : (
                        promotion.promotionDetails.map((detail) => (
                          <tr key={detail.promotionDetailId} className='hover:bg-muted/40 transition-colors'>
                            <td className='px-4 py-3 font-mono font-semibold text-primary'>
                              {detail.productCode}
                            </td>
                            <td className='px-4 py-3 font-medium text-foreground'>
                              {detail.productName}
                            </td>
                            <td className='px-4 py-3 text-right font-semibold text-foreground'>
                              {detail.price.toLocaleString('vi-VN')} đ
                            </td>
                            <td className='px-4 py-3 text-center font-bold text-success'>
                              {detail.discountType === 'PERCENTAGE' 
                                ? `${detail.discountValue}%` 
                                : `${detail.discountValue.toLocaleString('vi-VN')} đ`
                              }
                            </td>
                            <td className='px-4 py-3 text-right font-semibold text-destructive'>
                              -{detail.discountAmount.toLocaleString('vi-VN')} đ
                            </td>
                            <td className='px-4 py-3 text-right font-bold text-primary'>
                              {detail.salePrice.toLocaleString('vi-VN')} đ
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        <footer className='flex items-center justify-end border-t border-border bg-muted/30 px-6 py-4 shrink-0'>
          <button
            type='button'
            onClick={onClose}
            className='h-10 rounded-xl border border-border bg-card px-5 text-sm font-bold text-foreground hover:bg-muted transition-colors'
          >
            Đóng
          </button>
        </footer>
      </section>
    </div>
  )
}
