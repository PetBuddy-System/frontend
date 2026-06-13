import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'
import { MarkdownPreviewSkeleton, MarkdownRenderer } from './markdown-renderer'

export interface BlogPostFormData {
  title: string
  excerpt: string
  category: string
  author: string
  imageUrl: string
  markdownContent: string
  isPublished: boolean
}

export interface AdminCreateBlogPostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: BlogPostFormData) => void
  initialData?: Partial<BlogPostFormData>
}

const CATEGORIES = ['featured', 'nutrition', 'health', 'grooming', 'training', 'lifestyle'] as const

export function AdminCreateBlogPostModal({ isOpen, onClose, onSubmit, initialData }: AdminCreateBlogPostModalProps) {
  const { t } = useTranslation('admin')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '')
  const [category, setCategory] = useState(initialData?.category ?? 'featured')
  const [author, setAuthor] = useState(initialData?.author ?? '')
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '')
  const [markdownContent, setMarkdownContent] = useState(initialData?.markdownContent ?? '')
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [isDragging, setIsDragging] = useState(false)

  const handleFileImport = useCallback((file: File) => {
    if (!file.name.endsWith('.md')) {
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setMarkdownContent(text)
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileImport(file)
      }
    },
    [handleFileImport]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileImport(file)
      }
    },
    [handleFileImport]
  )

  const handleSubmit = useCallback(() => {
    onSubmit({
      title,
      excerpt,
      category,
      author,
      imageUrl,
      markdownContent,
      isPublished
    })
  }, [title, excerpt, category, author, imageUrl, markdownContent, isPublished, onSubmit])

  if (!isOpen) {
    return null
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label={t('blogManagement.create.close')}
        className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
        onClick={onClose}
      />

      <section className='relative flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl'>
        <header className='flex flex-col gap-4 border-b border-border px-5 py-5 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-[0.25em] text-primary'>PetBuddy Ops</p>
            <h2 className='mt-2 font-display text-2xl font-extrabold text-card-foreground md:text-3xl'>
              {initialData?.title ? t('blogManagement.create.editTitle') : t('blogManagement.create.title')}
            </h2>
            <p className='mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground'>
              {t('blogManagement.create.subtitle')}
            </p>
          </div>

          <div className='flex flex-wrap gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-bold text-card-foreground transition-colors hover:bg-muted'
            >
              {t('blogManagement.create.cancel')}
            </button>
            <button
              type='button'
              onClick={handleSubmit}
              className='inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring'
            >
              <MaterialIcon name='save' className='text-lg' />
              {t('blogManagement.create.save')}
            </button>
          </div>
        </header>

        <div className='min-h-0 flex-1 overflow-y-auto px-5 py-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]'>
            <article className='rounded-3xl border border-border bg-muted/40 p-6 shadow-sm'>
              <div className='mb-4 flex items-center gap-1 rounded-xl border border-border bg-card p-1'>
                {(['editor', 'preview'] as const).map((tab) => (
                  <button
                    key={tab}
                    type='button'
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                      activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <MaterialIcon name={tab === 'editor' ? 'edit' : 'visibility'} className='text-[16px]' />
                    {t(`blogManagement.create.tabs.${tab}`)}
                  </button>
                ))}
              </div>

              {activeTab === 'editor' ? (
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <label className='space-y-2'>
                      <span className='text-sm font-semibold text-card-foreground'>
                        {t('blogManagement.create.fields.title')}
                      </span>
                      <input
                        type='text'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t('blogManagement.create.placeholders.title')}
                        className='h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring'
                      />
                    </label>

                    <label className='space-y-2'>
                      <span className='text-sm font-semibold text-card-foreground'>
                        {t('blogManagement.create.fields.category')}
                      </span>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className='h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring'
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {t(`blogManagement.sidebar.${cat}`)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <label className='space-y-2'>
                      <span className='text-sm font-semibold text-card-foreground'>
                        {t('blogManagement.create.fields.author')}
                      </span>
                      <input
                        type='text'
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder={t('blogManagement.create.placeholders.author')}
                        className='h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring'
                      />
                    </label>

                    <label className='space-y-2'>
                      <span className='text-sm font-semibold text-card-foreground'>
                        {t('blogManagement.create.fields.imageUrl')}
                      </span>
                      <input
                        type='url'
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder={t('blogManagement.create.placeholders.imageUrl')}
                        className='h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring'
                      />
                    </label>
                  </div>

                  <label className='space-y-2'>
                    <span className='text-sm font-semibold text-card-foreground'>
                      {t('blogManagement.create.fields.excerpt')}
                    </span>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={2}
                      placeholder={t('blogManagement.create.placeholders.excerpt')}
                      className='w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-card-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring'
                    />
                  </label>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-semibold text-card-foreground'>
                        {t('blogManagement.create.fields.content')}
                      </span>
                      <button
                        type='button'
                        onClick={() => fileInputRef.current?.click()}
                        className='inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20'
                      >
                        <MaterialIcon name='upload_file' className='text-[14px]' />
                        {t('blogManagement.create.importMd')}
                      </button>
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='.md'
                        className='hidden'
                        onChange={handleFileChange}
                      />
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={cn(
                        'rounded-2xl border-2 border-dashed p-4 transition-colors',
                        isDragging ? 'border-primary bg-primary/5' : 'border-border'
                      )}
                    >
                      <textarea
                        value={markdownContent}
                        onChange={(e) => setMarkdownContent(e.target.value)}
                        rows={10}
                        placeholder={t('blogManagement.create.placeholders.content')}
                        className='w-full resize-none bg-transparent text-sm text-card-foreground outline-none placeholder:text-muted-foreground'
                      />
                    </div>
                  </div>

                  <label className='flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4'>
                    <div className='flex items-center gap-3'>
                      <MaterialIcon
                        name={isPublished ? 'public' : 'lock'}
                        className={cn('text-xl', isPublished ? 'text-success' : 'text-muted-foreground')}
                      />
                      <div>
                        <span className='text-sm font-semibold text-card-foreground'>
                          {t('blogManagement.create.fields.publish')}
                        </span>
                        <p className='text-xs text-muted-foreground'>
                          {isPublished
                            ? t('blogManagement.create.publishedHint')
                            : t('blogManagement.create.draftHint')}
                        </p>
                      </div>
                    </div>
                    <input
                      type='checkbox'
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className='relative h-5 w-10 rounded-full bg-muted transition-colors checked:bg-success before:absolute before:left-1 before:top-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-5'
                    />
                  </label>
                </div>
              ) : (
                <div className='min-h-[400px] rounded-2xl border border-border bg-card p-4'>
                  {markdownContent ? <MarkdownRenderer content={markdownContent} /> : <MarkdownPreviewSkeleton />}
                </div>
              )}
            </article>

            <aside className='space-y-6'>
              <section className='rounded-3xl border border-border bg-card p-6 shadow-sm'>
                <h3 className='text-base font-extrabold text-card-foreground'>
                  {t('blogManagement.create.preview.title')}
                </h3>
                <p className='mt-1 text-sm text-muted-foreground'>{t('blogManagement.create.preview.subtitle')}</p>

                <div className='mt-4 overflow-hidden rounded-2xl border border-border'>
                  <div className='h-40 w-full bg-muted'>
                    {imageUrl ? (
                      <img src={imageUrl} alt='' className='h-full w-full object-cover' />
                    ) : (
                      <div className='flex h-full items-center justify-center'>
                        <MaterialIcon name='image' className='text-4xl text-muted-foreground' />
                      </div>
                    )}
                  </div>
                  <div className='bg-card p-4'>
                    <span className='mb-2 inline-block rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground'>
                      {t(`blogManagement.sidebar.${category}`)}
                    </span>
                    <h4 className='font-display text-lg font-bold text-card-foreground line-clamp-2'>
                      {title || t('blogManagement.create.preview.titlePlaceholder')}
                    </h4>
                    <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                      {excerpt || t('blogManagement.create.preview.excerptPlaceholder')}
                    </p>
                    <div className='mt-3 flex items-center gap-2 text-xs text-muted-foreground'>
                      <MaterialIcon name='person' className='text-[12px]' />
                      <span>{author || 'Author name'}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className='rounded-3xl bg-primary p-6 text-primary-foreground shadow-sm'>
                <MaterialIcon name='lightbulb' className='text-2xl' />
                <h3 className='mt-3 text-base font-extrabold'>{t('blogManagement.create.tip.title')}</h3>
                <p className='mt-2 text-sm leading-relaxed text-primary-foreground/90'>
                  {t('blogManagement.create.tip.text')}
                </p>
              </section>

              <section className='rounded-3xl border border-border bg-card p-6 shadow-sm'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground'>
                    <MaterialIcon name='pets' className='text-2xl' />
                  </div>
                  <div>
                    <p className='text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground'>
                      {t('blogManagement.create.accent.label')}
                    </p>
                    <h3 className='text-lg font-extrabold text-card-foreground'>
                      {t('blogManagement.create.accent.title')}
                    </h3>
                  </div>
                </div>
                <p className='mt-4 text-sm text-muted-foreground'>{t('blogManagement.create.accent.text')}</p>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
