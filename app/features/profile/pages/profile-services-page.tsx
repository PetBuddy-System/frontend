import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { ServiceHistoryList } from '../components/services/service-history-list'

export function ProfileServicesPage() {
  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='services' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ProfilePageHeader titleKey='serviceHistory.headerTitle' subtitleKey='serviceHistory.headerSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-24'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <ServiceHistoryList />
          </div>
        </main>
      </div>
      <ProfileFloatingSupport />
    </div>
  )
}
