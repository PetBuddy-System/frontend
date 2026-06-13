import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { AdminProductsStatsGrid } from '../components/products/admin-products-stats-grid'
import { AdminProductsTable } from '../components/products/admin-products-table'
import { AdminProductsToolbar } from '../components/products/admin-products-toolbar'

export function AdminProductsPage() {
  const { t } = useTranslation('admin')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='inventory' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav titleKey='productManagement.title' subtitleKey='productManagement.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>
                  {t('productManagement.title')}
                </h1>
                <p className='mt-2 max-w-3xl text-muted-foreground'>{t('productManagement.subtitle')}</p>
              </div>
              <div className='relative w-full lg:max-w-sm'>
                <MaterialIcon
                  name='search'
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                />
                <input
                  type='search'
                  placeholder={t('productManagement.searchPlaceholder')}
                  className='h-11 w-full rounded-full border border-input bg-card pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring'
                />
              </div>
            </section>

            <AdminProductsStatsGrid />
            <AdminProductsToolbar />
            <AdminProductsTable />
          </div>
        </main>
      </div>
    </div>
  )
}
