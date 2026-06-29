import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function AdminEmployeesToolbar() {
  const { t } = useTranslation('admin')

  return (
    <section className='flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between'>
      <div className='relative w-full md:max-w-md'>
        <MaterialIcon
          name='search'
          className='absolute left-3 top-1/2 -translate-y-1/2 text-xl text-muted-foreground'
        />
        <input
          type='text'
          className='h-11 w-full rounded-lg border border-input bg-muted px-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring'
          placeholder={t('employees.toolbar.searchPlaceholder')}
        />
      </div>
      <select className='h-11 w-full rounded-lg border border-input bg-muted px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring md:w-52'>
        <option value='all'>{t('employees.toolbar.role.all')}</option>
        <option value='staff'>{t('employees.roles.staff')}</option>
        <option value='manager'>{t('employees.roles.manager')}</option>
      </select>
    </section>
  )
}
