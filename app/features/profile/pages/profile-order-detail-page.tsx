import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { OrderDetailView } from '~/shared/components'

interface ProfileOrderDetailPageProps {
  orderId: number
}

export function ProfileOrderDetailPage({ orderId }: ProfileOrderDetailPageProps) {
  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='orders' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        {/* Header bar */}
        <header className='flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-4 sm:px-6'>
          <h1 className='text-lg font-bold text-foreground'>Đơn hàng của tôi</h1>
        </header>

        <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-24'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <OrderDetailView orderId={orderId} isStaff={false} />
          </div>
        </main>
      </div>
      <ProfileFloatingSupport />
    </div>
  )
}
