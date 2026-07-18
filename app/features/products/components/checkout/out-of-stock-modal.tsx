import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'

export interface OutOfStockModalProps {
  productName: string
  onClose: () => void
}

export function OutOfStockModal({ productName, onClose }: OutOfStockModalProps) {
  const { t } = useTranslation('products')
  const [progress, setProgress] = useState(100)
  
  useEffect(() => {
    const total = 5000
    const interval = 50
    const step = (interval / total) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step
        if (next <= 0) {
          clearInterval(timer)
          onClose()
          return 0
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [onClose])

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200'
      onClick={onClose}
    >
      <div
        className='relative w-full max-w-sm overflow-hidden rounded-2xl bg-card border border-border shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='absolute top-0 left-0 h-1 bg-destructive/20 w-full'>
          <div
            className='h-full bg-destructive transition-all duration-50 ease-linear'
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className='p-6 pt-7'>
          <div className='flex items-center justify-center mb-4'>
            <div className='w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center'>
              <MaterialIcon name='inventory_2' className='text-[36px] text-destructive' />
            </div>
          </div>
          <h3 className='text-center font-display text-lg font-bold text-foreground mb-2'>
            {t('outOfStockModal.title', 'Sản phẩm đã hết hàng')}
          </h3>
          <div className='mx-auto mb-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5'>
            <MaterialIcon name='remove_shopping_cart' className='shrink-0 text-[18px] text-destructive' />
            <p className='text-sm font-semibold text-destructive line-clamp-2 text-center flex-1'>
              {productName}
            </p>
          </div>

          <p className='text-center text-xs text-muted-foreground mb-5 leading-relaxed whitespace-pre-line'>
            {t('outOfStockModal.description', 'Rất tiếc! Sản phẩm này vừa được người khác mua hết. Sản phẩm đã được tự động xóa khỏi giỏ hàng của bạn.')}
          </p>

          <button
            onClick={onClose}
            className='w-full rounded-xl bg-destructive py-3 font-semibold text-destructive-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]'
          >
            {t('outOfStockModal.gotIt', 'Đã hiểu')}
          </button>
        </div>
      </div>
    </div>
  )
}
