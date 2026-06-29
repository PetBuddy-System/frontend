import { ProductDetailPage } from '~/features/products'

import type { Route } from './+types/product-detail'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Chi tiet san pham' }]
}

export default function ProductDetail() {
  return <ProductDetailPage />
}
