import { useTranslation } from 'react-i18next'
import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'
import type { Promotion } from '../../services/promotion/promotion-api'

export interface ManagerPromotionsTableProps {
  promotions: Promotion[]
  isLoading?: boolean
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  onEditClick?: (promotionId: string) => void
  onDeleteClick?: (promotionId: string) => void
  onViewClick?: (promotionId: string) => void
}

export function ManagerPromotionsTable({
  promotions = [],
  isLoading = false,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onEditClick,
  onDeleteClick,
  onViewClick
}: ManagerPromotionsTableProps) {
  const { t } = useTranslation('manager')

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    try {
      const d = new Date(dateStr)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return 'N/A'
    }
  }

  const getStatusBadge = (status: Promotion['status']) => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: 'ACTIVE',
          className: 'bg-success/10 text-success border border-success/20'
        }
      case 'DRAFT':
        return {
          label: 'DRAFT',
          className: 'bg-warning/10 text-warning border border-warning/20'
        }
      case 'EXPIRED':
        return {
          label: 'EXPIRED',
          className: 'bg-destructive/10 text-destructive border border-destructive/20'
        }
      case 'CANCELLED':
        return {
          label: 'CANCELLED',
          className: 'bg-muted-foreground/15 text-muted-foreground border border-muted-foreground/20'
        }
      case 'DELETED':
        return {
          label: 'DELETED',
          className: 'bg-destructive/15 text-destructive/80 border border-destructive/20'
        }
      default:
        return {
          label: 'UNKNOWN',
          className: 'bg-muted-foreground/10 text-muted-foreground'
        }
    }
  }

  if (isLoading) {
    return (
      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-pulse'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[960px] border-collapse text-left'>
            <thead>
              <tr className='border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                <th className='px-6 py-4'>{t('promotions.table.columns.name', 'Tên khuyến mãi')}</th>
                <th className='px-6 py-4'>{t('promotions.table.columns.description', 'Mô tả')}</th>
                <th className='px-6 py-4'>{t('promotions.table.columns.startDate', 'Ngày bắt đầu')}</th>
                <th className='px-6 py-4'>{t('promotions.table.columns.endDate', 'Ngày kết thúc')}</th>
                <th className='px-6 py-4'>{t('promotions.table.columns.status', 'Trạng thái')}</th>
                <th className='px-6 py-4 text-right'>{t('promotions.table.columns.actions', 'Thao tác')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className='h-20 bg-card'>
                  <td className='px-6 py-4'><div className='h-5 w-40 bg-muted rounded' /></td>
                  <td className='px-6 py-4'><div className='h-4 w-60 bg-muted rounded' /></td>
                  <td className='px-6 py-4'><div className='h-4 w-24 bg-muted rounded' /></td>
                  <td className='px-6 py-4'><div className='h-4 w-24 bg-muted rounded' /></td>
                  <td className='px-6 py-4'><div className='h-6 w-20 bg-muted rounded' /></td>
                  <td className='px-6 py-4'><div className='h-8 w-24 bg-muted rounded ml-auto' /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  if (!promotions || promotions.length === 0) {
    return (
      <section className='overflow-hidden rounded-2xl border border-border bg-card p-12 text-center shadow-sm'>
        <MaterialIcon name='local_offer' className='text-5xl text-muted-foreground' />
        <p className='mt-4 text-lg font-semibold text-foreground font-display'>
          {t('promotions.table.noPromotions', 'Không có chương trình khuyến mãi nào')}
        </p>
        <p className='text-sm text-muted-foreground mt-1'>
          {t('promotions.table.noPromotionsDesc', 'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm')}
        </p>
      </section>
    )
  }

  const resultsFrom = totalElements > 0 ? currentPage * pageSize + 1 : 0
  const resultsTo = Math.min((currentPage + 1) * pageSize, totalElements)

  const pages = Array.from({ length: totalPages }, (_, idx) => idx)
  const startPage = Math.max(0, currentPage - 2)
  const endPage = Math.min(totalPages - 1, currentPage + 2)
  const visiblePages = pages.slice(startPage, endPage + 1)

  return (
    <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[960px] border-collapse text-left'>
          <thead>
            <tr className='border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground'>
              <th className='px-6 py-4 w-[20%]'>{t('promotions.table.columns.name', 'Tên khuyến mãi')}</th>
              <th className='px-6 py-4 w-[40%]'>{t('promotions.table.columns.description', 'Mô tả')}</th>
              <th className='px-6 py-4 w-[12%]'>{t('promotions.table.columns.startDate', 'Ngày bắt đầu')}</th>
              <th className='px-6 py-4 w-[12%]'>{t('promotions.table.columns.endDate', 'Ngày kết thúc')}</th>
              <th className='px-6 py-4 w-[10%]'>{t('promotions.table.columns.status', 'Trạng thái')}</th>
              <th className='px-6 py-4 w-[6%] text-right'>{t('promotions.table.columns.actions', 'Thao tác')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {promotions.map((promo) => {
              const status = getStatusBadge(promo.status)
              const isDeletedOrCancelled = promo.status === 'DELETED' || promo.status === 'CANCELLED'

              return (
                <tr key={promo.promotionId} className='group transition-colors hover:bg-muted/70'>
                  <td className='px-6 py-4 font-bold text-primary font-display'>
                    {promo.name}
                  </td>
                  <td className='px-6 py-4 text-sm text-card-foreground max-w-xs'>
                    <span className='line-clamp-2'>{promo.description || '—'}</span>
                  </td>
                  <td className='px-6 py-4 text-sm font-medium text-foreground'>{formatDate(promo.startDate)}</td>
                  <td className='px-6 py-4 text-sm font-medium text-foreground'>{formatDate(promo.endDate)}</td>
                  <td className='px-6 py-4'>
                    <span className={cn(
                      'inline-flex rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide',
                      status.className
                    )}>
                      {status.label}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex justify-end gap-2'>
                      {onViewClick && (
                        <button
                          type='button'
                          onClick={() => onViewClick(promo.promotionId)}
                          aria-label={t('promotions.actions.view')}
                          className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
                        >
                          <MaterialIcon name='visibility' className='text-lg' />
                        </button>
                      )}

                      {!isDeletedOrCancelled && (
                        <>
                          {onEditClick && (
                            <button
                              type='button'
                              onClick={() => onEditClick(promo.promotionId)}
                              aria-label={t('promotions.actions.edit')}
                              className='flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10'
                            >
                              <MaterialIcon name='edit' className='text-lg' />
                            </button>
                          )}
                          {onDeleteClick && (
                            <button
                              type='button'
                              onClick={() => onDeleteClick(promo.promotionId)}
                              aria-label={t('promotions.actions.delete')}
                              className='flex h-9 w-9 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10'
                            >
                              <MaterialIcon name='delete' className='text-lg' />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className='flex flex-col gap-4 border-t border-border bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground font-semibold'>
          {t('promotions.table.showing', `Hiển thị ${resultsFrom}-${resultsTo} trong tổng số ${totalElements} khuyến mãi`)}
        </p>
        {totalPages > 1 && (
          <div className='flex items-center gap-2'>
            <button
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground disabled:opacity-50 hover:text-primary transition-colors'
            >
              <MaterialIcon name='chevron_left' className='text-lg' />
            </button>
            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg font-bold transition-all',
                  page === currentPage
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-muted-foreground hover:text-primary'
                )}
              >
                {page + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-primary transition-colors disabled:opacity-50'
            >
              <MaterialIcon name='chevron_right' className='text-lg' />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
