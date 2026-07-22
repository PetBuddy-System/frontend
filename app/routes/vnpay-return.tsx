import { VnPayReturnPage } from '~/features/products'
import type { Route } from './+types/vnpay-return'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Xác nhận thanh toán VNPAY - PetBuddy' }]
}

export default function PaymentVnPayReturn() {
  return <VnPayReturnPage />
}
