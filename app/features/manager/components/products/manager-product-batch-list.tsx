import { useState, useEffect, Fragment } from 'react'
import { MaterialIcon } from '~/shared/ui'
import { fetchProductBatchesApi, updateBatchApi } from '../../services/batch'
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
  // ─── Batch State ────────────────────────────────────────────
  const [batches, setBatches] = useState<ProductBatchItem[]>([])
  const [isLoadingBatches, setIsLoadingBatches] = useState(false)
  const [batchSearch, setBatchSearch] = useState('')
  const [batchStatus, setBatchStatus] = useState<'ACTIVE' | 'INACTIVE' | 'DELETED' | 'ALL'>('ALL')
  const [batchPage, setBatchPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [sortBy, setSortBy] = useState<BatchSortBy>('date_desc')

  // ─── Batch interactive operations states ───────────────────
  const [expandedBatchIds, setExpandedBatchIds] = useState<string[]>([])
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState<number>(0)
  const [editExpiryDate, setEditExpiryDate] = useState<string>('')
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE' | 'DELETED'>('ACTIVE')
  const [editError, setEditError] = useState<string | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false)

  const [localRefreshKey, setLocalRefreshKey] = useState(0)

  // ─── Load Batches ───────────────────────────────────────────
  useEffect(() => {
    async function loadBatches() {
      setIsLoadingBatches(true)
      try {
        const response = await fetchProductBatchesApi(productId, {
          keyword: batchSearch || undefined,
          status: batchStatus !== 'ALL' ? batchStatus : undefined,
          page: batchPage,
          size: 10,
          sortBy
        })

        if (response.success) {
          setBatches(response.data.content)
          setTotalPages(response.data.totalPages)
          setTotalElements(response.data.totalElements)

          // Calculate expiring soon count
          const count = response.data.content.filter((batch) => {
            const days = getDaysRemaining(batch.expiryDate)
            return days > 0 && days < 90 && batch.status === 'ACTIVE'
          }).length
          onExpiringSoonCountChange?.(count)
        }
      } catch (err) {
        console.error('Batch API Error:', err)
      } finally {
        setIsLoadingBatches(false)
      }
    }

    void loadBatches()
  }, [productId, batchSearch, batchStatus, batchPage, sortBy, refreshKey, localRefreshKey, onExpiringSoonCountChange])

  // ─── Toggle detail expansion ────────────────────────────────
  const toggleExpandBatch = (batchId: string) => {
    setExpandedBatchIds((prev) =>
      prev.includes(batchId)
        ? prev.filter((id) => id !== batchId)
        : [...prev, batchId]
    )
  }

  // ─── Start editing inline ──────────────────────────────────
  const handleStartEdit = (batch: ProductBatchItem) => {
    setEditingBatchId(batch.batchId)
    setEditQuantity(batch.stockQuantity)
    setEditExpiryDate(batch.expiryDate ? batch.expiryDate.substring(0, 10) : '')
    setEditStatus(batch.status)
    setEditError(null)
  }

  // ─── Cancel editing ────────────────────────────────────────
  const handleCancelEdit = () => {
    setEditingBatchId(null)
    setEditError(null)
  }

  // ─── Save inline editing changes ───────────────────────────
  const handleSaveEdit = async () => {
    setEditError(null)
    if (editQuantity < 0) {
      setEditError('Số lượng phải từ 0 trở lên')
      return
    }
    if (!editExpiryDate.trim()) {
      setEditError('Ngày hết hạn không được trống')
      return
    }
    if (!editingBatchId) return

    setIsSavingEdit(true)
    try {
      const response = await updateBatchApi(editingBatchId, {
        stockQuantity: editQuantity,
        expiryDate: editExpiryDate,
        status: editStatus
      })
      if (response.success) {
        setEditingBatchId(null)
        setLocalRefreshKey((prev) => prev + 1)
        onBatchChange()
      } else {
        setEditError(response.message || 'Không thể cập nhật lô hàng')
      }
    } catch (err) {
      console.error('Update batch error:', err)
      const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật lô hàng'
      setEditError(errMsg)
    } finally {
      setIsSavingEdit(false)
    }
  }

  // ─── Soft delete batch ──────────────────────────────────────
  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lô hàng này?')) return
    try {
      const response = await updateBatchApi(batchId, {
        status: 'DELETED'
      })
      if (response.success) {
        setLocalRefreshKey((prev) => prev + 1)
        onBatchChange()
      } else {
        alert(response.message || 'Không thể xóa lô hàng')
      }
    } catch (err) {
      console.error('Delete batch error:', err)
      const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa lô hàng'
      alert(errMsg)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <h4 className='font-bold text-base text-foreground'>Danh sách lô hàng ({totalElements})</h4>
      </div>

      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border/50'>
        {/* Search Input */}
        <div className='relative flex-1 min-w-[240px]'>
          <MaterialIcon name='search' className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg' />
          <input
            type='text'
            placeholder='Tìm kiếm lô hàng...'
            value={batchSearch}
            onChange={(e) => {
              setBatchSearch(e.target.value)
              setBatchPage(0)
            }}
            className='w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
          />
        </div>

        {/* Status Dropdown */}
        <div className='relative min-w-[180px]'>
          <select
            value={batchStatus}
            onChange={(e) => {
              setBatchStatus(e.target.value as typeof batchStatus)
              setBatchPage(0)
            }}
            className='w-full appearance-none rounded-lg border border-input bg-background px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
          >
            <option value='ALL'>Trạng thái: Tất cả</option>
            <option value='ACTIVE'>Đang hoạt động</option>
            <option value='INACTIVE'>Ngừng hoạt động</option>
            <option value='DELETED'>Đã xóa</option>
          </select>
          <MaterialIcon name='expand_more' className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-lg' />
        </div>

        {/* Sorting Dropdown */}
        <div className='relative min-w-[180px]'>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as BatchSortBy)
              setBatchPage(0)
            }}
            className='w-full appearance-none rounded-lg border border-input bg-background px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
          >
            <option value='date_desc'>Sắp xếp: Mới nhất</option>
            <option value='date_asc'>Sắp xếp: Cũ nhất</option>
            <option value='stock_desc'>Tồn kho cao nhất</option>
            <option value='stock_asc'>Tồn kho thấp nhất</option>
            <option value='expiry_asc'>Sắp hết hạn</option>
            <option value='expiry_desc'>Hết hạn xa nhất</option>
          </select>
          <MaterialIcon name='expand_more' className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-lg' />
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            setBatchSearch('')
            setBatchStatus('ALL')
            setSortBy('date_desc')
            setBatchPage(0)
          }}
          className='p-1.5 bg-card hover:bg-muted border border-border text-foreground rounded-lg transition-colors flex items-center justify-center'
          title='Làm mới'
        >
          <MaterialIcon name='refresh' className='text-lg' />
        </button>
      </div>

      {/* Batch Table */}
      {isLoadingBatches ? (
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-primary'></div>
        </div>
      ) : batches.length === 0 ? (
        <div className='text-center py-12 border border-border border-dashed rounded-xl bg-muted/10'>
          <MaterialIcon name='inbox' className='text-4xl text-muted-foreground/60 mb-2' />
          <p className='text-muted-foreground text-sm font-medium'>Không tìm thấy lô hàng nào</p>
        </div>
      ) : (
        <div className='border border-border rounded-xl overflow-hidden bg-card'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm border-collapse text-left'>
              <thead>
                <tr className='bg-muted/40 border-b border-border'>
                  <th className='w-16 px-4 py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider'>STT</th>
                  <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>Mã lô hàng</th>
                  <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>Tồn kho</th>
                  <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>Ngày hết hạn</th>
                  <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>Số ngày còn lại</th>
                  <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>Trạng thái</th>
                  <th className='w-32 px-4 py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider'>Thao tác</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {batches.map((batch, index) => {
                  const daysRemaining = getDaysRemaining(batch.expiryDate)
                  const isExpiringSoon = daysRemaining <= 45 && daysRemaining > 0
                  const isExpired = daysRemaining <= 0
                  const isExpanded = expandedBatchIds.includes(batch.batchId)
                  const isEditing = editingBatchId === batch.batchId

                  return (
                    <Fragment key={batch.batchId}>
                      {/* ── Main data row ── */}
                      <tr className='hover:bg-muted/10 transition-colors'>
                        <td className='px-4 py-3.5 text-center text-muted-foreground font-medium'>
                          {index + 1 + batchPage * 10}
                        </td>
                        <td className='px-4 py-3.5 font-bold text-primary font-mono text-sm'>
                          {batch.batchCode}
                        </td>
                        <td className='px-4 py-3.5 font-semibold text-foreground'>
                          {batch.stockQuantity}
                        </td>
                        <td className='px-4 py-3.5 text-muted-foreground font-medium'>
                          {formatDate(batch.expiryDate)}
                        </td>
                        <td className='px-4 py-3.5'>
                          {isExpired ? (
                            <span className='text-destructive font-bold text-sm'>Đã hết hạn</span>
                          ) : isExpiringSoon ? (
                            <span className='text-destructive font-bold text-sm inline-flex items-center gap-1'>
                              <MaterialIcon name='warning' className='text-base' />
                              ▲ {daysRemaining} ngày
                            </span>
                          ) : (
                            <span className='text-foreground font-medium text-sm'>
                              {daysRemaining} ngày
                            </span>
                          )}
                        </td>
                        <td className='px-4 py-3.5'>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            batch.status === 'ACTIVE'
                              ? 'bg-success/15 text-success'
                              : batch.status === 'DELETED'
                              ? 'bg-destructive/15 text-destructive'
                              : 'bg-muted-foreground/15 text-muted-foreground'
                          }`}>
                            {batch.status}
                          </span>
                        </td>
                        <td className='px-4 py-3.5 text-center'>
                          <div className='flex items-center justify-center gap-1.5'>
                            {/* 👁️ Chi tiết — toggle audit info */}
                            <button
                              onClick={() => toggleExpandBatch(batch.batchId)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isExpanded
                                  ? 'text-primary bg-primary/10'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                              title='Chi tiết'
                            >
                              <MaterialIcon name='visibility' className='text-lg' />
                            </button>
                            {/* ✏️ Sửa — toggle inline edit */}
                            <button
                              onClick={() => isEditing ? handleCancelEdit() : handleStartEdit(batch)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isEditing
                                  ? 'text-primary bg-primary/10'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                              title='Sửa'
                            >
                              <MaterialIcon name='edit' className='text-lg' />
                            </button>
                            {/* 🗑️ Xóa — soft delete */}
                            <button
                              onClick={() => handleDeleteBatch(batch.batchId)}
                              disabled={batch.status === 'DELETED'}
                              className='p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
                              title='Xóa'
                            >
                              <MaterialIcon name='delete' className='text-lg' />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── 👁️ Audit detail expansion row ── */}
                      {isExpanded && (
                        <tr className='bg-muted/20 border-b border-border/50'>
                          <td colSpan={7} className='px-6 py-3'>
                            <div className='flex flex-wrap gap-x-8 gap-y-2 text-xs'>
                              <div className='flex items-center gap-2 text-muted-foreground'>
                                <MaterialIcon name='calendar_month' className='text-sm' />
                                <span className='font-bold uppercase tracking-wide'>Ngày tạo:</span>
                                <span className='font-semibold text-foreground'>{formatDate(batch.createdAt)}</span>
                              </div>
                              <div className='flex items-center gap-2 text-muted-foreground'>
                                <MaterialIcon name='history' className='text-sm' />
                                <span className='font-bold uppercase tracking-wide'>Cập nhật:</span>
                                <span className='font-semibold text-foreground'>{formatDate(batch.updatedAt)}</span>
                              </div>
                              <div className='flex items-center gap-2 text-muted-foreground'>
                                <MaterialIcon name='delete_outline' className='text-sm' />
                                <span className='font-bold uppercase tracking-wide'>Ngày xóa:</span>
                                <span className={`font-semibold ${batch.deletedAt ? 'text-destructive' : 'text-foreground'}`}>
                                  {batch.deletedAt ? formatDate(batch.deletedAt) : '—'}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* ── ✏️ Inline edit form row ── */}
                      {isEditing && (
                        <tr className='bg-primary/5 border-b border-border'>
                          <td colSpan={7} className='px-6 py-4'>
                            <div className='flex flex-col gap-3'>
                              <span className='text-xs font-bold text-muted-foreground uppercase tracking-wide'>Chỉnh sửa lô hàng: {batch.batchCode}</span>
                              <div className='flex flex-wrap gap-3'>
                                {/* Số lượng */}
                                <div className='flex flex-col gap-1 min-w-[140px]'>
                                  <label className='text-xs font-bold text-muted-foreground uppercase'>Tồn kho</label>
                                  <input
                                    type='number'
                                    min={0}
                                    value={editQuantity}
                                    onChange={(e) => setEditQuantity(Number(e.target.value))}
                                    disabled={isSavingEdit}
                                    className='bg-background border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all w-full disabled:opacity-50'
                                  />
                                </div>
                                {/* Ngày hết hạn */}
                                <div className='flex flex-col gap-1 min-w-[160px]'>
                                  <label className='text-xs font-bold text-muted-foreground uppercase'>Ngày hết hạn</label>
                                  <input
                                    type='date'
                                    value={editExpiryDate}
                                    onChange={(e) => setEditExpiryDate(e.target.value)}
                                    disabled={isSavingEdit}
                                    className='bg-background border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all w-full disabled:opacity-50'
                                  />
                                </div>
                                {/* Trạng thái */}
                                <div className='flex flex-col gap-1 min-w-[170px]'>
                                  <label className='text-xs font-bold text-muted-foreground uppercase'>Trạng thái</label>
                                  <div className='relative'>
                                    <select
                                      value={editStatus}
                                      onChange={(e) => setEditStatus(e.target.value as typeof editStatus)}
                                      disabled={isSavingEdit}
                                      className='w-full appearance-none bg-background border border-input rounded-lg px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50'
                                    >
                                      <option value='ACTIVE'>ACTIVE</option>
                                      <option value='INACTIVE'>INACTIVE</option>
                                      <option value='DELETED'>DELETED</option>
                                    </select>
                                    <MaterialIcon name='expand_more' className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-base' />
                                  </div>
                                </div>
                              </div>
                              {/* Error message */}
                              {editError && (
                                <div className='flex items-center gap-1.5 text-destructive text-xs font-semibold'>
                                  <MaterialIcon name='error_outline' className='text-base' />
                                  {editError}
                                </div>
                              )}
                              {/* Action buttons */}
                              <div className='flex items-center gap-2 pt-1'>
                                <button
                                  onClick={handleSaveEdit}
                                  disabled={isSavingEdit}
                                  className='flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                  {isSavingEdit
                                    ? <MaterialIcon name='hourglass_empty' className='animate-spin text-base' />
                                    : <MaterialIcon name='save' className='text-base' />
                                  }
                                  Lưu
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={isSavingEdit}
                                  className='flex items-center gap-1.5 px-4 py-1.5 bg-card hover:bg-muted text-foreground border border-border rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                  <MaterialIcon name='close' className='text-base' />
                                  Hủy
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 0 && (
            <div className='border-t border-border px-6 py-4 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm'>
              <div className='flex flex-wrap items-center gap-4 text-muted-foreground'>
                <span>Trang {batchPage + 1} của {totalPages}</span>
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
                    <MaterialIcon name='expand_more' className='absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-base' />
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-1'>
                <button
                  onClick={() => setBatchPage(Math.max(0, batchPage - 1))}
                  disabled={batchPage === 0}
                  className='p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:hover:bg-card transition-colors flex items-center justify-center'
                >
                  <MaterialIcon name='chevron_left' className='text-lg' />
                </button>
                <button
                  className='w-8 h-8 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center'
                >
                  {batchPage + 1}
                </button>
                <button
                  onClick={() => setBatchPage(Math.min(totalPages - 1, batchPage + 1))}
                  disabled={batchPage >= totalPages - 1}
                  className='p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:hover:bg-card transition-colors flex items-center justify-center'
                >
                  <MaterialIcon name='chevron_right' className='text-lg' />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
