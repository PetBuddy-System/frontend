import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '~/shared/lib/cn'

interface BlogArticleContentProps {
  content: string
  className?: string
}

export function BlogArticleContent({ content, className }: BlogArticleContentProps) {
  return (
    <div className={cn('article-content prose prose-slate max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className='font-display text-2xl font-bold text-foreground mt-10 mb-4'>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className='font-display text-xl font-bold text-foreground mt-8 mb-3'>{children}</h3>
          ),
          p: ({ children }) => <p className='text-muted-foreground leading-relaxed mb-5'>{children}</p>,
          ul: ({ children }) => (
            <ul className='list-disc list-inside space-y-2 text-muted-foreground mb-5'>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className='list-decimal list-inside space-y-2 text-muted-foreground mb-5'>{children}</ol>
          ),
          li: ({ children }) => <li className='text-muted-foreground'>{children}</li>,
          a: ({ href, children }) => (
            <a href={href} className='text-primary underline underline-offset-2 hover:opacity-80'>
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className='border-l-4 border-primary pl-4 my-6 italic text-muted-foreground'>
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className='bg-muted px-1.5 py-0.5 rounded text-sm text-primary font-mono'>{children}</code>
          ),
          pre: ({ children }) => (
            <pre className='bg-muted p-4 rounded-xl overflow-x-auto my-5'>{children}</pre>
          ),
          img: ({ src, alt }) => (
            <img src={src} alt={alt ?? ''} className='rounded-xl w-full my-6' loading='lazy' />
          ),
          hr: () => <hr className='border-border my-8' />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
