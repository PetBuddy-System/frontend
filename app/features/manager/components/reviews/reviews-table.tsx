// app/features/manager/components/reviews/reviews-table.tsx

import { MaterialIcon, Button } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { StarRating } from './star-rating'
import type { ManagerReviewItem } from '~/shared/lib/product'

interface ReviewsTableProps {
  reviews: ManagerReviewItem[]
  isLoading: boolean
  totalPages: number
  totalReviews: number
  currentPage: number
  onPageChange: (page: number) => void
  onViewDetail: (reviewId: string) => void
  onToggleStatus: (review: ManagerReviewItem) => void
  onDelete: (reviewId: string) => void
}

function TableSkeleton() {
  return (
    <div className='p-6 space-y-4 animate-pulse'>
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className='flex flex-col gap-3 border-b border-border/40 pb-4 last:border-0 last:pb-0'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-full bg-muted' />
            <div className='space-y-1.5'>
              <div className='h-4 w-40 bg-muted rounded' />
              <div className='h-3 w-28 bg-muted rounded' />
            </div>
          </div>
          <div className='h-4 w-full bg-muted rounded' />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className='flex flex-col items-center justify-center py-16 text-center'>
      <MaterialIcon name='rate_review' className='text-5xl text-muted-foreground/30' />
      <p className='mt-4 text-base font-semibold text-muted-foreground'>
        Không tìm thấy đánh giá nào phù hợp với bộ lọc.
      </p>
    </div>
  )
}

interface ReviewRowProps {
  review: ManagerReviewItem
  onViewDetail: (id: string) => void
  onToggleStatus: (review: ManagerReviewItem) => void
  onDelete: (id: string) => void
}
function ReviewRow({ review, onViewDetail, onToggleStatus, onDelete }: ReviewRowProps) {
  const isHidden = review.status === 'HIDDEN'
  const isOrderReview = !review.productId

  return (
    <tr
      className={cn(
        'transition-all hover:bg-muted/10',
        isHidden && 'bg-muted/30 opacity-60 grayscale-[10%]'
      )}
    >
      {/* Sản phẩm / Đơn hàng */}
      <td className='px-6 py-4 max-w-[200px]'>
        {isOrderReview ? (
          <div>
            <p className='font-bold text-foreground font-display leading-tight'>
              <span className='text-primary'>Đánh giá đơn hàng</span>
            </p>
            {review.orderCode && (
              <span className='mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider'>
                #{review.orderCode}
              </span>
            )}
          </div>
        ) : (
          <div>
            <p
              className='font-bold text-foreground font-display leading-tight truncate'
              title={review.productName || ''}
            >
              {review.productName}
            </p>
            <span className='mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
              {review.productCode}
            </span>
          </div>
        )}
      </td>

      {/* Khách hàng */}
      <td className='px-6 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-primary font-display border border-border/30'>
            {review.userFullName?.charAt(0) || 'U'}
          </div>
          <div className='min-w-0'>
            <div className='flex items-center gap-1.5'>
              <span className='block font-bold text-foreground truncate max-w-[120px]'>
                {review.userFullName}
              </span>
              {review.anonymous && (
                <span className='rounded bg-accent/15 px-1 py-0.5 text-[9px] font-extrabold text-accent uppercase tracking-wider'>
                  Ẩn danh
                </span>
              )}
            </div>
            <span className='block text-xs text-muted-foreground truncate max-w-[180px]'>
              {review.userEmail}
            </span>
          </div>
        </div>
      </td>

      {/* Đánh giá */}
      <td className='px-6 py-4 max-w-[320px]'>
        <div className='flex items-center gap-2'>
          <StarRating rating={review.rating} size='sm' />
          <span className='text-[11px] text-muted-foreground font-semibold'>
            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <p className='mt-1.5 text-sm text-foreground/90 line-clamp-2 leading-relaxed'>
          {review.content}
        </p>
      </td>

      {/* Trạng thái */}
      <td className='px-6 py-4'>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
            isHidden ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isHidden ? 'bg-destructive' : 'bg-success'
            )}
          />
          {isHidden ? 'Đang ẩn' : 'Hiển thị'}
        </span>
      </td>

      {/* Thao tác */}
      <td className='px-6 py-4 text-right'>
        <div className='flex items-center justify-end gap-2'>
          {/* Xem chi tiết - luôn hiển thị */}
          <button
            onClick={() => onViewDetail(review.reviewId)}
            className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary/20 active:scale-95'
            title='Xem chi tiết đánh giá'
          >
            <MaterialIcon name='open_in_new' className='text-base' />
          </button>

          {/* Ẩn/Hiện - CHỈ CHO PRODUCT REVIEW */}
          {!isOrderReview && (
            <button
              onClick={() => onToggleStatus(review)}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-all active:scale-95',
                isHidden
                  ? 'bg-success/10 text-success hover:bg-success/20'
                  : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground'
              )}
              title={isHidden ? 'Hiển thị đánh giá' : 'Ẩn đánh giá'}
            >
              <MaterialIcon name={isHidden ? 'visibility' : 'visibility_off'} className='text-sm' />
              {isHidden ? 'Hiện' : 'Ẩn'}
            </button>
          )}

          {/* Xóa - luôn hiển thị */}
          <button
            onClick={() => onDelete(review.reviewId)}
            className='flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-all hover:bg-destructive/20 active:scale-95'
            title='Xóa vĩnh viễn'
          >
            <MaterialIcon name='delete' className='text-base' />
          </button>
        </div>
      </td>
    </tr>
  )
}

export function ReviewsTable({
  reviews,
  isLoading,
  totalPages,
  totalReviews,
  currentPage,
  onPageChange,
  onViewDetail,
  onToggleStatus,
  onDelete
}: ReviewsTableProps) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm'>
        {isLoading ? (
          <TableSkeleton />
        ) : reviews.length === 0 ? (
          <EmptyState />
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left text-sm'>
              <thead>
                <tr className='border-b border-border bg-muted/40 font-semibold text-muted-foreground'>
                  <th className='px-6 py-4'>Sản phẩm / Đơn hàng</th>
                  <th className='px-6 py-4'>Khách hàng</th>
                  <th className='px-6 py-4'>Đánh giá</th>
                  <th className='px-6 py-4'>Trạng thái</th>
                  <th className='px-6 py-4 text-right'>Thao tác</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border/60'>
                {reviews.map((review) => (
                  <ReviewRow
                    key={review.reviewId}
                    review={review}
                    onViewDetail={onViewDetail}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className='flex items-center justify-between border-t border-border/40 pt-4'>
          <p className='text-xs font-semibold text-muted-foreground'>
            Trang {currentPage + 1} / {totalPages} &mdash; {totalReviews} đánh giá
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage === 0}
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
              className='rounded-lg text-xs font-semibold'
            >
              <MaterialIcon name='chevron_left' className='text-sm' />
              Trước
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage === totalPages - 1}
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
              className='rounded-lg text-xs font-semibold'
            >
              Sau
              <MaterialIcon name='chevron_right' className='text-sm' />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}