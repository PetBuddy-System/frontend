// app/features/manager/components/products/manager-product-batch-list.tsx

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchProductBatchesApi, updateBatchApi } from '../../services/batch'
import { ManagerProductBatchToolbar } from './manager-product-batch-toolbar'
import { ManagerProductBatchTable } from './manager-product-batch-table'
import { ManagerProductBatchPagination } from './manager-product-batch-pagination'
import { ManagerBatchDeleteDialog } from './manager-batch-delete-dialog'
import { ManagerBatchEditDialog } from './manager-batch-edit-dialog'
import type { ProductBatchItem, BatchSortBy } from '~/shared/lib/batch'

export interface ManagerProductBatchListProps {
  productId: string
  refreshKey: number
  onBatchChange: () => void
  formatDate: (dateStr: string) => string
  getDaysRemaining: (expiryDate: string) => number
  onExpiringSoonCountChange?: (count: number) => void
}

export function ManagerProductBatchList({
  productId,
  refreshKey,
  onBatchChange,
  formatDate,
  getDaysRemaining,
  onExpiringSoonCountChange
}: ManagerProductBatchListProps) {
  const { t } = useTranslation('manager')
  // ─── State ──────────────────────────────────────────────
  const [batches, setBatches] = useState<ProductBatchItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'DELETED' | 'ALL'>('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [sortBy, setSortBy] = useState<BatchSortBy>('date_desc')
  const [localRefreshKey, setLocalRefreshKey] = useState(0)

  // ─── Edit Dialog State ──────────────────────────────────
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<ProductBatchItem | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // ─── Expand State ───────────────────────────────────────
  const [expandedBatchIds, setExpandedBatchIds] = useState<string[]>([])

  // ─── Delete Dialog State ───────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingBatchId, setDeletingBatchId] = useState<string | null>(null)
  const [deletingBatchCode, setDeletingBatchCode] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // ─── Load Data ──────────────────────────────────────────
  useEffect(() => {
    async function loadBatches() {
      setIsLoading(true)
      try {
        const response = await fetchProductBatchesApi(productId, {
          keyword: search || undefined,
          status: status !== 'ALL' ? status : undefined,
          page,
          size: 10,
          sortBy
        })
        if (response.success) {
          setBatches(response.data.content)
          setTotalPages(response.data.totalPages)
          setTotalElements(response.data.totalElements)

          const count = response.data.content.filter((batch) => {
            const days = getDaysRemaining(batch.expiryDate)
            return days > 0 && days < 90 && batch.status === 'ACTIVE'
          }).length
          onExpiringSoonCountChange?.(count)
        }
      } catch (err) {
        console.error('Batch API Error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    void loadBatches()
  }, [
    productId,
    search,
    status,
    page,
    sortBy,
    refreshKey,
    localRefreshKey,
    onExpiringSoonCountChange,
    getDaysRemaining
  ])

  // ─── Handlers ───────────────────────────────────────────
  const handleToggleExpand = (batchId: string) => {
    setExpandedBatchIds((prev) => (prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]))
  }

  const handleOpenEditDialog = (batch: ProductBatchItem) => {
    setEditingBatch(batch)
    setEditError(null)
    setEditDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setEditingBatch(null)
    setEditError(null)
  }

  const handleConfirmEdit = async (payload: {
    stockQuantity: number
    basePrice: number | undefined
    expiryDate: string
    status: 'ACTIVE' | 'INACTIVE'
    reason?: string
    note?: string
  }) => {
    if (!editingBatch) return

    setIsSavingEdit(true)
    setEditError(null)

    try {
      const response = await updateBatchApi(editingBatch.batchId, {
        stockQuantity: payload.stockQuantity,
        basePrice: payload.basePrice,
        expiryDate: payload.expiryDate,
        status: payload.status,
        reason: payload.reason,
        note: payload.note
      })
      if (response.success) {
        setEditDialogOpen(false)
        setEditingBatch(null)
        setLocalRefreshKey((prev) => prev + 1)
        onBatchChange()
      } else {
        setEditError(response.message || t('productManagement.batch.errors.updateFailed'))
      }
    } catch (err) {
      setEditError(err instanceof Error ? err.message : t('productManagement.batch.errors.updateFailed'))
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteBatch = (batchId: string, batchCode: string) => {
    setDeletingBatchId(batchId)
    setDeletingBatchCode(batchCode)
    setDeleteError(null)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async (reason?: string, note?: string) => {
    if (!deletingBatchId) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await updateBatchApi(deletingBatchId, {
        status: 'DELETED',
        reason: reason,
        note: note
      })
      if (response.success) {
        setDeleteDialogOpen(false)
        setDeletingBatchId(null)
        setLocalRefreshKey((prev) => prev + 1)
        onBatchChange()
      } else {
        setDeleteError(response.message || t('productManagement.batch.errors.deleteFailed'))
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t('productManagement.batch.errors.deleteFailed'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReset = () => {
    setSearch('')
    setStatus('ALL')
    setSortBy('date_desc')
    setPage(0)
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <h4 className='font-bold text-base text-foreground'>
          {t('productManagement.batch.batchList', { count: totalElements })}
        </h4>
      </div>

      <ManagerProductBatchToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(0)
        }}
        statusValue={status}
        onStatusChange={(val) => {
          setStatus(val)
          setPage(0)
        }}
        sortByValue={sortBy}
        onSortChange={(val) => {
          setSortBy(val)
          setPage(0)
        }}
        onReset={handleReset}
      />

      {isLoading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-primary' />
        </div>
      ) : (
        <>
          <ManagerProductBatchTable
            batches={batches}
            currentPage={page}
            expandedBatchIds={expandedBatchIds}
            formatDate={formatDate}
            getDaysRemaining={getDaysRemaining}
            onToggleExpand={handleToggleExpand}
            onEdit={handleOpenEditDialog}
            onDelete={handleDeleteBatch}
          />

          <ManagerProductBatchPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* ─── Edit Batch Dialog ─────────────────────────────────── */}
      <ManagerBatchEditDialog
        batch={editingBatch}
        isOpen={editDialogOpen}
        isSaving={isSavingEdit}
        error={editError}
        onClose={handleCloseEditDialog}
        onConfirm={handleConfirmEdit}
      />

      {/* ─── Delete Batch Dialog ────────────────────────────────── */}
      <ManagerBatchDeleteDialog
        batchCode={deletingBatchCode}
        isOpen={deleteDialogOpen}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={() => {
          setDeleteDialogOpen(false)
          setDeletingBatchId(null)
          setDeleteError(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
