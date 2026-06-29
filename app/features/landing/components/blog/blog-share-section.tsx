import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export interface BlogShareSectionProps {
  categoryLabel: string
}

export function BlogShareSection({ categoryLabel }: BlogShareSectionProps) {
  const { t } = useTranslation('blog')

  return (
    <div className='mx-auto mt-12 max-w-4xl px-4 md:px-6'>
      <div className='rounded-2xl border border-border/60 bg-card p-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-semibold text-muted-foreground'>
              {t('detail.share')}
            </span>
            <div className='flex gap-2'>
              <button
                type='button'
                className='flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary'
                aria-label='Share on Facebook'
              >
                <MaterialIcon name='share' className='text-lg' />
              </button>
              <button
                type='button'
                className='flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary'
                aria-label='Share on Twitter'
              >
                <MaterialIcon name='alternate_email' className='text-lg' />
              </button>
              <button
                type='button'
                className='flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary'
                aria-label='Copy link'
              >
                <MaterialIcon name='link' className='text-lg' />
              </button>
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            <span className='rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground'>
              #PetCare
            </span>
            <span className='rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground'>
              #{categoryLabel}
            </span>
            <span className='rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground'>
              #Health
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
