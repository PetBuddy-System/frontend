import { useTranslation } from 'react-i18next'

import { AttendanceMonthPicker } from '../components/attendance/attendance-month-picker'
import { AttendanceSummaryCards } from '../components/attendance/attendance-summary-cards'
import { AttendanceTable } from '../components/attendance/attendance-table'
import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'

export function StaffAttendancePage() {
  const { t } = useTranslation('staff')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='attendanceHistory' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav
          titleKey='attendance.pageTitle'
          subtitleKey='attendance.pageSubtitle'
        />
        <main className='flex-1 overflow-y-auto p-4 md:p-8'>
          <div className='mx-auto flex max-w-7xl flex-col gap-8'>
            {/* Header + Month Picker */}
            <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
              <div>
                <h1 className='font-display text-3xl font-bold lg:text-4xl'>
                  {t('attendance.heading')}
                </h1>
                <p className='mt-2 text-base text-muted-foreground'>
                  {t('attendance.description')}
                </p>
              </div>
              <AttendanceMonthPicker />
            </div>

            {/* Summary Cards */}
            <AttendanceSummaryCards />

            {/* Detailed Table */}
            <AttendanceTable />
          </div>
        </main>
      </div>
    </div>
  )
}
