import { useTranslation } from 'react-i18next'

import { ShiftRequestForm } from '../components/shift-request/shift-request-form'
import { ShiftRequestRecentList } from '../components/shift-request/shift-request-recent-list'
import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'

export function StaffShiftRequestPage() {
  const { t } = useTranslation('staff')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='shiftRequest' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav
          titleKey='shiftRequest.pageTitle'
          subtitleKey='shiftRequest.pageSubtitle'
        />
        <main className='flex-1 overflow-y-auto p-4 md:p-8'>
          <div className='mx-auto flex max-w-7xl flex-col gap-8'>
            {/* Page Header */}
            <div>
              <h1 className='font-display text-3xl font-bold lg:text-4xl'>
                {t('shiftRequest.heading')}
              </h1>
              <p className='mt-2 text-base text-muted-foreground'>
                {t('shiftRequest.description')}
              </p>
            </div>

            {/* Content Grid */}
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
              <div className='lg:col-span-2'>
                <ShiftRequestForm />
              </div>
              <div className='lg:col-span-1'>
                <ShiftRequestRecentList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
