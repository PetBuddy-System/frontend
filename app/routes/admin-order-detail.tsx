import { useParams } from 'react-router'
import { StaffOrderDetailPage } from '~/features/staff'

export default function AdminOrderDetailRoute() {
  const { orderId } = useParams()
  return <StaffOrderDetailPage orderId={Number(orderId)} />
}
