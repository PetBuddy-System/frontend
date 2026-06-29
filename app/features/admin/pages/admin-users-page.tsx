import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'
import { AdminUsersStatsGrid } from '../components/users/admin-users-stats-grid'
import { AdminUsersTable } from '../components/users/admin-users-table'
import { AdminUsersToolbar } from '../components/users/admin-users-toolbar'

export function AdminUsersPage() {
  const { t } = useTranslation('admin')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='users' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav titleKey='users.title' subtitleKey='users.subtitle' />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h1 className='mb-2 font-display text-2xl font-bold text-primary md:text-3xl'>{t('users.title')}</h1>
                <p className='max-w-3xl text-muted-foreground'>{t('users.subtitle')}</p>
              </div>
              <div className='flex flex-wrap gap-3'>
                <button
                  type='button'
                  className='inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring'
                >
                  <MaterialIcon name='person_add' className='text-lg' />
                  <span>{t('users.actions.add')}</span>
                </button>
                <button
                  type='button'
                  className='inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-primary transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring'
                >
                  <MaterialIcon name='download' className='text-lg' />
                  <span>{t('users.actions.export')}</span>
                </button>
              </div>
            </section>

            <AdminUsersStatsGrid />
            <AdminUsersToolbar />
            <AdminUsersTable />
          </div>
        </main>
      </div>
    </div>
  )
}
