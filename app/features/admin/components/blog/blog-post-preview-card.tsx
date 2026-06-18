import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export interface BlogPostPreviewCardProps {
  title: string
  excerpt: string
  label: string
  author: string
  imagePreviewUrl: string
}

export function BlogPostPreviewCard({
  title,
  excerpt,
  label,
  author,
  imagePreviewUrl
}: BlogPostPreviewCardProps) {
  const { t } = useTranslation('admin')

  return (
    <section className='rounded-3xl border border-border bg-card p-6 shadow-sm'>
      <h3 className='text-base font-extrabold text-card-foreground'>
        {t('blogManagement.create.preview.title')}
      </h3>
      <p className='mt-1 text-sm text-muted-foreground'>
        {t('blogManagement.create.preview.subtitle')}
      </p>

      <div className='mt-4 overflow-hidden rounded-2xl border border-border'>
        <div className='h-40 w-full bg-muted'>
          {imagePreviewUrl ? (
            <img src={imagePreviewUrl} alt='' className='h-full w-full object-cover' />
          ) : (
            <div className='flex h-full items-center justify-center'>
              <MaterialIcon name='image' className='text-4xl text-muted-foreground' />
            </div>
          )}
        </div>
        <div className='bg-card p-4'>
          <span className='mb-2 inline-block rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground'>
            {t(`blogManagement.sidebar.${label}`)}
          </span>
          <h4 className='font-display text-lg font-bold text-card-foreground line-clamp-2'>
            {title || t('blogManagement.create.preview.titlePlaceholder')}
          </h4>
          <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
            {excerpt || t('blogManagement.create.preview.excerptPlaceholder')}
          </p>
          <div className='mt-3 flex items-center gap-2 text-xs text-muted-foreground'>
            <MaterialIcon name='person' className='text-[12px]' />
            <span>{author || 'Author name'}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
