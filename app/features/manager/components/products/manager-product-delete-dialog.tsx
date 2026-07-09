// app/features/manager/components/products/manager-product-delete-dialog.tsx

import { useState } from 'react'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

export interface ManagerProductDeleteDialogProps {
    productName: string
    isOpen: boolean
    isDeleting: boolean
    error: string | null
    onClose: () => void
    onConfirm: (reason?: string, note?: string) => void
}

export function ManagerProductDeleteDialog({
    productName,
    isOpen,
    isDeleting,
    error,
    onClose,
    onConfirm
}: ManagerProductDeleteDialogProps) {
    const [reason, setReason] = useState('')
    const [note, setNote] = useState('')

    const handleClose = () => {
        setReason('')
        setNote('')
        onClose()
    }

    const handleConfirm = () => {
        onConfirm(reason || undefined, note || undefined)
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <button
                type='button'
                aria-label='Đóng'
                className='absolute inset-0 bg-foreground/45 backdrop-blur-sm'
                onClick={() => !isDeleting && handleClose()}
            />

            <div className='relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 flex flex-col gap-5'>
                <div className='flex flex-col items-center gap-3 text-center'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10'>
                        <MaterialIcon name='delete_forever' className='text-3xl text-destructive' />
                    </div>
                    <h2 className='text-lg font-bold text-foreground'>Xóa sản phẩm?</h2>
                    <p className='text-sm text-muted-foreground'>
                        Sản phẩm <span className='font-semibold text-foreground'>{productName}</span> sẽ bị
                        chuyển sang trạng thái <span className='font-semibold text-destructive'>DELETED</span>.
                        Bạn có thể khôi phục bằng cách chỉnh sửa trạng thái sau.
                    </p>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                        Lý do xóa
                        <span className='text-xs font-normal text-muted-foreground ml-1'>(không bắt buộc)</span>
                    </label>
                    <textarea
                        rows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder='Nhập lý do xóa sản phẩm...'
                        className={cn(
                            'w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring resize-y min-h-[60px]',
                            isDeleting && 'opacity-60 cursor-not-allowed'
                        )}
                        disabled={isDeleting}
                    />
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                        Ghi chú
                        <span className='text-xs font-normal text-muted-foreground ml-1'>(không bắt buộc)</span>
                    </label>
                    <textarea
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder='Nhập ghi chú thêm...'
                        className={cn(
                            'w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring resize-y min-h-[60px]',
                            isDeleting && 'opacity-60 cursor-not-allowed'
                        )}
                        disabled={isDeleting}
                    />
                </div>

                {error && (
                    <div className='flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive'>
                        <MaterialIcon name='error_outline' className='shrink-0 text-lg' />
                        <span>{error}</span>
                    </div>
                )}

                <div className='flex gap-3'>
                    <button
                        type='button'
                        disabled={isDeleting}
                        onClick={handleClose}
                        className='flex-1 h-10 rounded-full border border-border bg-card text-sm font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-50'
                    >
                        Hủy
                    </button>
                    <button
                        type='button'
                        disabled={isDeleting}
                        onClick={handleConfirm}
                        className='flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-full bg-destructive text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-50'
                    >
                        {isDeleting ? (
                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                        ) : (
                            <MaterialIcon name='delete' className='text-base' />
                        )}
                        Xác nhận xóa
                    </button>
                </div>
            </div>
        </div>
    )
}