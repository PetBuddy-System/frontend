import { StaffNotificationsCard } from '../components/dashboard/staff-notifications-card'
import { StaffScheduleCard } from '../components/dashboard/staff-schedule-card'
import { StaffStatsGrid } from '../components/dashboard/staff-stats-grid'
import { StaffWelcomeSection } from '../components/dashboard/staff-welcome-section'
import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'

export function StaffDashboardPage() {
  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav />
        <main className='flex-1 overflow-y-auto p-4 md:p-8'>
          <div className='mx-auto flex max-w-7xl flex-col gap-8'>
            <StaffWelcomeSection />
            <StaffStatsGrid />
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <StaffScheduleCard />
              <StaffNotificationsCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
