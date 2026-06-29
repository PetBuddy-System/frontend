import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import type { CategoryData } from '~/shared/lib/product'

export interface ManagerProductsToolbarProps {
  categories: CategoryData[]
  selectedCategory: string | number
  onCategorySelect: (cat: string | number) => void
  selectedStatus: string
  onStatusSelect: (status: string) => void
}

export function ManagerProductsToolbar({
  categories = [],
  selectedCategory,
  onCategorySelect,
  selectedStatus,
  onStatusSelect
}: ManagerProductsToolbarProps) {
  const { t } = useTranslation('manager')

  return (
    <section className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
      <div className='flex w-full gap-2 overflow-x-auto rounded-xl bg-muted p-1 lg:w-fit'>
        <button
          type='button'
          onClick={() => onCategorySelect('all')}
          className={
            selectedCategory === 'all'
              ? 'shrink-0 rounded-lg bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm'
              : 'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-primary'
          }
        >
          {t('productManagement.filters.categories.all', 'Tất cả')}
        </button>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.categoryId
          return (
            <button
              key={cat.categoryId}
              type='button'
              onClick={() => onCategorySelect(cat.categoryId)}
              className={
                isActive
                  ? 'shrink-0 rounded-lg bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm'
                  : 'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-primary'
              }
            >
              {cat.name}
            </button>
          )
        })}
      </div>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='relative'>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusSelect(e.target.value)}
            className='h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring sm:w-56 cursor-pointer'
          >
            <option value='all'>{t('productManagement.filters.status.all', 'Tất cả trạng thái')}</option>
            <option value='ACTIVE'>{t('productManagement.filters.status.active', 'Đang bán')}</option>
            <option value='INACTIVE'>{t('productManagement.filters.status.inactive', 'Ngừng bán')}</option>
            <option value='DELETED'>{t('productManagement.filters.status.deleted', 'Đã xóa')}</option>
          </select>
          <MaterialIcon
            name='expand_more'
            className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
          />
        </div>
      </div>
    </section>
  )
}
