import { MaterialIcon } from '~/shared/ui'

export interface AdjustedQuantityModalProps {
  productName: string
  newQuantity: number
  onConfirm: () => void
  onDecline: () => void
}
export function AdjustedQuantityModal({
  productName,
  newQuantity,
  onConfirm,
  onDecline,
}: AdjustedQuantityModalProps) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300'>
      <div
        className='relative w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl animate-in zoom-in-95 duration-300'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='p-8 md:p-12 text-center'>
          <div className='flex justify-center mb-6'>
            <div className='w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center'>
              <MaterialIcon name='shopping_cart' className='text-[32px] text-primary' />
            </div>
          </div>

          <h2 className='text-2xl font-bold text-slate-900 mb-4'>
            Số lượng đã thay đổi
          </h2>

          <div className='bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 flex items-center justify-center gap-3'>
            <MaterialIcon name='inventory_2' className='text-[20px] text-amber-500' />
            <span className='text-indigo-900 font-semibold text-lg line-clamp-2'>
              {productName}
            </span>
          </div>

          <div className='text-slate-600 space-y-2 mb-10'>
            <p className='text-lg'>
              Sản phẩm{' '}
              <span className='font-semibold text-indigo-900'>{productName}</span>{' '}
              hiện chỉ còn{' '}
              <span className='font-bold text-amber-600 text-xl'>{newQuantity}</span>{' '}
              sản phẩm trong kho.
            </p>
            <p className='text-sm'>
              Số lượng trong giỏ hàng đã được cập nhật. Bạn có muốn tiếp tục mua sản phẩm này không?
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <button
              type='button'
              onClick={onDecline}
              className='w-full sm:w-48 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors'
            >
              Từ chối
            </button>
            <button
              type='button'
              onClick={onConfirm}
              className='w-full sm:w-48 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-indigo-800 shadow-lg shadow-indigo-200 transition-all active:scale-95'
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}