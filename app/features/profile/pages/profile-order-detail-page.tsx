// app/features/profile/pages/profile-order-detail-page.tsx

import { useState, useEffect } from 'react'
import { ProfileFloatingSupport } from '../components/layout/profile-floating-support'
import { ProfileSidebar } from '../components/layout/profile-sidebar'
import { OrderDetailView } from '~/shared/components'
import { Button } from '~/shared/ui'
import { MaterialIcon } from '~/shared/ui'
import { ReturnWarrantyForm } from '../components/returns/return-warranty-form'
import { ReviewOrderModal } from '../components/returns/review-order-modal'
import { EditReviewModal } from '../components/returns/edit-review-modal'
import { ViewReviewModal } from '../components/returns/view-review-modal'
import { fetchOrderDetailApi } from '~/features/profile/services/order/order-api'
import { getOrderReviewApi, deleteReviewApi } from '~/features/profile/services'
import type { OrderReviewResponse } from '~/shared/lib/review'

interface ProfileOrderDetailPageProps {
  orderId: number
}

export function ProfileOrderDetailPage({ orderId }: ProfileOrderDetailPageProps) {
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showEditReviewModal, setShowEditReviewModal] = useState(false)
  const [showViewReviewModal, setShowViewReviewModal] = useState(false)
  const [orderStatus, setOrderStatus] = useState<string | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [existingReview, setExistingReview] = useState<OrderReviewResponse | null>(null)
  const [loadingReview, setLoadingReview] = useState(false)

  // Load order status
  useEffect(() => {
    async function loadOrderStatus() {
      setIsLoadingStatus(true)
      try {
        const res = await fetchOrderDetailApi(orderId)
        if (res.success && res.data) {
          setOrderStatus(res.data.status)
        }
      } catch (err) {
        console.error('Failed to load order status', err)
      } finally {
        setIsLoadingStatus(false)
      }
    }
    void loadOrderStatus()
  }, [orderId])

  // Load review nếu có
  useEffect(() => {
    async function loadReview() {
      if (!orderId) return
      setLoadingReview(true)
      try {
        const review: any = await getOrderReviewApi(orderId) // ← Thêm : any
        console.log('📦 Review data:', review)

        // Lấy data từ response
        const reviewData = review?.data || review

        // Kiểm tra có reviewId không
        if (reviewData && reviewData.reviewId) {
          setExistingReview(reviewData)
        } else {
          setExistingReview(null)
        }
      } catch (error) {
        console.error('Failed to load review:', error)
        setExistingReview(null)
      } finally {
        setLoadingReview(false)
      }
    }
    void loadReview()
  }, [orderId])

  const canReturn = orderStatus === 'COMPLETED'
  const canReview = orderStatus === 'COMPLETED' && !existingReview
  const hasReview = !!existingReview && !!existingReview.reviewId

  // Reload review
  const reloadReview = async () => {
    try {
      const review: any = await getOrderReviewApi(orderId) // ← Thêm : any
      const reviewData = review?.data || review
      if (reviewData && reviewData.reviewId) {
        setExistingReview(reviewData)
      } else {
        setExistingReview(null)
      }
    } catch (error) {
      console.error('Failed to reload review:', error)
      setExistingReview(null)
    }
  }

  // Xử lý khi review thành công
  const handleReviewSuccess = async () => {
    setShowReviewModal(false)
    await reloadReview()
  }

  // Xử lý khi edit review thành công
  const handleEditReviewSuccess = async () => {
    setShowEditReviewModal(false)
    await reloadReview()
  }

  // Mở modal xem review
  const handleViewReview = () => {
    setShowViewReviewModal(true)
  }

  // Mở modal edit từ view
  const handleEditFromView = () => {
    setShowViewReviewModal(false)
    setShowEditReviewModal(true)
  }

  // Xóa review
  const handleDeleteReview = async () => {
    if (!existingReview) return
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return

    try {
      await deleteReviewApi(existingReview.reviewId)
      setExistingReview(null)
      setShowViewReviewModal(false)
      alert('Đã xóa đánh giá thành công!')
    } catch (error) {
      console.error('Failed to delete review:', error)
      alert('Có lỗi xảy ra khi xóa đánh giá!')
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ProfileSidebar activeItem='orders' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <header className='flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-4 sm:px-6'>
          <h1 className='text-lg font-bold text-foreground'>Đơn hàng của tôi</h1>
        </header>

        <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-24'>
          <div className='mx-auto flex max-w-7xl flex-col gap-4'>
            <div>
              {/* ✅ Chi tiết đơn hàng */}
              <OrderDetailView orderId={orderId} isStaff={false} />

              {/* ✅ 2 nút nằm trong cùng khung, phía dưới */}
              {!isLoadingStatus && (canReturn || canReview || hasReview) && (
                <div className='flex flex-wrap gap-3 justify-end border-t border-border pt-3 mt-2'>
                  {canReturn && (
                    <Button type='button' onClick={() => setShowReturnForm(true)} className='flex items-center gap-2'>
                      <MaterialIcon name='assignment_return' className='text-lg' />
                      <span>Đổi trả hàng</span>
                    </Button>
                  )}

                  {canReview && !hasReview && (
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setShowReviewModal(true)}
                      className='flex items-center gap-2'
                    >
                      <MaterialIcon name='star_rate' className='text-lg' />
                      <span>Đánh giá đơn hàng</span>
                    </Button>
                  )}

                  {hasReview && (
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleViewReview}
                      className='flex items-center gap-2'
                    >
                      <MaterialIcon name='visibility' className='text-lg' />
                      <span>Xem đánh giá</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <ProfileFloatingSupport />
      {/* Return Form Modal */}
      {showReturnForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
          <div className='relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-background p-6 shadow-2xl'>
            <button
              type='button'
              onClick={() => setShowReturnForm(false)}
              className='absolute right-4 top-4 rounded-full p-2 hover:bg-muted transition-colors'
            >
              <MaterialIcon name='close' className='text-2xl' />
            </button>

            <ReturnWarrantyForm
              orderId={orderId}
              onSuccess={() => {
                setShowReturnForm(false)
                setOrderStatus('COMPLETED')
              }}
              onCancel={() => setShowReturnForm(false)}
            />
          </div>
        </div>
      )}

      {/* Review Modal - Tạo mới */}
      {showReviewModal && (
        <ReviewOrderModal
          orderId={orderId}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* View Review Modal - Xem chi tiết */}
      {showViewReviewModal && existingReview && (
        <ViewReviewModal
          review={existingReview}
          isOpen={showViewReviewModal}
          onClose={() => setShowViewReviewModal(false)}
          onEdit={handleEditFromView}
          onDelete={handleDeleteReview}
        />
      )}

      {/* Edit Review Modal - Cập nhật */}
      {showEditReviewModal && existingReview && (
        <EditReviewModal
          review={existingReview}
          isOpen={showEditReviewModal}
          onClose={() => setShowEditReviewModal(false)}
          onSuccess={handleEditReviewSuccess}
        />
      )}
    </div>
  )
}
