import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

export interface ProductDetailGalleryProps {
  imageUrls: string[]
  productName: string
  videoUrl?: string | null
}

export function ProductDetailGallery({ imageUrls, productName, videoUrl }: ProductDetailGalleryProps) {
  const { t } = useTranslation('products')
  const [activeTab, setActiveTab] = useState<'images' | 'video'>('images')
  const [activeImage, setActiveImage] = useState(0)

  const safeImageUrls = imageUrls || []
  const defaultImage = safeImageUrls.length > 0 ? safeImageUrls[activeImage] : 'https://placehold.co/600'
  const hasVideo = Boolean(videoUrl)

  return (
    <div className='flex flex-col gap-4'>
      {/* ⭐ Chỉ hiển thị tab khi có video */}
      {hasVideo && (
        <div className='flex gap-2 border-b border-border/60'>
          <button
            onClick={() => setActiveTab('images')}
            className={cn(
              'px-4 py-2 text-sm font-semibold transition-all border-b-2',
              activeTab === 'images'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <div className='flex items-center gap-2'>
              <MaterialIcon name='photo' className='text-[18px]' />
              Ảnh
            </div>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={cn(
              'px-4 py-2 text-sm font-semibold transition-all border-b-2',
              activeTab === 'video'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <div className='flex items-center gap-2'>
              <MaterialIcon name='play_circle' className='text-[18px]' />
              Video
            </div>
          </button>
        </div>
      )}

      {/* Main display - Image hoặc Video */}
      <div className='relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-card p-8 shadow-sm'>
        {activeTab === 'video' && videoUrl ? (
          <video src={videoUrl} controls autoPlay className='h-full w-full object-contain' />
        ) : (
          <img src={defaultImage} alt={productName} className='h-full w-full object-contain drop-shadow-md' />
        )}
      </div>

      {/* Thumbnails - chỉ hiển thị khi ở tab ảnh và có nhiều hơn 1 ảnh */}
      {activeTab === 'images' && safeImageUrls.length > 1 && (
        <div className='grid grid-cols-4 gap-4'>
          {safeImageUrls.map((url, index) => (
            <button
              key={`image-${index}`}
              type='button'
              onClick={() => setActiveImage(index)}
              className={cn(
                'aspect-square overflow-hidden rounded-xl border bg-card p-2 shadow-sm transition-all',
                index === activeImage
                  ? 'border-2 border-primary'
                  : 'border-border/60 opacity-70 hover:border-primary hover:opacity-100'
              )}
            >
              <img src={url} alt={`${productName} thumbnail ${index + 1}`} className='h-full w-full object-contain' />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
