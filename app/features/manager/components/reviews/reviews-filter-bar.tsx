import { MaterialIcon } from '~/shared/ui'

interface ReviewsFilterBarProps {
  keyword: string
  onKeywordChange: (value: string) => void
  statusFilter: string
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  ratingFilter: number | undefined
  onRatingChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  sortKey: string
  onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export function ReviewsFilterBar({
  keyword,
  onKeywordChange,
  statusFilter,
  onStatusChange,
  ratingFilter,
  onRatingChange,
  sortKey,
  onSortChange
}: ReviewsFilterBarProps) {
  return (
    <div className='grid grid-cols-1 gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4'>
      {/* Keyword Search */}
      <div className='relative'>
        <MaterialIcon
          name='search'
          className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg'
        />
        <input
          type='text'
          placeholder='Tìm sản phẩm, tên khách hàng, nội dung...'
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className='w-full rounded-lg border border-border/60 bg-background py-2 pl-10 pr-4 text-sm placeholder-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
        />
      </div>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={onStatusChange}
        className='w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium'
      >
        <option value=''>Tất cả trạng thái</option>
        <option value='ACTIVE'>Đang hiển thị (Active)</option>
        <option value='HIDDEN'>Đang ẩn (Hidden)</option>
      </select>

      {/* Rating Filter */}
      <select
        value={ratingFilter === undefined ? '' : ratingFilter.toString()}
        onChange={onRatingChange}
        className='w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium'
      >
        <option value=''>Tất cả đánh giá sao</option>
        <option value='5'>5 Sao</option>
        <option value='4'>4 Sao</option>
        <option value='3'>3 Sao</option>
        <option value='2'>2 Sao</option>
        <option value='1'>1 Sao</option>
      </select>

      {/* Sort By */}
      <select
        value={sortKey}
        onChange={onSortChange}
        className='w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium'
      >
        <option value='newest'>Ngày đăng: Mới nhất</option>
        <option value='oldest'>Ngày đăng: Cũ nhất</option>
        <option value='highestRating'>Đánh giá: Cao đến Thấp</option>
        <option value='lowestRating'>Đánh giá: Thấp đến Cao</option>
      </select>
    </div>
  )
}
