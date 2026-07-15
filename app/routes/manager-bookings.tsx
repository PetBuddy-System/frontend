import { AdminServiceBookingsPage } from '~/features/admin'
import { ManagerSidebar, ManagerTopNav } from '~/features/manager'

export default function ManagerBookingsRoute() {
  return (
    <AdminServiceBookingsPage
      sidebar={<ManagerSidebar activeItem='serviceBookings' />}
      topNav={<ManagerTopNav titleKey='serviceBookings.title' subtitleKey='serviceBookings.subtitle' />}
    />
  )
}
