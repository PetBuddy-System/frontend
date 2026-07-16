import { AdminServicesPage } from '~/features/admin'
import { ManagerSidebar, ManagerTopNav } from '~/features/manager'

export default function ManagerServicesRoute() {
  return (
    <AdminServicesPage
      sidebar={<ManagerSidebar activeItem='services' />}
      topNav={<ManagerTopNav titleKey='serviceManagement.title' subtitleKey='serviceManagement.subtitle' />}
    />
  )
}
