import { useTranslation } from 'react-i18next'

import { BlogCard, type BlogPost } from './blog-card'

export interface BlogGridProps {
  posts: BlogPost[]
  selectedCategory: string
}

export function BlogGrid({ posts, selectedCategory }: BlogGridProps) {
  const { t } = useTranslation('blog')

  if (posts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center'>
        <span className='mb-3 text-4xl'>🐾</span>
        <h3 className='mb-2 text-lg font-semibold text-foreground'>{t('empty.title')}</h3>
        <p className='text-sm text-muted-foreground'>{t('empty.description')}</p>
      </div>
    )
  }

  const featuredPost = selectedCategory === 'all' || selectedCategory === 'featured' ? posts[0] : null
  const remainingPosts = featuredPost ? posts.slice(1) : posts

  return (
    <div className='flex flex-col gap-6'>
      {featuredPost && (
        <div className='mb-2'>
          <BlogCard post={featuredPost} featured />
        </div>
      )}

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {remainingPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
