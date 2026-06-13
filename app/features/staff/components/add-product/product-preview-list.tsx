import { useTranslation } from 'react-i18next'

import type { ProductFormData } from './add-product-form'
import { ProductPreviewCard } from './product-preview-card'
import { MaterialIcon } from '~/shared/ui'

interface ProductPreviewListProps {
  products: ProductFormData[]
  onRemove: (id: string) => void
}

export function ProductPreviewList({ products, onRemove }: ProductPreviewListProps) {
  const { t } = useTranslation('staff')

  if (products.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-6 text-center sm:p-8'>
        <MaterialIcon name='inventory_2' className='mb-2 text-4xl text-muted-foreground/50 sm:mb-3 sm:text-5xl' />
        <p className='text-sm font-medium text-muted-foreground'>
          {t('addProduct.preview.empty')}
        </p>
        <p className='mt-1 text-xs text-muted-foreground/70'>
          {t('addProduct.preview.emptyHint')}
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-3 sm:space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-base font-bold text-primary sm:text-lg'>
          {t('addProduct.preview.title')}
        </h3>
        <span className='rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground sm:px-3'>
          {products.length} {t('addProduct.preview.count')}
        </span>
      </div>

      {/* Product Grid */}
      <div className='grid grid-cols-1 gap-2 sm:gap-3'>
        {products.map((product, index) => (
          <ProductPreviewCard
            key={product.id}
            product={product}
            index={index}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}
