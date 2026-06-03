import { useTranslation } from 'react-i18next'

import { DisposalRequestForm } from '../components/disposal-request/disposal-request-form'
import { DisposalRequestRecentList } from '../components/disposal-request/disposal-request-recent-list'
import { DisposalRequestSummary } from '../components/disposal-request/disposal-request-summary'
import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'

export function StaffDisposalRequestPage() {
  const { t } = useTranslation('staff')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <StaffSidebar activeItem='disposalRequest' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <StaffTopNav titleKey='disposalRequest.pageTitle' subtitleKey='disposalRequest.pageSubtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <div>
              <h1 className='font-display text-2xl font-bold lg:text-3xl'>{t('disposalRequest.heading')}</h1>
              <p className='mt-2 text-base text-muted-foreground'>{t('disposalRequest.description')}</p>
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              <div className='lg:col-span-2'>
                <DisposalRequestForm />
              </div>
              <div className='space-y-6'>
                <DisposalRequestSummary />
                <DisposalRequestRecentList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
