import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { StaffSidebar, StaffTopNav } from '~/features/staff/components/layout'
import { AddProductForm, ProductPreviewList, AddProductImageUpload, type ProductFormData } from '~/features/staff/components/add-product'
import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const PRODUCT_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&q=80',
    alt: 'Organic cat dry food'
  },
  {
    url: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=200&q=80',
    alt: 'Premium pet food bowl'
  }
]

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function createEmptyProduct(): ProductFormData {
  return {
    id: generateId(),
    name: '',
    category: '',
    supplier: '',
    price: '',
    stock: '100',
    description: ''
  }
}

export function StaffAddProductPage() {
  const { t } = useTranslation('staff')
  const [currentProduct, setCurrentProduct] = useState<ProductFormData>(createEmptyProduct())
  const [addedProducts, setAddedProducts] = useState<ProductFormData[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  function handleFieldChange(field: keyof ProductFormData, value: string) {
    setCurrentProduct((prev) => ({ ...prev, [field]: value }))
  }

  function handleConfirm() {
    if (!currentProduct.name.trim()) return

    setAddedProducts((prev) => [...prev, { ...currentProduct, id: generateId() }])
    setCurrentProduct(createEmptyProduct())
  }

  function handleRemoveProduct(id: string) {
    setAddedProducts((prev) => prev.filter((p) => p.id !== id))
  }

  function handleCancel() {
    setCurrentProduct(createEmptyProduct())
    setAddedProducts([])
  }

  async function handleSaveAll() {
    if (addedProducts.length === 0) return

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log('Saving products:', addedProducts)

      setShowSuccess(true)
      setAddedProducts([])

      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save products:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isConfirmDisabled = !currentProduct.name.trim()

  return (
    <div className='flex min-h-screen bg-background'>
      <StaffSidebar activeItem='inventory' />

      <div className='min-w-0 flex-1'>
        <StaffTopNav titleKey='addProduct.pageTitle' />

        <main className='p-4 sm:p-6 lg:p-8'>
          <div className='mx-auto max-w-6xl'>
            {/* Page Card */}
            <div className='rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-6 lg:p-10'>
              {/* Header */}
              <div className='mb-6 lg:mb-10'>
                <h1 className='flex flex-wrap items-center gap-2 gap-x-3 text-xl font-bold text-primary sm:text-2xl lg:text-3xl'>
                  <img
                    className='h-8 w-8 rounded-full border-2 border-background object-cover shadow-sm sm:h-10 sm:w-10 lg:h-12 lg:w-12'
                    src={PRODUCT_IMAGES[0].url}
                    alt={PRODUCT_IMAGES[0].alt}
                  />
                  <span>{t('addProduct.heading1')}</span>
                  <span>{t('addProduct.heading2')}</span>
                  <span>{t('addProduct.heading3')}</span>
                  <img
                    className='h-8 w-8 rounded-full border-2 border-background object-cover shadow-sm sm:h-10 sm:w-10 lg:h-12 lg:w-12'
                    src={PRODUCT_IMAGES[1].url}
                    alt={PRODUCT_IMAGES[1].alt}
                  />
                </h1>
                <p className='mt-2 max-w-xl text-sm text-muted-foreground sm:mt-4 sm:text-base lg:text-lg'>
                  {t('addProduct.description')}
                </p>
              </div>

              {/* Content Grid */}
              <div className='flex flex-col gap-6 lg:flex-row lg:gap-8'>
                {/* Left: Form */}
                <div className='w-full lg:flex-1'>
                  <AddProductForm
                    product={currentProduct}
                    onChange={handleFieldChange}
                    onConfirm={handleConfirm}
                    isConfirmDisabled={isConfirmDisabled}
                  />
                </div>

                {/* Right: Image Upload + Preview */}
                <div className='w-full space-y-4 lg:w-80 xl:w-96'>
                  {/* Image Upload */}
                  <AddProductImageUpload />

                  {/* Product Preview List */}
                  <ProductPreviewList
                    products={addedProducts}
                    onRemove={handleRemoveProduct}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='mt-8 flex flex-col-reverse items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row'>
                <button
                  type='button'
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className={cn(
                    'w-full rounded-xl border border-border px-6 py-3 text-sm font-semibold transition-colors sm:w-auto',
                    'text-muted-foreground hover:bg-muted hover:text-foreground',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                >
                  {t('addProduct.form.cancel')}
                </button>

                <button
                  type='button'
                  onClick={handleSaveAll}
                  disabled={isSubmitting || addedProducts.length === 0}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold shadow-lg transition-all sm:w-auto lg:px-8 lg:py-3',
                    'text-primary-foreground shadow-primary/20',
                    'hover:opacity-90 active:scale-[0.98]',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <MaterialIcon name='hourglass_empty' className='animate-spin' />
                      {t('addProduct.form.saving')}
                    </>
                  ) : (
                    <>
                      <MaterialIcon name='save' />
                      {t('addProduct.form.submit')}
                      {addedProducts.length > 0 && (
                        <span className='rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs'>
                          {addedProducts.length}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className='fixed bottom-4 right-4 left-4 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-xl ring-1 ring-border sm:left-auto sm:max-w-md sm:px-6 sm:py-4'>
          <MaterialIcon name='check_circle' filled className='text-xl text-success sm:text-2xl' />
          <div className='min-w-0 flex-1'>
            <p className='font-bold text-foreground'>
              {t('addProduct.toast.successTitle')}
            </p>
            <p className='truncate text-sm text-muted-foreground'>
              {t('addProduct.toast.successMessage')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
