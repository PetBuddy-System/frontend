import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  categoryLabel: string
  author: string
  date: string
  imageUrl: string
}

export interface BlogCardProps {
  post: BlogPost
  featured?: boolean
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const { t } = useTranslation('blog')

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
        featured && 'md:flex-row'
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden bg-muted',
          featured ? 'h-48 w-full md:h-auto md:w-1/2' : 'h-48 w-full'
        )}
      >
        <img
          src={post.imageUrl}
          alt={post.title}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
        <span className='absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground'>
          {post.categoryLabel}
        </span>
      </div>

      <div className='flex flex-1 flex-col gap-3 p-5'>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <MaterialIcon name='person' className='text-[14px]' />
          <span>
            {t('card.author')} {post.author}
          </span>
          <span aria-hidden>·</span>
          <MaterialIcon name='calendar_today' className='text-[14px]' />
          <span>{post.date}</span>
        </div>

        <h3
          className={cn(
            'font-semibold leading-snug text-foreground',
            featured ? 'text-lg md:text-xl' : 'text-base'
          )}
        >
          {post.title}
        </h3>

        <p className='line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground'>{post.excerpt}</p>

        <a
          href={`/blog/${post.id}`}
          className='inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80'
        >
          {t('card.readMore')}
          <MaterialIcon name='arrow_forward' className='text-[16px]' />
        </a>
      </div>
    </article>
  )
}
