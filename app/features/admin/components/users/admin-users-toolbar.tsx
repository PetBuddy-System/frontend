import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function AdminUsersToolbar() {
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
          placeholder={t('users.toolbar.searchPlaceholder')}
        />
      </div>
      <div className='flex w-full flex-col gap-3 sm:flex-row md:w-auto'>
        <select className='h-11 min-w-44 rounded-lg border border-input bg-muted px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'>
          <option value='all'>{t('users.toolbar.status.all')}</option>
          <option value='active'>{t('users.toolbar.status.active')}</option>
          <option value='locked'>{t('users.toolbar.status.locked')}</option>
        </select>
        <button
          type='button'
          className='inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-muted px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-ring'
        >
          <MaterialIcon name='filter_list' className='text-lg' />
          <span>{t('users.toolbar.advancedFilter')}</span>
        </button>
      </div>
    </section>
  )
}
