import { useParams } from 'react-router'
import { AdminOrderDetailPage } from '~/features/admin/pages/admin-order-detail-page'

export default function AdminOrderDetailRoute() {
  const { orderId } = useParams()
  return <AdminOrderDetailPage orderId={Number(orderId)} />
}
