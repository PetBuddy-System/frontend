import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'
import { MarkdownPreviewSkeleton, MarkdownRenderer } from './markdown-renderer'
import { BlogImageUpload } from './blog-image-upload'
import { BlogPostPreviewCard } from './blog-post-preview-card'
import { BlogMarkdownTips } from './blog-markdown-tips'

export interface BlogPostFormData {
  title: string
  excerpt: string
  label: string
  author: string
  /** File ảnh bìa được chọn từ máy (dùng cho create / update) */
  imageFiles: File[]
  /** URL ảnh bìa hiện tại (dùng cho preview khi edit bài đã có ảnh trên S3) */
  existingImageUrl?: string
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
  const mdFileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '')
  const [label, setLabel] = useState(initialData?.label ?? 'featured')
  const [author, setAuthor] = useState(initialData?.author ?? '')
  const [imageFiles, setImageFiles] = useState<File[]>(initialData?.imageFiles ?? [])
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(initialData?.existingImageUrl ?? '')
  const [markdownContent, setMarkdownContent] = useState(initialData?.markdownContent ?? '')
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [isDragging, setIsDragging] = useState(false)

  // ─── Markdown file import ─────────────────────────────────────────────────
  const handleMdFileImport = useCallback((file: File) => {
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

  const handleMdDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        handleMdFileImport(file)
      }
    },
    [handleMdFileImport]
  )

  const handleMdFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleMdFileImport(file)
      }
    },
    [handleMdFileImport]
  )

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    onSubmit({
      title,
      excerpt,
      label,
      author,
      imageFiles,
      existingImageUrl: imagePreviewUrl,
      markdownContent,
      isPublished
    })
  }, [title, excerpt, label, author, imageFiles, imagePreviewUrl, markdownContent, isPublished, onSubmit])

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
                        {t('blogManagement.create.fields.label')}
                      </span>
                      <select
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
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

                    <BlogImageUpload
                      imageFiles={imageFiles}
                      imagePreviewUrl={imagePreviewUrl}
                      onChange={(files, previewUrl) => {
                        setImageFiles(files)
                        setImagePreviewUrl(previewUrl)
                      }}
                      onRemove={() => {
                        setImageFiles([])
                        setImagePreviewUrl('')
                      }}
                    />
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
                        onClick={() => mdFileInputRef.current?.click()}
                        className='inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20'
                      >
                        <MaterialIcon name='upload_file' className='text-[14px]' />
                        {t('blogManagement.create.importMd')}
                      </button>
                      <input
                        ref={mdFileInputRef}
                        type='file'
                        accept='.md'
                        className='hidden'
                        onChange={handleMdFileChange}
                      />
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleMdDrop}
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
              <BlogPostPreviewCard
                title={title}
                excerpt={excerpt}
                label={label}
                author={author}
                imagePreviewUrl={imagePreviewUrl}
              />

              <BlogMarkdownTips />
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
