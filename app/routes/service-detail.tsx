import { ServiceDetailPage } from '~/features/services'

import type { Route } from './+types/service-detail'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chi tiet dich vu' }]
}

export default function ServiceDetail() {
  return <ServiceDetailPage />
}
