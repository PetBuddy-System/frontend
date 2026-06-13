import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { AdminRewardSettingsCard } from '../components/vouchers/admin-reward-settings-card'
import { AdminVoucherStatsGrid } from '../components/vouchers/admin-voucher-stats-grid'
import { AdminVoucherTable } from '../components/vouchers/admin-voucher-table'

export function AdminVouchersPage() {
  const { t } = useTranslation('admin')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='vouchers' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav titleKey='voucherManagement.title' subtitleKey='voucherManagement.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>
                  {t('voucherManagement.title')}
                </h1>
                <p className='mt-2 max-w-3xl text-muted-foreground'>{t('voucherManagement.subtitle')}</p>
              </div>
              <button
                type='button'
                className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <MaterialIcon name='add_circle' className='text-lg' />
                {t('voucherManagement.actions.create')}
              </button>
            </section>

            <AdminVoucherStatsGrid />

            <section className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
              <AdminVoucherTable />
              <AdminRewardSettingsCard />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
