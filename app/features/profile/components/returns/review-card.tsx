// app/features/profile/components/returns/review-card.tsx

import { MaterialIcon } from '~/shared/ui'
import type { OrderReviewResponse } from '~/shared/lib/review'

interface ReviewCardProps {
    review: OrderReviewResponse
    onEdit?: () => void
    onDelete?: () => void
}

export function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Vừa đăng'
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return 'Vừa đăng'
        }
    }

    return (
        <div className='mt-6 rounded-xl border border-border bg-card p-5 shadow-sm'>
            {/* Header - Avatar + Tên + Thời gian */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    {/* Avatar */}
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold'>
                        {review.anonymous ? (
                            <MaterialIcon name='person_outline' className='text-xl' />
                        ) : (
                            review.fullName?.charAt(0)?.toUpperCase() || 'U'
                        )}
                    </div>
                    <div>
                        <div className='flex items-center gap-2'>
                            <span className='font-semibold text-foreground'>
                                {review.anonymous ? 'Ẩn danh' : review.fullName}
                            </span>
                            {review.anonymous && (
                                <span className='rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
                                    Ẩn danh
                                </span>
                            )}
                        </div>
                        <div className='flex items-center gap-2'>
                            {/* Rating stars */}
                            <div className='flex text-yellow-500'>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className='text-base'>
                                        {star <= review.rating ? '★' : '☆'}
                                    </span>
                                ))}
                            </div>
                            <span className='text-xs text-muted-foreground'>
                                {formatDate(review.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions - Edit & Delete */}
                {(onEdit || onDelete) && (
                    <div className='flex items-center gap-1'>
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className='rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary'
                                title='Chỉnh sửa đánh giá'
                            >
                                <MaterialIcon name='edit' className='text-lg' />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className='rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
                                title='Xóa đánh giá'
                            >
                                <MaterialIcon name='delete' className='text-lg' />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <p className='mt-3 text-sm text-foreground/90 leading-relaxed'>
                {review.content}
            </p>

            {/* Footer - Order info */}
            <div className='mt-3 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/50 pt-3'>
                <MaterialIcon name='receipt_long' className='text-sm' />
                <span>Đơn hàng #{review.orderCode}</span>
            </div>
        </div>
    )
}