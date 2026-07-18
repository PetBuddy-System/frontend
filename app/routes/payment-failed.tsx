import { PaymentFailedPage } from '~/features/products'
import type { Route } from './+types/payment-failed'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Thanh toán thất bại - PetBuddy' }]
}

export default function PaymentFailedRoute() {
  return <PaymentFailedPage />
}
