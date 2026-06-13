import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SiteBottomNav, SiteFab, SiteFooter, SiteHeader } from '~/shared/components'

import { BlogGrid } from '../components/blog/blog-grid'
import { BlogHero } from '../components/blog/blog-hero'
import { BlogSidebar, type BlogCategory } from '../components/blog/blog-sidebar'
import { MOCK_POSTS, type BlogPost } from '../data/posts'

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  featured: 'Featured',
  nutrition: 'Nutrition',
  health: 'Health',
  grooming: 'Grooming',
  training: 'Training',
  lifestyle: 'Lifestyle'
}

export function BlogPage() {
  const { t } = useTranslation('blog')
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>('all')

  const filteredPosts: BlogPost[] =
    selectedCategory === 'all'
      ? MOCK_POSTS
      : MOCK_POSTS.map((post: BlogPost) => ({
          ...post,
          categoryLabel: CATEGORY_LABELS[post.category] ?? post.categoryLabel
        })).filter((post: BlogPost) => post.category === selectedCategory)

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader activeItem='blog' />

      <main className='flex-1 pb-24 md:pb-0'>
        <BlogHero />

        <div className='mx-auto max-w-6xl px-4 py-12 md:px-6'>
          <div className='flex flex-col gap-8 lg:flex-row'>
            <BlogSidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

            <section className='min-w-0 flex-1'>
              <div className='mb-6 flex items-center justify-between border-b border-border/60 pb-4'>
                <h2 className='font-display text-lg font-semibold text-foreground'>
                  {t(`sidebar.${selectedCategory}`)}
                </h2>
                <span className='text-sm text-muted-foreground'>
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                </span>
              </div>

              <BlogGrid posts={filteredPosts} selectedCategory={selectedCategory} />
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
