import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

import { AdminEmployeesTable } from '../components/employees/admin-employees-table'
import { AdminEmployeesToolbar } from '../components/employees/admin-employees-toolbar'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminTopNav } from '../components/layout/admin-top-nav'

export function AdminEmployeesPage() {
  const { t } = useTranslation('admin')

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <AdminSidebar activeItem='employees' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <AdminTopNav />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-primary md:text-3xl'>{t('employees.title')}</h1>
              </div>
              <button
                type='button'
                className='inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <MaterialIcon name='add' className='text-lg' />
                <span>{t('employees.actions.add')}</span>
              </button>
            </section>

            <AdminEmployeesToolbar />
            <AdminEmployeesTable />
          </div>
        </main>
      </div>
    </div>
  )
}
