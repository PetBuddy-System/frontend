import { Link } from 'react-router'

import { useTranslation } from 'react-i18next'

import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { MaterialIcon } from '~/shared/ui'

import { AuthorCard } from '../components/blog/blog-author-card'
import { BlogArticleContent } from '../components/blog/blog-article-content'
import { RelatedPosts } from '../components/blog/blog-related-posts'
import { MOCK_POSTS } from '../data/posts'
import type { BlogPostDetail } from '../data/post-details'

export interface BlogDetailPageProps {
  post: BlogPostDetail
}

export function BlogDetailPage({ post }: BlogDetailPageProps) {
  const { t } = useTranslation('blog')

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader activeItem='blog' />

      <main className='flex-1 pb-24 md:pb-0'>
        {/* Breadcrumb */}
        <div className='mx-auto max-w-4xl px-4 pt-8 md:px-6'>
          <nav className='flex items-center gap-1 text-sm text-muted-foreground' aria-label='Breadcrumb'>
            <Link to='/blog' className='hover:text-primary transition-colors'>
              {t('detail.nav.blog')}
            </Link>
            <MaterialIcon name='chevron_right' className='text-base' />
            <span className='text-primary font-semibold'>{post.categoryLabel}</span>
          </nav>
        </div>

        {/* Article Header */}
        <header className='mx-auto max-w-4xl px-4 pb-8 md:px-6'>
          <h1 className='mt-6 font-display text-3xl font-bold leading-tight text-foreground md:text-5xl'>
            {post.title}
          </h1>

          <div className='mt-6 flex flex-wrap items-center gap-6'>
            <AuthorCard author={post.author} authorRole={post.authorRole} />

            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
              <div className='flex items-center gap-1.5'>
                <MaterialIcon name='calendar_today' className='text-base' />
                <span>{post.date}</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <MaterialIcon name='schedule' className='text-base' />
                <span>
                  {post.readTime} {t('detail.readTime')}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div className='mx-auto max-w-5xl px-4 md:px-6'>
          <div className='aspect-[21/9] overflow-hidden rounded-2xl shadow-lg'>
            <img src={post.imageUrl} alt={post.title} className='h-full w-full object-cover' />
          </div>
        </div>

        {/* Content Area - Full Width */}
        <div className='mx-auto mt-12 max-w-4xl px-4 md:px-6'>
          <article>
            <BlogArticleContent content={post.markdownContent} />
          </article>
        </div>

        {/* Related Posts Section */}
        <div className='mx-auto mt-16 max-w-5xl px-4 md:px-6'>
          <RelatedPosts posts={MOCK_POSTS} currentPostId={post.id} />
        </div>

        {/* Share Section */}
        <div className='mx-auto mt-12 max-w-4xl px-4 md:px-6'>
          <div className='rounded-2xl border border-border/60 bg-card p-6'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-3'>
                <span className='text-sm font-semibold text-muted-foreground'>{t('detail.share')}</span>
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
                  #{post.categoryLabel}
                </span>
                <span className='rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground'>
                  #Health
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className='mx-auto mt-8 max-w-4xl px-4 pb-12 md:px-6'>
          <div className='rounded-2xl border border-border/60 bg-card p-6'>
            <h3 className='font-display text-xl font-bold text-foreground'>{t('detail.comments')}</h3>
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
      </main>

      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}
