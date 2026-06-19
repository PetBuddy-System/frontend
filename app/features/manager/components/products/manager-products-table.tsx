import { useTranslation } from 'react-i18next'
import { cn } from '~/shared/lib/cn'
import { MaterialIcon } from '~/shared/ui'
import type { ProductManagementItem } from '~/shared/lib/product'

export interface ManagerProductsTableProps {
  products: ProductManagementItem[]
  isLoading?: boolean
  currentPage: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  onEditClick?: (productId: string) => void
  onDeleteClick?: (productId: string) => void
  onViewClick?: (productId: string) => void
}

export function ManagerProductsTable({
  products = [],
  isLoading = false,
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
  onEditClick,
  onDeleteClick,
  onViewClick
}: ManagerProductsTableProps) {
  const { t } = useTranslation('manager')

  const formatPrice = (price: number) => {
    return (price || 0).toLocaleString('vi-VN') + 'đ'
  }

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

  if (isLoading) {
    return (
      <section className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm animate-pulse'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[960px] border-collapse text-left'>
            <thead>
              <tr className='border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wide text-muted-foreground'>
                <th className='px-4 py-3'>{t('productManagement.table.columns.name', 'Sản phẩm')}</th>
                <th className='px-4 py-3'>{t('productManagement.table.columns.brand', 'Thương hiệu')}</th>
                <th className='px-4 py-3'>{t('productManagement.table.columns.price', 'Đơn giá')}</th>
                <th className='px-4 py-3 text-center'>{t('productManagement.table.columns.stock', 'Tồn kho')}</th>
                <th className='px-4 py-3'>{t('productManagement.table.columns.status', 'Trạng thái')}</th>
                <th className='px-4 py-3'>{t('productManagement.table.columns.updatedAt', 'Ngày cập nhật')}</th>
                <th className='px-4 py-3 text-right'>{t('productManagement.table.columns.actions', 'Hành động')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className='h-20 bg-card'>
                  <td className='px-4 py-4'>
                    <div className='flex items-center gap-4'>
                      <div className='h-14 w-14 shrink-0 rounded-xl bg-muted' />
                      <div className='flex flex-1 flex-col gap-2'>
                        <div className='h-4 w-40 bg-muted rounded' />
                        <div className='h-3 w-20 bg-muted rounded' />
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-4'><div className='h-6 w-20 bg-muted rounded' /></td>
                  <td className='px-4 py-4'><div className='h-6 w-16 bg-muted rounded' /></td>
                  <td className='px-4 py-4'><div className='h-6 w-10 bg-muted rounded mx-auto' /></td>
                  <td className='px-4 py-4'><div className='h-6 w-16 bg-muted rounded' /></td>
                  <td className='px-4 py-4'><div className='h-6 w-24 bg-muted rounded' /></td>
                  <td className='px-4 py-4'><div className='h-8 w-16 bg-muted rounded ml-auto' /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) {
    return (
      <section className='overflow-hidden rounded-2xl border border-border bg-card p-12 text-center shadow-sm'>
        <MaterialIcon name='inventory_2' className='text-5xl text-muted-foreground' />
        <p className='mt-4 text-lg font-semibold text-foreground font-display'>
          {t('productManagement.table.noProducts', 'Không có sản phẩm nào')}
        </p>
        <p className='text-sm text-muted-foreground mt-1'>
          {t('productManagement.table.noProductsDesc', 'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm')}
        </p>
      </section>
    )
  }

  const resultsFrom = totalElements > 0 ? currentPage * 10 + 1 : 0
  const resultsTo = Math.min((currentPage + 1) * 10, totalElements)

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
              <th className='px-4 py-3'>{t('productManagement.table.columns.name', 'Sản phẩm')}</th>
              <th className='px-4 py-3'>{t('productManagement.table.columns.brand', 'Thương hiệu')}</th>
              <th className='px-4 py-3'>{t('productManagement.table.columns.price', 'Đơn giá')}</th>
              <th className='px-4 py-3 text-center'>{t('productManagement.table.columns.stock', 'Tồn kho')}</th>
              <th className='px-4 py-3'>{t('productManagement.table.columns.status', 'Trạng thái')}</th>
              <th className='px-4 py-3'>{t('productManagement.table.columns.updatedAt', 'Ngày cập nhật')}</th>
              <th className='px-4 py-3 text-right'>{t('productManagement.table.columns.actions', 'Hành động')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {products.map((product) => {
              const isLowStock = product.totalStock <= 10
              const thumbnail = product.imageUrls?.[0] || 'https://placehold.co/100'

              return (
                <tr key={product.productId} className='group transition-colors hover:bg-muted/70'>
                  <td className='px-4 py-4'>
                    <div className='flex items-center gap-4'>
                      <img
                        src={thumbnail}
                        alt={product.name}
                        className='h-14 w-14 shrink-0 rounded-xl border border-border bg-muted object-cover'
                      />
                      <div className='min-w-0'>
                        <p className='font-bold text-card-foreground line-clamp-1'>
                          {product.name}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Code: {product.productCode || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    <span className='inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground'>
                      {product.brandName || 'N/A'}
                    </span>
                  </td>
                  <td className='px-4 py-4 font-bold text-primary'>{formatPrice(product.price)}</td>
                  <td className='px-4 py-4 text-center'>
                    <div className='flex flex-col items-center'>
                      <span className={isLowStock ? 'font-bold text-destructive' : 'font-semibold text-foreground'}>
                        {product.totalStock}
                      </span>
                      {isLowStock && (
                        <span className='text-[10px] font-bold uppercase tracking-wide text-destructive'>
                          {t('productManagement.stock.low', 'Tồn thấp')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
                        product.status === 'ACTIVE'
                          ? 'bg-success/15 text-success'
                          : product.status === 'INACTIVE'
                            ? 'bg-muted-foreground/15 text-muted-foreground'
                            : 'bg-destructive/15 text-destructive'
                      )}
                    >
                      {product.status === 'ACTIVE'
                        ? t('productManagement.status.active', 'Đang bán')
                        : product.status === 'INACTIVE'
                          ? t('productManagement.status.inactive', 'Ngừng bán')
                          : t('productManagement.status.deleted', 'Đã xóa')}
                    </span>
                  </td>
                  <td className='px-4 py-4 text-sm text-muted-foreground'>{formatDate(product.updatedAt)}</td>
                  <td className='px-4 py-4'>
                    <div className='flex justify-end gap-2'>
                      {onViewClick && (
                        <button
                          type='button'
                          onClick={() => onViewClick(product.productId)}
                          aria-label={t('productManagement.actions.view')}
                          className='flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary'
                        >
                          <MaterialIcon name='visibility' className='text-lg' />
                        </button>
                      )}
                      {onEditClick && (
                        <button
                          type='button'
                          onClick={() => onEditClick(product.productId)}
                          aria-label={t('productManagement.actions.edit')}
                          className='flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10'
                        >
                          <MaterialIcon name='edit' className='text-lg' />
                        </button>
                      )}
                      {onDeleteClick && (
                        <button
                          type='button'
                          onClick={() => onDeleteClick(product.productId)}
                          aria-label={t('productManagement.actions.delete')}
                          className='flex h-9 w-9 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10'
                        >
                          <MaterialIcon name='delete' className='text-lg' />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className='flex flex-col gap-4 border-t border-border bg-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>
          {t('productManagement.pagination.showing', {
            from: resultsFrom,
            to: resultsTo,
            total: totalElements
          })}
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
