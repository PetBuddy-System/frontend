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
  // ⭐ Thêm search props
  searchValue: string
  onSearchChange: (value: string) => void
}

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Mới nhất' },
  { value: 'date_asc', label: 'Cũ nhất' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang bán' },
  { value: 'INACTIVE', label: 'Ngừng bán' },
  { value: 'DELETED', label: 'Đã xóa' },
]

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

  return (
    <div className='flex flex-col gap-3'>
      {/* ⭐ Hàng 1: Search */}
      <div className='relative w-full'>
        <MaterialIcon
          name='search'
          className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
        />
        <input
          type='search'
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder='Tìm kiếm theo tên hoặc mã sản phẩm...'
          className='h-11 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring'
        />
      </div>

      {/* ⭐ Hàng 2: Category (dropdown) + Status + Sort */}
      <div className='flex flex-wrap items-center gap-3'>
        {/* Category Dropdown */}
        <div className='flex items-center gap-2'>
          <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0'>
            Danh mục
          </span>
          <div className='relative'>
            <select
              value={selectedCategory}
              onChange={(e) => onCategorySelect(e.target.value)}
              className='h-9 min-w-[160px] appearance-none rounded-lg border border-input bg-card pl-3 pr-8 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring cursor-pointer'
            >
              <option value='all'>Tất cả</option>
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
            Trạng thái
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
            Sắp xếp
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