/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'
import {
  fetchProductManagementByIdApi,
  fetchProductImagesApi,
  updateProductApi,
  updateProductImagesApi,
  updateProductVideoApi,
  fetchProductVideoApi
} from '../../services/product'
import type { CategoryData, ProductUnit } from '~/shared/lib/product'

export interface ManagerEditProductModalProps {
  productId: string | null
  categories: CategoryData[]
  onClose: () => void
  onSaveSuccess: () => void
}

export function ManagerEditProductModal({
  productId,
  categories,
  onClose,
  onSaveSuccess
}: ManagerEditProductModalProps) {
  const { t } = useTranslation('manager')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [salePrice, setSalePrice] = useState(0)
  const [brandName, setBrandName] = useState('')
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [usageInstructions, setUsageInstructions] = useState('')
  const [unit, setUnit] = useState<ProductUnit | ''>('')
  const [weight, setWeight] = useState<number | ''>('')
  const [totalStock, setTotalStock] = useState(0)
  const [isDeleted, setIsDeleted] = useState(false)

  // REASON & NOTE
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')

  // Images
  const [existingImages, setExistingImages] = useState<{ mediaFileId: number; fileUrl: string }[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [keepImageIds, setKeepImageIds] = useState<number[]>([])

  // Video
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [deleteVideo, setDeleteVideo] = useState(false)

  // Lấy unit options từ translation
  const UNIT_OPTIONS_I18N: { value: ProductUnit; label: string }[] = [
    { value: 'PIECE', label: t('unit.PIECE') },
    { value: 'BAG', label: t('unit.BAG') },
    { value: 'BOX', label: t('unit.BOX') },
    { value: 'PACK', label: t('unit.PACK') },
    { value: 'BOTTLE', label: t('unit.BOTTLE') },
    { value: 'CAN', label: t('unit.CAN') },
    { value: 'TUBE', label: t('unit.TUBE') },
    { value: 'SET', label: t('unit.SET') }
  ]

  // Lấy status options từ translation
  const STATUS_OPTIONS_I18N = [
    { value: 'ACTIVE', label: t('productManagement.status.active') },
    { value: 'INACTIVE', label: t('productManagement.status.inactive') }
  ] as const

  useEffect(() => {
    if (!productId) return

    let active = true

    async function loadData() {
      setLoading(true)
      setReason('')
      setNote('')

      try {
        const res = await fetchProductManagementByIdApi(productId!)
        if (active && res.success) {
          const p = res.data

          setName(p.name || '')
          setSalePrice(p.salePrice || 0)
          setBrandName(p.brandName || '')
          setCategoryId(p.categoryId)
          setStatus(p.status === 'DELETED' ? 'INACTIVE' : (p.status as 'ACTIVE' | 'INACTIVE'))
          setIsDeleted(p.status === 'DELETED')
          setDescription(p.description || '')
          setIngredients(p.ingredients || '')
          setUsageInstructions(p.usageInstructions || '')
          setUnit(p.unit || '')
          setWeight(p.weight || '')
          setTotalStock(p.totalStock || 0)
        }

        // Lấy ảnh
        try {
          const imagesRes = await fetchProductImagesApi(productId!)
          if (active && imagesRes.success) {
            const images = imagesRes.data
              .filter((item) => item.fileType === 'IMAGE')
              .map((item) => ({
                mediaFileId: item.mediaFileId,
                fileUrl: item.fileUrl
              }))
            setExistingImages(images)
            setKeepImageIds(images.map((img) => img.mediaFileId))
          }
        } catch {
          console.warn('Không thể tải ảnh sản phẩm')
        }

        // Lấy video
        try {
          const videoRes = await fetchProductVideoApi(productId!)
          if (active && videoRes.success && videoRes.data) {
            setExistingVideoUrl(videoRes.data.fileUrl)
          }
        } catch {
          setExistingVideoUrl(null)
        }
      } catch (err) {
        setError(t('productManagement.editModal.errors.loadFailed'))
      } finally {
        setLoading(false)
      }
    }
    loadData()
    return () => {
      active = false
    }
  }, [productId, t])

  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url))
  }, [previewUrls])

  const toggleKeepImage = (mediaFileId: number) => {
    const isCurrentlyKept = keepImageIds.includes(mediaFileId)
    if (!isCurrentlyKept && keepImageIds.length + selectedFiles.length >= 4) {
      setError(t('productManagement.editModal.errors.maxImages'))
      return
    }
    setError(null)
    setKeepImageIds((prev) =>
      prev.includes(mediaFileId) ? prev.filter((id) => id !== mediaFileId) : [...prev, mediaFileId]
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (keepImageIds.length + files.length > 4) {
      setError(t('productManagement.editModal.errors.maxImages'))
      e.target.value = ''
      return
    }
    setError(null)
    setSelectedFiles(files)
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)))
    e.target.value = ''
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0])
      setDeleteVideo(false)
    }
    e.target.value = ''
  }

  const handleRemoveVideo = () => {
    setVideoFile(null)
    setDeleteVideo(true)
  }

  const handleCancelDeleteVideo = () => {
    setDeleteVideo(false)
    setVideoFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId || isDeleted) return

    // ✅ Validate required fields
    if (!unit) {
      setError(t('productManagement.editModal.errors.unitRequired'))
      return
    }
    if (!weight) {
      setError(t('productManagement.editModal.errors.weightRequired'))
      return
    }
    if (Number(weight) <= 0) {
      setError(t('productManagement.editModal.errors.weightInvalid'))
      return
    }
    if (keepImageIds.length + selectedFiles.length > 4) {
      setError(t('productManagement.editModal.errors.maxImages'))
      return
    }

    setSaving(true)
    setError(null)

    try {
      // 1. Update product info
      const updateRes = await updateProductApi(productId, {
        name,
        salePrice,
        brandName,
        status,
        categoryId,
        description,
        ingredients,
        usageInstructions,
        unit: unit as ProductUnit,
        weight: Number(weight),
        reason: reason || undefined,
        note: note || undefined
      })
      if (!updateRes.success) throw new Error(updateRes.message)

      // 2. Update images
      if (selectedFiles.length > 0 || keepImageIds.length > 0) {
        const imgRes = await updateProductImagesApi(
          productId,
          selectedFiles.length > 0 ? selectedFiles : undefined,
          keepImageIds
        )
        if (!imgRes.success) console.warn('Upload ảnh thất bại:', imgRes.message)
      }

      // 3. Update video
      if (videoFile) {
        await updateProductVideoApi(productId, videoFile)
      } else if (deleteVideo) {
        await updateProductVideoApi(productId, null)
      }

      onSaveSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || t('productManagement.editModal.errors.updateFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (!productId) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto'>
      <div className='absolute inset-0 bg-foreground/45 backdrop-blur-sm' onClick={onClose} />

      <section className='relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl'>
        <header className='flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4'>
          <h2 className='font-display text-lg font-bold'>{t('productManagement.editModal.title')}</h2>
          <button onClick={onClose} className='p-1 rounded-full hover:bg-muted'>
            <MaterialIcon name='close' className='text-xl' />
          </button>
        </header>

        {loading ? (
          <div className='flex items-center justify-center py-16'>
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='flex flex-col flex-1 min-h-0'>
            <div className='flex-1 overflow-y-auto p-6 space-y-4'>
              {error && (
                <div className='flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive'>
                  <MaterialIcon name='error' className='text-lg' />
                  <span>{error}</span>
                </div>
              )}

              {/* Status badge */}
              <div className='flex items-center gap-3 rounded-xl bg-muted/30 px-4 py-2'>
                <span className='text-xs font-bold uppercase text-muted-foreground'>
                  {t('productManagement.editModal.statusLabel')}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-bold',
                    status === 'ACTIVE' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                  )}
                >
                  {status === 'ACTIVE' ? t('productManagement.status.active') : t('productManagement.status.inactive')}
                </span>
                {isDeleted && (
                  <span className='rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-bold text-destructive'>
                    {t('productManagement.status.deleted')}
                  </span>
                )}
              </div>

              {/* Form fields */}
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <InputField
                  label={t('productManagement.editModal.name')}
                  required
                  value={name}
                  onChange={setName}
                  disabled={isDeleted}
                />
                <InputField
                  label={t('productManagement.editModal.price')}
                  type='number'
                  required
                  value={salePrice}
                  onChange={setSalePrice}
                  disabled={isDeleted}
                />
                <InputField
                  label={t('productManagement.editModal.brand')}
                  required
                  value={brandName}
                  onChange={setBrandName}
                  disabled={isDeleted}
                />

                <SelectField
                  label={t('productManagement.editModal.category')}
                  value={categoryId || ''}
                  onChange={(v) => setCategoryId(v ? Number(v) : undefined)}
                  disabled={isDeleted}
                >
                  <option value=''>{t('productManagement.editModal.selectCategory')}</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label={t('productManagement.editModal.status')}
                  value={status}
                  onChange={(v) => setStatus(v as 'ACTIVE' | 'INACTIVE')}
                  disabled={isDeleted}
                >
                  {STATUS_OPTIONS_I18N.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </SelectField>

                <InputField
                  label={t('productManagement.editModal.stock')}
                  type='number'
                  value={totalStock}
                  disabled
                  onChange={() => {}}
                />
              </div>

              {/* Unit & Weight - 2 cột */}
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {/* Unit */}
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('productManagement.editModal.unit')} <span className='text-destructive'>*</span>
                  </label>
                  <div className='relative'>
                    <select
                      value={unit}
                      required
                      onChange={(v) => setUnit(v.target.value as ProductUnit)}
                      disabled={isDeleted}
                      className={cn(
                        'h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring cursor-pointer',
                        isDeleted && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <option value=''>{t('productManagement.editModal.selectUnit')}</option>
                      {UNIT_OPTIONS_I18N.map((u) => (
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
                  <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('productManagement.editModal.weight')} <span className='text-destructive'>*</span>
                  </label>
                  <input
                    type='number'
                    required
                    min='0'
                    step='0.1'
                    disabled={isDeleted}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                    placeholder={t('productManagement.editModal.weightPlaceholder')}
                    className={cn(
                      'h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring',
                      isDeleted && 'opacity-60 cursor-not-allowed'
                    )}
                  />
                </div>
              </div>

              <TextareaField
                label={t('productManagement.editModal.description')}
                value={description}
                onChange={setDescription}
                disabled={isDeleted}
                rows={5}
              />

              <TextareaField
                label={t('productManagement.editModal.ingredients')}
                value={ingredients}
                onChange={setIngredients}
                disabled={isDeleted}
                rows={4}
              />

              <TextareaField
                label={t('productManagement.editModal.usageInstructions')}
                value={usageInstructions}
                onChange={setUsageInstructions}
                disabled={isDeleted}
                rows={4}
              />

              {/* REASON & NOTE */}
              <div className='border-t border-border pt-4 mt-2'>
                <div className='grid grid-cols-1 gap-4'>
                  <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('productManagement.editModal.reason')}
                      <span className='text-xs font-normal text-muted-foreground ml-1'>
                        ({t('productManagement.editModal.optional')})
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      disabled={isDeleted}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={t('productManagement.editModal.reasonPlaceholder')}
                      className={cn(
                        'w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring resize-y min-h-[60px]',
                        isDeleted && 'opacity-60 cursor-not-allowed'
                      )}
                    />
                  </div>
                  <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('productManagement.editModal.note')}
                      <span className='text-xs font-normal text-muted-foreground ml-1'>
                        ({t('productManagement.editModal.optional')})
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      disabled={isDeleted}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t('productManagement.editModal.notePlaceholder')}
                      className={cn(
                        'w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring resize-y min-h-[60px]',
                        isDeleted && 'opacity-60 cursor-not-allowed'
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className='border-t border-border pt-4'>
                <label className='text-xs font-bold uppercase text-muted-foreground'>
                  {t('productManagement.editModal.images')}
                </label>

                {existingImages.length > 0 && (
                  <div className='mt-2'>
                    <p className='text-xs text-muted-foreground mb-2'>
                      {t('productManagement.editModal.currentImages')}
                    </p>
                    <div className='flex flex-wrap gap-3'>
                      {existingImages.map((img) => {
                        const isKept = keepImageIds.includes(img.mediaFileId)
                        return (
                          <div
                            key={img.mediaFileId}
                            onClick={() => !isDeleted && toggleKeepImage(img.mediaFileId)}
                            className={cn(
                              'relative w-20 h-20 rounded-lg border-2 overflow-hidden cursor-pointer transition-all',
                              isKept ? 'border-primary shadow-md' : 'border-destructive/50 opacity-50',
                              isDeleted && 'cursor-not-allowed'
                            )}
                          >
                            <img
                              src={img.fileUrl}
                              alt={t('productManagement.editModal.productImage')}
                              className='w-full h-full object-cover'
                            />
                            {isKept && (
                              <div className='absolute top-1 right-1 bg-primary rounded-full p-0.5'>
                                <MaterialIcon name='check' className='text-white text-xs' />
                              </div>
                            )}
                            {!isKept && (
                              <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                                <MaterialIcon name='delete' className='text-white text-lg' />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {keepImageIds.length === 0
                        ? `⚠️ ${t('productManagement.editModal.allImagesDeleted')}`
                        : `${t('productManagement.editModal.keepingImages')} ${keepImageIds.length}/${existingImages.length}`}
                    </p>
                  </div>
                )}

                <div className='mt-3'>
                  <label className='text-xs font-medium text-muted-foreground'>
                    {t('productManagement.editModal.uploadNewImages')}
                  </label>
                  <div className='mt-1'>
                    <label
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted transition-colors',
                        isDeleted && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <MaterialIcon name='upload' className='text-lg' />
                      <span className='text-sm font-medium'>{t('productManagement.editModal.selectImages')}</span>
                      <input
                        type='file'
                        accept='image/*'
                        multiple
                        onChange={handleFileChange}
                        disabled={isDeleted}
                        className='hidden'
                      />
                    </label>
                    {selectedFiles.length > 0 && (
                      <span className='ml-3 text-sm text-muted-foreground'>
                        {t('productManagement.editModal.selectedImagesCount', { count: selectedFiles.length })}
                      </span>
                    )}
                  </div>
                </div>

                {previewUrls.length > 0 && (
                  <div className='flex flex-wrap gap-3 mt-2'>
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className='w-20 h-20 rounded-lg border border-border overflow-hidden'>
                        <img
                          src={url}
                          alt={`${t('productManagement.editModal.preview')} ${idx}`}
                          className='w-full h-full object-cover'
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Section */}
              <div className='border-t border-border pt-4'>
                <label className='text-xs font-bold uppercase text-muted-foreground'>
                  {t('productManagement.editModal.video')}
                </label>

                {existingVideoUrl && !deleteVideo && !videoFile && (
                  <div className='mt-2 p-3 rounded-lg bg-muted/30 border border-border'>
                    <div className='flex items-center gap-3'>
                      <MaterialIcon name='play_circle' className='text-2xl text-primary' />
                      <span className='text-sm text-foreground flex-1 truncate'>
                        {t('productManagement.editModal.currentVideo')}
                      </span>
                      {!isDeleted && (
                        <button
                          type='button'
                          onClick={handleRemoveVideo}
                          className='text-sm text-destructive hover:underline flex items-center gap-1'
                        >
                          <MaterialIcon name='delete' className='text-base' />
                          {t('productManagement.editModal.deleteVideo')}
                        </button>
                      )}
                    </div>
                    <video
                      src={existingVideoUrl}
                      controls
                      className='mt-2 w-full max-h-[150px] rounded-lg object-contain bg-black/5'
                    />
                  </div>
                )}

                {deleteVideo && (
                  <div className='mt-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm text-destructive font-medium'>
                        {t('productManagement.editModal.videoMarkedForDeletion')}
                      </span>
                      <button
                        type='button'
                        onClick={handleCancelDeleteVideo}
                        className='text-sm text-primary hover:underline'
                      >
                        {t('productManagement.editModal.undo')}
                      </button>
                    </div>
                  </div>
                )}

                {!isDeleted && (
                  <div className='mt-3'>
                    <label className='text-xs font-medium text-muted-foreground'>
                      {t('productManagement.editModal.replaceVideo')}
                    </label>
                    <div className='mt-1'>
                      <label className='inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted transition-colors'>
                        <MaterialIcon name='upload' className='text-lg' />
                        <span className='text-sm font-medium'>{t('productManagement.editModal.selectVideo')}</span>
                        <input
                          type='file'
                          accept='video/*'
                          onChange={handleVideoChange}
                          disabled={isDeleted}
                          className='hidden'
                        />
                      </label>
                      {videoFile && !deleteVideo && (
                        <span className='ml-3 text-sm text-success'>
                          {t('productManagement.editModal.videoSelected', { name: videoFile.name })}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {existingVideoUrl && !deleteVideo && !videoFile && (
                  <p className='text-xs text-muted-foreground mt-2'>✓ {t('productManagement.editModal.hasVideo')}</p>
                )}
                {!existingVideoUrl && !videoFile && !deleteVideo && (
                  <p className='text-xs text-muted-foreground mt-2'>{t('productManagement.editModal.noVideo')}</p>
                )}
                {videoFile && !deleteVideo && (
                  <p className='text-xs text-success mt-2'>
                    ✓ {t('productManagement.editModal.videoSelected', { name: videoFile.name })}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <footer className='flex justify-end gap-3 border-t border-border bg-muted/40 px-6 py-4'>
              <button
                type='button'
                onClick={onClose}
                className='h-10 px-6 rounded-full border border-border bg-card text-sm font-bold hover:bg-muted'
              >
                {t('productManagement.editModal.cancel')}
              </button>
              {!isDeleted && (
                <button
                  type='submit'
                  disabled={saving}
                  className='h-10 px-6 rounded-full bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center gap-2'
                >
                  {saving ? (
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  ) : (
                    <MaterialIcon name='save' className='text-lg' />
                  )}
                  {t('productManagement.editModal.save')}
                </button>
              )}
            </footer>
          </form>
        )}
      </section>
    </div>
  )
}

// ─── Helper Components ──────────────────────────────────────────────

interface InputFieldProps {
  label: string
  type?: 'text' | 'number'
  required?: boolean
  value: string | number
  onChange: (value: any) => void
  disabled?: boolean
}

function InputField({ label, type = 'text', required, value, onChange, disabled }: InputFieldProps) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
        {label} {required && <span className='text-destructive'>*</span>}
      </label>
      <input
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className={cn(
          'h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      />
    </div>
  )
}

interface SelectFieldProps {
  label: string
  value: string | number
  onChange: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
}

function SelectField({ label, value, onChange, disabled, children }: SelectFieldProps) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{label}</label>
      <div className='relative'>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            'h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring cursor-pointer',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          {children}
        </select>
        <MaterialIcon
          name='expand_more'
          className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
        />
      </div>
    </div>
  )
}

interface TextareaFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  rows?: number
}

function TextareaField({ label, value, onChange, disabled, rows = 4 }: TextareaFieldProps) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>{label}</label>
      <textarea
        rows={rows}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring resize-y min-h-[100px]',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      />
    </div>
  )
}
