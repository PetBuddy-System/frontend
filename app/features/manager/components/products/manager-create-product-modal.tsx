import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { createProductApi, updateProductImagesApi, updateProductVideoApi } from '../../services/product'
import type { CategoryData, ProductUnit } from '~/shared/lib/product'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CreateProductFormData {
  name: string
  salePrice: number
  brandName: string
  categoryId: number | undefined
  description: string
  ingredients: string
  usageInstructions: string
  unit: ProductUnit | ''
  weight: number | ''
}

interface ManagerCreateProductModalProps {
  categories: CategoryData[]
  onClose: () => void
  onSuccess: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ManagerCreateProductModal({
  categories,
  onClose,
  onSuccess
}: ManagerCreateProductModalProps) {
  const { t } = useTranslation('manager')

  const [form, setForm] = useState<CreateProductFormData>({
    name: '',
    salePrice: 0,
    brandName: '',
    categoryId: undefined,
    description: '',
    ingredients: '',
    usageInstructions: '',
    unit: '',
    weight: '',
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Lấy unit options từ translation
  const UNIT_OPTIONS: { value: ProductUnit; label: string }[] = [
    { value: 'PIECE', label: t('unit.PIECE') },
    { value: 'BAG', label: t('unit.BAG') },
    { value: 'BOX', label: t('unit.BOX') },
    { value: 'PACK', label: t('unit.PACK') },
    { value: 'BOTTLE', label: t('unit.BOTTLE') },
    { value: 'CAN', label: t('unit.CAN') },
    { value: 'TUBE', label: t('unit.TUBE') },
    { value: 'SET', label: t('unit.SET') },
  ]

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
      if (videoPreview) URL.revokeObjectURL(videoPreview)
    }
  }, [imagePreviews, videoPreview])

  // ── Form handlers ──────────────────────────────────────────────────────────

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      if (images.length + filesArray.length > 4) {
        setError(t('productManagement.createModal.errors.maxImages'))
        e.target.value = ''
        return
      }
      setError(null)
      setImages((prev) => [...prev, ...filesArray])
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file))
      setImagePreviews((prev) => [...prev, ...newPreviews])
    }
    e.target.value = ''
  }

  function handleRemoveImage(index: number) {
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index])
    }
    setImages((prev) => prev.filter((_, idx) => idx !== index))
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== index))
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setVideoFile(file)
      if (videoPreview) URL.revokeObjectURL(videoPreview)
      setVideoPreview(URL.createObjectURL(file))
    }
    e.target.value = ''
  }

  function handleRemoveVideo() {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(null)
    setVideoPreview(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate form
    if (!form.name.trim()) {
      setError(t('productManagement.createModal.errors.nameRequired'))
      return
    }
    if (form.salePrice < 0) {
      setError(t('productManagement.createModal.errors.priceInvalid'))
      return
    }
    if (!form.brandName.trim()) {
      setError(t('productManagement.createModal.errors.brandRequired'))
      return
    }
    if (!form.categoryId) {
      setError(t('productManagement.createModal.errors.categoryRequired'))
      return
    }
    if (!form.unit) {
      setError(t('productManagement.createModal.errors.unitRequired'))
      return
    }
    if (images.length > 4) {
      setError(t('productManagement.createModal.errors.maxImages'))
      return
    }
    if (!form.weight) {
      setError(t('productManagement.createModal.errors.weightRequired'))
      return
    }
    if (Number(form.weight) <= 0) {
      setError(t('productManagement.createModal.errors.weightInvalid'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Tạo sản phẩm
      const response = await createProductApi({
        name: form.name.trim(),
        salePrice: Number(form.salePrice),
        brandName: form.brandName.trim(),
        categoryId: Number(form.categoryId),
        description: form.description.trim(),
        ingredients: form.ingredients.trim(),
        usageInstructions: form.usageInstructions.trim(),
        unit: form.unit as ProductUnit,
        weight: Number(form.weight)
      })

      if (!response.success) {
        setError(response.message || t('productManagement.createModal.errors.createFailed'))
        setIsSubmitting(false)
        return
      }

      const productId = response.data.productId

      // 2. Upload ảnh (nếu có)
      if (images.length > 0) {
        const imgRes = await updateProductImagesApi(productId, images, [])
        if (!imgRes.success) {
          console.warn('Upload ảnh thất bại:', imgRes.message)
        }
      }

      // 3. Upload video (nếu có)
      if (videoFile) {
        const videoRes = await updateProductVideoApi(productId, videoFile)
        if (!videoRes.success) {
          console.warn('Upload video thất bại:', videoRes.message)
        }
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('productManagement.createModal.errors.createFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto'>
      {/* Backdrop */}
      <button
        type='button'
        aria-label={t('productManagement.createModal.close')}
        className='absolute inset-0 bg-foreground/45 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />

      <section className='relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all'>
        {/* ── Header ── */}
        <header className='flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4'>
          <div>
            <h2 className='font-display text-lg font-bold text-card-foreground'>
              {t('productManagement.createModal.title')}
            </h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {t('productManagement.createModal.subtitle')}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary transition-colors'
          >
            <MaterialIcon name='close' className='text-xl' />
          </button>
        </header>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} className='flex flex-col min-h-0 flex-1'>
          <div className='min-h-0 flex-1 overflow-y-auto p-6 space-y-4'>
            {error && (
              <div className='flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
                <MaterialIcon name='error' className='shrink-0 text-xl' />
                <span>{error}</span>
              </div>
            )}

            {/* Name & Price */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='flex flex-col gap-1.5'>
                <label htmlFor='create-name' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('productManagement.createModal.name')} <span className='text-destructive'>*</span>
                </label>
                <input
                  id='create-name'
                  type='text'
                  required
                  placeholder={t('productManagement.createModal.namePlaceholder')}
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className='h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label htmlFor='create-price' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('productManagement.createModal.price')} <span className='text-destructive'>*</span>
                </label>
                <input
                  id='create-price'
                  type='number'
                  required
                  min='0'
                  value={form.salePrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, salePrice: Number(e.target.value) }))}
                  className='h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
                />
              </div>
            </div>

            {/* Brand & Category */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='flex flex-col gap-1.5'>
                <label htmlFor='create-brand' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('productManagement.createModal.brand')} <span className='text-destructive'>*</span>
                </label>
                <input
                  id='create-brand'
                  type='text'
                  required
                  placeholder={t('productManagement.createModal.brandPlaceholder')}
                  value={form.brandName}
                  onChange={(e) => setForm((prev) => ({ ...prev, brandName: e.target.value }))}
                  className='h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label htmlFor='create-category' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('productManagement.createModal.category')} <span className='text-destructive'>*</span>
                </label>
                <div className='relative'>
                  <select
                    id='create-category'
                    required
                    value={form.categoryId || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
                    className='h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer'
                  >
                    <option value=''>{t('productManagement.createModal.selectCategory')}</option>
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

            {/* Unit & Weight - 2 cột */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {/* Unit */}
              <div className='flex flex-col gap-1.5'>
                <label htmlFor='create-unit' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('productManagement.createModal.unit')} <span className='text-destructive'>*</span>
                </label>
                <div className='relative'>
                  <select
                    id='create-unit'
                    required  // ✅ Thêm required
                    value={form.unit}
                    onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value as ProductUnit }))}
                    className='h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer'
                  >
                    <option value=''>{t('productManagement.createModal.selectUnit')}</option>
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                  <MaterialIcon
                    name='expand_more'
                    className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                  />
                </div>
              </div>

              {/* Weight */}
              <div className='flex flex-col gap-1.5'>
                <label htmlFor='create-weight' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('productManagement.createModal.weight')} <span className='text-destructive'>*</span>
                </label>
                <input
                  id='create-weight'
                  type='number'
                  required
                  min='0'
                  step='0.1'
                  placeholder={t('productManagement.createModal.weightPlaceholder')}
                  value={form.weight}
                  onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value ? Number(e.target.value) : '' }))}
                  className='h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
                />
              </div>
            </div>

            {/* Description - rows=5 */}
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='create-desc' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                {t('productManagement.createModal.description')}
              </label>
              <textarea
                id='create-desc'
                rows={5}
                placeholder={t('productManagement.createModal.descriptionPlaceholder')}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className='w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors resize-y min-h-[100px]'
              />
            </div>

            {/* Ingredients & Usage Instructions - 2 cột */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='flex flex-col gap-1.5'>
                <label htmlFor='create-ingredients' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('productManagement.createModal.ingredients')}
                </label>
                <textarea
                  id='create-ingredients'
                  rows={4}
                  placeholder={t('productManagement.createModal.ingredientsPlaceholder')}
                  value={form.ingredients}
                  onChange={(e) => setForm((prev) => ({ ...prev, ingredients: e.target.value }))}
                  className='w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors resize-y min-h-[80px]'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label htmlFor='create-usage' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  {t('productManagement.createModal.usageInstructions')}
                </label>
                <textarea
                  id='create-usage'
                  rows={4}
                  placeholder={t('productManagement.createModal.usagePlaceholder')}
                  value={form.usageInstructions}
                  onChange={(e) => setForm((prev) => ({ ...prev, usageInstructions: e.target.value }))}
                  className='w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors resize-y min-h-[80px]'
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className='flex flex-col gap-3.5 border-t border-border pt-4'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-primary'>
                {t('productManagement.createModal.images')}
              </h3>

              {/* Previews */}
              {imagePreviews.length > 0 && (
                <div className='flex flex-col gap-1.5'>
                  <span className='text-xs font-bold text-muted-foreground'>
                    {t('productManagement.createModal.selectedImages')}
                  </span>
                  <div className='flex flex-wrap gap-2'>
                    {imagePreviews.map((url, idx) => (
                      <div key={idx} className='relative group h-16 w-16 rounded-xl border border-border bg-muted overflow-hidden shadow-sm'>
                        <img
                          src={url}
                          alt={t('productManagement.createModal.previewAlt')}
                          className='h-full w-full object-cover'
                        />
                        <button
                          type='button'
                          onClick={() => handleRemoveImage(idx)}
                          className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-xl'
                        >
                          <MaterialIcon name='delete' className='text-lg' />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload zone */}
              <div className='flex flex-col gap-1.5'>
                <span className='text-xs font-bold text-muted-foreground'>
                  {t('productManagement.createModal.uploadImages')}
                </span>
                <label className='flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 transition-all hover:bg-muted/50 hover:border-primary/50'>
                  <div className='flex flex-col items-center justify-center pb-2 pt-2 text-center px-4'>
                    <MaterialIcon name='cloud_upload' className='text-3xl text-muted-foreground' />
                    <p className='text-xs text-muted-foreground mt-2 font-semibold'>
                      {t('productManagement.createModal.uploadImagesLabel')}
                    </p>
                    <p className='text-[10px] text-muted-foreground/80 mt-1'>
                      {t('productManagement.createModal.uploadImagesHint')}
                    </p>
                  </div>
                  <input
                    type='file'
                    multiple
                    accept='image/*'
                    className='hidden'
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {/* Video Upload */}
            <div className='flex flex-col gap-3.5 border-t border-border pt-4'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-primary'>
                {t('productManagement.createModal.video')}
              </h3>

              {/* Video preview */}
              {videoPreview && (
                <div className='relative rounded-xl border border-border overflow-hidden bg-black/5'>
                  <video
                    src={videoPreview}
                    controls
                    className='w-full max-h-[200px] object-contain'
                  />
                  <button
                    type='button'
                    onClick={handleRemoveVideo}
                    className='absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors'
                  >
                    <MaterialIcon name='close' className='text-lg' />
                  </button>
                </div>
              )}

              {/* Upload zone */}
              <div className='flex flex-col gap-1.5'>
                <span className='text-xs font-bold text-muted-foreground'>
                  {t('productManagement.createModal.uploadVideo')}
                </span>
                <label className='flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 transition-all hover:bg-muted/50 hover:border-primary/50'>
                  <div className='flex flex-col items-center justify-center pb-2 pt-2 text-center px-4'>
                    <MaterialIcon name='play_circle' className='text-3xl text-muted-foreground' />
                    <p className='text-xs text-muted-foreground mt-2 font-semibold'>
                      {t('productManagement.createModal.uploadVideoLabel')}
                    </p>
                    <p className='text-[10px] text-muted-foreground/80 mt-1'>
                      {t('productManagement.createModal.uploadVideoHint')}
                    </p>
                  </div>
                  <input
                    type='file'
                    accept='video/*'
                    className='hidden'
                    onChange={handleVideoChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <footer className='flex justify-end gap-3 border-t border-border bg-muted/40 px-6 py-4 shrink-0'>
            <button
              type='button'
              disabled={isSubmitting}
              onClick={onClose}
              className='h-11 rounded-full border border-border bg-card px-6 text-sm font-bold text-card-foreground hover:bg-muted transition-colors disabled:opacity-50'
            >
              {t('productManagement.createModal.cancel')}
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='h-11 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-all disabled:opacity-50'
            >
              {isSubmitting ? (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
              ) : (
                <MaterialIcon name='save' className='text-lg' />
              )}
              <span>{t('productManagement.createModal.save')}</span>
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}