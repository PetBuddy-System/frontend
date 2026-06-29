import { useTranslation } from 'react-i18next'

import type { ProductFormData } from './add-product-form'
import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

interface ProductPreviewCardProps {
  product: ProductFormData
  index: number
  onRemove: (id: string) => void
}

const CATEGORY_LABELS: Record<string, { vi: string; en: string }> = {
  toys: { vi: 'Đồ chơi', en: 'Toys' },
  hygiene: { vi: 'Vệ sinh', en: 'Hygiene' },
  supplement: { vi: 'Thực phẩm', en: 'Supplement' },
  accessories: { vi: 'Phụ kiện', en: 'Accessories' },
  dogFood: { vi: 'Thức ăn chó', en: 'Dog food' },
  catFood: { vi: 'Thức ăn mèo', en: 'Cat food' }
}

export function ProductPreviewCard({ product, index, onRemove }: ProductPreviewCardProps) {
  const { t, i18n } = useTranslation('staff')
  const isVietnamese = i18n.language === 'vi'

  const categoryLabel = product.category
    ? CATEGORY_LABELS[product.category]?.[isVietnamese ? 'vi' : 'en'] || product.category
    : null

  function formatPrice(price: string) {
    if (!price) return null
    const num = parseInt(price.replace(/[^0-9]/g, ''), 10)
    return num.toLocaleString('vi-VN')
  }

  return (
    <div className={cn(
      'group relative rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:border-primary/40 hover:shadow-md sm:p-4'
    )}>
      {/* Remove Button - Always visible on mobile, hover on desktop */}
      <button
        type='button'
        onClick={() => onRemove(product.id)}
        aria-label={t('addProduct.preview.remove')}
        className={cn(
          'absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm',
          'transition-all hover:bg-destructive/90 active:scale-110',
          'sm:absolute sm:-right-2 sm:-top-2 sm:h-7 sm:w-7',
          'focus:outline-none focus:ring-2 focus:ring-ring'
        )}
      >
        <MaterialIcon name='close' className='text-xs sm:text-sm' />
      </button>

      {/* Index Badge */}
      <div className='mb-2 flex items-center gap-2'>
        <span className='flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary sm:h-6 sm:w-6'>
          {index + 1}
        </span>
        <span className='text-xs text-muted-foreground sm:text-sm'>
          {t('addProduct.preview.indexLabel')}
        </span>
      </div>

      {/* Product Info */}
      <div className='space-y-1.5 sm:space-y-2'>
        <h4 className='pr-6 font-semibold text-foreground line-clamp-1 sm:pr-8'>
          {product.name || t('addProduct.preview.noName')}
        </h4>

        {/* Tags Row */}
        <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
          {categoryLabel && (
            <span className='rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary'>
              {categoryLabel}
            </span>
          )}
          {product.supplier && (
            <span className='rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
              {product.supplier}
            </span>
          )}
        </div>

        {/* Price & Stock */}
        <div className='flex items-center justify-between pt-1'>
          {product.price ? (
            <span className='font-mono text-base font-bold text-primary sm:text-lg'>
              {formatPrice(product.price)}đ
            </span>
          ) : (
            <span className='text-xs text-muted-foreground sm:text-sm'>
              {t('addProduct.preview.noPrice')}
            </span>
          )}
          {product.stock && (
            <span className='text-xs text-muted-foreground sm:text-sm'>
              {t('addProduct.preview.stock')}: {product.stock}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
