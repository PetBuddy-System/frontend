import { useParams } from 'react-router'
import { ProfileOrderDetailPage } from '~/features/profile/pages/profile-order-detail-page'

export default function ProfileOrderDetailRoute() {
  const { orderId } = useParams()
  return <ProfileOrderDetailPage orderId={Number(orderId)} />
}
