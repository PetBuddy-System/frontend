import { useParams } from 'react-router'
import { ProfileOrderCancelPage } from '~/features/profile/pages/profile-order-cancel-page'

export default function ProfileOrderCancelRoute() {
  const { orderId } = useParams()
  return <ProfileOrderCancelPage orderId={Number(orderId)} />
}
