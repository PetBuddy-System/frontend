// app/features/manager/components/reviews/review-detail-drawer.tsx

import { useState, useEffect } from 'react'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { StarRating } from './star-rating'
import { fetchManagementReviewByIdApi } from '../../services/review/review-api'
import type { ManagerReviewItem } from '~/shared/lib/product'

export interface ReviewDetailDrawerProps {
  reviewId: string | null
  onClose: () => void
  onToggleStatus: (review: ManagerReviewItem) => Promise<void>
  onDelete: (reviewId: string) => Promise<void>
}

function DrawerSkeleton() {
  return (
    <div className='animate-pulse space-y-6 p-6'>
      <div className='flex items-center gap-4'>
        <div className='h-16 w-16 rounded-full bg-muted' />
        <div className='space-y-2'>
          <div className='h-5 w-36 rounded bg-muted' />
          <div className='h-3.5 w-48 rounded bg-muted' />
        </div>
      </div>
      <div className='space-y-2'>
        <div className='h-4 w-full rounded bg-muted' />
        <div className='h-4 w-5/6 rounded bg-muted' />
        <div className='h-4 w-3/4 rounded bg-muted' />
      </div>
      <div className='h-24 w-full rounded-xl bg-muted' />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className='mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
      {children}
    </p>
  )
}

interface DrawerContentProps {
  detail: ManagerReviewItem
}

function DrawerContent({ detail }: DrawerContentProps) {
  const isOrderReview = !detail.productId

  return (
    <div className='space-y-6 p-6'>
      {/* Customer Card */}
      <div className='rounded-xl border border-border/60 bg-background p-4'>
        <SectionLabel>Thông tin khách hàng</SectionLabel>
        <div className='flex items-start gap-4'>
          <div className='relative shrink-0'>
            {detail.userAvatar ? (
              <img
                src={detail.userAvatar}
                alt={detail.userFullName}
                className='h-16 w-16 rounded-full object-cover ring-2 ring-primary/20'
              />
            ) : (
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary ring-2 ring-primary/20'>
                {detail.userFullName?.charAt(0) || 'U'}
              </div>
            )}
            {detail.anonymous && (
              <span className='absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[9px] font-black text-accent-foreground ring-2 ring-card'>
                ?
              </span>
            )}
          </div>

          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='font-bold text-foreground'>{detail.userFullName}</span>
              {detail.anonymous && (
                <span className='rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-accent'>
                  Ẩn danh
                </span>
              )}
            </div>
            <span className='block text-sm text-muted-foreground'>{detail.userEmail}</span>
            <span className='mt-1 block font-mono text-[11px] text-muted-foreground/60'>
              ID: {detail.userId}
            </span>
          </div>
        </div>
      </div>

      {/* Product / Order Card - SỬA: Hiển thị Order nếu là Order Review */}
      <div className='rounded-xl border border-border/60 bg-background p-4'>
        <SectionLabel>
          {isOrderReview ? 'Đơn hàng được đánh giá' : 'Sản phẩm được đánh giá'}
        </SectionLabel>

        {isOrderReview ? (
          // Order Review
          <div>
            <p className='font-bold text-foreground'>Đánh giá đơn hàng</p>
            {detail.orderCode && (
              <div className='mt-1.5 flex items-center gap-2'>
                <span className='rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary'>
                  #{detail.orderCode}
                </span>
                {detail.orderId && (
                  <span className='font-mono text-[11px] text-muted-foreground/60'>
                    ID: {detail.orderId}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          // Product Review
          <div>
            <p className='font-bold text-foreground'>{detail.productName}</p>
            <div className='mt-1.5 flex items-center gap-2'>
              <span className='rounded bg-muted px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground'>
                {detail.productCode}
              </span>
              <span className='font-mono text-[11px] text-muted-foreground/60'>
                {detail.productId}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Review Content Card */}
      <div className='rounded-xl border border-border/60 bg-background p-4'>
        <SectionLabel>Nội dung đánh giá</SectionLabel>
        <div className='mb-3 flex items-center justify-between'>
          <StarRating rating={detail.rating} />
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold',
              detail.status === 'HIDDEN'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-success/10 text-success'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                detail.status === 'HIDDEN' ? 'bg-destructive' : 'bg-success'
              )}
            />
            {detail.status === 'HIDDEN' ? 'Đang ẩn' : 'Đang hiển thị'}
          </span>
        </div>
        <p className='whitespace-pre-wrap text-sm leading-relaxed text-foreground/90'>
          {detail.content}
        </p>
      </div>

      {/* Timestamps */}
      <div className='grid grid-cols-2 gap-3'>
        {[
          { label: 'Ngày đăng', date: detail.createdAt },
          { label: 'Cập nhật lần cuối', date: detail.updatedAt }
        ].map(({ label, date }) => (
          <div key={label} className='rounded-lg border border-border/60 bg-background p-3'>
            <p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
              {label}
            </p>
            <p className='mt-1 text-sm font-semibold text-foreground'>
              {new Date(date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </p>
            <p className='text-xs text-muted-foreground'>
              {new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
      </div>

      {/* Review ID */}
      <div className='rounded-lg border border-border/40 bg-muted/30 p-3'>
        <p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
          Review ID
        </p>
        <p className='mt-1 break-all font-mono text-xs text-muted-foreground'>{detail.reviewId}</p>
      </div>
    </div>
  )
}

export function ReviewDetailDrawer({
  reviewId,
  onClose,
  onToggleStatus,
  onDelete
}: ReviewDetailDrawerProps) {
  const [detail, setDetail] = useState<ManagerReviewItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!reviewId) {
      setDetail(null)
      return
    }
    setIsLoading(true)
    fetchManagementReviewByIdApi(reviewId)
      .then((res) => {
        if (res.success) setDetail(res.data)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [reviewId])

  const isOpen = !!reviewId
  const isOrderReview = !detail?.productId

  const handleToggle = async () => {
    if (!detail) return
    await onToggleStatus(detail)
    const res = await fetchManagementReviewByIdApi(detail.reviewId)
    if (res.success) setDetail(res.data)
  }

  const handleDelete = async () => {
    if (!detail) return
    await onDelete(detail.reviewId)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border px-6 py-4'>
          <div className='flex items-center gap-2'>
            <MaterialIcon name='rate_review' className='text-primary text-xl' />
            <h2 className='font-display text-lg font-bold text-card-foreground'>Chi tiết Đánh giá</h2>
          </div>
          <button
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          >
            <MaterialIcon name='close' className='text-xl' />
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto'>
          {isLoading ? (
            <DrawerSkeleton />
          ) : detail ? (
            <DrawerContent detail={detail} />
          ) : (
            <div className='flex flex-col items-center justify-center py-20 text-center'>
              <MaterialIcon name='error_outline' className='text-5xl text-muted-foreground/30' />
              <p className='mt-4 text-sm text-muted-foreground'>Không tìm thấy đánh giá.</p>
            </div>
          )}
        </div>

        {/* Footer Actions - CHỈ HIỂN THỊ NÚT ẨN CHO PRODUCT REVIEW */}
        {detail && !isLoading && (
          <div className='flex items-center gap-3 border-t border-border bg-muted/20 px-6 py-4'>
            {/* Nút Ẩn/Hiện - CHỈ CHO PRODUCT REVIEW */}
            {!isOrderReview && (
              <button
                onClick={handleToggle}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-95',
                  detail.status === 'HIDDEN'
                    ? 'bg-success/15 text-success hover:bg-success/25'
                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground'
                )}
              >
                <MaterialIcon
                  name={detail.status === 'HIDDEN' ? 'visibility' : 'visibility_off'}
                  className='text-base'
                />
                {detail.status === 'HIDDEN' ? 'Hiện review' : 'Ẩn review'}
              </button>
            )}

            {/* Nút Xóa - luôn hiển thị */}
            <button
              onClick={handleDelete}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-95',
                !isOrderReview ? 'flex-1' : 'w-full justify-center',
                'bg-destructive/10 text-destructive hover:bg-destructive/20'
              )}
            >
              <MaterialIcon name='delete' className='text-base' />
              Xóa vĩnh viễn
            </button>
          </div>
        )}
      </div>
    </>
  )
}