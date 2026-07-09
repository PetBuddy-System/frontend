// app/features/manager/components/products/manager-batch-edit-dialog.tsx

import { useState, useEffect } from 'react'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import type { ProductBatchItem } from '~/shared/lib/batch'

export interface ManagerBatchEditDialogProps {
    batch: ProductBatchItem | null
    isOpen: boolean
    isSaving: boolean
    error: string | null
    onClose: () => void
    onConfirm: (payload: {
        stockQuantity: number
        basePrice: number | undefined
        expiryDate: string
        status: 'ACTIVE' | 'INACTIVE'
        reason?: string
        note?: string
    }) => void
}

export function ManagerBatchEditDialog({
    batch,
    isOpen,
    isSaving,
    error,
    onClose,
    onConfirm
}: ManagerBatchEditDialogProps) {
    const [stockQuantity, setStockQuantity] = useState(0)
    const [basePrice, setBasePrice] = useState<string>('')
    const [expiryDate, setExpiryDate] = useState('')
    const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE')
    const [reason, setReason] = useState('')
    const [note, setNote] = useState('')
    const [localError, setLocalError] = useState<string | null>(null)

    // Sync form khi batch thay đổi
    useEffect(() => {
        if (batch) {
            setStockQuantity(batch.stockQuantity)
            setBasePrice(batch.basePrice != null ? String(batch.basePrice) : '')
            setExpiryDate(batch.expiryDate ? batch.expiryDate.substring(0, 10) : '')
            setStatus(batch.status === 'DELETED' ? 'INACTIVE' : batch.status)
            setReason('')
            setNote('')
            setLocalError(null)
        }
    }, [batch])

    const handleClose = () => {
        if (!isSaving) onClose()
    }

    const handleConfirm = () => {
        setLocalError(null)
        if (stockQuantity < 0) {
            setLocalError('Số lượng tồn kho phải từ 0 trở lên')
            return
        }
        if (!expiryDate.trim()) {
            setLocalError('Ngày hết hạn không được để trống')
            return
        }
        if (basePrice !== '' && Number(basePrice) < 0) {
            setLocalError('Giá nhập phải là số không âm')
            return
        }

        onConfirm({
            stockQuantity,
            basePrice: basePrice !== '' ? Number(basePrice) : undefined,
            expiryDate,
            status,
            reason: reason.trim() || undefined,
            note: note.trim() || undefined
        })
    }

    if (!isOpen || !batch) return null

    const displayError = localError ?? error

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            {/* Backdrop */}
            <button
                type='button'
                aria-label='Đóng'
                className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
                onClick={handleClose}
                tabIndex={-1}
            />

            <div className='relative z-10 w-full max-w-xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden'>
                {/* Header */}
                <div className='flex items-center gap-3 border-b border-border bg-primary/5 px-6 py-4'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary'>
                        <MaterialIcon name='edit' className='text-xl' />
                    </div>
                    <div>
                        <h3 className='text-lg font-bold text-foreground'>Chỉnh sửa lô hàng</h3>
                        <p className='text-sm text-muted-foreground'>
                            Mã lô: <span className='font-semibold text-primary font-mono'>{batch.batchCode}</span>
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className='p-6 space-y-4 max-h-[70vh] overflow-y-auto'>
                    {/* Row 1: Tồn kho + Giá nhập */}
                    <div className='grid grid-cols-2 gap-3'>
                        <div className='flex flex-col gap-1.5'>
                            <label htmlFor='edit-batch-stock' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                                Tồn kho
                            </label>
                            <input
                                id='edit-batch-stock'
                                type='number'
                                min={0}
                                value={stockQuantity}
                                onChange={(e) => setStockQuantity(Number(e.target.value))}
                                disabled={isSaving}
                                className={cn(
                                    'w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all',
                                    isSaving && 'opacity-60 cursor-not-allowed'
                                )}
                            />
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <label htmlFor='edit-batch-price' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                                Giá nhập
                                <span className='text-[10px] font-normal text-muted-foreground ml-1'>(₫, không bắt buộc)</span>
                            </label>
                            <input
                                id='edit-batch-price'
                                type='number'
                                min={0}
                                step={100}
                                value={basePrice}
                                onChange={(e) => setBasePrice(e.target.value)}
                                placeholder='Nhập giá nhập...'
                                disabled={isSaving}
                                className={cn(
                                    'w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all',
                                    isSaving && 'opacity-60 cursor-not-allowed'
                                )}
                            />
                        </div>
                    </div>

                    {/* Row 2: Ngày hết hạn + Trạng thái */}
                    <div className='grid grid-cols-2 gap-3'>
                        <div className='flex flex-col gap-1.5'>
                            <label htmlFor='edit-batch-expiry' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                                Ngày hết hạn
                            </label>
                            <input
                                id='edit-batch-expiry'
                                type='date'
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                disabled={isSaving}
                                className={cn(
                                    'w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all',
                                    isSaving && 'opacity-60 cursor-not-allowed'
                                )}
                            />
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <label htmlFor='edit-batch-status' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                                Trạng thái
                            </label>
                            <div className='relative'>
                                <select
                                    id='edit-batch-status'
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                                    disabled={isSaving}
                                    className={cn(
                                        'w-full appearance-none rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all',
                                        isSaving && 'opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    <option value='ACTIVE'>ACTIVE</option>
                                    <option value='INACTIVE'>INACTIVE</option>
                                </select>
                                <MaterialIcon
                                    name='expand_more'
                                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-base'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lý do thay đổi */}
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='edit-batch-reason' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                            Lý do thay đổi
                            <span className='text-[10px] font-normal text-muted-foreground ml-1'>(không bắt buộc)</span>
                        </label>
                        <textarea
                            id='edit-batch-reason'
                            rows={2}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder='Nhập lý do thay đổi...'
                            disabled={isSaving}
                            className={cn(
                                'w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring resize-y min-h-[60px] transition-all',
                                isSaving && 'opacity-60 cursor-not-allowed'
                            )}
                        />
                    </div>

                    {/* Ghi chú */}
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor='edit-batch-note' className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                            Ghi chú
                            <span className='text-[10px] font-normal text-muted-foreground ml-1'>(không bắt buộc)</span>
                        </label>
                        <textarea
                            id='edit-batch-note'
                            rows={2}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder='Nhập ghi chú thêm...'
                            disabled={isSaving}
                            className={cn(
                                'w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring resize-y min-h-[60px] transition-all',
                                isSaving && 'opacity-60 cursor-not-allowed'
                            )}
                        />
                    </div>

                    {displayError && (
                        <div className='flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive'>
                            <MaterialIcon name='error' className='text-base shrink-0' />
                            <span>{displayError}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className='flex justify-end gap-3 border-t border-border bg-muted/40 px-6 py-4'>
                    <button
                        type='button'
                        onClick={handleClose}
                        disabled={isSaving}
                        className='h-10 px-6 rounded-full border border-border bg-card text-sm font-bold text-foreground hover:bg-muted disabled:opacity-50 transition-colors'
                    >
                        Hủy
                    </button>
                    <button
                        type='button'
                        onClick={handleConfirm}
                        disabled={isSaving}
                        className='h-10 px-6 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm'
                    >
                        {isSaving ? (
                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
                        ) : (
                            <MaterialIcon name='save' className='text-base' />
                        )}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    )
}
