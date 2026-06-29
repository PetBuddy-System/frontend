// app/features/manager/components/products/manager-product-batch-section.tsx
import { Fragment, useState, useEffect } from 'react'
import { MaterialIcon } from '~/shared/ui'
import {
    fetchProductBatchesApi,
    createBatchesApi,
    updateBatchApi,
} from '../../services/batch'
import type {
    ProductBatchItem,
    BatchSortBy,
    CreateBatchPayload
} from '~/shared/lib/batch'

interface ManagerProductBatchSectionProps {
    productId: string
    isDeleted?: boolean // ✅ Thêm prop này
    onRefresh?: () => void
}

interface NewBatchRow {
    quantity: number
    expiryDate: string
}

export function ManagerProductBatchSection({
    productId,
    isDeleted = false // ✅ Mặc định false
}: ManagerProductBatchSectionProps) {
    // ─── State ────────────────────────────────────────────
    const [batches, setBatches] = useState<ProductBatchItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [batchSearch, setBatchSearch] = useState('')
    const [batchStatus, setBatchStatus] = useState<'ACTIVE' | 'INACTIVE' | 'DELETED' | 'ALL'>('ALL')
    const [batchPage, setBatchPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [sortBy, setSortBy] = useState<BatchSortBy>('date_desc')

    // ─── New Batch Form State ─────────────────────────────
    const [newBatches, setNewBatches] = useState<NewBatchRow[]>([{ quantity: 0, expiryDate: '' }])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)

    // ─── Batch interactive operations states ───────────────
    const [expandedBatchIds, setExpandedBatchIds] = useState<string[]>([])
    const [editingBatchId, setEditingBatchId] = useState<string | null>(null)
    const [editQuantity, setEditQuantity] = useState<number>(0)
    const [editExpiryDate, setEditExpiryDate] = useState<string>('')
    const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE' | 'DELETED'>('ACTIVE')
    const [editError, setEditError] = useState<string | null>(null)
    const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false)

    // ─── Load Batches ─────────────────────────────────────
    useEffect(() => {
        async function loadBatches() {
            setIsLoading(true)
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
                }
            } catch (err) {
                console.error('Load batches error:', err)
            } finally {
                setIsLoading(false)
            }
        }
        void loadBatches()
    }, [productId, batchSearch, batchStatus, batchPage, sortBy])

    // ─── Helpers ───────────────────────────────────────────
    const getDaysRemaining = (expiryDate: string) => {
        const today = new Date()
        const expiry = new Date(expiryDate)
        const diffTime = expiry.getTime() - today.getTime()
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A'
        try {
            const d = new Date(dateStr)
            if (isNaN(d.getTime())) return 'N/A'
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        } catch {
            return 'N/A'
        }
    }

    // ─── New Batch Form Handlers ───────────────────────────
    const addBatchRow = () => setNewBatches([...newBatches, { quantity: 0, expiryDate: '' }])

    const removeBatchRow = (index: number) => setNewBatches(newBatches.filter((_, i) => i !== index))

    const updateBatchRow = (index: number, field: 'quantity' | 'expiryDate', value: string | number) => {
        const updated = [...newBatches]
        updated[index] = { ...updated[index], [field]: value }
        setNewBatches(updated)
    }

    const handleSubmitBatches = async () => {
        setSubmitError(null)
        setShowSuccess(false)

        const validBatches = newBatches.filter(b => b.quantity > 0 && b.expiryDate.trim() !== '')
        if (validBatches.length === 0) {
            setSubmitError('Vui lòng nhập ít nhất 1 lô hàng')
            return
        }

        setIsSubmitting(true)
        try {
            const payload: CreateBatchPayload[] = validBatches.map((batch) => ({
                stockQuantity: batch.quantity,
                expiryDate: batch.expiryDate
            }))
            const response = await createBatchesApi(productId, payload)
            if (response.success) {
                setNewBatches([{ quantity: 0, expiryDate: '' }])
                setShowSuccess(true)
                setTimeout(() => setShowSuccess(false), 3000)
                // Refresh list
                const refreshRes = await fetchProductBatchesApi(productId, { page: batchPage, size: 10, sortBy })
                if (refreshRes.success) {
                    setBatches(refreshRes.data.content)
                    setTotalElements(refreshRes.data.totalElements)
                }
            } else {
                setSubmitError(response.message || 'Không thể nhập lô hàng')
            }
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi nhập lô hàng')
        } finally {
            setIsSubmitting(false)
        }
    }

    // ─── Batch Actions ─────────────────────────────────────
    const toggleExpandBatch = (batchId: string) => {
        setExpandedBatchIds(prev =>
            prev.includes(batchId) ? prev.filter(id => id !== batchId) : [...prev, batchId]
        )
    }

    const handleStartEdit = (batch: ProductBatchItem) => {
        setEditingBatchId(batch.batchId)
        setEditQuantity(batch.stockQuantity)
        setEditExpiryDate(batch.expiryDate ? batch.expiryDate.substring(0, 10) : '')
        setEditStatus(batch.status)
        setEditError(null)
    }

    const handleCancelEdit = () => {
        setEditingBatchId(null)
        setEditError(null)
    }

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
                // Refresh
                const refreshRes = await fetchProductBatchesApi(productId, {
                    keyword: batchSearch || undefined,
                    status: batchStatus !== 'ALL' ? batchStatus : undefined,
                    page: batchPage,
                    size: 10,
                    sortBy
                })
                if (refreshRes.success) setBatches(refreshRes.data.content)
            } else {
                setEditError(response.message || 'Không thể cập nhật lô hàng')
            }
        } catch (err) {
            setEditError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật lô hàng')
        } finally {
            setIsSavingEdit(false)
        }
    }

    const handleDeleteBatch = async (batchId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa lô hàng này?')) return
        try {
            const response = await updateBatchApi(batchId, { status: 'DELETED' })
            if (response.success) {
                // Refresh
                const refreshRes = await fetchProductBatchesApi(productId, {
                    keyword: batchSearch || undefined,
                    status: batchStatus !== 'ALL' ? batchStatus : undefined,
                    page: batchPage,
                    size: 10,
                    sortBy
                })
                if (refreshRes.success) {
                    setBatches(refreshRes.data.content)
                    setTotalElements(refreshRes.data.totalElements)
                }
            } else {
                alert(response.message || 'Không thể xóa lô hàng')
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa lô hàng')
        }
    }

    return (
        <div className='bg-card rounded-2xl border border-border overflow-hidden shadow-sm'>
            {/* Card Header */}
            <div className='border-b border-border bg-card px-6 py-4 flex items-center gap-2.5'>
                <MaterialIcon name='inventory_2' className='text-primary text-xl' />
                <span className='font-bold text-foreground font-display text-sm tracking-wide uppercase'>Lô hàng sản phẩm</span>
            </div>

            <div className='p-6 flex flex-col gap-8'>
                {/* ✅ Sub-section 1: Nhập nhiều lô hàng - ẨN KHI ĐÃ XÓA */}
                {!isDeleted && (
                    <>
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                                <h4 className='font-bold text-base text-foreground'>Nhập nhiều lô hàng</h4>
                                <div className='flex items-center gap-3'>
                                    <button
                                        onClick={addBatchRow}
                                        disabled={isSubmitting}
                                        className='px-4 py-2 bg-card hover:bg-muted text-primary border border-border rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        <MaterialIcon name='add' className='text-lg' />
                                        Thêm dòng
                                    </button>
                                    <button
                                        onClick={handleSubmitBatches}
                                        disabled={isSubmitting}
                                        className='px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {isSubmitting ? (
                                            <MaterialIcon name='hourglass_empty' className='animate-spin text-lg' />
                                        ) : (
                                            <MaterialIcon name='check_circle' className='text-lg' />
                                        )}
                                        Xác nhận nhập lô
                                    </button>
                                </div>
                            </div>

                            {/* Intake Table */}
                            <div className='border border-border rounded-xl overflow-hidden bg-card'>
                                <table className='w-full text-sm border-collapse'>
                                    <thead>
                                        <tr className='bg-muted/40 border-b border-border'>
                                            <th className='w-16 px-4 py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider'>STT</th>
                                            <th className='px-4 py-2.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider'>Số lượng</th>
                                            <th className='px-4 py-2.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider'>Ngày hết hạn</th>
                                            <th className='w-20 px-4 py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider'>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-border'>
                                        {newBatches.map((batch, index) => (
                                            <tr key={index} className='hover:bg-muted/10'>
                                                <td className='px-4 py-3 text-center font-medium text-muted-foreground'>{index + 1}</td>
                                                <td className='px-4 py-3'>
                                                    <input
                                                        type='number'
                                                        value={batch.quantity || ''}
                                                        onChange={(e) => updateBatchRow(index, 'quantity', Number(e.target.value))}
                                                        className='w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
                                                        placeholder='0'
                                                        disabled={isSubmitting}
                                                    />
                                                </td>
                                                <td className='px-4 py-3'>
                                                    <input
                                                        type='date'
                                                        value={batch.expiryDate}
                                                        onChange={(e) => updateBatchRow(index, 'expiryDate', e.target.value)}
                                                        className='w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
                                                        disabled={isSubmitting}
                                                    />
                                                </td>
                                                <td className='px-4 py-3 text-center'>
                                                    <button
                                                        onClick={() => removeBatchRow(index)}
                                                        disabled={newBatches.length === 1 || isSubmitting}
                                                        className='p-1.5 text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors'
                                                    >
                                                        <MaterialIcon name='delete_outline' className='text-lg' />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Error & Success Messages */}
                            {submitError && (
                                <div className='mt-2 flex items-center gap-2 text-destructive text-sm font-semibold bg-destructive/10 p-3 rounded-lg'>
                                    <MaterialIcon name='error_outline' className='text-lg shrink-0' />
                                    <span>{submitError}</span>
                                </div>
                            )}
                            {showSuccess && (
                                <div className='mt-2 flex items-center gap-2 text-success text-sm font-semibold bg-success/10 p-3 rounded-lg'>
                                    <MaterialIcon name='check_circle_outline' className='text-lg shrink-0' />
                                    <span>Nhập lô hàng thành công!</span>
                                </div>
                            )}
                        </div>

                        <hr className='border-border' />
                    </>
                )}

                {/* Sub-section 2: Danh sách lô hàng - Luôn hiển thị */}
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
                                onChange={(e) => setBatchSearch(e.target.value)}
                                className='w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
                            />
                        </div>

                        {/* Status Dropdown */}
                        <div className='relative min-w-[180px]'>
                            <select
                                value={batchStatus}
                                onChange={(e) => setBatchStatus(e.target.value as typeof batchStatus)}
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
                                onChange={(e) => setSortBy(e.target.value as BatchSortBy)}
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
                            onClick={() => { setBatchSearch(''); setBatchStatus('ALL'); setSortBy('date_desc') }}
                            className='p-1.5 bg-card hover:bg-muted border border-border text-foreground rounded-lg transition-colors flex items-center justify-center'
                            title='Làm mới'
                        >
                            <MaterialIcon name='refresh' className='text-lg' />
                        </button>
                    </div>

                    {/* Batch Table */}
                    {isLoading ? (
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
                                                <Fragment key={`batch-${batch.batchId}`}>
                                                    {/* Main data row */}
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
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${batch.status === 'ACTIVE'
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
                                                                {/* ✅ Nút View - Luôn hiển thị */}
                                                                <button
                                                                    onClick={() => toggleExpandBatch(batch.batchId)}
                                                                    className={`p-1.5 rounded-lg transition-colors ${isExpanded
                                                                        ? 'text-primary bg-primary/10'
                                                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                                                        }`}
                                                                    title='Chi tiết'
                                                                >
                                                                    <MaterialIcon name='visibility' className='text-lg' />
                                                                </button>

                                                                {/* ✅ Chỉ hiển thị Edit và Delete nếu chưa bị xóa */}
                                                                {!isDeleted && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => isEditing ? handleCancelEdit() : handleStartEdit(batch)}
                                                                            className={`p-1.5 rounded-lg transition-colors ${isEditing
                                                                                ? 'text-primary bg-primary/10'
                                                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                                                                }`}
                                                                            title='Sửa'
                                                                        >
                                                                            <MaterialIcon name='edit' className='text-lg' />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteBatch(batch.batchId)}
                                                                            disabled={batch.status === 'DELETED'}
                                                                            className='p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
                                                                            title='Xóa'
                                                                        >
                                                                            <MaterialIcon name='delete' className='text-lg' />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Audit detail expansion row */}
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

                                                    {/* Inline edit form row - Chỉ hiển thị khi chưa xóa */}
                                                    {isEditing && !isDeleted && (
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
                                                                                value={editQuantity}
                                                                                onChange={(e) => setEditQuantity(Number(e.target.value))}
                                                                                className='rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                                                            />
                                                                        </div>
                                                                        {/* Ngày hết hạn */}
                                                                        <div className='flex flex-col gap-1 min-w-[160px]'>
                                                                            <label className='text-xs font-bold text-muted-foreground uppercase'>Ngày hết hạn</label>
                                                                            <input
                                                                                type='date'
                                                                                value={editExpiryDate}
                                                                                onChange={(e) => setEditExpiryDate(e.target.value)}
                                                                                className='rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                                                            />
                                                                        </div>
                                                                        {/* Trạng thái */}
                                                                        <div className='flex flex-col gap-1 min-w-[140px]'>
                                                                            <label className='text-xs font-bold text-muted-foreground uppercase'>Trạng thái</label>
                                                                            <select
                                                                                value={editStatus}
                                                                                onChange={(e) => setEditStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'DELETED')}
                                                                                className='rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                                                                            >
                                                                                <option value='ACTIVE'>ACTIVE</option>
                                                                                <option value='INACTIVE'>INACTIVE</option>
                                                                                <option value='DELETED'>DELETED</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>

                                                                    {/* Edit Error */}
                                                                    {editError && (
                                                                        <div className='flex items-center gap-2 text-destructive text-xs font-semibold'>
                                                                            <MaterialIcon name='error_outline' className='text-base' />
                                                                            <span>{editError}</span>
                                                                        </div>
                                                                    )}

                                                                    {/* Edit Actions */}
                                                                    <div className='flex gap-2'>
                                                                        <button
                                                                            onClick={handleCancelEdit}
                                                                            disabled={isSavingEdit}
                                                                            className='px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-semibold transition-colors disabled:opacity-50'
                                                                        >
                                                                            Hủy
                                                                        </button>
                                                                        <button
                                                                            onClick={handleSaveEdit}
                                                                            disabled={isSavingEdit}
                                                                            className='px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1'
                                                                        >
                                                                            {isSavingEdit ? (
                                                                                <MaterialIcon name='sync' className='animate-spin text-base' />
                                                                            ) : (
                                                                                <MaterialIcon name='check' className='text-base' />
                                                                            )}
                                                                            Lưu
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
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className='flex items-center justify-center gap-2 pt-4'>
                            <button
                                onClick={() => setBatchPage(p => Math.max(0, p - 1))}
                                disabled={batchPage === 0}
                                className='p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                            >
                                <MaterialIcon name='chevron_left' className='text-lg' />
                            </button>
                            <span className='text-sm text-muted-foreground font-medium px-3'>
                                Trang {batchPage + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setBatchPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={batchPage >= totalPages - 1}
                                className='p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                            >
                                <MaterialIcon name='chevron_right' className='text-lg' />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}   