import { AdminBlogManagementPage } from '~/features/admin'

import type { Route } from './+types/admin-blog-management'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Blog Management' }]
}

export default function AdminBlogManagement() {
  return <AdminBlogManagementPage />
}
