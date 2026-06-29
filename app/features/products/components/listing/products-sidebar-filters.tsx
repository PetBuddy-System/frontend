import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import type { CategoryData } from '~/shared/lib/product'

export const BRANDS = ['royalCanin', 'ganador', 'pedigree', 'zenith'] as const

export interface ProductsSidebarFiltersProps {
  category: string | number
  brandName: string
  categories: CategoryData[]
  onCategoryChange: (cat: string | number) => void
  onBrandChange: (brand: string) => void
}

export function ProductsSidebarFilters({
  category,
  brandName,
  categories = [],
  onCategoryChange,
  onBrandChange
}: ProductsSidebarFiltersProps) {
  const { t } = useTranslation('products')

  return (
    <div className='sticky top-[100px] rounded-xl border border-border/60 bg-card p-6 shadow-sm'>
      <div className='mb-6 flex items-center gap-2 border-b border-border/60 pb-4'>
        <MaterialIcon name='filter_list' className='text-[20px] text-primary' />
        <h2 className='text-lg font-semibold text-foreground font-display'>{t('filters.title')}</h2>
      </div>

      <div className='mb-6'>
        <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-foreground'>
          {t('filters.categoriesTitle')}
        </h3>
        <div className='flex flex-col gap-2'>
          <label className='flex items-center gap-3 cursor-pointer'>
            <input
              type='radio'
              name='sidebar-category'
              checked={category === 'all'}
              onChange={() => onCategoryChange('all')}
              className='h-5 w-5 rounded-full border-border bg-muted text-primary focus:ring-ring'
            />
            <span className='text-sm text-foreground'>{t('filters.categories.all')}</span>
          </label>

          {categories.map((cat) => (
            <label key={cat.categoryId} className='flex items-center gap-3 cursor-pointer'>
              <input
                type='radio'
                name='sidebar-category'
                checked={category === cat.categoryId}
                onChange={() => onCategoryChange(cat.categoryId)}
                className='h-5 w-5 rounded-full border-border bg-muted text-primary focus:ring-ring'
              />
              <span className='text-sm text-foreground'>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className='mb-6'>
        <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-foreground'>
          {t('filters.brandsTitle')}
        </h3>
        <div className='flex flex-col gap-2'>
          {BRANDS.map((brand) => (
            <label key={brand} className='flex items-center gap-3 cursor-pointer'>
              <input
                type='checkbox'
                checked={brandName === brand}
                onChange={() => onBrandChange(brand === brandName ? '' : brand)}
                className='h-5 w-5 rounded border-border bg-muted text-primary focus:ring-ring'
              />
              <span className='text-sm text-foreground'>{t(`brands.${brand}`)}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
