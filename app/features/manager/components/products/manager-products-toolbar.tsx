import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import type { CategoryData } from '~/shared/lib/product'

export interface ManagerProductsToolbarProps {
  categories: CategoryData[]
  selectedCategory: string | number
  onCategorySelect: (cat: string | number) => void
  selectedStatus: string
  onStatusSelect: (status: string) => void
  selectedSort: string
  onSortSelect: (sort: string) => void
  searchValue: string
  onSearchChange: (value: string) => void
}

export function ManagerProductsToolbar({
  categories = [],
  selectedCategory,
  onCategorySelect,
  selectedStatus,
  onStatusSelect,
  selectedSort,
  onSortSelect,
  searchValue,
  onSearchChange
}: ManagerProductsToolbarProps) {
  const { t } = useTranslation('manager')

  // Lấy options từ translation
  const SORT_OPTIONS = [
    { value: 'date_desc', label: t('productManagement.toolbar.sortNewest') },
    { value: 'date_asc', label: t('productManagement.toolbar.sortOldest') },
    { value: 'price_desc', label: t('productManagement.toolbar.sortPriceHigh') },
    { value: 'price_asc', label: t('productManagement.toolbar.sortPriceLow') },
  ]

  const STATUS_OPTIONS = [
    { value: 'all', label: t('productManagement.toolbar.statusAll') },
    { value: 'ACTIVE', label: t('productManagement.toolbar.statusActive') },
    { value: 'INACTIVE', label: t('productManagement.toolbar.statusInactive') },
    { value: 'DELETED', label: t('productManagement.toolbar.statusDeleted') },
  ]

  return (
    <div className='flex flex-col gap-3'>
      {/* Hàng 1: Search */}
      <div className='relative w-full'>
        <MaterialIcon
          name='search'
          className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
        />
        <input
          type='search'
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('productManagement.toolbar.searchPlaceholder')}
          className='h-11 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring'
        />
      </div>

      {/* Hàng 2: Category + Status + Sort */}
      <div className='flex flex-wrap items-center gap-3'>
        {/* Category Dropdown */}
        <div className='flex items-center gap-2'>
          <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0'>
            {t('productManagement.toolbar.categoryLabel')}
          </span>
          <div className='relative'>
            <select
              value={selectedCategory}
              onChange={(e) => onCategorySelect(e.target.value)}
              className='h-9 min-w-[160px] appearance-none rounded-lg border border-input bg-card pl-3 pr-8 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring cursor-pointer'
            >
              <option value='all'>{t('productManagement.toolbar.categoryAll')}</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </option>
              ))}
            </select>
            <MaterialIcon
              name='expand_more'
              className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-base'
            />
          </div>
        </div>

        {/* Status Dropdown */}
        <div className='flex items-center gap-2'>
          <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0'>
            {t('productManagement.toolbar.statusLabel')}
          </span>
          <div className='relative'>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusSelect(e.target.value)}
              className='h-9 min-w-[140px] appearance-none rounded-lg border border-input bg-card pl-3 pr-8 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring cursor-pointer'
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <MaterialIcon
              name='expand_more'
              className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-base'
            />
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className='flex items-center gap-2 ml-auto'>
          <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0'>
            {t('productManagement.toolbar.sortLabel')}
          </span>
          <div className='relative'>
            <select
              value={selectedSort}
              onChange={(e) => onSortSelect(e.target.value)}
              className='h-9 min-w-[140px] appearance-none rounded-lg border border-input bg-card pl-3 pr-8 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring cursor-pointer'
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <MaterialIcon
              name='expand_more'
              className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-base'
            />
          </div>
        </div>
      </div>
    </div>
  )
}