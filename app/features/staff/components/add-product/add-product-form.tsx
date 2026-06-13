import { type ChangeEvent } from 'react'

import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

export interface ProductFormData {
  id: string
  name: string
  category: string
  supplier: string
  price: string
  stock: string
  description: string
}

interface AddProductFormProps {
  product: ProductFormData
  onChange: (field: keyof ProductFormData, value: string) => void
  onConfirm: () => void
  isConfirmDisabled: boolean
}

const CATEGORIES = [
  { value: 'toys', labelKey: 'addProduct.categories.toys' },
  { value: 'hygiene', labelKey: 'addProduct.categories.hygiene' },
  { value: 'supplement', labelKey: 'addProduct.categories.supplement' },
  { value: 'accessories', labelKey: 'addProduct.categories.accessories' },
  { value: 'dogFood', labelKey: 'addProduct.categories.dogFood' },
  { value: 'catFood', labelKey: 'addProduct.categories.catFood' }
]

export function AddProductForm({
  product,
  onChange,
  onConfirm,
  isConfirmDisabled
}: AddProductFormProps) {
  const { t } = useTranslation('staff')

  function handleChange(field: keyof ProductFormData) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      onChange(field, e.target.value)
    }
  }

  return (
    <div className='space-y-4 sm:space-y-5'>
      {/* Product Name */}
      <div>
        <label className='mb-1.5 block text-sm font-semibold text-primary'>
          {t('addProduct.form.productName')}
        </label>
        <input
          type='text'
          value={product.name}
          onChange={handleChange('name')}
          placeholder={t('addProduct.form.productNamePlaceholder')}
          className='h-12 w-full rounded-xl border border-border bg-background px-4 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring sm:h-14 sm:px-6'
        />
      </div>

      {/* Category & Supplier Row */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label className='mb-1.5 block text-sm font-semibold text-primary'>
            {t('addProduct.form.category')}
          </label>
          <div className='relative'>
            <select
              value={product.category}
              onChange={handleChange('category')}
              className='h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 pr-10 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring sm:h-14 sm:px-6'
            >
              <option value=''>{t('addProduct.form.categoryPlaceholder')}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {t(cat.labelKey)}
                </option>
              ))}
            </select>
            <MaterialIcon
              name='expand_more'
              className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground sm:right-4'
            />
          </div>
        </div>

        <div>
          <label className='mb-1.5 block text-sm font-semibold text-primary'>
            {t('addProduct.form.supplier')}
          </label>
          <input
            type='text'
            value={product.supplier}
            onChange={handleChange('supplier')}
            placeholder={t('addProduct.form.supplierPlaceholder')}
            className='h-12 w-full rounded-xl border border-border bg-background px-4 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring sm:h-14 sm:px-6'
          />
        </div>
      </div>

      {/* Price & Stock Row */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label className='mb-1.5 block text-sm font-semibold text-primary'>
            {t('addProduct.form.price')}
          </label>
          <div className='relative'>
            <input
              type='text'
              value={product.price}
              onChange={handleChange('price')}
              className='h-12 w-full rounded-xl border border-border bg-background px-4 pr-12 font-mono text-right text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring sm:h-14 sm:px-6 sm:pr-14'
            />
            <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground sm:right-4 sm:text-sm'>
              VND
            </span>
          </div>
        </div>

        <div>
          <label className='mb-1.5 block text-sm font-semibold text-primary'>
            {t('addProduct.form.stock')}
          </label>
          <input
            type='number'
            value={product.stock}
            onChange={handleChange('stock')}
            className='h-12 w-full rounded-xl border border-border bg-background px-4 font-mono text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring sm:h-14 sm:px-6'
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className='mb-1.5 block text-sm font-semibold text-primary'>
          {t('addProduct.form.description')}
        </label>
        <textarea
          rows={3}
          value={product.description}
          onChange={handleChange('description')}
          placeholder={t('addProduct.form.descriptionPlaceholder')}
          className='w-full resize-none rounded-xl border border-border bg-background p-4 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring sm:rows-4 sm:p-6'
        />
      </div>

      {/* Confirm Button */}
      <button
        type='button'
        onClick={onConfirm}
        disabled={isConfirmDisabled}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 font-bold transition-all sm:py-4',
          'text-secondary-foreground',
          'hover:bg-secondary/90 active:scale-[0.98]',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
      >
        <MaterialIcon name='add_task' className='text-xl' />
        {t('addProduct.form.confirm')}
      </button>
    </div>
  )
}
