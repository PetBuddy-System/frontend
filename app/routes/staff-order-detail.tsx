import { useParams } from 'react-router'
import { StaffOrderDetailPage } from '~/features/staff/pages/staff-order-detail-page'

export default function StaffOrderDetailRoute() {
  const { orderId } = useParams()
  return <StaffOrderDetailPage orderId={Number(orderId)} />
}
