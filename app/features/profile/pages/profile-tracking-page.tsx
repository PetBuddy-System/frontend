import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { OrderTrackingSearch } from '../components/tracking/order-tracking-search'
import { OrderTrackingStepper } from '../components/tracking/order-tracking-stepper'
import { OrderTrackingTimeline } from '../components/tracking/order-tracking-timeline'
import { OrderTrackingInfo } from '../components/tracking/order-tracking-info'
import { OrderTrackingSupport } from '../components/tracking/order-tracking-support'

export function ProfileTrackingPage() {
  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='tracking' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ProfilePageHeader titleKey='orderTracking.headerTitle' subtitleKey='orderTracking.headerSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-24'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
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
          </div>
        </main>
      </div>
      <ProfileFloatingSupport />
    </div>
  )
}
