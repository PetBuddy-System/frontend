import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { ManagerReturnRequestsTable } from '../components/return-requests/manager-return-requests-table'

export function ManagerReturnRequestsPage() {
  const { t } = useTranslation('manager')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='returnRequests' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between'>
              <div>
                <div className='mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground'>
                  <span>{t('returnRequests.breadcrumb.ops')}</span>
                  <MaterialIcon name='chevron_right' className='text-sm' />
                  <span className='text-primary'>{t('returnRequests.breadcrumb.current')}</span>
                </div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('returnRequests.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('returnRequests.subtitle')}</p>
              </div>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                <div className='flex rounded-xl bg-muted p-1'>
                  {(['all', 'pending', 'resolved'] as const).map((filter) => (
                    <button
                      key={filter}
                      type='button'
                      className={
                        filter === 'all'
                          ? 'rounded-lg bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm'
                          : 'rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary'
                      }
                    >
                      {t(`returnRequests.filters.${filter}`)}
                    </button>
                  ))}
                </div>
                <button
                  type='button'
                  className='inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-bold text-card-foreground transition-colors hover:bg-muted'
                >
                  <MaterialIcon name='filter_list' className='text-lg' />
                  {t('returnRequests.filters.filter')}
                </button>
              </div>
            </section>

            <ManagerReturnRequestsTable />
          </div>
        </main>
      </div>
    </div>
  )
}
