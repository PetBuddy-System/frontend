import { BookingPage } from '~/features/booking'

import type { Route } from './+types/booking'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Booking - PetBuddy' }]
}

export default function Booking() {
  return <BookingPage />
}
