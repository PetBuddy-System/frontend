import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

export interface ManagerPromotionsToolbarProps {
  selectedStatus: string
  onStatusSelect: (status: string) => void
  selectedSort: 'createdAt_desc' | 'createdAt_asc' | 'startDate_desc'
  onSortSelect: (sort: 'createdAt_desc' | 'createdAt_asc' | 'startDate_desc') => void
  keyword: string
  onKeywordChange: (keyword: string) => void
}

export function ManagerPromotionsToolbar({
  selectedStatus,
  onStatusSelect,
  selectedSort,
  onSortSelect,
  keyword,
  onKeywordChange
}: ManagerPromotionsToolbarProps) {
  const { t } = useTranslation('manager')

  return (
    <section className='flex flex-wrap items-center justify-between gap-4'>
      {/* Filters group */}
      <div className='flex flex-1 flex-wrap items-center gap-3'>
        <div className='relative min-w-[260px] flex-1 max-w-md'>
          <MaterialIcon
            name='search'
            className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
          />
          <input
            type='search'
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder='Tìm theo tên hoặc mô tả...'
            className='h-11 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring'
          />
        </div>

        {/* Status Dropdown */}
        <div className='relative min-w-[180px]'>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusSelect(e.target.value)}
            className='h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring cursor-pointer transition-all'
          >
            <option value='all'>{t('productManagement.filters.status.all', 'Trạng thái: Tất cả')}</option>
            <option value='ACTIVE'>Trạng thái: Hoạt động</option>
            <option value='DRAFT'>Trạng thái: Bản nháp</option>
            <option value='EXPIRED'>Trạng thái: Hết hạn</option>
            <option value='CANCELLED'>Trạng thái: Đã hủy</option>
          </select>
          <MaterialIcon
            name='expand_more'
            className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
          />
        </div>

        {/* Sort Dropdown */}
        <div className='relative min-w-[240px]'>
          <select
            value={selectedSort}
            onChange={(e) => onSortSelect(e.target.value as ManagerPromotionsToolbarProps['selectedSort'])}
            className='h-11 w-full appearance-none rounded-xl border border-input bg-card pl-4 pr-10 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring cursor-pointer transition-all'
          >
            <option value='createdAt_desc'>Sắp xếp theo: Mới nhất</option>
            <option value='createdAt_asc'>Sắp xếp theo: Cũ nhất</option>
            <option value='startDate_desc'>Sắp xếp theo: Sắp diễn ra</option>
          </select>
          <MaterialIcon
            name='sort'
            className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
          />
        </div>
      </div>
    </section>
  )
}
