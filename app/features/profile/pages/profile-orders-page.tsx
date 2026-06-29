import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { OrderHistoryList } from '../components/orders/order-history-list'

export function ProfileOrdersPage() {
  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='orders' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ProfilePageHeader titleKey='orderHistory.headerTitle' subtitleKey='orderHistory.headerSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-24'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <OrderHistoryList />
          </div>
        </main>
      </div>
      <ProfileFloatingSupport />
    </div>
  )
}
