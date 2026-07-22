import { AdminSidebar } from '~/features/admin/components/layout/admin-sidebar'
import { AdminTopNav } from '~/features/admin/components/layout/admin-top-nav'
import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import { useAuth } from '~/providers/auth-provider'
import { OrderDetailView } from '~/shared/components'

interface StaffOrderDetailPageProps {
  orderId: number
}

export function StaffOrderDetailPage({ orderId }: StaffOrderDetailPageProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      {isAdmin ? <AdminSidebar activeItem='orders' /> : <StaffSidebar activeItem='orders' />}
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        {isAdmin ? (
          <AdminTopNav
            titleKey='staffOrderDetailPage.topNav.title'
            subtitleKey='staffOrderDetailPage.topNav.subtitle'
          />
        ) : (
          <StaffTopNav
            titleKey='staffOrderDetailPage.topNav.title'
            subtitleKey='staffOrderDetailPage.topNav.subtitle'
          />
        )}
        <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-20'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <OrderDetailView orderId={orderId} isStaff={!isAdmin} isAdmin={isAdmin} />
          </div>
        </main>
      </div>
    </div>
  )
}