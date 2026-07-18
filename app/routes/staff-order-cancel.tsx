import { useParams } from 'react-router'
import { StaffOrderCancelPage } from '~/features/staff/pages/staff-order-cancel-page'

export default function StaffOrderCancelRoute() {
  const { orderId } = useParams()
  return <StaffOrderCancelPage orderId={Number(orderId)} />
}
