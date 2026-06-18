import { useParams } from 'react-router'

import { BlogDetailPage } from '~/features/landing'

import type { Route } from './+types/blog-post-detail'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Blog Post - PetBuddy' }]
}

export default function BlogPostDetail() {
  const { postId } = useParams()

  return <BlogDetailPage postId={postId ?? ''} />
}

