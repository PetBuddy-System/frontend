import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

export function AddProductImageUpload() {
  const { t } = useTranslation('staff')
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 transition-all sm:p-6',
        isDragging && 'scale-[1.02] border-primary bg-primary/5'
      )}
    >
      {/* Background Pattern */}
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.03]'
        style={{
          backgroundImage: 'radial-gradient(#f97316 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      <div
        className={cn(
          'mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-sm transition-transform sm:mb-4 sm:h-16 sm:w-16',
          isDragging && 'scale-110'
        )}
      >
        <MaterialIcon name='add_a_photo' className='text-2xl text-primary sm:text-3xl' />
      </div>

      <h3 className='mb-1 text-center text-sm font-semibold text-primary sm:text-base'>
        {t('addProduct.form.uploadTitle')}
      </h3>
      <p className='max-w-[200px] text-center text-xs text-muted-foreground sm:max-w-[240px] sm:text-sm'>
        {t('addProduct.form.uploadHint')}
      </p>

      <button
        type='button'
        className='mt-3 rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:mt-4 sm:px-6 sm:py-2.5 sm:text-sm'
      >
        {t('addProduct.form.uploadButton')}
      </button>
    </div>
  )
}
