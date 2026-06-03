import { useTranslation } from 'react-i18next'

import { MaterialIcon } from '~/shared/ui'

export function AdminServiceBookingsToolbar() {
  const { t } = useTranslation('admin')

  return (
    <section className='flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-5 shadow-sm'>
      <div className='min-w-64 flex-1'>
        <label className='mb-2 block text-sm font-semibold text-muted-foreground'>
          {t('serviceBookings.toolbar.customerLabel')}
        </label>
        <div className='relative'>
          <MaterialIcon
            name='search'
            className='absolute left-3 top-1/2 -translate-y-1/2 text-xl text-muted-foreground'
          />
          <input
            type='text'
            className='h-11 w-full rounded-lg border border-input bg-muted px-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring'
            placeholder={t('serviceBookings.toolbar.searchPlaceholder')}
          />
        </div>
      </div>
      <div className='w-full md:w-56'>
        <label className='mb-2 block text-sm font-semibold text-muted-foreground'>
          {t('serviceBookings.toolbar.serviceLabel')}
        </label>
        <select className='h-11 w-full rounded-lg border border-input bg-muted px-4 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'>
          <option value='all'>{t('serviceBookings.toolbar.services.all')}</option>
          <option value='bath'>{t('serviceBookings.toolbar.services.bath')}</option>
          <option value='grooming'>{t('serviceBookings.toolbar.services.grooming')}</option>
          <option value='earCare'>{t('serviceBookings.toolbar.services.earCare')}</option>
          <option value='combo'>{t('serviceBookings.toolbar.services.combo')}</option>
        </select>
      </div>
      <div className='w-full md:w-56'>
        <label className='mb-2 block text-sm font-semibold text-muted-foreground'>
          {t('serviceBookings.toolbar.dateLabel')}
        </label>
        <input
          type='date'
          className='h-11 w-full rounded-lg border border-input bg-muted px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
        />
      </div>
      <button
        type='button'
        className='inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-muted px-5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground focus:outline-none focus:ring-2 focus:ring-ring'
      >
        <MaterialIcon name='filter_list' className='text-lg' />
        <span>{t('serviceBookings.toolbar.filter')}</span>
      </button>
    </section>
  )
}
