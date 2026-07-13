// app/features/manager/components/restock/restock-detail-dialog.tsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import {
    restockApi,
    type RestockInfoResponse,
    type RestockRequest
} from '../../services/restock/restock-api'

interface RestockDetailDialogProps {
    returnRequestId: number
    onClose: () => void
    onSuccess: () => void
}

function formatPrice(value: number) {
    if (value == null || isNaN(Number(value))) return '—'
    return `${new Intl.NumberFormat('vi-VN').format(Number(value))}đ`
}

function formatDate(dateString?: string | null) {
    if (!dateString) return '—'
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${min} ${dd}/${mm}/${yyyy}`
}

export function RestockDetailDialog({
    returnRequestId,
    onClose,
    onSuccess
}: RestockDetailDialogProps) {
    console.log('🔍 RestockDetailDialog mounted with returnRequestId:', returnRequestId)

    const { t } = useTranslation('manager')
    const [data, setData] = useState<RestockInfoResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [batchQuantities, setBatchQuantities] = useState<Record<string, number>>({})

    // ✅ State cho popup xác nhận
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    useEffect(() => {
        async function loadData() {
            setIsLoading(true)
            setError(null)
            try {
                const res = await restockApi.getRestockInfo(returnRequestId)

                if (res && res.returnRequestId) {
                    setData(res)
                    const initialQuantities: Record<string, number> = {}
                    res.items.forEach(item => {
                        item.batches.forEach(batch => {
                            initialQuantities[batch.batchId] = batch.availableToRestock
                        })
                    })
                    setBatchQuantities(initialQuantities)
                } else {
                    setError('Không thể tải thông tin nhập hàng')
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi hệ thống')
            } finally {
                setIsLoading(false)
            }
        }

        if (returnRequestId) {
            void loadData()
        }
    }, [returnRequestId])

    const handleQuantityChange = (batchId: string, value: number) => {
        setBatchQuantities(prev => ({
            ...prev,
            [batchId]: Math.max(0, value)
        }))
    }

    // ✅ Hàm mở popup xác nhận
    const handleOpenConfirm = () => {
        setShowConfirmDialog(true)
    }

    // ✅ Hàm đóng popup xác nhận
    const handleCloseConfirm = () => {
        setShowConfirmDialog(false)
    }

    // ✅ Hàm xác nhận nhập kho
    async function handleConfirmRestock() {
        setShowConfirmDialog(false)
        if (!data) return

        setIsSubmitting(true)
        setError(null)

        try {
            const requestBody: RestockRequest = {
                items: data.items.map(item => ({
                    orderDetailId: item.orderDetailId,
                    batches: item.batches.map(batch => ({
                        batchId: batch.batchId,
                        restockQuantity: batchQuantities[batch.batchId] || 0
                    }))
                }))
            }

            console.log('📦 Restock request body:', requestBody)

            const res = await restockApi.restock(returnRequestId, requestBody)
            console.log('📦 Restock response:', res)

            if (res === null || res === undefined ||
                (typeof res === 'object' && Object.keys(res).length === 0) ||
                res?.success === true ||
                res?.code === 1000) {
                console.log('✅ Nhập kho thành công!')
                onSuccess()
            } else {
                setError(res?.message || 'Nhập hàng thất bại')
            }
        } catch (err) {
            console.error('❌ Restock error:', err)
            setError(err instanceof Error ? err.message : 'Lỗi hệ thống')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Tính tổng số lượng cần nhập
    const totalQuantity = data?.items.reduce((sum, item) => {
        return sum + item.batches.reduce((batchSum, batch) => {
            return batchSum + (batchQuantities[batch.batchId] || 0)
        }, 0)
    }, 0) || 0

    if (isLoading) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
                <div className='flex h-full max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-2xl'>
                    <div className='flex items-center justify-between border-b border-border px-6 py-4'>
                        <h3 className='font-display text-lg font-bold text-card-foreground'>
                            Nhập hàng trả về
                        </h3>
                        <button
                            type='button'
                            onClick={onClose}
                            className='rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors'
                        >
                            <MaterialIcon name='close' className='text-xl' />
                        </button>
                    </div>
                    <div className='flex-1 p-12 text-center text-muted-foreground animate-pulse'>
                        Đang tải thông tin...
                    </div>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
                <div className='flex h-full max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-2xl'>
                    <div className='flex items-center justify-between border-b border-border px-6 py-4'>
                        <h3 className='font-display text-lg font-bold text-card-foreground'>
                            Nhập hàng trả về
                        </h3>
                        <button
                            type='button'
                            onClick={onClose}
                            className='rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors'
                        >
                            <MaterialIcon name='close' className='text-xl' />
                        </button>
                    </div>
                    <div className='flex-1 p-12 text-center text-destructive'>
                        <MaterialIcon name='error' className='text-4xl mb-4' />
                        <p>{error || 'Không tìm thấy thông tin'}</p>
                        <button
                            type='button'
                            onClick={onClose}
                            className='mt-4 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-muted transition-colors'
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
            <div className='flex h-full max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200'>
                {/* Header */}
                <div className='flex items-center justify-between border-b border-border px-6 py-4'>
                    <div className='flex items-center gap-3'>
                        <span className='rounded-lg bg-primary/10 p-2 text-primary'>
                            <MaterialIcon name='inventory_2' className='text-xl' />
                        </span>
                        <div>
                            <h3 className='font-display text-lg font-bold text-card-foreground'>
                                Nhập hàng trả về
                            </h3>
                            <p className='text-xs text-muted-foreground'>
                                Mã yêu cầu: #{data.returnCode}
                            </p>
                        </div>
                    </div>
                    <button
                        type='button'
                        onClick={onClose}
                        className='rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                    >
                        <MaterialIcon name='close' className='text-xl' />
                    </button>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto p-6 space-y-6'>
                    {error && (
                        <div className='rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive flex items-center gap-2'>
                            <MaterialIcon name='error' className='text-lg' />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* ⚠️ Cảnh báo chỉ nhập kho 1 lần */}
                    <div className='rounded-xl bg-amber-50 border border-amber-200 p-4 dark:bg-amber-950/20 dark:border-amber-800/50'>
                        <div className='flex items-start gap-3'>
                            <MaterialIcon name='warning' className='text-amber-600 dark:text-amber-400 text-xl shrink-0 mt-0.5' />
                            <div>
                                <p className='text-sm font-semibold text-amber-800 dark:text-amber-300'>
                                    Lưu ý quan trọng
                                </p>
                                <p className='text-sm text-amber-700 dark:text-amber-400/80'>
                                    <strong>Chỉ được nhập kho một lần duy nhất.</strong> Sau khi xác nhận,
                                    bạn sẽ không thể hoàn tác hoặc nhập kho lại lần nữa.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items List với Batch */}
                    <div className='space-y-4'>
                        <h4 className='text-sm font-bold text-card-foreground border-b border-border pb-1.5'>
                            Sản phẩm cần nhập kho
                        </h4>

                        {data.items.map((item) => (
                            <div key={item.orderDetailId} className='rounded-xl border border-border bg-card overflow-hidden'>
                                {/* Product Info */}
                                <div className='flex items-center gap-4 p-4 bg-muted/10 border-b border-border'>
                                    {item.productImage && (
                                        <img
                                            src={item.productImage}
                                            alt={item.productName}
                                            className='h-14 w-14 rounded-lg object-cover border border-border shrink-0'
                                        />
                                    )}
                                    <div>
                                        <p className='font-semibold text-card-foreground'>{item.productName}</p>
                                        <p className='text-xs text-muted-foreground'>
                                            ID: #{item.orderDetailId} | Yêu cầu: {item.requestedQuantity}
                                        </p>
                                    </div>
                                </div>

                                {/* Batches */}
                                <div className='p-4 space-y-3'>
                                    <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                                        Lô hàng hiện có:
                                    </p>
                                    {item.batches.length === 0 ? (
                                        <div className='p-4 text-center text-muted-foreground border border-dashed border-border rounded-lg'>
                                            <MaterialIcon name='inbox' className='text-3xl mx-auto mb-2 opacity-50' />
                                            <p className='text-sm font-medium'>Không có lô hàng nào</p>
                                            <p className='text-xs mt-1'>Sản phẩm này chưa có lô hàng trong kho.</p>
                                        </div>
                                    ) : (
                                        item.batches.map((batch) => (
                                            <div
                                                key={batch.batchId}
                                                className='flex items-center gap-4 p-3 rounded-lg border border-border/60 bg-muted/5'
                                            >
                                                <div className='flex-1 min-w-0'>
                                                    <p className='text-sm font-medium text-foreground'>{batch.batchCode}</p>
                                                    <div className='flex gap-4 text-xs text-muted-foreground'>
                                                        <span>Có sẵn: <strong className='text-foreground'>{batch.availableToRestock}</strong></span>
                                                        <span>Đã trừ: {batch.deductedQuantity}</span>
                                                    </div>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <label className='text-xs text-muted-foreground whitespace-nowrap'>Nhập:</label>
                                                    <input
                                                        type='number'
                                                        min={0}
                                                        max={batch.availableToRestock}
                                                        value={batchQuantities[batch.batchId] || 0}
                                                        onChange={(e) => handleQuantityChange(batch.batchId, Number(e.target.value))}
                                                        className='w-20 rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground text-center focus:ring-1 focus:ring-primary outline-none'
                                                    />
                                                    <span className='text-xs text-muted-foreground'>/ {batch.availableToRestock}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className='rounded-xl border border-border bg-primary/5 p-4 space-y-1.5'>
                        <div className='flex justify-between items-center'>
                            <span className='text-sm text-muted-foreground'>Tổng số sản phẩm sẽ nhập kho:</span>
                            <span className='text-lg font-extrabold text-primary'>{totalQuantity}</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-sm text-muted-foreground'>Mã yêu cầu:</span>
                            <span className='text-sm font-semibold'>#{data.returnCode}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-muted/10'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-card-foreground hover:bg-muted transition-colors active:scale-95'
                    >
                        Hủy
                    </button>
                    <button
                        type='button'
                        onClick={handleOpenConfirm}
                        disabled={isSubmitting || totalQuantity === 0}
                        className='inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all'
                    >
                        {isSubmitting ? (
                            <>
                                <span className='animate-spin'>⏳</span>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <MaterialIcon name='check_circle' className='text-lg' />
                                Xác nhận nhập kho ({totalQuantity})
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ✅ Popup xác nhận */}
            {showConfirmDialog && (
                <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
                    <div className='w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150'>
                        {/* Icon cảnh báo */}
                        <div className='flex justify-center mb-4'>
                            <div className='rounded-full bg-amber-100 p-3 dark:bg-amber-900/30'>
                                <MaterialIcon name='warning' className='text-4xl text-amber-600 dark:text-amber-400' />
                            </div>
                        </div>

                        <h3 className='text-center font-display text-xl font-bold text-card-foreground mb-2'>
                            Xác nhận nhập kho
                        </h3>

                        <p className='text-center text-sm text-muted-foreground mb-2'>
                            Bạn có chắc chắn muốn nhập kho <strong>{totalQuantity}</strong> sản phẩm?
                        </p>

                        <div className='rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4 dark:bg-amber-950/20 dark:border-amber-800/50'>
                            <p className='text-sm text-amber-800 dark:text-amber-300 font-medium text-center'>
                                ⚠️ Hành động này chỉ được thực hiện <strong>MỘT LẦN DUY NHẤT</strong>
                            </p>
                            <p className='text-xs text-amber-700 dark:text-amber-400/80 text-center mt-1'>
                                Sau khi xác nhận, bạn sẽ không thể hoàn tác hoặc nhập kho lại.
                            </p>
                        </div>

                        <div className='flex items-center justify-end gap-3 mt-4'>
                            <button
                                type='button'
                                onClick={handleCloseConfirm}
                                className='rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-card-foreground hover:bg-muted transition-colors active:scale-95'
                            >
                                Quay lại
                            </button>
                            <button
                                type='button'
                                onClick={handleConfirmRestock}
                                disabled={isSubmitting}
                                className='inline-flex items-center gap-2 rounded-xl bg-destructive px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all'
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className='animate-spin'>⏳</span>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <MaterialIcon name='check_circle' className='text-lg' />
                                        Xác nhận nhập kho
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}