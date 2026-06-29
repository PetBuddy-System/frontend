import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'
import type { BlogPost } from '~/features/landing/data/posts'

interface RelatedPostsProps {
  posts: BlogPost[]
  currentPostId: string
  className?: string
}

export function RelatedPosts({ posts, currentPostId, className }: RelatedPostsProps) {
  const { t } = useTranslation('blog')
  const relatedPosts = posts.filter((p) => p.id !== currentPostId).slice(0, 3)

  return (
    <aside className={cn('space-y-6', className)}>
      <h3 className='text-sm font-bold uppercase tracking-wider text-muted-foreground'>
        {t('detail.relatedTitle')}
      </h3>
      <div className='space-y-4'>
        {relatedPosts.map((post) => (
          <a
            key={post.id}
            href={`/blog/${post.id}`}
            className='group flex gap-4 rounded-xl border border-border/60 bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md'
          >
            <div className='h-20 w-24 shrink-0 overflow-hidden rounded-lg'>
              <img
                src={post.imageUrl}
                alt={post.title}
                className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
              />
            </div>
            <div className='flex min-w-0 flex-1 flex-col justify-center'>
              <p className='mb-1 text-xs font-semibold text-primary'>{post.categoryLabel}</p>
              <h4 className='line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary'>
                {post.title}
              </h4>
              <div className='mt-1 flex items-center gap-1 text-xs text-muted-foreground'>
                <MaterialIcon name='person' className='text-[12px]' />
                <span>{post.author}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </aside>
  )
}
