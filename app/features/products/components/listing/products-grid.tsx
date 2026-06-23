import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { addToCartApi } from '../../services/cart'
import { MaterialIcon } from '~/shared/ui'
import type { ProductResponse } from '~/shared/lib/product'

export interface ProductsGridProps {
  products: ProductResponse[]
  isLoading?: boolean
}

export function ProductsGrid({ products, isLoading = false }: ProductsGridProps) {
  const { t } = useTranslation('products')
  const [addingMap, setAddingMap] = useState<Record<string, boolean>>({})
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ'
  }

  const handleAddToCart = async (productId: string) => {
    if (addingMap[productId]) return
    setAddingMap((prev) => ({ ...prev, [productId]: true }))
    setError(null)
    setShowSuccessToast(false)

    try {
      await addToCartApi({ productId, quantity: 1 })
      setShowSuccessToast(true)
      // Tự động ẩn toast sau 3 giây
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi thêm vào giỏ hàng')
      setTimeout(() => setError(null), 3000)
    } finally {
      setAddingMap((prev) => ({ ...prev, [productId]: false }))
    }
  }

  if (isLoading) {
    return (
      <div className='grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className='flex flex-col rounded-2xl border border-border/60 bg-card p-4 shadow-sm animate-pulse'>
            <div className='aspect-square w-full rounded-xl bg-muted' />
            <div className='mt-4 h-4 w-2/3 bg-muted rounded' />
            <div className='mt-2 h-4 w-full bg-muted rounded animate-pulse' />
            <div className='mt-auto pt-3 flex justify-between items-center'>
              <div className='h-6 w-1/3 bg-muted rounded' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center bg-card rounded-2xl border border-border/60 p-6'>
        <MaterialIcon name='sentiment_dissatisfied' className='text-5xl text-muted-foreground' />
        <p className='mt-4 text-lg font-semibold text-foreground font-display'>
          {t('noProducts', 'Không tìm thấy sản phẩm nào')}
        </p>
        <p className='text-sm text-muted-foreground mt-1'>
          {t('noProductsDesc', 'Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm')}
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 relative'>
      {products.map((product) => (
        <article
          key={product.productId}
          className='group flex flex-col rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-lg'
        >
          <div className='relative w-full overflow-hidden bg-muted pt-[100%]'>
            <img
              src={product.imageUrls?.[0] || product.thumbnail || 'https://placehold.co/300'}
              alt={product.name}
              className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
            />
          </div>
          <div className='flex flex-1 flex-col p-4'>
            <span className='text-xs uppercase tracking-wider text-muted-foreground font-semibold'>
              {product.brandName}
            </span>
            <h3 className='mt-1 line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary md:text-base'>
              {product.name}
            </h3>
            <div className='mt-auto flex items-end justify-between pt-3'>
              <span className='text-base font-bold text-primary font-display'>{formatPrice(product.price)}</span>
            </div>
            <button
              type='button'
              disabled={addingMap[product.productId]}
              onClick={() => handleAddToCart(product.productId)}
              className='mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:opacity-90 disabled:opacity-50'
            >
              {addingMap[product.productId] ? (
                <MaterialIcon name='progress_activity' className='text-[18px] animate-spin' />
              ) : (
                <MaterialIcon name='add_shopping_cart' className='text-[18px]' />
              )}
              {t('actions.addToCart')}
            </button>
            <Link
              to={`/products/${product.productId}`}
              className='mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary'
            >
              <MaterialIcon name='info' className='text-[18px]' />
              {t('actions.viewDetails')}
            </Link>
          </div>
        </article>
      ))}

      {/* Floating success toast */}
      {showSuccessToast && (
        <div className='fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-success px-4 py-3 text-success-foreground shadow-lg animate-in fade-in slide-in-from-bottom-4'>
          <MaterialIcon name='check_circle' className='text-[20px]' />
          <div className='text-left'>
            <p className='text-sm font-bold'>{t('cart.addedToCart', 'Đã thêm sản phẩm vào giỏ hàng!')}</p>
          </div>
        </div>
      )}

      {/* Floating error toast */}
      {error && (
        <div className='fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-destructive px-4 py-3 text-destructive-foreground shadow-lg animate-in fade-in slide-in-from-bottom-4'>
          <MaterialIcon name='error' className='text-[20px]' />
          <div className='text-left'>
            <p className='text-sm font-bold'>{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
