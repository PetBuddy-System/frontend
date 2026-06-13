import { ServicesPage } from '~/features/services'

import type { Route } from './+types/services'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Dịch vụ Spa & Grooming - PetStore.vn' }]
}

export default function Services() {
  return <ServicesPage />
}
