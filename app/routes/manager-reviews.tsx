import { ManagerReviewsPage } from '~/features/manager'

import type { Route } from './+types/manager-reviews'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Quản lý đánh giá - PetBuddy' }]
}

export default function ManagerReviews() {
  return <ManagerReviewsPage />
}
