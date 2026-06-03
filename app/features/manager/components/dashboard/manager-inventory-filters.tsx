import { useTranslation } from 'react-i18next'

export function ManagerInventoryFilters() {
  const { t } = useTranslation('manager')

  return (
    <section className='flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm xl:flex-row xl:items-end'>
      <div className='grid w-full flex-1 grid-cols-1 gap-4 md:grid-cols-4'>
        <div className='flex flex-col gap-1.5'>
          <label className='text-sm font-semibold text-muted-foreground'>{t('filters.type.label')}</label>
          <select className='h-11 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'>
            <option value=''>{t('filters.type.all')}</option>
            <option value='import'>{t('transactionTypes.import')}</option>
            <option value='export'>{t('transactionTypes.export')}</option>
            <option value='damage'>{t('transactionTypes.damage')}</option>
            <option value='audit'>{t('transactionTypes.audit')}</option>
          </select>
        </div>
        <div className='flex flex-col gap-1.5'>
          <label className='text-sm font-semibold text-muted-foreground'>{t('filters.date')}</label>
          <input
            type='date'
            className='h-11 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'
          />
        </div>
        <div className='flex flex-col gap-1.5'>
          <label className='text-sm font-semibold text-muted-foreground'>{t('filters.zone.label')}</label>
          <select className='h-11 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring'>
            <option value=''>{t('filters.zone.all')}</option>
            <option value='front'>{t('filters.zone.front')}</option>
            <option value='back'>{t('filters.zone.back')}</option>
            <option value='cold'>{t('filters.zone.cold')}</option>
          </select>
        </div>
        <div className='flex flex-col gap-1.5'>
          <label className='text-sm font-semibold text-muted-foreground'>{t('filters.staff')}</label>
          <input
            type='text'
            className='h-11 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring'
            placeholder={t('filters.staffPlaceholder')}
          />
        </div>
      </div>
      <button className='h-11 shrink-0 rounded-lg bg-muted px-6 text-sm font-semibold text-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground'>
        {t('filters.apply')}
      </button>
    </section>
  )
}
