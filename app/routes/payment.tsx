import { PaymentPage } from '~/features/products'
import type { Route } from './+types/payment'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Thanh toán đơn hàng - PetBuddy' }]
}

export default function PaymentRoute() {
  return <PaymentPage />
}
