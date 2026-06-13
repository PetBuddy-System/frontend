import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  imageUrl: string
  isPublished: boolean
  views: number
}

export interface AdminBlogPostTableProps {
  posts: BlogPost[]
  onEdit: (post: BlogPost) => void
  onDelete: (post: BlogPost) => void
}

export function AdminBlogPostTable({ posts, onEdit, onDelete }: AdminBlogPostTableProps) {
  const { t } = useTranslation('admin')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredPosts =
    selectedCategory === 'all' ? posts : posts.filter((post) => post.category === selectedCategory)

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        {(['all', 'featured', 'nutrition', 'health', 'grooming', 'training', 'lifestyle'] as const).map(
          (cat) => (
            <button
              key={cat}
              type='button'
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-primary'
              )}
            >
              {t(`blogManagement.sidebar.${cat}`)}
            </button>
          )
        )}
      </div>

      <div className='overflow-x-auto rounded-3xl border border-border bg-card shadow-sm'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-border'>
              <th className='px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>
                {t('blogManagement.table.columns.post')}
              </th>
              <th className='px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>
                {t('blogManagement.table.columns.category')}
              </th>
              <th className='px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>
                {t('blogManagement.table.columns.author')}
              </th>
              <th className='px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>
                {t('blogManagement.table.columns.date')}
              </th>
              <th className='px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>
                {t('blogManagement.table.columns.status')}
              </th>
              <th className='px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>
                {t('blogManagement.table.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={6} className='px-5 py-12 text-center'>
                  <div className='flex flex-col items-center gap-2'>
                    <MaterialIcon name='article' className='text-4xl text-muted-foreground/50' />
                    <p className='text-sm text-muted-foreground'>{t('blogManagement.table.empty')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.id} className='transition-colors hover:bg-muted/50'>
                  <td className='px-5 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='h-12 w-16 shrink-0 overflow-hidden rounded-xl border border-border'>
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className='h-full w-full object-cover'
                          />
                        ) : (
                          <div className='flex h-full w-full items-center justify-center bg-muted'>
                            <MaterialIcon name='image' className='text-lg text-muted-foreground' />
                          </div>
                        )}
                      </div>
                      <div className='min-w-0'>
                        <p className='truncate font-semibold text-card-foreground'>{post.title}</p>
                        <p className='mt-0.5 line-clamp-1 text-xs text-muted-foreground'>{post.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-5 py-4'>
                    <span className='inline-block rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary-foreground'>
                      {t(`blogManagement.sidebar.${post.category}`)}
                    </span>
                  </td>
                  <td className='px-5 py-4'>
                    <span className='text-sm text-muted-foreground'>{post.author}</span>
                  </td>
                  <td className='px-5 py-4'>
                    <span className='text-sm text-muted-foreground'>{post.date}</span>
                  </td>
                  <td className='px-5 py-4'>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                        post.isPublished
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          post.isPublished ? 'bg-success' : 'bg-muted-foreground'
                        )}
                      />
                      {post.isPublished
                        ? t('blogManagement.table.published')
                        : t('blogManagement.table.draft')}
                    </span>
                  </td>
                  <td className='px-5 py-4'>
                    <div className='flex items-center justify-end gap-2'>
                      <button
                        type='button'
                        onClick={() => onEdit(post)}
                        className='flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary'
                        aria-label={t('blogManagement.actions.edit')}
                      >
                        <MaterialIcon name='edit' className='text-[18px]' />
                      </button>
                      <button
                        type='button'
                        onClick={() => onDelete(post)}
                        className='flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-destructive hover:text-destructive'
                        aria-label={t('blogManagement.actions.delete')}
                      >
                        <MaterialIcon name='delete' className='text-[18px]' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          {t('blogManagement.pagination.showing', {
            from: 1,
            to: filteredPosts.length,
            total: posts.length
          })}
        </p>
        <div className='flex items-center gap-1'>
          <button
            type='button'
            disabled
            className='flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground'
            aria-label={t('blogManagement.pagination.previous')}
          >
            <MaterialIcon name='chevron_left' className='text-[20px]' />
          </button>
          <button className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
            1
          </button>
          <button
            type='button'
            className='flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary'
            aria-label={t('blogManagement.pagination.next')}
          >
            <MaterialIcon name='chevron_right' className='text-[20px]' />
          </button>
        </div>
      </div>
    </div>
  )
}
