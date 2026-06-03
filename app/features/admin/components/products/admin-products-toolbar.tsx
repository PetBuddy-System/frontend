import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

const CATEGORY_FILTERS = ['all', 'food', 'accessories', 'toys', 'medicine'] as const

export function AdminProductsToolbar() {
  const { t } = useTranslation('admin')

  return (
    <section className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
      <div className='flex w-full gap-2 overflow-x-auto rounded-xl bg-muted p-1 lg:w-fit'>
        {CATEGORY_FILTERS.map((filter) => {
          const isActive = filter === 'all'

          return (
            <button
              key={filter}
              type='button'
              className={
                isActive
                  ? 'shrink-0 rounded-lg bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm'
                  : 'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-primary'
              }
            >
              {t(`productManagement.filters.categories.${filter}`)}
            </button>
          )
        })}
      </div>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='relative'>
          <select className='h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring sm:w-56'>
            <option>{t('productManagement.filters.status.all')}</option>
            <option>{t('productManagement.filters.status.active')}</option>
            <option>{t('productManagement.filters.status.inactive')}</option>
          </select>
          <MaterialIcon
            name='expand_more'
            className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
          />
        </div>
        <button
          type='button'
          className='inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-5 text-sm font-bold text-secondary-foreground shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring'
        >
          <MaterialIcon name='add' className='text-lg' />
          <span>{t('productManagement.actions.add')}</span>
        </button>
      </div>
    </section>
  )
}
