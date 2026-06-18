/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'
import { fetchBlogsApi } from '~/shared/lib/blog'
import type { BlogResponse, PageMeta } from '~/shared/lib/blog'
import { MaterialIcon } from '~/shared/ui'

import { BlogGrid } from '../components/blog/blog-grid'
import { BlogHero } from '../components/blog/blog-hero'
import { BlogSidebar, type BlogCategory } from '../components/blog/blog-sidebar'
import type { BlogPost } from '../data/posts'

const DEFAULT_PAGE_SIZE = 10

/** Map API response → BlogPost interface dùng trong BlogCard */
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

export function BlogPage() {
  const { t } = useTranslation('blog')

  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // Debounce search keyword (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword)
      setCurrentPage(0)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchKeyword])

  // Reset page khi đổi category
  useEffect(() => {
    setCurrentPage(0)
  }, [selectedCategory])

  // Fetch blogs từ API
  const fetchBlogs = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetchBlogsApi({
        keyword: debouncedKeyword || undefined,
        page: currentPage,
        size: DEFAULT_PAGE_SIZE
      })

      if (response.success && response.data) {
        const mapped = response.data.content.map(mapToBlogPost)
        setPosts(mapped)
        setPageMeta(response.data.page)
      } else {
        setPosts([])
        setPageMeta(null)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('error.fetch')
      setErrorMessage(message)
      setPosts([])
      setPageMeta(null)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedKeyword, currentPage, t])

  useEffect(() => {
    void fetchBlogs()
  }, [fetchBlogs])

  // Filter theo category (client-side)
  const filteredPosts =
    selectedCategory === 'all'
      ? posts
      : posts.filter((post) => post.category === selectedCategory)

  const totalPages = pageMeta?.totalPages ?? 0

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader activeItem='blog' />

      <main className='flex-1 pb-24 md:pb-0'>
        <BlogHero />

        <div className='mx-auto max-w-6xl px-4 py-12 md:px-6'>
          {/* Search bar */}
          <div className='mb-8'>
            <div className='relative mx-auto max-w-xl'>
              <MaterialIcon
                name='search'
                className='absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-muted-foreground'
              />
              <input
                type='text'
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={t('search.placeholder')}
                className='w-full rounded-xl border border-border bg-card py-3 pl-12 pr-4 text-sm text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring'
              />
              {searchKeyword && (
                <button
                  type='button'
                  onClick={() => setSearchKeyword('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  aria-label={t('search.clear')}
                >
                  <MaterialIcon name='close' className='text-[18px]' />
                </button>
              )}
            </div>
          </div>

          <div className='flex flex-col gap-8 lg:flex-row'>
            <BlogSidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

            <section className='min-w-0 flex-1'>
              <div className='mb-6 flex items-center justify-between border-b border-border/60 pb-4'>
                <h2 className='font-display text-lg font-semibold text-foreground'>
                  {t(`sidebar.${selectedCategory}`)}
                </h2>
                <span className='text-sm text-muted-foreground'>
                  {isLoading ? '...' : `${filteredPosts.length} ${t('pagination.posts')}`}
                </span>
              </div>

              {/* Error state */}
              {errorMessage && (
                <div className='mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
                  <MaterialIcon name='error' className='shrink-0 text-[20px]' />
                  <p>{errorMessage}</p>
                  <button
                    type='button'
                    onClick={() => void fetchBlogs()}
                    className='ml-auto shrink-0 text-sm font-semibold underline'
                  >
                    {t('error.retry')}
                  </button>
                </div>
              )}

              {/* Loading skeleton */}
              {isLoading ? (
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className='animate-pulse overflow-hidden rounded-xl border border-border/60 bg-card'
                    >
                      <div className='h-48 bg-muted' />
                      <div className='space-y-3 p-5'>
                        <div className='h-3 w-2/3 rounded bg-muted' />
                        <div className='h-5 w-full rounded bg-muted' />
                        <div className='h-3 w-full rounded bg-muted' />
                        <div className='h-3 w-1/2 rounded bg-muted' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <BlogGrid posts={filteredPosts} selectedCategory={selectedCategory} />
              )}

              {/* Pagination */}
              {!isLoading && totalPages > 1 && (
                <div className='mt-10 flex items-center justify-center gap-2'>
                  <button
                    type='button'
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    className='flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40'
                    aria-label={t('pagination.prev')}
                  >
                    <MaterialIcon name='chevron_left' className='text-[20px]' />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type='button'
                      onClick={() => setCurrentPage(i)}
                      className={
                        i === currentPage
                          ? 'flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm'
                          : 'flex h-10 w-10 items-center justify-center rounded-lg border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                      }
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    type='button'
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    className='flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40'
                    aria-label={t('pagination.next')}
                  >
                    <MaterialIcon name='chevron_right' className='text-[20px]' />
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
      <SiteBottomNav />
      <SiteFab />
    </div>
  )
}
