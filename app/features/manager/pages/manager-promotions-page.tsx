/* eslint-disable react-hooks/set-state-in-effect */
// app/features/manager/pages/manager-promotions-page.tsx
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { MaterialIcon } from '~/shared/ui'

import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { ManagerPromotionsStats } from '../components/promotions/manager-promotions-stats'
import { ManagerPromotionsToolbar } from '../components/promotions/manager-promotions-toolbar'
import { ManagerPromotionsTable } from '../components/promotions/manager-promotions-table'
import { ManagerPromotionDetailDialog } from '../components/promotions/manager-promotion-detail-dialog'
import { promotionApi, type Promotion } from '../services/promotion/promotion-api'

export function ManagerPromotionsPage() {
  const { t } = useTranslation('manager')
  const navigate = useNavigate()

  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSort, setSelectedSort] = useState<
    'createdAt_desc' | 'createdAt_asc' | 'startDate_desc'
  >('createdAt_desc')
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [viewingPromotionId, setViewingPromotionId] = useState<string | null>(null)

  const activeCount = promotions.filter((promotion) => promotion.status === 'ACTIVE').length
  const draftCount = promotions.filter((promotion) => promotion.status === 'DRAFT').length
  const expiredCount = promotions.filter((promotion) => promotion.status === 'EXPIRED').length

  const loadPromotions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await promotionApi.getPromotions({
        keyword: keyword.trim() || undefined,
        status: selectedStatus !== 'all' ? (selectedStatus as Promotion['status']) : undefined,
        page,
        size: 10,
        sortBy: selectedSort
      })

      if (!response.success) {
        throw new Error(response.message || 'Lỗi tải danh sách khuyến mãi')
      }

      setPromotions(response.data.content)
      setTotalElements(response.data.totalElements)
      setTotalPages(response.data.totalPages)
    } catch (err: unknown) {
      setPromotions([])
      setTotalElements(0)
      setTotalPages(0)
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách khuyến mãi')
    } finally {
      setIsLoading(false)
    }
  }, [keyword, page, selectedSort, selectedStatus])

  useEffect(() => {
    void loadPromotions()
  }, [loadPromotions, refreshKey])

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status)
    setPage(0)
  }

  const handleSortSelect = (
    sort: 'createdAt_desc' | 'createdAt_asc' | 'startDate_desc'
  ) => {
    setSelectedSort(sort)
    setPage(0)
  }

  const handleKeywordChange = (value: string) => {
    setKeywordInput(value)
    setPage(0)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(keywordInput)
      setPage(0)
    }, 350)

    return () => clearTimeout(timer)
  }, [keywordInput])

  const handleEdit = (promotionId: string) => {
    void navigate(`/manager/promotions/${promotionId}/edit`)
  }

  const handleView = (promotionId: string) => {
    setViewingPromotionId(promotionId)
  }

  // Xóa mềm: chỉ PATCH status → DELETED, không cần confirm
  const handleDelete = async (promotionId: string) => {
    try {
      await promotionApi.updatePromotion(promotionId, { status: 'DELETED' })
      setRefreshKey((previous) => previous + 1)
    } catch {
      // lỗi bỏ qua, không hiện gì
    }
  }

  const statsTotal = totalElements

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='promotions' />

      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey='promotions.title' subtitleKey='promotions.subtitle' />

        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            <section className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <h1 className='font-display text-2xl font-bold text-card-foreground md:text-3xl'>
                  {t('promotions.title', 'Quản lý Khuyến mãi')}
                </h1>
                <p className='mt-1 text-muted-foreground'>
                  {t('promotions.subtitle', 'Quản lý các chương trình giảm giá và chiến dịch quảng bá.')}
                </p>
              </div>

              <button
                type='button'
                onClick={() => void navigate('/manager/promotions/new')}
                className='inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-secondary px-5 text-sm font-bold text-secondary-foreground shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring'
              >
                <MaterialIcon name='add' className='text-lg' />
                <span>{t('promotions.actions.add', 'Thêm khuyến mãi mới')}</span>
              </button>
            </section>

            {error && (
              <div className='flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
                <MaterialIcon name='error' className='shrink-0 text-xl' />
                <span>{error}</span>
              </div>
            )}

            <ManagerPromotionsStats
              total={statsTotal}
              activeCount={activeCount}
              draftCount={draftCount}
              expiredCount={expiredCount}
              isLoading={isLoading}
            />

            <ManagerPromotionsToolbar
              selectedStatus={selectedStatus}
              onStatusSelect={handleStatusSelect}
              selectedSort={selectedSort}
              onSortSelect={handleSortSelect}
              keyword={keywordInput}
              onKeywordChange={handleKeywordChange}
            />

            <ManagerPromotionsTable
              promotions={promotions}
              isLoading={isLoading}
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={10}
              onPageChange={setPage}
              onEditClick={handleEdit}
              onDeleteClick={(id) => void handleDelete(id)}
              onViewClick={handleView}
            />
          </div>
        </main>
      </div>

      <ManagerPromotionDetailDialog
        promotionId={viewingPromotionId}
        onClose={() => setViewingPromotionId(null)}
      />
    </div>
  )
}
