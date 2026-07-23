// app/features/manager/components/reviews/reviews-filter-bar.tsx

import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

interface ReviewsFilterBarProps {
  keyword: string
  onKeywordChange: (value: string) => void
  statusFilter: string
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  ratingFilter: number | undefined
  onRatingChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  reviewTypeFilter: 'ALL' | 'PRODUCT' | 'ORDER'
  onReviewTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
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
  reviewTypeFilter,
  onReviewTypeChange,
  sortKey,
  onSortChange
}: ReviewsFilterBarProps) {
  const { t } = useTranslation('manager')

  return (
    <div className='grid grid-cols-1 gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5'>
      {/* Keyword Search */}
      <div className='relative'>
        <MaterialIcon
          name='search'
          className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg'
        />
        <input
          type='text'
          placeholder={t('reviews.filter.searchPlaceholder')}
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className='w-full rounded-lg border border-border/60 bg-background py-2 pl-10 pr-4 text-sm placeholder-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
        />
      </div>

      {/* Review Type Filter */}
      <select
        value={reviewTypeFilter}
        onChange={onReviewTypeChange}
        className='w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium'
      >
        <option value='ALL'>{t('reviews.filter.reviewType.all')}</option>
        <option value='PRODUCT'>{t('reviews.filter.reviewType.product')}</option>
        <option value='ORDER'>{t('reviews.filter.reviewType.order')}</option>
      </select>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={onStatusChange}
        className='w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium'
      >
        <option value=''>{t('reviews.filter.status.all')}</option>
        <option value='ACTIVE'>{t('reviews.filter.status.active')}</option>
        <option value='HIDDEN'>{t('reviews.filter.status.hidden')}</option>
      </select>

      {/* Rating Filter */}
      <select
        value={ratingFilter === undefined ? '' : ratingFilter.toString()}
        onChange={onRatingChange}
        className='w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium'
      >
        <option value=''>{t('reviews.filter.rating.all')}</option>
        <option value='5'>5 {t('reviews.filter.rating.stars')}</option>
        <option value='4'>4 {t('reviews.filter.rating.stars')}</option>
        <option value='3'>3 {t('reviews.filter.rating.stars')}</option>
        <option value='2'>2 {t('reviews.filter.rating.stars')}</option>
        <option value='1'>1 {t('reviews.filter.rating.stars')}</option>
      </select>

      {/* Sort By */}
      <select
        value={sortKey}
        onChange={onSortChange}
        className='w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-medium'
      >
        <option value='newest'>{t('reviews.filter.sort.newest')}</option>
        <option value='oldest'>{t('reviews.filter.sort.oldest')}</option>
        <option value='highestRating'>{t('reviews.filter.sort.highestRating')}</option>
        <option value='lowestRating'>{t('reviews.filter.sort.lowestRating')}</option>
      </select>
    </div>
  )
}