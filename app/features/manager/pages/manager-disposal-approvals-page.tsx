import { useTranslation } from 'react-i18next'

import { ManagerDisposalRequestsWorkspace } from '../components/disposal-requests/manager-disposal-requests-workspace'
import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'

export function ManagerDisposalApprovalsPage() {
  const { t } = useTranslation('manager')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='disposalApprovals' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>
                  {t('disposalApprovals.title')}
                </h1>
                <p className='mt-2 max-w-3xl text-muted-foreground'>{t('disposalApprovals.subtitle')}</p>
              </div>
              <div className='flex w-fit items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-secondary-foreground'>
                <span className='h-2 w-2 rounded-full bg-secondary-foreground' />
                {t('disposalApprovals.pendingBadge', { count: 14 })}
              </div>
            </section>

            <ManagerDisposalRequestsWorkspace />
          </div>
        </main>
      </div>
    </div>
  )
}
