import { useRef, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

export interface ReturnWarrantyStepPhotosProps {
  photos: string[]
  onPhotosChange: (photos: string[]) => void
}

export function ReturnWarrantyStepPhotos({ photos, onPhotosChange }: ReturnWarrantyStepPhotosProps) {
  const { t } = useTranslation('profile')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      const newUrls = filesArray.map((file) => URL.createObjectURL(file))
      const combined = [...photos, ...newUrls].slice(0, 5) // Max 5 images
      onPhotosChange(combined)
    }
  }

  const removePhoto = (indexToRemove: number) => {
    onPhotosChange(photos.filter((_, idx) => idx !== indexToRemove))
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-center gap-3'>
        <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground'>
          4
        </span>
        <h3 className='font-display text-lg font-bold text-foreground'>{t('returnWarranty.step.photos')}</h3>
      </div>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <input
          type='file'
          multiple
          accept='image/*'
          ref={fileInputRef}
          onChange={handleFileUpload}
          className='hidden'
        />
        <button
          type='button'
          onClick={triggerFileInput}
          className='flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card text-muted-foreground hover:bg-muted hover:text-primary transition-all active:scale-95'
        >
          <MaterialIcon name='add_a_photo' className='text-3xl' />
          <span className='text-[10px] font-bold uppercase'>{t('returnWarranty.photos.upload')}</span>
        </button>

        {/* Render uploaded image previews */}
        {photos.map((url, idx) => (
          <div key={idx} className='group relative aspect-square overflow-hidden rounded-xl bg-muted shadow-sm'>
            <img src={url} alt='Upload preview' className='h-full w-full object-cover' />
            <button
              type='button'
              onClick={() => removePhoto(idx)}
              className='absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100'
            >
              <MaterialIcon name='close' className='text-sm' />
            </button>
          </div>
        ))}
      </div>
      <p className='text-xs italic text-muted-foreground'>{t('returnWarranty.photos.note')}</p>
    </div>
  )
}
