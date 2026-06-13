import { BlogPage } from '~/features/landing'

import type { Route } from './+types/blog'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Blog' }]
}

export default function Blog() {
  return <BlogPage />
}
