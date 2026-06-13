import { ProductsPage } from '~/features/products'

import type { Route } from './+types/products'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'San pham' }]
}

export default function Products() {
  return <ProductsPage />
}
