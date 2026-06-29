import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '~/shared/lib/cn'

export interface ProductDetailGalleryProps {
  imageUrls: string[]
  productName: string
}

export function ProductDetailGallery({ imageUrls, productName }: ProductDetailGalleryProps) {
  const { t } = useTranslation('products')
  const [activeImage, setActiveImage] = useState(0)

  const safeImageUrls = imageUrls || []
  const defaultImage = safeImageUrls.length > 0 ? safeImageUrls[activeImage] : 'https://placehold.co/600'

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-card p-8 shadow-sm transition-transform duration-300 hover:scale-[1.01]'>
        <img
          src={defaultImage}
          alt={productName}
          className='h-full w-full object-contain drop-shadow-md'
        />
      </div>

      {safeImageUrls.length > 1 && (
        <div className='grid grid-cols-4 gap-4'>
          {safeImageUrls.map((url, index) => (
            <button
              key={index}
              type='button'
              onClick={() => setActiveImage(index)}
              className={cn(
                'aspect-square overflow-hidden rounded-xl border bg-card p-2 shadow-sm transition-all',
                index === activeImage
                  ? 'border-2 border-primary'
                  : 'border-border/60 opacity-70 hover:border-primary hover:opacity-100'
              )}
            >
              <img
                src={url}
                alt={`${productName} thumbnail ${index + 1}`}
                className='h-full w-full object-contain'
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
