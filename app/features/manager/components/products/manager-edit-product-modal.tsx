import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'
import {
  fetchProductByIdApi,
  updateProductApi,
} from '../../services/product'
import type { CategoryData } from '~/shared/lib/product'
import { ManagerProductImageUploader } from './manager-product-image-uploader'

export interface ManagerEditProductModalProps {
  productId: string | null
  categories: CategoryData[]
  onClose: () => void
  onSaveSuccess: () => void
}

// ✅ Hàm lấy label status tiếng Việt
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'Đang hoạt động'
    case 'INACTIVE':
      return 'Ngừng kinh doanh'
    case 'DELETED':
      return 'Đã xóa'
    default:
      return status
  }
}

// ✅ Hàm lấy màu cho status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-success/15 text-success'
    case 'INACTIVE':
      return 'bg-warning/15 text-warning'
    case 'DELETED':
      return 'bg-destructive/15 text-destructive'
    default:
      return 'bg-muted/15 text-muted-foreground'
  }
}

export function ManagerEditProductModal({
  productId,
  categories,
  onClose,
  onSaveSuccess
}: ManagerEditProductModalProps) {
  const { t } = useTranslation('manager')

  // Loading & Form state
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fields
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [brandName, setBrandName] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [totalStock, setTotalStock] = useState(0)
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'DELETED'>('ACTIVE')
  const [description, setDescription] = useState('')
  const [productCode, setProductCode] = useState('')
  const [isDeleted, setIsDeleted] = useState(false)

  // Images state
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  useEffect(() => {
    if (!productId) return

    let active = true
    async function loadProductDetail() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetchProductByIdApi(productId!)
        if (active && response.success) {
          const prod = response.data
          setName(prod.name || '')
          setPrice(prod.price || 0)
          setBrandName(prod.brandName || '')
          setCategoryId(prod.categoryId || undefined)
          setTotalStock(prod.totalStock || 0)
          const prodStatus = (prod.status as 'ACTIVE' | 'INACTIVE' | 'DELETED') || 'ACTIVE'
          setStatus(prodStatus)
          setIsDeleted(prodStatus === 'DELETED') // ✅ Check if deleted
          setDescription(prod.description || '')
          setProductCode(prod.productCode || '')
          setExistingImageUrls(prod.imageUrls || [])
          setSelectedFiles([])
          setPreviewUrls([])
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Lỗi tải chi tiết sản phẩm')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadProductDetail()
    return () => {
      active = false
    }
  }, [productId])

  // Revoke object URLs on previewUrls change or unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  if (!productId) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles(filesArray)

      // Generate previews
      const previews = filesArray.map((file) => URL.createObjectURL(file))
      setPreviewUrls(previews)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const response = await updateProductApi(
        productId,
        {
          name,
          price: Number(price),
          brandName,
          status,
          categoryId: categoryId ? Number(categoryId) : undefined,
          description
        },
        selectedFiles
      )

      if (response.success) {
        onSaveSuccess()
        onClose()
      } else {
        setError(response.message || t('productManagement.editModal.error'))
      }
    } catch (err: any) {
      setError(err.message || t('productManagement.editModal.error'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto'>
      <button
        type='button'
        aria-label={t('productManagement.editModal.cancel')}
        className='absolute inset-0 bg-foreground/45 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />

      <section className='relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all'>
        <header className='flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4'>
          <div>
            <h2 className='font-display text-lg font-bold text-card-foreground'>
              {t('productManagement.editModal.title')}
            </h2>
            {productCode && (
              <p className='text-xs text-muted-foreground mt-0.5'>
                {t('productManagement.editModal.code')}: <span className='font-mono font-bold'>{productCode}</span>
              </p>
            )}
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary transition-colors'
          >
            <MaterialIcon name='close' className='text-xl' />
          </button>
        </header>

        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-16 px-6 space-y-4'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
            <p className='text-sm text-muted-foreground font-semibold'>{t('productManagement.editModal.loading')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='flex flex-col min-h-0 flex-1'>
            <div className='min-h-0 flex-1 overflow-y-auto p-6 space-y-4'>
              {error && (
                <div className='flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
                  <MaterialIcon name='error' className='shrink-0 text-xl' />
                  <span>{error}</span>
                </div>
              )}

              {/* ✅ Hiển thị status tiếng Việt */}
              <div className='flex items-center gap-3 rounded-xl bg-muted/30 px-4 py-2.5'>
                <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Trạng thái hiện tại:
                </span>
                <span className={cn(
                  'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
                  getStatusColor(status)
                )}>
                  {getStatusLabel(status)}
                </span>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div className='flex flex-col gap-1.5'>
                  <label htmlFor='product-name' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('productManagement.editModal.name')} <span className='text-destructive'>*</span>
                  </label>
                  <input
                    id='product-name'
                    type='text'
                    required
                    disabled={isDeleted}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn(
                      'h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors',
                      isDeleted && 'opacity-60 cursor-not-allowed'
                    )}
                  />
                </div>

                <div className='flex flex-col gap-1.5'>
                  <label htmlFor='product-price' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('productManagement.editModal.price')} <span className='text-destructive'>*</span>
                  </label>
                  <input
                    id='product-price'
                    type='number'
                    required
                    min='0'
                    disabled={isDeleted}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className={cn(
                      'h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors',
                      isDeleted && 'opacity-60 cursor-not-allowed'
                    )}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div className='flex flex-col gap-1.5'>
                  <label htmlFor='product-brand' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('productManagement.editModal.brand')} <span className='text-destructive'>*</span>
                  </label>
                  <input
                    id='product-brand'
                    type='text'
                    required
                    disabled={isDeleted}
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className={cn(
                      'h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors',
                      isDeleted && 'opacity-60 cursor-not-allowed'
                    )}
                  />
                </div>

                <div className='flex flex-col gap-1.5'>
                  <label htmlFor='product-category' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('productManagement.editModal.category')}
                  </label>
                  <div className='relative'>
                    <select
                      id='product-category'
                      disabled={isDeleted}
                      value={categoryId || ''}
                      onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                      className={cn(
                        'h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer',
                        isDeleted && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <option value=''>-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <MaterialIcon
                      name='expand_more'
                      className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                    />
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div className='flex flex-col gap-1.5'>
                  <label htmlFor='product-stock' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('productManagement.editModal.stock')}
                  </label>
                  <input
                    id='product-stock'
                    type='number'
                    disabled
                    value={totalStock}
                    className='h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-muted-foreground outline-none cursor-not-allowed'
                  />
                </div>

                <div className='flex flex-col gap-1.5'>
                  <label htmlFor='product-status' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('productManagement.editModal.status')} <span className='text-destructive'>*</span>
                  </label>
                  <div className='relative'>
                    <select
                      id='product-status'
                      required
                      disabled={isDeleted}
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'DELETED')}
                      className={cn(
                        'h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer',
                        isDeleted && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <option value='ACTIVE'>Đang hoạt động</option>
                      <option value='INACTIVE'>Ngừng kinh doanh</option>
                      {/* ❌ Đã xóa option DELETED */}
                    </select>
                    <MaterialIcon
                      name='expand_more'
                      className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                    />
                  </div>
                </div>
              </div>

              {/* Product Images Section */}
              <ManagerProductImageUploader
                existingImageUrls={existingImageUrls}
                previewUrls={previewUrls}
                onFileChange={handleFileChange}
              />

              <div className='flex flex-col gap-1.5 border-t border-border pt-4'>
                <label htmlFor='product-desc' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('productManagement.editModal.description')}
                </label>
                <textarea
                  id='product-desc'
                  rows={4}
                  disabled={isDeleted}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn(
                    'w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors resize-y',
                    isDeleted && 'opacity-60 cursor-not-allowed'
                  )}
                />
              </div>
            </div>

            <footer className='flex justify-end gap-3 border-t border-border bg-muted/40 px-6 py-4 shrink-0'>
              <button
                type='button'
                disabled={isSaving}
                onClick={onClose}
                className='h-11 rounded-full border border-border bg-card px-6 text-sm font-bold text-card-foreground hover:bg-muted transition-colors disabled:opacity-50'
              >
                {t('productManagement.editModal.cancel')}
              </button>
              {/* ✅ Ẩn nút Lưu nếu status = DELETED */}
              {!isDeleted && (
                <button
                  type='submit'
                  disabled={isSaving}
                  className='h-11 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all disabled:opacity-50'
                >
                  {isSaving ? (
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
                  ) : (
                    <MaterialIcon name='save' className='text-lg' />
                  )}
                  <span>{t('productManagement.editModal.save')}</span>
                </button>
              )}
            </footer>
          </form>
        )}
      </section>
    </div>
  )
}