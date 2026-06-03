import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { ManagerBookingAssignmentTable } from '../components/staff-schedule/manager-booking-assignment-table'
import { ManagerStaffAvailabilityPanel } from '../components/staff-schedule/manager-staff-availability-panel'

export function ManagerStaffSchedulePage() {
  const { t } = useTranslation('manager')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='staff' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav />
        <main className='flex-1 overflow-y-auto p-4 md:p-8'>
          <div className='mx-auto flex max-w-7xl flex-col gap-8'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-3xl font-bold text-card-foreground md:text-5xl'>
                  {t('staffSchedule.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('staffSchedule.subtitle')}</p>
              </div>
              <div className='relative w-full md:w-80'>
                <MaterialIcon
                  name='search'
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground'
                />
                <input
                  type='text'
                  className='h-11 w-full rounded-full border border-input bg-card px-10 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring'
                  placeholder={t('staffSchedule.searchPlaceholder')}
                />
              </div>
            </section>

            <div className='flex flex-col gap-8 lg:flex-row'>
              <ManagerBookingAssignmentTable />
              <ManagerStaffAvailabilityPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
