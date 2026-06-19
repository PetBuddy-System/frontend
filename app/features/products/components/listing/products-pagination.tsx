import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

export interface ProductsPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ProductsPagination({ currentPage, totalPages, onPageChange }: ProductsPaginationProps) {
  const { t } = useTranslation('products')

  if (totalPages <= 1) return null

  const pageNumbers = Array.from({ length: totalPages }).map((_, i) => i)

  return (
    <div className='mt-12 flex items-center justify-center gap-2'>
      <button
        type='button'
        className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80 disabled:opacity-50 disabled:pointer-events-none'
        aria-label={t('pagination.prev')}
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <MaterialIcon name='chevron_left' className='text-[20px]' />
      </button>

      {pageNumbers.map((page) => {
        const isActive = page === currentPage

        return (
          <button
            key={page}
            type='button'
            onClick={() => onPageChange(page)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg font-semibold transition-all',
              isActive
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'border border-border bg-card text-foreground hover:border-primary hover:text-primary active:scale-95'
            )}
          >
            {page + 1}
          </button>
        )
      })}

      <button
        type='button'
        className='flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:pointer-events-none'
        aria-label={t('pagination.next')}
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <MaterialIcon name='chevron_right' className='text-[20px]' />
      </button>
    </div>
  )
}
