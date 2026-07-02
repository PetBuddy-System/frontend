import { MaterialIcon } from '~/shared/ui'

interface ManagerPromotionDeleteDialogProps {
  promotionName: string | undefined
  isOpen: boolean
  isDeleting: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}

export function ManagerPromotionDeleteDialog({
  promotionName,
  isOpen,
  isDeleting,
  error,
  onClose,
  onConfirm
}: ManagerPromotionDeleteDialogProps) {
  if (!isOpen || !promotionName) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <button
        type='button'
        aria-label='Đóng'
        className='absolute inset-0 bg-foreground/45 backdrop-blur-sm'
        onClick={() => !isDeleting && onClose()}
      />

      {/* Dialog panel */}
      <div className='relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-6 flex flex-col gap-5'>
        {/* Icon + Title */}
        <div className='flex flex-col items-center gap-3 text-center'>
          <div className='flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10'>
            <MaterialIcon name='delete_forever' className='text-3xl text-destructive' />
          </div>
          <h2 className='text-lg font-bold text-foreground font-display'>Xóa chương trình khuyến mãi?</h2>
          <p className='text-sm text-muted-foreground'>
            Chương trình <span className='font-semibold text-foreground'>{promotionName}</span> sẽ bị
            chuyển sang trạng thái <span className='font-semibold text-destructive'>DELETED</span>.
            Bạn có thể khôi phục bằng cách chỉnh sửa trạng thái sau.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className='flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive'>
            <MaterialIcon name='error_outline' className='shrink-0 text-lg' />
            <span>{error}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className='flex gap-3'>
          <button
            type='button'
            disabled={isDeleting}
            onClick={onClose}
            className='flex-1 h-10 rounded-full border border-border bg-card text-sm font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-50'
          >
            Hủy
          </button>
          <button
            type='button'
            disabled={isDeleting}
            onClick={onConfirm}
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
