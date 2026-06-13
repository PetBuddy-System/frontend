import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import type { BlogPost } from '~/features/landing/data/posts'

interface AuthorCardProps {
  author: string
  authorRole?: string
  className?: string
}

export function AuthorCard({ author, authorRole, className }: AuthorCardProps) {
  const { t } = useTranslation('blog')

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm',
        className
      )}
    >
      <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground'>
        <span className='font-display text-lg font-bold'>{author.charAt(0)}</span>
      </div>
      <div>
        <p className='font-semibold text-foreground'>{author}</p>
        {authorRole && <p className='text-sm text-muted-foreground'>{authorRole}</p>}
        <p className='mt-0.5 text-xs text-muted-foreground'>{t('detail.authorLabel')}</p>
      </div>
    </div>
  )
}
