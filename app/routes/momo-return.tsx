import { MomoReturnPage } from '~/features/products'
import type { Route } from './+types/momo-return'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Xác nhận thanh toán MoMo - PetBuddy' }]
}

export default function PaymentMomoReturn() {
  return <MomoReturnPage />
}
