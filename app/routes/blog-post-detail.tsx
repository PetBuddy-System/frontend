import { useParams } from 'react-router'

import { BlogDetailPage, getBlogPostById } from '~/features/landing'

import type { Route } from './+types/blog-post-detail'

export function meta({ data }: Route.MetaArgs) {
  const postData = data as { post?: { title: string } } | undefined
  return [{ title: postData?.post?.title ?? 'Blog Post' }]
}

export default function BlogPostDetail() {
  const { postId } = useParams()

  const post = getBlogPostById(postId ?? '')

  if (!post) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-background text-foreground'>
        <h1 className='font-display text-3xl font-bold'>Post not found</h1>
        <a href='/blog' className='mt-4 text-primary hover:underline'>
          Back to Blog
        </a>
      </div>
    )
  }

  return <BlogDetailPage post={post} />
}
