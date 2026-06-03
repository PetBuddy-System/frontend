import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

const PRODUCT_IMAGE_URL =
  'https://lh3.googleusercontent.com/aida/ADBb0ugHETrMQc_4-Nif1lEEpK4pxufsQe-rAJQyrjvuPQoQMMHM2CrbUXJH9PoYKxL65tBhJRY_NQ-LkxTRlsqYY6dY6nesA5tYkzDIsG-fsrNZVNrMdxNI10lYYTUmgSeYvOhbeBraGZHb84VTucGzYDk8owiPRLlNg_Ji_7Pm-vQ-MmSAKsR4E1nzkWyXwa_ud5S4NitoZ3OBCcDDXbMgtP3FKMDXZ8c9acm8yxjUw8q32nDMPTnEsT8hxg'

const THUMBNAILS = ['front', 'kibble', 'nutrition', 'lifestyle'] as const

export function ProductDetailGallery() {
  const { t } = useTranslation('products')

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-card p-8 shadow-sm transition-transform duration-300 hover:scale-[1.01]'>
        <img
          src={PRODUCT_IMAGE_URL}
          alt={t('detail.product.imageAlt')}
          className='h-full w-full object-contain drop-shadow-md'
        />
      </div>

      <div className='grid grid-cols-4 gap-4'>
        {THUMBNAILS.map((thumbnail, index) => (
          <button
            key={thumbnail}
            type='button'
            aria-label={t(`detail.gallery.${thumbnail}`)}
            className={cn(
              'aspect-square overflow-hidden rounded-xl border bg-card p-2 shadow-sm transition-all',
              index === 0
                ? 'border-2 border-primary'
                : 'border-border/60 opacity-70 hover:border-primary hover:opacity-100'
            )}
          >
            {index === 0 ? (
              <img
                src={PRODUCT_IMAGE_URL}
                alt={t('detail.product.imageAlt')}
                className='h-full w-full object-contain'
              />
            ) : (
              <span className='block h-full w-full rounded-lg bg-muted' />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
