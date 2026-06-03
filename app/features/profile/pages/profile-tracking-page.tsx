import { useSidebar } from '~/providers/sidebar-provider'
import { cn } from '~/shared/lib/cn'
import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { OrderTrackingSearch } from '../components/tracking/order-tracking-search'
import { OrderTrackingStepper } from '../components/tracking/order-tracking-stepper'
import { OrderTrackingTimeline } from '../components/tracking/order-tracking-timeline'
import { OrderTrackingInfo } from '../components/tracking/order-tracking-info'
import { OrderTrackingSupport } from '../components/tracking/order-tracking-support'

export function ProfileTrackingPage() {
  const { isCollapsed } = useSidebar()

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <ProfileSidebar activeItem='tracking' />
      <main
        className={cn(
          'w-full p-4 pb-24 md:p-6 transition-all duration-300',
          isCollapsed ? 'lg:ml-20 lg:w-[calc(100%-5rem)]' : 'lg:ml-64 lg:w-[calc(100%-16rem)]'
        )}
      >
        <ProfilePageHeader titleKey='orderTracking.headerTitle' />

        <OrderTrackingSearch />

        <div className='grid grid-cols-1 items-start gap-5 lg:grid-cols-12'>
          <div className='space-y-5 lg:col-span-8'>
            <OrderTrackingStepper />
            <OrderTrackingTimeline />
          </div>
          <div className='space-y-5 lg:col-span-4'>
            <OrderTrackingInfo />
            <OrderTrackingSupport />
          </div>
        </div>
      </main>
      <ProfileFloatingSupport />
    </div>
  )
}
