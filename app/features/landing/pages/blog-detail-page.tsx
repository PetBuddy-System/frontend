/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { fetchBlogByIdApi, fetchBlogsApi } from '../services/blog'
import type { BlogResponse } from '~/shared/lib/blog'
import { MaterialIcon } from '~/shared/ui'

import { AuthorCard } from '../components/blog/blog-author-card'
import { BlogArticleContent } from '../components/blog/blog-article-content'
import { RelatedPosts } from '../components/blog/blog-related-posts'
import { BlogShareSection } from '../components/blog/blog-share-section'
import { BlogCommentsSection } from '../components/blog/blog-comments-section'
import { BlogDetailSkeleton } from '../components/blog/blog-detail-skeleton'
import type { BlogPost } from '../data/posts'

export interface BlogDetailPageProps {
  postId: string
}

function mapToBlogPost(blog: BlogResponse): BlogPost {
  return {
    id: blog.blogId,
    title: blog.title,
    excerpt: blog.snippet || blog.content?.slice(0, 150) + '...' || '',
    category: blog.label?.toLowerCase() ?? 'all',
    categoryLabel: blog.label ?? '',
    author: blog.userId ? `User ${blog.userId.slice(0, 8)}` : 'PetBuddy',
    date: new Date(blog.createdAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    imageUrl: blog.imageUrls?.[0] || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80'
  }
}

export function BlogDetailPage({ postId }: BlogDetailPageProps) {
  const { t } = useTranslation('blog')

  const [post, setPost] = useState<BlogResponse | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const loadPostData = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const [detailRes, listRes] = await Promise.all([
        fetchBlogByIdApi(postId),
        fetchBlogsApi({ size: 10 }).catch(() => null)
      ])

      if (detailRes.success && detailRes.data) {
        setPost(detailRes.data)
        document.title = `${detailRes.data.title} - PetBuddy`
      } else {
        setErrorMsg('Failed to load post detail')
      }

      if (listRes && listRes.success && listRes.data) {
        const mapped = listRes.data.content.map(mapToBlogPost)
        setRelatedPosts(mapped)
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    void loadPostData()
  }, [loadPostData])

  if (isLoading) {
    return <BlogDetailSkeleton />
  }

  if (errorMsg) {
    const isAuthError =
      errorMsg.includes('401') ||
      errorMsg.includes('unauthorized') ||
      errorMsg.includes('authenticated') ||
      errorMsg.toLowerCase().includes('đăng nhập')

    return (
      <div className='flex min-h-screen flex-col bg-background text-foreground'>
        <SiteHeader activeItem='blog' />
        <main className='flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto'>
          {isAuthError ? (
            <div className='space-y-6'>
              <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-primary'>
                <MaterialIcon name='lock' className='text-3xl' />
              </div>
              <div>
                <h1 className='font-display text-2xl font-bold'>{t('error.authTitle')}</h1>
                <p className='mt-2 text-muted-foreground text-sm'>{t('error.authDescription')}</p>
              </div>
              <Link
                to='/login'
                className='inline-flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 shadow-md'
              >
                {t('error.loginButton')}
              </Link>
            </div>
          ) : (
            <div className='space-y-6'>
              <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive'>
                <MaterialIcon name='error' className='text-3xl' />
              </div>
              <div>
                <h1 className='font-display text-2xl font-bold'>{t('detail.notFound.title')}</h1>
                <p className='mt-2 text-muted-foreground text-sm'>{errorMsg}</p>
              </div>
              <div className='flex flex-col gap-3 w-full'>
                <button
                  type='button'
                  onClick={() => void loadPostData()}
                  className='inline-flex h-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 shadow-md'
                >
                  {t('error.retry')}
                </button>
                <Link
                  to='/blog'
                  className='inline-flex h-11 items-center justify-center rounded-full border border-border bg-card text-sm font-bold text-foreground transition-colors hover:bg-muted'
                >
                  {t('detail.notFound.backLink')}
                </Link>
              </div>
            </div>
          )}
        </main>
        <SiteFooter />
        <SiteBottomNav />
        <SiteFab />
      </div>
    )
  }

  if (!post) {
    return (
      <div className='flex min-h-screen flex-col bg-background text-foreground'>
        <SiteHeader activeItem='blog' />
        <main className='flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto'>
          <div className='space-y-6'>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground'>
              <MaterialIcon name='description' className='text-3xl' />
            </div>
            <div>
              <h1 className='font-display text-2xl font-bold'>{t('detail.notFound.title')}</h1>
            </div>
            <Link
              to='/blog'
              className='inline-flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 shadow-md'
            >
              {t('detail.notFound.backLink')}
            </Link>
          </div>
        </main>
        <SiteFooter />
        <SiteBottomNav />
        <SiteFab />
      </div>
    )
  }

  const categoryLabel = post.label
    ? post.label.charAt(0).toUpperCase() + post.label.slice(1)
    : ''

  const formattedDate = new Date(post.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  // Estimate read time based on word count
  const wordsPerMinute = 200
  const words = post.content ? post.content.split(/\s+/).length : 0
  const estimatedReadTime = Math.max(1, Math.ceil(words / wordsPerMinute))

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
            <span className='text-primary font-semibold'>{categoryLabel}</span>
          </nav>
        </div>

        {/* Article Header */}
        <header className='mx-auto max-w-4xl px-4 pb-8 md:px-6'>
          <h1 className='mt-6 font-display text-3xl font-bold leading-tight text-foreground md:text-5xl'>
            {post.title}
          </h1>

          <div className='mt-6 flex flex-wrap items-center gap-6'>
            <AuthorCard author={post.userId ? `User ${post.userId.slice(0, 8)}` : 'PetBuddy'} authorRole='Author' />

            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
              <div className='flex items-center gap-1.5'>
                <MaterialIcon name='calendar_today' className='text-base' />
                <span>{formattedDate}</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <MaterialIcon name='schedule' className='text-base' />
                <span>
                  {estimatedReadTime} {t('detail.readTime')}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div className='mx-auto max-w-5xl px-4 md:px-6'>
          <div className='aspect-[21/9] overflow-hidden rounded-2xl shadow-lg'>
            <img
              src={
                post.imageUrls?.[0] ||
                'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80'
              }
              alt={post.title}
              className='h-full w-full object-cover'
            />
          </div>
        </div>

        {/* Content Area - Full Width */}
        <div className='mx-auto mt-12 max-w-4xl px-4 md:px-6'>
          <article>
            <BlogArticleContent content={post.content} />
          </article>
        </div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <div className='mx-auto mt-16 max-w-5xl px-4 md:px-6'>
            <RelatedPosts posts={relatedPosts} currentPostId={post.blogId} />
          </div>
        )}

        <BlogShareSection categoryLabel={categoryLabel} />

        <BlogCommentsSection />
      </main>

      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}
