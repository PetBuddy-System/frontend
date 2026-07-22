// app/features/profile/components/returns/view-review-modal.tsx

import { Button, MaterialIcon } from '~/shared/ui'

interface ViewReviewModalProps {
  review: {
    reviewId?: string
    rating?: number
    content?: string
    fullName?: string
    avatar?: string | null
    orderId?: number
    orderCode?: string
    anonymous?: boolean
    createdAt?: string
    updatedAt?: string
    status?: string
    userId?: string
    data?: any // Trong trường hợp truyền cả response
  } | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ViewReviewModal({ review, isOpen, onClose, onEdit, onDelete }: ViewReviewModalProps) {
  if (!isOpen || !review) return null

  // Lấy data từ response nếu có
  const reviewData = review?.data || review

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'N/A'
    }
  }

  // Lấy tên hiển thị
  const displayName = reviewData.anonymous ? 'Khách hàng' : reviewData.fullName || 'Người dùng'

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='relative w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl animate-in fade-in zoom-in duration-200'>
        {/* Nút đóng */}
        <button
          type='button'
          onClick={onClose}
          className='absolute right-4 top-4 rounded-full p-2 hover:bg-muted transition-colors'
        >
          <MaterialIcon name='close' className='text-2xl' />
        </button>

        {/* Header */}
        <h2 className='text-lg font-bold text-foreground'>Đánh giá của bạn</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Chi tiết đánh giá cho đơn hàng {reviewData.orderCode ? `#${reviewData.orderCode}` : ''}
        </p>

        {/* Thông tin người đánh giá */}
        <div className='mt-4 flex items-center gap-3'>
          {reviewData.avatar ? (
            <img src={reviewData.avatar} alt={displayName} className='w-10 h-10 rounded-full object-cover' />
          ) : (
            <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
              <span className='text-primary font-semibold'>{displayName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div>
            <p className='font-medium text-foreground'>{displayName}</p>
            <p className='text-xs text-muted-foreground'>{formatDate(reviewData.createdAt)}</p>
          </div>
        </div>

        {/* Rating stars */}
        <div className='mt-3 flex items-center gap-2'>
          <div className='flex gap-1 text-2xl'>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={star <= (reviewData.rating || 0) ? 'text-yellow-500' : 'text-muted'}>
                ★
              </span>
            ))}
          </div>
          <span className='text-sm text-muted-foreground'>{reviewData.rating || 0}/5</span>
        </div>

        {/* Nội dung đánh giá */}
        <div className='mt-3 p-3 bg-muted rounded-lg'>
          <p className='text-foreground whitespace-pre-wrap break-words'>
            {reviewData.content || 'Không có nội dung đánh giá'}
          </p>
        </div>

        {/* Trạng thái */}
        <div className='mt-3 flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>Trạng thái:</span>
          <span
            className={`text-sm font-medium px-2 py-0.5 rounded-full ${
              reviewData.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {reviewData.status === 'ACTIVE' ? 'Hiển thị' : 'Ẩn'}
          </span>
        </div>

        {/* Nút hành động */}
        <div className='mt-6 flex justify-end gap-2 border-t pt-4'>
          <Button variant='outline' onClick={onClose}>
            Đóng
          </Button>
          <Button
            variant='outline'
            onClick={onEdit}
            className='flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50'
          >
            <MaterialIcon name='edit' className='text-sm' />
            Sửa
          </Button>
          <Button variant='destructive' onClick={onDelete} className='flex items-center gap-2'>
            <MaterialIcon name='delete' className='text-sm' />
            Xóa
          </Button>
        </div>
      </div>
    </div>
  )
}
