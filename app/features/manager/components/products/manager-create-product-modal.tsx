import { useState, useEffect } from 'react'
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
}

interface ManagerCreateProductModalProps {
  categories: CategoryData[]
  onClose: () => void
  onSuccess: () => void
}

const UNIT_OPTIONS: { value: ProductUnit; label: string }[] = [
  { value: 'PIECE', label: 'Cái' },
  { value: 'KG', label: 'Kilogram' },
  { value: 'GRAM', label: 'Gram' },
  { value: 'LITER', label: 'Lít' },
  { value: 'MILLILITER', label: 'Mililit' },
  { value: 'BAG', label: 'Túi' },
  { value: 'BOX', label: 'Hộp' },
  { value: 'PACK', label: 'Gói' },
  { value: 'BOTTLE', label: 'Chai' },
  { value: 'CAN', label: 'Lon' },
  { value: 'TUBE', label: 'Tuýp' },
  { value: 'SET', label: 'Bộ' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export function ManagerCreateProductModal({
  categories,
  onClose,
  onSuccess
}: ManagerCreateProductModalProps) {
  const [form, setForm] = useState<CreateProductFormData>({
    name: '',
    salePrice: 0,
    brandName: '',
    categoryId: undefined,
    description: '',
    ingredients: '',
    usageInstructions: '',
    unit: '',
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    if (!form.name.trim()) {
      setError('Tên sản phẩm không được để trống')
      return
    }
    if (form.salePrice < 0) {
      setError('Đơn giá không được âm')
      return
    }
    if (!form.brandName.trim()) {
      setError('Thương hiệu không được để trống')
      return
    }
    if (!form.categoryId) {
      setError('Vui lòng chọn danh mục')
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
        unit: form.unit as ProductUnit | undefined
      })

      if (!response.success) {
        setError(response.message || 'Lỗi khi tạo sản phẩm')
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
      setError(err instanceof Error ? err.message : 'Lỗi khi tạo sản phẩm')
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
        aria-label='Close'
        className='absolute inset-0 bg-foreground/45 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />

      <section className='relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all'>
        {/* ── Header ── */}
        <header className='flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4'>
          <div>
            <h2 className='font-display text-lg font-bold text-card-foreground'>
              Thêm sản phẩm mới
            </h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Vui lòng điền thông tin sản phẩm mới bên dưới
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
                  Tên sản phẩm <span className='text-destructive'>*</span>
                </label>
                <input
                  id='create-name'
                  type='text'
                  required
                  placeholder='Nhập tên sản phẩm'
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className='h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label htmlFor='create-price' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Giá bán (VNĐ) <span className='text-destructive'>*</span>
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
                  Thương hiệu <span className='text-destructive'>*</span>
                </label>
                <input
                  id='create-brand'
                  type='text'
                  required
                  placeholder='Whiskas, Pedigree, etc.'
                  value={form.brandName}
                  onChange={(e) => setForm((prev) => ({ ...prev, brandName: e.target.value }))}
                  className='h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label htmlFor='create-category' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Danh mục <span className='text-destructive'>*</span>
                </label>
                <div className='relative'>
                  <select
                    id='create-category'
                    required
                    value={form.categoryId || ''}
                    onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
                    className='h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer'
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

            {/* Unit */}
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='create-unit' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                Đơn vị
              </label>
              <div className='relative'>
                <select
                  id='create-unit'
                  value={form.unit}
                  onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value as ProductUnit }))}
                  className='h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors cursor-pointer'
                >
                  <option value=''>-- Chọn đơn vị --</option>
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

            {/* Description - rows=5 */}
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='create-desc' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                Mô tả sản phẩm
              </label>
              <textarea
                id='create-desc'
                rows={5}
                placeholder='Mô tả thông tin chi tiết về sản phẩm...'
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className='w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors resize-y min-h-[100px]'
              />
            </div>

            {/* Ingredients & Usage Instructions - 2 cột */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='flex flex-col gap-1.5'>
                <label htmlFor='create-ingredients' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Thành phần
                </label>
                <textarea
                  id='create-ingredients'
                  rows={4}
                  placeholder='Nhập thành phần sản phẩm...'
                  value={form.ingredients}
                  onChange={(e) => setForm((prev) => ({ ...prev, ingredients: e.target.value }))}
                  className='w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors resize-y min-h-[80px]'
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label htmlFor='create-usage' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Hướng dẫn sử dụng
                </label>
                <textarea
                  id='create-usage'
                  rows={4}
                  placeholder='Nhập hướng dẫn sử dụng...'
                  value={form.usageInstructions}
                  onChange={(e) => setForm((prev) => ({ ...prev, usageInstructions: e.target.value }))}
                  className='w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors resize-y min-h-[80px]'
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className='flex flex-col gap-3.5 border-t border-border pt-4'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-primary'>
                Hình ảnh sản phẩm
              </h3>

              {/* Previews */}
              {imagePreviews.length > 0 && (
                <div className='flex flex-col gap-1.5'>
                  <span className='text-xs font-bold text-muted-foreground'>
                    Hình ảnh đã chọn
                  </span>
                  <div className='flex flex-wrap gap-2'>
                    {imagePreviews.map((url, idx) => (
                      <div key={idx} className='relative group h-16 w-16 rounded-xl border border-border bg-muted overflow-hidden shadow-sm'>
                        <img
                          src={url}
                          alt='preview'
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
                  Tải lên hình ảnh mới
                </span>
                <label className='flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 transition-all hover:bg-muted/50 hover:border-primary/50'>
                  <div className='flex flex-col items-center justify-center pb-2 pt-2 text-center px-4'>
                    <MaterialIcon name='cloud_upload' className='text-3xl text-muted-foreground' />
                    <p className='text-xs text-muted-foreground mt-2 font-semibold'>Chọn tệp hình ảnh để tải lên</p>
                    <p className='text-[10px] text-muted-foreground/80 mt-1'>Định dạng JPG, PNG tối đa 5MB</p>
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
                Video sản phẩm
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
                  Tải lên video mới
                </span>
                <label className='flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 transition-all hover:bg-muted/50 hover:border-primary/50'>
                  <div className='flex flex-col items-center justify-center pb-2 pt-2 text-center px-4'>
                    <MaterialIcon name='play_circle' className='text-3xl text-muted-foreground' />
                    <p className='text-xs text-muted-foreground mt-2 font-semibold'>Chọn tệp video để tải lên</p>
                    <p className='text-[10px] text-muted-foreground/80 mt-1'>Định dạng MP4 tối đa 50MB</p>
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
              Hủy
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
              <span>Lưu sản phẩm</span>
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}