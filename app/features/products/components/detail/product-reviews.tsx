import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '~/providers/auth-provider'
import { MaterialIcon, Button } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import {
  fetchProductReviewsApi,
  fetchMyProductReviewApi,
  createProductReviewApi,
  updateProductReviewApi,
  deleteProductReviewApi
} from '../../services/products/review-api'
import type { ProductReview } from '~/shared/lib/product'

interface ProductReviewsProps {
  productId: string
}

type SortOption = 'createdAt' | 'rating'
type SortDir = 'asc' | 'desc'

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { t } = useTranslation('products')
  const { user, isAuthenticated } = useAuth()

  // Reviews list states
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined)
  const [sortBy, setSortBy] = useState<SortOption>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [isLoading, setIsLoading] = useState(true)

  // My review states
  const [myReview, setMyReview] = useState<ProductReview | null>(null)
  const [isLoadingMyReview, setIsLoadingMyReview] = useState(false)

  // Write/Edit form states
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formRating, setFormRating] = useState(5)
  const [formContent, setFormContent] = useState('')
  const [formAnonymous, setFormAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Stats calculation
  const [averageRating, setAverageRating] = useState(0.0)

  // Fetch reviews list
  const loadReviews = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetchProductReviewsApi(productId, {
        rating: ratingFilter,
        page: currentPage,
        size: 5,
        sortBy,
        sortDirection: sortDir
      })

      if (response.success && response.data) {
        setReviews(response.data.content)
        setTotalReviews(response.data.totalElements)
        setTotalPages(response.data.totalPages)
      }
    } catch (error) {
      console.error('Failed to load product reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }, [productId, ratingFilter, currentPage, sortBy, sortDir])

  // Fetch logged-in user's review
  const loadMyReview = useCallback(async () => {
    if (!isAuthenticated) {
      setMyReview(null)
      return
    }
    setIsLoadingMyReview(true)
    try {
      const response = await fetchMyProductReviewApi(productId)
      if (response.success && response.data) {
        setMyReview(response.data)
      } else {
        setMyReview(null)
      }
    } catch (error) {
      console.error('Failed to load my review:', error)
    } finally {
      setIsLoadingMyReview(false)
    }
  }, [productId, isAuthenticated])

  // Initial load
  useEffect(() => {
    void loadReviews()
  }, [loadReviews])

  useEffect(() => {
    void loadMyReview()
  }, [loadMyReview])

  // Calculate average rating dynamically from reviews when rating filter is not applied
  // For standard mock look, let's also aggregate.
  useEffect(() => {
    if (!ratingFilter && reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0)
      const avg = sum / reviews.length
      setAverageRating(parseFloat(avg.toFixed(1)))
    } else if (reviews.length === 0 && !ratingFilter) {
      setAverageRating(5.0) // Default fallback
    }
  }, [reviews, ratingFilter])

  // Star selection helper for form
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  // Open write review form
  const handleOpenWrite = () => {
    setFormRating(5)
    setFormContent('')
    setFormAnonymous(false)
    setIsEditing(false)
    setFormError(null)
    setShowForm(true)
  }

  // Open edit review form
  const handleOpenEdit = () => {
    if (!myReview) return
    setFormRating(myReview.rating)
    setFormContent(myReview.content)
    setFormAnonymous(myReview.anonymous)
    setIsEditing(true)
    setFormError(null)
    setShowForm(true)
  }

  // Handle form submission (POST / PUT)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formContent.trim()) {
      setFormError(t('detail.reviews.contentRequired'))
      return
    }
    if (formContent.trim().length < 10) {
      setFormError('Nội dung đánh giá phải có ít nhất 10 ký tự.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      let res
      if (isEditing && myReview) {
        res = await updateProductReviewApi(myReview.reviewId, {
          rating: formRating,
          content: formContent,
          anonymous: formAnonymous
        })
      } else {
        res = await createProductReviewApi(productId, {
          rating: formRating,
          content: formContent,
          anonymous: formAnonymous
        })
      }

      if (res.success) {
        setShowForm(false)
        await loadMyReview()
        await loadReviews()
      } else {
        setFormError(res.message || 'Có lỗi xảy ra, vui lòng thử lại.')
      }
    } catch (error: any) {
      setFormError(error.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm(t('detail.reviews.confirmDelete'))) return

    try {
      const res = await deleteProductReviewApi(reviewId)
      if (res.success) {
        if (myReview && myReview.reviewId === reviewId) {
          setMyReview(null)
        }
        await loadReviews()
      } else {
        alert(res.message || 'Xóa đánh giá không thành công')
      }
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi xóa đánh giá')
    }
  }

  const handleRatingFilterChange = (rating: number | undefined) => {
    setRatingFilter(rating)
    setCurrentPage(0)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === 'newest') {
      setSortBy('createdAt')
      setSortDir('desc')
    } else if (val === 'highestRating') {
      setSortBy('rating')
      setSortDir('desc')
    } else if (val === 'lowestRating') {
      setSortBy('rating')
      setSortDir('asc')
    }
    setCurrentPage(0)
  }

  // Check roles
  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN'

  return (
    <section className='mt-12 rounded-xl border border-border/60 bg-card p-6 shadow-sm'>
      {/* Header Area */}
      <div className='border-b border-border/60 pb-6'>
        <div className='flex flex-col justify-between gap-6 md:flex-row md:items-center'>
          <div>
            <h2 className='text-2xl font-bold text-foreground font-display'>{t('detail.reviews.title')}</h2>
            <div className='mt-2 flex flex-wrap items-center gap-4'>
              <div className='flex items-center gap-1.5'>
                <span className='text-3xl font-extrabold text-foreground font-display'>{averageRating}</span>
                <span className='text-sm text-muted-foreground'>/ 5</span>
              </div>
              <div className='flex items-center text-secondary'>
                {Array.from({ length: 5 }).map((_, idx) => {
                  const ratingVal = idx + 1
                  const isFilled = ratingVal <= Math.round(averageRating)
                  return (
                    <MaterialIcon
                      key={idx}
                      name='star'
                      filled={isFilled}
                      className={cn('text-[22px]', isFilled ? 'text-secondary' : 'text-muted-foreground/30')}
                    />
                  )
                })}
              </div>
              <span className='text-sm text-muted-foreground'>
                ({totalReviews} {t('detail.reviews.stars')})
              </span>
            </div>
          </div>

          {isAuthenticated ? (
            !myReview &&
            !showForm && (
              <Button
                variant='primary'
                onClick={handleOpenWrite}
                className='self-start rounded-xl font-semibold shadow-sm transition-all hover:brightness-105 active:scale-[0.98]'
              >
                <MaterialIcon name='rate_review' className='text-lg' />
                {t('detail.reviews.write')}
              </Button>
            )
          ) : (
            <p className='text-sm italic text-muted-foreground'>{t('detail.reviews.loginRequired')}</p>
          )}
        </div>
      </div>

      {/* Review Input / Edit Form (Inline Collapsible) */}
      {showForm && (
        <div className='mt-6 rounded-xl border border-primary/20 bg-primary/5 p-6 transition-all duration-300'>
          <h3 className='text-lg font-bold text-foreground flex items-center gap-2'>
            <MaterialIcon name={isEditing ? 'edit' : 'add_circle'} className='text-primary' />
            {isEditing ? t('detail.reviews.editTitle') : t('detail.reviews.createTitle')}
          </h3>
          <form onSubmit={handleSubmitReview} className='mt-4 space-y-4'>
            {formError && (
              <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive font-medium'>{formError}</div>
            )}

            {/* Rating Stars Selector */}
            <div className='space-y-1.5'>
              <label className='block text-sm font-semibold text-foreground'>Đánh giá số sao</label>
              <div className='flex items-center gap-1 text-secondary'>
                {Array.from({ length: 5 }).map((_, idx) => {
                  const ratingValue = idx + 1
                  const isActive = hoverRating !== null ? ratingValue <= hoverRating : ratingValue <= formRating
                  return (
                    <button
                      type='button'
                      key={idx}
                      onClick={() => setFormRating(ratingValue)}
                      onMouseEnter={() => setHoverRating(ratingValue)}
                      onMouseLeave={() => setHoverRating(null)}
                      className='transition-transform hover:scale-110 focus:outline-none'
                    >
                      <MaterialIcon
                        name='star'
                        filled={isActive}
                        className={cn('text-[30px]', isActive ? 'text-secondary' : 'text-muted-foreground/30')}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content Textarea */}
            <div className='space-y-1.5'>
              <label htmlFor='review-content' className='block text-sm font-semibold text-foreground'>
                Nội dung nhận xét
              </label>
              <textarea
                id='review-content'
                rows={4}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder={t('detail.reviews.contentPlaceholder')}
                className={cn(
                  'w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/60 transition-all',
                  'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                )}
              />
            </div>

            {/* Anonymous Checkbox */}
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='review-anonymous'
                checked={formAnonymous}
                onChange={(e) => setFormAnonymous(e.target.checked)}
                className='h-4 w-4 rounded border-border/60 text-primary focus:ring-primary'
              />
              <label htmlFor='review-anonymous' className='text-sm text-muted-foreground cursor-pointer select-none'>
                {t('detail.reviews.anonymousHint')}
              </label>
            </div>

            {/* Form Actions */}
            <div className='flex items-center gap-3 pt-2'>
              <Button
                type='submit'
                variant='primary'
                disabled={isSubmitting}
                className='rounded-lg px-5 py-2 text-sm font-semibold'
              >
                {isSubmitting ? 'Đang gửi...' : t('detail.reviews.submit')}
              </Button>
              <Button
                type='button'
                variant='outline'
                disabled={isSubmitting}
                onClick={() => setShowForm(false)}
                className='rounded-lg px-5 py-2 text-sm font-semibold'
              >
                {t('detail.reviews.cancel')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Logged in User's own review */}
      {myReview && !showForm && (
        <div className='mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5 relative overflow-hidden'>
          <div className='absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-bl-lg'>
            {t('detail.reviews.yourReview')}
          </div>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold text-primary font-display'>
                {myReview.anonymous ? 'A' : myReview.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <span className='block font-bold text-foreground'>
                  {myReview.anonymous ? t('detail.reviews.anonymousUser') : myReview.fullName}
                </span>
                <div className='flex items-center gap-2'>
                  <div className='flex text-secondary'>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <MaterialIcon
                        key={idx}
                        name='star'
                        filled={idx < myReview.rating}
                        className={cn(
                          'text-[16px]',
                          idx < myReview.rating ? 'text-secondary' : 'text-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {new Date(myReview.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2 mt-1 mr-12 md:mr-0'>
              <button
                onClick={handleOpenEdit}
                className='flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-muted/80'
              >
                <MaterialIcon name='edit' className='text-[14px]' />
                {t('detail.reviews.edit')}
              </button>
              <button
                onClick={() => handleDeleteReview(myReview.reviewId)}
                className='flex items-center gap-1 rounded bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20'
              >
                <MaterialIcon name='delete' className='text-[14px]' />
                {t('detail.reviews.delete')}
              </button>
            </div>
          </div>
          <p className='mt-3 italic text-muted-foreground text-sm pl-1'>"{myReview.content}"</p>
        </div>
      )}

      {/* Filtering and Sorting controls */}
      <div className='mt-8 flex flex-col gap-4 border-b border-border/60 pb-4 md:flex-row md:items-center md:justify-between'>
        {/* Rating Filter Chips */}
        <div className='flex flex-wrap items-center gap-2'>
          <button
            onClick={() => handleRatingFilterChange(undefined)}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-full transition-all border',
              ratingFilter === undefined
                ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                : 'border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {t('detail.reviews.all')}
          </button>
          {[5, 4, 3, 2, 1].map((ratingVal) => (
            <button
              key={ratingVal}
              onClick={() => handleRatingFilterChange(ratingVal)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-full transition-all border flex items-center gap-1',
                ratingFilter === ratingVal
                  ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                  : 'border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {ratingVal} <MaterialIcon name='star' filled className='text-[12px] text-secondary' />
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className='flex items-center gap-2 self-start md:self-auto'>
          <label htmlFor='reviews-sort' className='text-xs font-semibold text-muted-foreground whitespace-nowrap'>
            {t('detail.reviews.sortBy')}
          </label>
          <select
            id='reviews-sort'
            onChange={handleSortChange}
            value={sortBy === 'rating' ? (sortDir === 'desc' ? 'highestRating' : 'lowestRating') : 'newest'}
            className='rounded-lg border border-border/60 bg-card px-2.5 py-1 text-xs text-foreground font-semibold focus:border-primary focus:outline-none'
          >
            <option value='newest'>{t('detail.reviews.newest')}</option>
            <option value='highestRating'>{t('detail.reviews.highestRating')}</option>
            <option value='lowestRating'>{t('detail.reviews.lowestRating')}</option>
          </select>
        </div>
      </div>

      {/* Public Reviews List */}
      <div className='mt-6 space-y-6'>
        {isLoading ? (
          /* Loading Skeletons */
          <div className='space-y-4 animate-pulse'>
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className='flex flex-col gap-3 rounded-xl border border-border/40 p-5'>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-full bg-muted' />
                  <div className='space-y-1.5'>
                    <div className='h-4 w-32 bg-muted rounded' />
                    <div className='h-3 w-20 bg-muted rounded' />
                  </div>
                </div>
                <div className='h-4 w-full bg-muted rounded mt-1' />
                <div className='h-4 w-3/4 bg-muted rounded' />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          /* Empty State */
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <MaterialIcon name='rate_review' className='text-5xl text-muted-foreground/40' />
            <p className='mt-3 text-sm font-semibold text-muted-foreground'>{t('detail.reviews.empty')}</p>
          </div>
        ) : (
          /* Reviews Content List */
          reviews.map((review) => {
            const isMyPublicReview = user && review.userId === user.userId
            return (
              <article
                key={review.reviewId}
                className={cn(
                  'flex flex-col gap-3 rounded-xl border border-border/50 p-5 bg-card shadow-sm transition-all',
                  isMyPublicReview && 'border-primary/40 bg-primary/[0.01]'
                )}
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold text-primary font-display'>
                      {review.anonymous ? 'A' : review.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <span className='block font-bold text-foreground flex items-center gap-1.5'>
                        {review.anonymous ? t('detail.reviews.anonymousUser') : review.fullName}
                        {isMyPublicReview && (
                          <span className='text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded'>
                            {t('detail.reviews.yourReview')}
                          </span>
                        )}
                      </span>
                      <div className='flex items-center gap-2'>
                        <div className='flex text-secondary'>
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <MaterialIcon
                              key={idx}
                              name='star'
                              filled={idx < review.rating}
                              className={cn(
                                'text-[15px]',
                                idx < review.rating ? 'text-secondary' : 'text-muted-foreground/30'
                              )}
                            />
                          ))}
                        </div>
                        <span className='text-xs text-muted-foreground'>
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    {/* Delete button (only show for Owner or Manager/Admin) */}
                    {(isMyPublicReview || isManagerOrAdmin) && (
                      <button
                        onClick={() => handleDeleteReview(review.reviewId)}
                        className='flex items-center justify-center rounded-full bg-destructive/10 h-7 w-7 text-destructive transition-colors hover:bg-destructive/20 ml-2'
                        title='Xóa đánh giá này'
                      >
                        <MaterialIcon name='delete' className='text-[16px]' />
                      </button>
                    )}
                  </div>
                </div>
                <p className='mt-2 pl-1 text-sm text-muted-foreground leading-relaxed whitespace-pre-line'>
                  {review.content}
                </p>
              </article>
            )
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && !isLoading && (
        <div className='mt-8 flex items-center justify-between border-t border-border/60 pt-4'>
          <p className='text-xs font-semibold text-muted-foreground'>
            Trang {currentPage + 1} / {totalPages}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className='rounded-lg text-xs font-semibold'
            >
              <MaterialIcon name='chevron_left' className='text-sm' />
              {t('pagination.prev')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              className='rounded-lg text-xs font-semibold'
            >
              {t('pagination.next')}
              <MaterialIcon name='chevron_right' className='text-sm' />
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
