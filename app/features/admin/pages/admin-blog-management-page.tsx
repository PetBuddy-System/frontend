import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { MaterialIcon } from '~/shared/ui'

import { AdminBlogPostTable, type BlogPost } from '../components/blog/admin-blog-post-table'
import { AdminCreateBlogPostModal, type BlogPostFormData } from '../components/blog/admin-create-blog-post-modal'

const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Top 10 Essential Supplies Every New Pet Owner Needs',
    excerpt: 'Bringing a new pet home is exciting...',
    category: 'featured',
    author: 'PetBuddy Team',
    date: 'Jan 15, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    isPublished: true,
    views: 1250
  },
  {
    id: '2',
    title: 'Understanding Your Dog Body Language',
    excerpt: 'Dogs communicate through body language...',
    category: 'training',
    author: 'Dr. Minh Tran',
    date: 'Jan 12, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
    isPublished: true,
    views: 980
  },
  {
    id: '3',
    title: 'The Best Diet Plan for Puppies',
    excerpt: 'Puppies have different nutritional needs...',
    category: 'nutrition',
    author: 'Dr. Lan Nguyen',
    date: 'Jan 10, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&q=80',
    isPublished: false,
    views: 0
  }
]

export function AdminBlogManagementPage() {
  const { t } = useTranslation('admin')
  const [posts, setPosts] = useState<BlogPost[]>(MOCK_POSTS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)

  const handleCreate = (data: BlogPostFormData) => {
    const newPost: BlogPost = {
      id: String(Date.now()),
      title: data.title,
      excerpt: data.excerpt,
      category: data.category,
      author: data.author,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      imageUrl: data.imageUrl,
      isPublished: data.isPublished,
      views: 0
    }
    setPosts((prev) => [newPost, ...prev])
    setIsModalOpen(false)
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const handleDelete = (post: BlogPost) => {
    if (window.confirm(t('blogManagement.confirmDelete'))) {
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
    }
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

            <AdminBlogPostTable posts={posts} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </main>
      </div>

      <AdminCreateBlogPostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingPost(null)
        }}
        onSubmit={
          editingPost
            ? (data) => {
                setPosts((prev) =>
                  prev.map((p) =>
                    p.id === editingPost.id
                      ? {
                          ...p,
                          title: data.title,
                          excerpt: data.excerpt,
                          category: data.category,
                          author: data.author,
                          imageUrl: data.imageUrl,
                          isPublished: data.isPublished
                        }
                      : p
                  )
                )
                setIsModalOpen(false)
                setEditingPost(null)
              }
            : handleCreate
        }
        initialData={
          editingPost
            ? {
                title: editingPost.title,
                excerpt: editingPost.excerpt,
                category: editingPost.category,
                author: editingPost.author,
                imageUrl: editingPost.imageUrl,
                isPublished: editingPost.isPublished
              }
            : undefined
        }
      />
    </div>
  )
}
