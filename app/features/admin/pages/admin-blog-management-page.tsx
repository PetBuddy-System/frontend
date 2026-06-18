/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { fetchBlogsApi, createBlogApi, updateBlogApi } from '~/shared/lib/blog'
import type { BlogResponse } from '~/shared/lib/blog'
import { MaterialIcon } from '~/shared/ui'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { AdminBlogPostTable, type BlogPost } from '../components/blog/admin-blog-post-table'
import { AdminCreateBlogPostModal } from '../components/blog/admin-create-blog-post-modal'
import type { BlogPostFormData } from '../components/blog/admin-create-blog-post-modal'

function mapToBlogPost(blog: BlogResponse): BlogPost & { markdownContent: string } {
  return {
    id: blog.blogId,
    title: blog.title,
    excerpt: blog.snippet || blog.content?.slice(0, 100) || '',
    label: blog.label?.toLowerCase() ?? 'all',
    author: blog.userId ? `User ${blog.userId.slice(0, 8)}` : 'PetBuddy',
    date: new Date(blog.createdAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    imageUrl: blog.imageUrls?.[0] || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
    isPublished: true,
    views: 0,
    markdownContent: blog.content || ''
  }
}

export function AdminBlogManagementPage() {
  const { t } = useTranslation('admin')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<(BlogPost & { markdownContent: string }) | null>(null)

  const loadPosts = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const res = await fetchBlogsApi({ size: 100 })
      if (res.success && res.data) {
        setPosts(res.data.content.map(mapToBlogPost))
      } else {
        setPosts([])
      }
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : 'Failed to fetch blogs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  const handleCreate = async (data: BlogPostFormData) => {
    try {
      const res = await createBlogApi(
        {
          title: data.title,
          content: data.markdownContent,
          label: data.label,
          snippet: data.excerpt
        },
        data.imageFiles.length > 0 ? data.imageFiles : undefined
      )

      if (res.success && res.data) {
        setPosts((prev) => [mapToBlogPost(res.data), ...prev])
        setIsModalOpen(false)
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Failed to create blog')
    }
  }

  const handleUpdate = async (data: BlogPostFormData) => {
    if (!editingPost) return
    try {
      const res = await updateBlogApi(
        editingPost.id,
        {
          title: data.title,
          content: data.markdownContent,
          label: data.label,
          snippet: data.excerpt
        },
        data.imageFiles.length > 0 ? data.imageFiles : undefined
      )

      if (res.success && res.data) {
        setPosts((prev) =>
          prev.map((p) => (p.id === editingPost.id ? mapToBlogPost(res.data) : p))
        )
        setIsModalOpen(false)
        setEditingPost(null)
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Failed to update blog')
    }
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post as BlogPost & { markdownContent: string })
    setIsModalOpen(true)
  }

  const handleDelete = () => {
    alert(t('blogManagement.actions.deleteNotSupported') || 'API backend chưa hỗ trợ xóa bài viết')
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='blog' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav titleKey='blogManagement.title' subtitleKey='blogManagement.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col justify-between gap-4 md:flex-row md:items-end'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('blogManagement.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('blogManagement.subtitle')}</p>
              </div>
              <button
                type='button'
                onClick={() => {
                  setEditingPost(null)
                  setIsModalOpen(true)
                }}
                className='inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-secondary px-6 text-sm font-bold text-secondary-foreground shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <MaterialIcon name='add' className='text-lg' />
                <span>{t('blogManagement.actions.add')}</span>
              </button>
            </section>

            {errorMsg && (
              <div className='flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
                <MaterialIcon name='error' className='shrink-0 text-[20px]' />
                <p>{errorMsg}</p>
                <button
                  type='button'
                  onClick={() => void loadPosts()}
                  className='ml-auto shrink-0 text-sm font-semibold underline'
                >
                  {t('error.retry') || 'Retry'}
                </button>
              </div>
            )}

            {isLoading ? (
              <div className='rounded-3xl border border-border bg-card p-8 shadow-sm space-y-4 animate-pulse'>
                <div className='h-8 bg-muted w-1/4 rounded' />
                <div className='h-12 bg-muted w-full rounded' />
                <div className='h-12 bg-muted w-full rounded' />
                <div className='h-12 bg-muted w-full rounded' />
              </div>
            ) : (
              <AdminBlogPostTable posts={posts} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </div>
        </main>
      </div>

      <AdminCreateBlogPostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingPost(null)
        }}
        onSubmit={editingPost ? handleUpdate : handleCreate}
        initialData={
          editingPost
            ? {
              title: editingPost.title,
              excerpt: editingPost.excerpt,
              label: editingPost.label,
              author: editingPost.author,
              imageFiles: [],
              existingImageUrl: editingPost.imageUrl,
              markdownContent: editingPost.markdownContent,
              isPublished: true
            }
            : undefined
        }
      />
    </div>
  )
}
