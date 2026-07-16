// app/features/manager/components/products/manager-batch-delete-dialog.tsx

import { useState } from 'react'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'

export interface ManagerBatchDeleteDialogProps {
  batchCode: string
  isOpen: boolean
  isDeleting: boolean
  error: string | null
  onClose: () => void
  onConfirm: (reason?: string, note?: string) => void
}

export function ManagerBatchDeleteDialog({
  batchCode,
  isOpen,
  isDeleting,
  error,
  onClose,
  onConfirm
}: ManagerBatchDeleteDialogProps) {
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
      <div className='absolute inset-0 bg-foreground/45 backdrop-blur-sm' onClick={handleClose} />

      <div className='relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center gap-3 border-b border-border bg-destructive/5 px-6 py-4'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive'>
            <MaterialIcon name='delete' className='text-xl' />
          </div>
          <div>
            <h3 className='text-lg font-bold text-foreground'>Xóa lô hàng</h3>
            <p className='text-sm text-muted-foreground'>
              Bạn có chắc chắn muốn xóa lô hàng <span className='font-semibold'>{batchCode}</span>?
            </p>
          </div>
        </div>

        {/* Body */}
        <div className='p-6 space-y-4'>
          {/* Cảnh báo */}
          <div className='rounded-xl bg-warning/10 border border-warning/20 p-4'>
            <div className='flex items-start gap-3'>
              <MaterialIcon name='warning' className='text-warning text-xl shrink-0 mt-0.5' />
              <div>
                <p className='text-sm font-semibold text-warning'>
                  Lô hàng sẽ bị chuyển sang trạng thái <span className='font-bold'>Đã xóa</span>.
                </p>
                <p className='text-xs text-muted-foreground mt-1'>
                  Bạn có thể khôi phục bằng cách chỉnh sửa trạng thái sau.
                </p>
              </div>
            </div>
          </div>

          {/* Lý do xóa */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
              Lý do xóa
              <span className='text-xs font-normal text-muted-foreground ml-1'>(không bắt buộc)</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='Nhập lý do xóa lô hàng...'
              className={cn(
                'w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring resize-y min-h-[60px]',
                isDeleting && 'opacity-60 cursor-not-allowed'
              )}
              disabled={isDeleting}
            />
          </div>

          {/* Ghi chú */}
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
            <div className='flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>
              <MaterialIcon name='error' className='text-base' />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-3 border-t border-border bg-muted/40 px-6 py-4'>
          <button
            type='button'
            onClick={handleClose}
            disabled={isDeleting}
            className='h-10 px-6 rounded-full border border-border bg-card text-sm font-bold hover:bg-muted disabled:opacity-50'
          >
            Hủy
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            disabled={isDeleting}
            className='h-10 px-6 rounded-full bg-destructive text-sm font-bold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 flex items-center gap-2'
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
