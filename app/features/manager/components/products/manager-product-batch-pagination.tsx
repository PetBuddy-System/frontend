// app/features/manager/components/products/manager-product-batch-pagination.tsx

import { MaterialIcon } from '~/shared/ui'

export interface ManagerProductBatchPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ManagerProductBatchPagination({
  currentPage,
  totalPages,
  onPageChange
}: ManagerProductBatchPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className='border-t border-border px-6 py-4 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm'>
      <div className='flex flex-wrap items-center gap-4 text-muted-foreground'>
        <span>
          Trang {currentPage + 1} của {totalPages}
        </span>
        <div className='flex items-center gap-2'>
          <span>Dòng mỗi trang:</span>
          <div className='relative'>
            <select
              className='appearance-none bg-background border border-border rounded-lg pl-3 pr-8 py-1 focus:outline-none focus:ring-1 focus:ring-ring font-medium'
              value={10}
              disabled
            >
              <option value={10}>10</option>
            </select>
            <MaterialIcon
              name='expand_more'
              className='absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-base'
            />
          </div>
        </div>
      </div>

      <div className='flex items-center gap-1'>
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
          className='p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:hover:bg-card transition-colors flex items-center justify-center'
        >
          <MaterialIcon name='chevron_left' className='text-lg' />
        </button>
        <button className='w-8 h-8 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center'>
          {currentPage + 1}
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage >= totalPages - 1}
          className='p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:hover:bg-card transition-colors flex items-center justify-center'
        >
          <MaterialIcon name='chevron_right' className='text-lg' />
        </button>
      </div>
    </div>
  )
}
