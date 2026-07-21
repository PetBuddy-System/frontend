import { useParams } from 'react-router'

import { ProfileBookingDetailPage } from '~/features/profile/pages/profile-booking-detail-page'

export default function MyBookingDetailRoute() {
  const { bookingId } = useParams()
  return <ProfileBookingDetailPage bookingId={Number(bookingId)} />
}
