import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'

const EMPLOYEES = [
  {
    key: 'tranVanAn',
    initials: 'TA',
    code: 'NV-001',
    role: 'staff',
    status: 'working',
    avatarClassName: 'bg-primary text-primary-foreground'
  },
  {
    key: 'leThiMai',
    initials: 'LM',
    code: 'NV-002',
    role: 'staff',
    status: 'working',
    avatarClassName: 'bg-secondary text-secondary-foreground'
  },
  {
    key: 'phamVanHung',
    initials: 'PH',
    code: 'NV-003',
    role: 'manager',
    status: 'leave',
    avatarClassName: 'bg-muted text-muted-foreground'
  },
  {
    key: 'nguyenMinhHoang',
    initials: 'NH',
    code: 'NV-004',
    role: 'manager',
    status: 'working',
    avatarClassName: 'bg-primary text-primary-foreground'
  }
] as const

export function AdminEmployeesTable() {
  const { t } = useTranslation('admin')

  return (
    <section className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[720px] border-collapse text-left'>
          <thead>
            <tr className='border-b border-border bg-muted text-sm font-semibold text-muted-foreground'>
              <th className='px-4 py-3'>{t('employees.table.columns.name')}</th>
              <th className='px-4 py-3'>{t('employees.table.columns.role')}</th>
              <th className='px-4 py-3'>{t('employees.table.columns.status')}</th>
              <th className='px-4 py-3 text-right'>{t('employees.table.columns.actions')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {EMPLOYEES.map((employee) => {
              const isWorking = employee.status === 'working'

              return (
                <tr key={employee.key} className='transition-colors hover:bg-muted'>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display font-bold',
                          employee.avatarClassName
                        )}
                      >
                        {employee.initials}
                      </div>
                      <div>
                        <p className='font-semibold text-card-foreground'>
                          {t(`employees.table.rows.${employee.key}.name`)}
                        </p>
                        <p className='text-sm text-muted-foreground'>{employee.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={
                        employee.role === 'manager'
                          ? 'inline-flex rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground'
                          : 'inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary'
                      }
                    >
                      {t(`employees.roles.${employee.role}`)}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={
                        isWorking
                          ? 'inline-flex items-center gap-2 rounded-full bg-success px-3 py-1 text-sm font-semibold text-success-foreground'
                          : 'inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground'
                      }
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          isWorking ? 'bg-success-foreground' : 'bg-muted-foreground'
                        )}
                      />
                      {t(`employees.status.${employee.status}`)}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex justify-end gap-1'>
                      <button
                        type='button'
                        aria-label={t('employees.actions.edit')}
                        className='flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring'
                      >
                        <MaterialIcon name='edit' className='text-lg' />
                      </button>
                      <button
                        type='button'
                        aria-label={t('employees.actions.delete')}
                        className='flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive focus:outline-none focus:ring-2 focus:ring-ring'
                      >
                        <MaterialIcon name='delete' className='text-lg' />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className='flex items-center justify-between border-t border-border bg-card px-4 py-3'>
        <span className='text-sm text-muted-foreground'>
          {t('employees.pagination.showing', { from: 1, to: 4, total: 48 })}
        </span>
        <div className='flex gap-2'>
          <button
            type='button'
            disabled
            aria-label={t('employees.pagination.previous')}
            className='flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground disabled:opacity-50'
          >
            <MaterialIcon name='chevron_left' className='text-lg' />
          </button>
          <button
            type='button'
            aria-label={t('employees.pagination.next')}
            className='flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
          >
            <MaterialIcon name='chevron_right' className='text-lg' />
          </button>
        </div>
      </div>
    </section>
  )
}
