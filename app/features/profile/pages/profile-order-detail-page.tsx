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
import { ReviewCard } from '../components/returns/review-card'
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
        const review = await getOrderReviewApi(orderId)
        setExistingReview(review)
      } catch (error) {
        console.error('Failed to load review:', error)
      } finally {
        setLoadingReview(false)
      }
    }
    void loadReview()
  }, [orderId])

  const canReturn = orderStatus === 'COMPLETED'
  const canReview = orderStatus === 'COMPLETED' && !existingReview

  // Reload review
  const reloadReview = async () => {
    try {
      const review = await getOrderReviewApi(orderId)
      setExistingReview(review)
    } catch (error) {
      console.error('Failed to reload review:', error)
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

  // Xóa review
  const handleDeleteReview = async () => {
    if (!existingReview) return
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return

    try {
      await deleteReviewApi(existingReview.reviewId)
      setExistingReview(null)
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
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <div className='relative'>
              <OrderDetailView orderId={orderId} isStaff={false} />

              {/* Review Card - Component đã tách riêng */}
              {existingReview && (
                <ReviewCard
                  review={existingReview}
                  onEdit={() => setShowEditReviewModal(true)}
                  onDelete={handleDeleteReview}
                />
              )}

              {/* Nút hành động */}
              {!isLoadingStatus && (canReturn || canReview) && (
                <div className='flex flex-wrap gap-3 justify-end border-t border-border pt-4 mt-4'>
                  {canReturn && (
                    <Button
                      type='button'
                      onClick={() => setShowReturnForm(true)}
                      className='flex items-center gap-2'
                    >
                      <MaterialIcon name='assignment_return' className='text-lg' />
                      <span>Đổi trả hàng</span>
                    </Button>
                  )}

                  {canReview && (
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