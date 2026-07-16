// app/features/profile/components/returns/edit-review-modal.tsx

import { useState } from 'react'
import { Button, MaterialIcon } from '~/shared/ui'
import { updateReviewApi } from '~/features/profile/services'
import type { OrderReviewResponse } from '~/shared/lib/review'

interface EditReviewModalProps {
    review: OrderReviewResponse | any
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function EditReviewModal({ review, isOpen, onClose, onSuccess }: EditReviewModalProps) {
    // Lấy data từ response nếu có
    const reviewData = review?.data || review

    const [rating, setRating] = useState(reviewData?.rating ?? 0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [content, setContent] = useState(reviewData?.content ?? '')
    const [submitting, setSubmitting] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Vui lòng chọn số sao!')
            return
        }

        if (!content.trim()) {
            alert('Vui lòng nhập nội dung đánh giá!')
            return
        }

        const reviewId = reviewData?.reviewId

        if (!reviewId) {
            console.error('❌ reviewId is undefined!', reviewData)
            alert('Không tìm thấy ID đánh giá! Vui lòng thử lại.')
            return
        }

        setSubmitting(true)
        try {
            await updateReviewApi(reviewId, {
                rating,
                content: content.trim(),
                anonymous: reviewData?.anonymous ?? false
            })
            alert('Cập nhật đánh giá thành công!')
            onSuccess?.()
            onClose()
        } catch (error) {
            console.error('Failed to update review:', error)
            alert('Có lỗi xảy ra, vui lòng thử lại!')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
            <div className='relative w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl animate-in fade-in zoom-in duration-200'>
                <button
                    type='button'
                    onClick={onClose}
                    className='absolute right-4 top-4 rounded-full p-2 hover:bg-muted transition-colors'
                >
                    <MaterialIcon name='close' className='text-2xl' />
                </button>

                <h2 className='text-lg font-bold text-foreground'>Chỉnh sửa đánh giá</h2>
                <p className='mt-1 text-sm text-muted-foreground'>
                    Cập nhật đánh giá của bạn về đơn hàng này
                </p>

                {/* Rating stars */}
                <div className='mt-4 flex gap-2 justify-center'>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type='button'
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className='text-4xl transition-colors focus:outline-none'
                        >
                            <span className={star <= (hoveredRating || rating) ? 'text-yellow-500' : 'text-muted'}>
                                ★
                            </span>
                        </button>
                    ))}
                </div>
                <p className='mt-1 text-center text-sm text-muted-foreground'>
                    {rating > 0 ? `${rating}/5` : 'Chọn số sao'}
                </p>

                {/* Content textarea */}
                <textarea
                    className='mt-4 w-full p-3 border border-border rounded-lg bg-muted text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring'
                    placeholder='Viết đánh giá của bạn...'
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    maxLength={1000}
                />
                <p className='mt-1 text-right text-xs text-muted-foreground'>
                    {content.length}/1000
                </p>

                {/* Actions */}
                <div className='mt-6 flex justify-end gap-2 border-t pt-4'>
                    <Button variant='outline' onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || !content.trim() || submitting}
                    >
                        {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

// ✅ Đảm bảo export default (nếu cần)
export default EditReviewModal