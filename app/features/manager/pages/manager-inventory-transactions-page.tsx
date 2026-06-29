import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

import { ManagerInventoryFilters } from '../components/dashboard/manager-inventory-filters'
import { ManagerInventoryStatsGrid } from '../components/dashboard/manager-inventory-stats-grid'
import { ManagerTransactionTable } from '../components/dashboard/manager-transaction-table'
import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'

export function ManagerInventoryTransactionsPage() {
  const { t } = useTranslation('manager')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='inventory' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='dashboard.title' subtitleKey='dashboard.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('dashboard.title')}
                </h1>
                <p className='mt-1 text-muted-foreground'>{t('dashboard.subtitle')}</p>
              </div>
              <div className='flex gap-3'>
                <button className='inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-primary transition-colors hover:bg-muted'>
                  <MaterialIcon name='print' className='text-lg' />
                  <span>{t('dashboard.print')}</span>
                </button>
                <button className='inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90'>
                  <MaterialIcon name='download' className='text-lg' />
                  <span>{t('dashboard.export')}</span>
                </button>
              </div>
            </section>

            <ManagerInventoryStatsGrid />
            <ManagerInventoryFilters />
            <ManagerTransactionTable />
          </div>
        </main>
      </div>
    </div>
  )
}
