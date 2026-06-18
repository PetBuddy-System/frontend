import { useTranslation } from 'react-i18next'

export function BlogCommentsSection() {
  const { t } = useTranslation('blog')

  return (
    <div className='mx-auto mt-8 max-w-4xl px-4 pb-12 md:px-6'>
      <div className='rounded-2xl border border-border/60 bg-card p-6'>
        <h3 className='font-display text-xl font-bold text-foreground'>
          {t('detail.comments')}
        </h3>
        <div className='mt-5 space-y-4'>
          <textarea
            rows={4}
            placeholder={t('detail.commentPlaceholder')}
            className='w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring'
          />
          <div className='flex justify-end'>
            <button
              type='button'
              className='inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring'
            >
              {t('detail.postComment')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
