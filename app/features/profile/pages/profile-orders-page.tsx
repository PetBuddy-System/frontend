import { useSidebar } from '~/providers/sidebar-provider'
import { cn } from '~/shared/lib/cn'
import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { OrderHistoryList } from '../components/orders/order-history-list'

export function ProfileOrdersPage() {
  const { isCollapsed } = useSidebar()

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <ProfileSidebar activeItem='orders' />
      <main
        className={cn(
          'w-full p-4 pb-24 md:p-6 transition-all duration-300',
          isCollapsed ? 'lg:ml-20 lg:w-[calc(100%-5rem)]' : 'lg:ml-64 lg:w-[calc(100%-16rem)]'
        )}
      >
        <ProfilePageHeader titleKey='orderHistory.headerTitle' subtitleKey='orderHistory.headerSubtitle' />
        <OrderHistoryList />
      </main>
      <ProfileFloatingSupport />
    </div>
  )
}
