import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '~/shared/lib/cn'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('markdown-body prose prose-sm max-w-none', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}

export function MarkdownPreviewSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='h-6 w-3/4 animate-pulse rounded-lg bg-muted' />
      <div className='space-y-2'>
        <div className='h-4 w-full animate-pulse rounded bg-muted' />
        <div className='h-4 w-5/6 animate-pulse rounded bg-muted' />
        <div className='h-4 w-4/5 animate-pulse rounded bg-muted' />
      </div>
    </div>
  )
}
