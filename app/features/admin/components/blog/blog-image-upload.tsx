import { useCallback, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export interface BlogImageUploadProps {
  imageFiles: File[]
  imagePreviewUrl: string
  onChange: (files: File[], previewUrl: string) => void
  onRemove: () => void
}

const MAX_FILE_SIZE_MB = 5
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export function BlogImageUpload({
  imageFiles,
  imagePreviewUrl,
  onChange,
  onRemove
}: BlogImageUploadProps) {
  const { t } = useTranslation('admin')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [imageError, setImageError] = useState('')

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  const validateAndSetImage = useCallback(
    (file: File) => {
      setImageError('')

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setImageError(t('blogManagement.create.imageUpload.invalidType'))
        return
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setImageError(t('blogManagement.create.imageUpload.tooLarge', { max: MAX_FILE_SIZE_MB }))
        return
      }

      // Create temporary preview URL
      const objectUrl = URL.createObjectURL(file)
      onChange([file], objectUrl)
    },
    [t, onChange]
  )

  const handleImageFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        validateAndSetImage(file)
      }
      e.target.value = ''
    },
    [validateAndSetImage]
  )

  const handleImageDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) {
        validateAndSetImage(file)
      }
    },
    [validateAndSetImage]
  )

  const handleRemoveImage = useCallback(() => {
    setImageError('')
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl)
    }
    onRemove()
  }, [imagePreviewUrl, onRemove])

  const hasImage = imagePreviewUrl || imageFiles.length > 0

  return (
    <div className='space-y-2'>
      <span className='text-sm font-semibold text-card-foreground'>
        {t('blogManagement.create.fields.coverImage')}
      </span>

      {hasImage ? (
        <div className='group relative h-12 overflow-hidden rounded-2xl border border-border bg-card'>
          <div className='flex h-full items-center gap-3 px-4'>
            <MaterialIcon name='image' className='shrink-0 text-lg text-success' />
            <span className='flex-1 truncate text-sm text-card-foreground'>
              {imageFiles[0]?.name ?? t('blogManagement.create.imageUpload.currentImage')}
            </span>
            <button
              type='button'
              onClick={handleRemoveImage}
              className='shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
              aria-label={t('blogManagement.create.imageUpload.remove')}
            >
              <MaterialIcon name='close' className='text-[16px]' />
            </button>
          </div>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => imageInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImageDrop}
          className='flex h-12 w-full items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card px-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5'
        >
          <MaterialIcon name='cloud_upload' className='text-lg' />
          <span>{t('blogManagement.create.imageUpload.placeholder')}</span>
        </button>
      )}

      <input
        ref={imageInputRef}
        type='file'
        accept='image/jpeg,image/png,image/gif,image/webp'
        className='hidden'
        onChange={handleImageFileChange}
      />

      {imageError && (
        <p className='flex items-center gap-1 text-xs text-destructive'>
          <MaterialIcon name='error' className='text-[14px]' />
          {imageError}
        </p>
      )}
    </div>
  )
}
