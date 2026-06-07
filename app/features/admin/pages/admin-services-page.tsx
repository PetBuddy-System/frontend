import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { AdminCreateServiceModal } from '../components/services/admin-create-service-modal'
import { AdminServicesStatsGrid } from '../components/services/admin-services-stats-grid'
import { AdminServicesTable } from '../components/services/admin-services-table'

export function AdminServicesPage() {
  const { t } = useTranslation('admin')
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false)

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='services' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col justify-between gap-4 md:flex-row md:items-end'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('serviceManagement.title')}
                </h1>
                <p className='mt-2 text-muted-foreground'>{t('serviceManagement.subtitle')}</p>
              </div>
              <button
                type='button'
                onClick={() => setIsCreateServiceOpen(true)}
                className='inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-secondary px-6 text-sm font-bold text-secondary-foreground shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <MaterialIcon name='add' className='text-lg' />
                <span>{t('serviceManagement.actions.add')}</span>
              </button>
            </section>

            <AdminServicesStatsGrid />
            <AdminServicesTable />
          </div>
        </main>
      </div>

      <AdminCreateServiceModal
        isOpen={isCreateServiceOpen}
        onClose={() => setIsCreateServiceOpen(false)}
      />
    </div>
  )
}
