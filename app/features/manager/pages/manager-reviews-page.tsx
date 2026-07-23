// app/features/manager/pages/manager-reviews-page.tsx

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { ReviewsFilterBar } from '../components/reviews/reviews-filter-bar'
import { ReviewsTable } from '../components/reviews/reviews-table'
import { ReviewDetailDrawer } from '../components/reviews/review-detail-drawer'
import {
  fetchManagementReviewsApi,
  updateManagementReviewStatusApi,
  deleteManagementReviewApi
} from '../services/review/review-api'
import type { ManagerReviewItem } from '~/shared/lib/product'

type SortKey = 'newest' | 'oldest' | 'highestRating' | 'lowestRating'
type ReviewTypeFilter = 'ALL' | 'PRODUCT' | 'ORDER'

const SORT_MAP: Record<SortKey, { sortBy: string; sortDir: 'asc' | 'desc' }> = {
  newest: { sortBy: 'createdAt', sortDir: 'desc' },
  oldest: { sortBy: 'createdAt', sortDir: 'asc' },
  highestRating: { sortBy: 'rating', sortDir: 'desc' },
  lowestRating: { sortBy: 'rating', sortDir: 'asc' }
}

export function ManagerReviewsPage() {
  const { t } = useTranslation('manager')

  // ── List state ──────────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<ManagerReviewItem[]>([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const PAGE_SIZE = 10

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState('')
  const [reviewTypeFilter, setReviewTypeFilter] = useState<ReviewTypeFilter>('ALL') // ← THÊM
  const [sortKey, setSortKey] = useState<SortKey>('newest')

  // ── Detail drawer state ──────────────────────────────────────────────────────
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)

  // ── Debounce keyword ─────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedKeyword(keyword)
      setCurrentPage(0)
    }, 400)
    return () => clearTimeout(id)
  }, [keyword])

  // ── Fetch reviews ────────────────────────────────────────────────────────────
  const loadReviews = useCallback(async () => {
    setIsLoading(true)
    try {
      const { sortBy, sortDir } = SORT_MAP[sortKey]
      const res = await fetchManagementReviewsApi({
        keyword: debouncedKeyword || undefined,
        rating: ratingFilter,
        status: statusFilter || undefined,
        reviewType: reviewTypeFilter === 'ALL' ? undefined : reviewTypeFilter, // ← THÊM
        page: currentPage,
        size: PAGE_SIZE,
        sortBy,
        sortDirection: sortDir
      })
      if (res.success && res.data) {
        setReviews(res.data.content)
        setTotalReviews(res.data.totalElements)
        setTotalPages(res.data.totalPages)
      }
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedKeyword, ratingFilter, statusFilter, reviewTypeFilter, currentPage, sortKey])

  useEffect(() => {
    void loadReviews()
  }, [loadReviews])

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleToggleStatus = async (review: ManagerReviewItem) => {
    const newStatus = review.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE'
    const res = await updateManagementReviewStatusApi(review.reviewId, newStatus)
    if (res.success) {
      setReviews((prev) => prev.map((r) => (r.reviewId === review.reviewId ? { ...r, status: newStatus } : r)))
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này vĩnh viễn? Hành động này không thể hoàn tác.')) {
      return
    }
    const res = await deleteManagementReviewApi(reviewId)
    if (res.success) {
      setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId))
      setTotalReviews((prev) => prev - 1)
    }
  }

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRatingFilter(e.target.value ? parseInt(e.target.value, 10) : undefined)
    setCurrentPage(0)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
    setCurrentPage(0)
  }

  const handleReviewTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // ← THÊM
    setReviewTypeFilter(e.target.value as ReviewTypeFilter)
    setCurrentPage(0)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortKey(e.target.value as SortKey)
    setCurrentPage(0)
  }

  // ── Computed sort key for filter bar ─────────────────────────────────────────
  const { sortBy, sortDir } = SORT_MAP[sortKey]
  const currentSortKey =
    sortBy === 'rating'
      ? sortDir === 'desc'
        ? 'highestRating'
        : 'lowestRating'
      : sortDir === 'asc'
        ? 'oldest'
        : 'newest'

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='reviews' />

      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='reviews.title' subtitleKey='reviews.subtitle' />

        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            {/* Page header */}
            <section className='border-b border-border pb-6'>
              <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>{t('reviews.title')}</h1>
              <p className='mt-2 text-muted-foreground'>{t('reviews.subtitle')}</p>
            </section>

            {/* Filters */}
            <ReviewsFilterBar
              keyword={keyword}
              onKeywordChange={setKeyword}
              statusFilter={statusFilter}
              onStatusChange={handleStatusChange}
              ratingFilter={ratingFilter}
              onRatingChange={handleRatingChange}
              reviewTypeFilter={reviewTypeFilter} // ← THÊM
              onReviewTypeChange={handleReviewTypeChange} // ← THÊM
              sortKey={currentSortKey}
              onSortChange={handleSortChange}
            />

            {/* Table */}
            <ReviewsTable
              reviews={reviews}
              isLoading={isLoading}
              totalPages={totalPages}
              totalReviews={totalReviews}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onViewDetail={setSelectedReviewId}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteReview}
            />
          </div>
        </main>
      </div>

      {/* Detail Drawer */}
      <ReviewDetailDrawer
        reviewId={selectedReviewId}
        onClose={() => setSelectedReviewId(null)}
        onToggleStatus={handleToggleStatus}
        onDelete={async (reviewId) => {
          if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này vĩnh viễn? Hành động này không thể hoàn tác.'))
            return
          const res = await deleteManagementReviewApi(reviewId)
          if (res.success) {
            setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId))
            setTotalReviews((prev) => prev - 1)
          }
        }}
      />
    </div>
  )
}
