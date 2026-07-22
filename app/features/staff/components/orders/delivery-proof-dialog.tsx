// app/features/staff/components/orders/delivery-proof-dialog.tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import { updateOrderStatusApi } from '../../services/order'

interface DeliveryProofDialogProps {
  orderId: number
  orderCode: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeliveryProofDialog({ orderId, orderCode, isOpen, onClose, onSuccess }: DeliveryProofDialogProps) {
  const { t } = useTranslation('profile')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError(t('orderDetail.uploadProofTypeError', 'Vui lòng chọn file hình ảnh.'))
        return
      }
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setError(null)
    }
  }

  const handleConfirm = async () => {
    if (!file) {
      setError(t('orderDetail.uploadProofError', 'Vui lòng chọn ảnh chụp bằng chứng giao hàng.'))
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await updateOrderStatusApi(orderId, 'DELIVERED', file)
      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.message || t('orderDetail.unexpectedError', 'Cập nhật trạng thái thất bại'))
      }
    } catch (err: any) {
      setError(err?.message || t('orderDetail.unexpectedError', 'Có lỗi xảy ra khi xác nhận giao hàng.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in'>
      <div className='bg-card rounded-2xl w-full max-w-md overflow-hidden border border-border shadow-xl flex flex-col scale-in'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <MaterialIcon name='photo_camera' className='text-[22px]' />
            </div>
            <div>
              <h3 className='font-bold text-foreground'>
                {t('orderDetail.deliveryProofTitle', 'Xác nhận đã giao hàng')}
              </h3>
              <p className='text-xs text-muted-foreground'>Đơn #{orderCode}</p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors'
          >
            <MaterialIcon name='close' className='text-[20px]' />
          </button>
        </div>

        {/* Body */}
        <div className='p-6 space-y-4'>
          <p className='text-sm text-muted-foreground leading-relaxed font-medium'>
            {t(
              'orderDetail.deliveryProofDesc',
              'Vui lòng chụp và tải lên hình ảnh xác nhận đã giao hàng thành công để hoàn tất đơn hàng.'
            )}
          </p>

          <div className='relative flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 hover:border-primary/50 transition-colors bg-muted/10 min-h-[160px]'>
            {previewUrl ? (
              <div className='relative w-full max-h-48 rounded-lg overflow-hidden border border-border'>
                <img src={previewUrl} alt='Preview proof' className='w-full h-full object-cover' />
                <button
                  type='button'
                  onClick={() => {
                    setFile(null)
                    setPreviewUrl(null)
                  }}
                  className='absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors shadow-md'
                >
                  <MaterialIcon name='delete' className='text-sm' />
                </button>
              </div>
            ) : (
              <label className='flex flex-col items-center justify-center cursor-pointer w-full py-4 text-center'>
                <MaterialIcon name='cloud_upload' className='text-4xl text-primary mb-2' />
                <span className='text-sm font-semibold text-foreground'>
                  {t('orderDetail.uploadProof', 'Tải ảnh lên')}
                </span>
                <span className='text-xs text-muted-foreground mt-1'>
                  {t('orderDetail.uploadProofNote', 'PNG, JPG hoặc JPEG')}
                </span>
                <input type='file' accept='image/*' onChange={handleFileChange} className='hidden' />
              </label>
            )}
          </div>

          {error && (
            <p className='text-xs font-semibold text-destructive flex items-center gap-1.5'>
              <MaterialIcon name='error' className='text-[16px]' />
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-2 border-t border-border px-6 py-4 bg-muted/10'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-sm font-semibold border border-border rounded-xl hover:bg-muted text-foreground transition-colors'
          >
            {t('orderDetail.cancel', 'Hủy')}
          </button>
          <button
            type='button'
            onClick={handleConfirm}
            disabled={!file || isSubmitting}
            className='flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:opacity-95 transition-opacity disabled:opacity-50'
          >
            {isSubmitting ? (
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
            ) : (
              <>
                <MaterialIcon name='check' className='text-[18px]' />
                {t('orderDetail.confirm', 'Xác nhận đã giao')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
