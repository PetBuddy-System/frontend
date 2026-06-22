import { AdminShippingPage } from '~/features/admin'

export function meta() {
  return [
    { title: 'PetStore Ops - Cấu hình vận chuyển' },
    { name: 'description', content: 'Cấu hình biểu phí vận chuyển dựa trên khoảng cách' }
  ]
}

export default function AdminShipping() {
  return <AdminShippingPage />
}
