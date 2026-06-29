import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { ManagerDashboardHero } from '../components/dashboard/manager-dashboard-hero'
import { ManagerDashboardStats } from '../components/dashboard/manager-dashboard-stats'
import { ManagerDashboardRevenueChart } from '../components/dashboard/manager-dashboard-revenue-chart'
import { ManagerDashboardTasks } from '../components/dashboard/manager-dashboard-tasks'
import { ManagerDashboardAppointments } from '../components/dashboard/manager-dashboard-appointments'

export function ManagerDashboardPage() {
  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='dashboard' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='managerDashboard.title' subtitleKey='managerDashboard.subtitle' />
        <main className='flex-1 overflow-y-auto bg-background p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <ManagerDashboardHero />
            <ManagerDashboardStats />
            <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
              <ManagerDashboardRevenueChart />
              <ManagerDashboardTasks />
            </div>
            <ManagerDashboardAppointments />
          </div>
        </main>
      </div>
    </div>
  )
}
