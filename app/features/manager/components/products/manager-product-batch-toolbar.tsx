// app/features/manager/components/products/manager-product-batch-toolbar.tsx

import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import type { BatchSortBy } from '~/shared/lib/batch'

export interface ManagerProductBatchToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  statusValue: 'ACTIVE' | 'INACTIVE' | 'DELETED' | 'ALL'
  onStatusChange: (value: 'ACTIVE' | 'INACTIVE' | 'DELETED' | 'ALL') => void
  sortByValue: BatchSortBy
  onSortChange: (value: BatchSortBy) => void
  onReset: () => void
}

export function ManagerProductBatchToolbar({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  sortByValue,
  onSortChange,
  onReset
}: ManagerProductBatchToolbarProps) {
  const { t } = useTranslation('manager')

  return (
    <div className='flex flex-wrap items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border/50'>
      <div className='relative flex-1 min-w-[240px]'>
        <MaterialIcon
          name='search'
          className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg'
        />
        <input
          type='text'
          placeholder={t('productManagement.batch.searchPlaceholder')}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className='w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
        />
      </div>

      <div className='relative min-w-[180px]'>
        <select
          value={statusValue}
          onChange={(e) => onStatusChange(e.target.value as typeof statusValue)}
          className='w-full appearance-none rounded-lg border border-input bg-background px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
        >
          <option value='ALL'>{t('productManagement.batch.statusAll')}</option>
          <option value='ACTIVE'>{t('productManagement.batch.statusActive')}</option>
          <option value='INACTIVE'>{t('productManagement.batch.statusInactive')}</option>
          <option value='DELETED'>{t('productManagement.batch.statusDeleted')}</option>
        </select>
        <MaterialIcon
          name='expand_more'
          className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-lg'
        />
      </div>

      <div className='relative min-w-[180px]'>
        <select
          value={sortByValue}
          onChange={(e) => onSortChange(e.target.value as BatchSortBy)}
          className='w-full appearance-none rounded-lg border border-input bg-background px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
        >
          <option value='date_desc'>{t('productManagement.batch.sortNewest')}</option>
          <option value='date_asc'>{t('productManagement.batch.sortOldest')}</option>
          <option value='stock_desc'>{t('productManagement.batch.sortStockDesc')}</option>
          <option value='stock_asc'>{t('productManagement.batch.sortStockAsc')}</option>
          <option value='expiry_asc'>{t('productManagement.batch.sortExpiryAsc')}</option>
          <option value='expiry_desc'>{t('productManagement.batch.sortExpiryDesc')}</option>
        </select>
        <MaterialIcon
          name='expand_more'
          className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-lg'
        />
      </div>

      <button
        onClick={onReset}
        className='p-1.5 bg-card hover:bg-muted border border-border text-foreground rounded-lg transition-colors flex items-center justify-center'
        title={t('productManagement.batch.refresh')}
      >
        <MaterialIcon name='refresh' className='text-lg' />
      </button>
    </div>
  )
}
