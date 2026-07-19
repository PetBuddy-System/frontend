// app/features/manager/components/products/manager-product-info-card.tsx

import { useTranslation } from 'react-i18next'
import type { ProductDetailData } from '~/shared/lib/product'
import { MaterialIcon } from '~/shared/ui'

export interface ManagerProductInfoCardProps {
  product: ProductDetailData
  formatDate: (dateStr: string) => string
}

export function ManagerProductInfoCard({
  product,
  formatDate
}: ManagerProductInfoCardProps) {
  const { t } = useTranslation('manager')

  // ✅ Lấy unit label từ translation
  const unitLabel = product.unit ? t(`unit.${product.unit}`, product.unit.toLowerCase()) : ''

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return t('productManagement.detail.statusUnknown')
    switch (status) {
      case 'ACTIVE':
        return t('productManagement.detail.statusActive')
      case 'INACTIVE':
        return t('productManagement.detail.statusInactive')
      case 'DELETED':
        return t('productManagement.detail.statusDeleted')
      default:
        return status
    }
  }

  const formatDateSafe = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A'
    return formatDate(dateStr)
  }

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '0'
    }
    return price.toLocaleString('en-US')
  }

  const displayPrice = product.salePrice ?? product.price ?? 0

  return (
    <div className='bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between'>
      {/* Left Column: Properties Grid */}
      <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8'>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>
            {t('productManagement.detail.productCode')}
          </span>
          <span className='text-base font-bold text-foreground block'>{product.productCode || product.productId}</span>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>
            {t('productManagement.detail.productName')}
          </span>
          <span className='text-base font-bold text-foreground block'>{product.name}</span>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>
            {t('productManagement.detail.status')}
          </span>
          <div className='flex items-center gap-1.5 mt-0.5'>
            <span className={`w-2 h-2 rounded-full ${product.status === 'ACTIVE' ? 'bg-success' : product.status === 'DELETED' ? 'bg-destructive' : 'bg-muted-foreground'}`}></span>
            <span className={`text-sm font-semibold ${product.status === 'ACTIVE' ? 'text-success' : product.status === 'DELETED' ? 'text-destructive' : 'text-muted-foreground'}`}>
              {getStatusLabel(product.status)}
            </span>
          </div>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>
            {t('productManagement.detail.category')}
          </span>
          <span className='text-sm font-semibold text-muted-foreground block'>{product.categoryName || 'N/A'}</span>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>
            {t('productManagement.detail.brand')}
          </span>
          <div className='mt-0.5'>
            <span className='bg-secondary/15 text-secondary-foreground text-xs font-semibold px-2 py-0.5 rounded'>
              {product.brandName || 'N/A'}
            </span>
          </div>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>
            {t('productManagement.detail.salePrice')}
          </span>
          <div className='flex items-baseline gap-1 mt-0.5'>
            <span className='text-base font-bold text-primary'>
              {formatPrice(displayPrice)} VNĐ
            </span>
            {unitLabel && (
              <span className='text-sm font-semibold text-muted-foreground'>
                /{unitLabel}
              </span>
            )}
          </div>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>
            {t('productManagement.detail.totalStock')}
          </span>
          <div className='flex items-baseline gap-1 mt-0.5'>
            <span className='text-base font-bold text-foreground'>{product.totalStock ?? 0}</span>
            {unitLabel && (
              <span className='text-sm font-semibold text-muted-foreground'>
                {unitLabel}
              </span>
            )}
          </div>
        </div>
        <div>
          <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>
            {t('productManagement.detail.totalBatches')}
          </span>
          <span className='text-base font-bold text-foreground block mt-0.5'>{product.batchCount ?? 0}</span>
        </div>
      </div>

      {/* Right Column: Date Card */}
      <div className='w-full md:w-64 shrink-0 bg-muted/30 border border-border/60 rounded-xl p-4 flex flex-col gap-4 self-start'>
        <div className='flex items-start gap-3'>
          <MaterialIcon name='calendar_month' className='text-muted-foreground text-xl mt-0.5' />
          <div>
            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block'>
              {t('productManagement.detail.createdAt')}
            </span>
            <span className='text-sm font-semibold text-muted-foreground block'>{formatDateSafe(product.createdAt)}</span>
          </div>
        </div>
        <div className='flex items-start gap-3 border-t border-border/50 pt-3'>
          <MaterialIcon name='history' className='text-muted-foreground text-xl mt-0.5' />
          <div>
            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block'>
              {t('productManagement.detail.updatedAt')}
            </span>
            <span className='text-sm font-semibold text-muted-foreground block'>{formatDateSafe(product.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}