import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import { OrderDetailView } from '~/shared/components'

interface StaffOrderDetailPageProps {
  orderId: number
}

export function StaffOrderDetailPage({ orderId }: StaffOrderDetailPageProps) {
  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='orders' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav titleKey='Chi tiết đơn hàng' subtitleKey='Xem chi tiết và xử lý đơn hàng' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-20'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <OrderDetailView orderId={orderId} isStaff={true} />
          </div>
        </main>
      </div>
    </div>
  )
}
