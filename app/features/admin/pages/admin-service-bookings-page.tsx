import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { AdminServiceBookingsStatsGrid } from '../components/service-bookings/admin-service-bookings-stats-grid'
import { AdminServiceBookingsTable } from '../components/service-bookings/admin-service-bookings-table'
import { AdminServiceBookingsToolbar } from '../components/service-bookings/admin-service-bookings-toolbar'

export function AdminServiceBookingsPage() {
  const { t } = useTranslation('admin')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='services' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav />
        <main className='flex-1 overflow-y-auto p-4 md:p-8'>
          <div className='mx-auto flex max-w-7xl flex-col gap-8'>
            <section className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
              <div>
                <h1 className='mb-2 font-display text-3xl font-bold text-primary md:text-4xl'>
                  {t('serviceBookings.title')}
                </h1>
                <p className='text-muted-foreground'>{t('serviceBookings.subtitle')}</p>
              </div>
              <button
                type='button'
                className='inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-secondary px-6 text-sm font-bold text-secondary-foreground shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <MaterialIcon name='calendar_add_on' className='text-lg' />
                <span>{t('serviceBookings.actions.create')}</span>
              </button>
            </section>

            <AdminServiceBookingsStatsGrid />
            <AdminServiceBookingsToolbar />
            <AdminServiceBookingsTable />
          </div>
        </main>
      </div>
    </div>
  )
}
