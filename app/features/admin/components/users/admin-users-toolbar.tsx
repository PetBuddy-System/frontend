import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

import type { AdminEmployeeRole, AdminStaffTask } from '../../services/users'

export interface AdminUsersToolbarProps {
  role: AdminEmployeeRole | 'ALL'
  staffTask: AdminStaffTask | 'ALL'
  onClear: () => void
  onRoleChange: (role: AdminEmployeeRole | 'ALL') => void
  onStaffTaskChange: (staffTask: AdminStaffTask | 'ALL') => void
}

export function AdminUsersToolbar({
  role,
  staffTask,
  onClear,
  onRoleChange,
  onStaffTaskChange
}: AdminUsersToolbarProps) {
  const { t } = useTranslation('admin')
  const isStaffTaskDisabled = role !== 'STAFF'

  return (
    <section className='flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between'>
      <div className='max-w-xl'>
        <p className='font-display text-xl font-bold text-card-foreground'>{t('users.toolbar.title')}</p>
        <p className='mt-1 text-sm leading-6 text-muted-foreground'>{t('users.toolbar.intro')}</p>
      </div>
      <div className='grid w-full gap-3 sm:grid-cols-3 lg:w-auto'>
        <label className='grid gap-1.5'>
          <span className='text-xs font-bold uppercase text-muted-foreground'>{t('users.toolbar.roleLabel')}</span>
          <select
            value={role}
            onChange={(event) => {
              const nextRole = event.target.value as AdminEmployeeRole | 'ALL'
              onRoleChange(nextRole)
              if (nextRole !== 'STAFF') onStaffTaskChange('ALL')
            }}
            className='h-11 rounded-lg border border-input bg-muted px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
          >
            <option value='ALL'>{t('users.roles.ALL')}</option>
            <option value='MANAGER'>{t('users.roles.MANAGER')}</option>
            <option value='STAFF'>{t('users.roles.STAFF')}</option>
          </select>
        </label>
        <label className='grid gap-1.5'>
          <span className='text-xs font-bold uppercase text-muted-foreground'>{t('users.toolbar.staffTaskLabel')}</span>
          <select
            value={staffTask}
            disabled={isStaffTaskDisabled}
            onChange={(event) => onStaffTaskChange(event.target.value as AdminStaffTask | 'ALL')}
            className='h-11 rounded-lg border border-input bg-muted px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60'
          >
            <option value='ALL'>{t('users.staffTasks.ALL')}</option>
            <option value='GROOMER'>{t('users.staffTasks.GROOMER')}</option>
            <option value='SHIPPER'>{t('users.staffTasks.SHIPPER')}</option>
            <option value='COORDINATOR'>{t('users.staffTasks.COORDINATOR')}</option>
          </select>
        </label>
        <button
          type='button'
          onClick={onClear}
          className='mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-muted px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:mt-auto'
        >
          <MaterialIcon name='filter_alt_off' className='text-lg' />
          <span>{t('users.toolbar.clear')}</span>
        </button>
      </div>
    </section>
  )
}
