import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfileInfoCard } from '../components/overview/profile-info-card'
import { ProfilePageHeader } from '../components/layout/profile-page-header'
import { ProfilePetsCard } from '../components/overview/profile-pets-card'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { ProfileStats } from '../components/overview/profile-stats'

export function ProfilePage() {
  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='profile' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ProfilePageHeader titleKey='header.title' subtitleKey='' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-24'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <div className='grid grid-cols-12 gap-4 md:gap-5'>
              <ProfileStats />

              <div className='col-span-12 flex flex-col gap-6 lg:col-span-8'>
                <ProfileInfoCard />
              </div>

              <div className='col-span-12 flex flex-col gap-6 lg:col-span-4'>
                <ProfilePetsCard />
              </div>
            </div>
          </div>
        </main>
      </div>
      <ProfileFloatingSupport />
    </div>
  )
}
