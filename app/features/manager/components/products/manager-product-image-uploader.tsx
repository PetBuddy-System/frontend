import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

export interface ManagerProductImageUploaderProps {
  existingImageUrls: string[]
  previewUrls: string[]
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ManagerProductImageUploader({
  existingImageUrls,
  previewUrls,
  onFileChange
}: ManagerProductImageUploaderProps) {
  const { t } = useTranslation('manager')

  return (
    <div className='flex flex-col gap-3.5 border-t border-border pt-4'>
      <h3 className='text-xs font-bold uppercase tracking-wider text-primary'>
        {t('productManagement.editModal.imageUrls')}
      </h3>

      {/* Existing Images */}
      {existingImageUrls.length > 0 && (
        <div className='flex flex-col gap-1.5'>
          <span className='text-xs font-bold text-muted-foreground'>
            {t('productManagement.editModal.currentImages')}
          </span>
          <div className='flex flex-wrap gap-2'>
            {existingImageUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt='product'
                className='h-16 w-16 rounded-xl border border-border bg-muted object-cover shadow-sm'
              />
            ))}
          </div>
        </div>
      )}

      {/* Image Upload Input */}
      <div className='flex flex-col gap-1.5'>
        <span className='text-xs font-bold text-muted-foreground'>
          {t('productManagement.editModal.uploadNew')}
        </span>
        <label className='flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 transition-all hover:bg-muted/50 hover:border-primary/50'>
          <div className='flex flex-col items-center justify-center pb-2 pt-2'>
            <MaterialIcon name='cloud_upload' className='text-2xl text-muted-foreground' />
            <p className='text-xs text-muted-foreground mt-1'>Chọn tệp hình ảnh để tải lên</p>
          </div>
          <input
            type='file'
            multiple
            accept='image/*'
            className='hidden'
            onChange={onFileChange}
          />
        </label>
      </div>

      {/* Previews */}
      {previewUrls.length > 0 && (
        <div className='flex flex-col gap-1.5'>
          <span className='text-xs font-bold text-muted-foreground'>
            {t('productManagement.editModal.newImagesPreview')}
          </span>
          <div className='flex flex-wrap gap-2'>
            {previewUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt='preview'
                className='h-16 w-16 rounded-xl border border-border bg-muted object-cover shadow-sm'
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
