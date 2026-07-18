import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { addToCartApi } from '../../services'
import { useCart } from '~/providers/cart-provider'
import { MaterialIcon } from '~/shared/ui'
import type { ProductResponse } from '~/shared/lib/product'

export interface ProductsGridProps {
  products: ProductResponse[]
  isLoading?: boolean
}

export function ProductsGrid({ products, isLoading = false }: ProductsGridProps) {
  const { t } = useTranslation('products')
  const navigate = useNavigate()
  const { refreshCart } = useCart()
  const [addingMap, setAddingMap] = useState<Record<string, boolean>>({})
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '0đ'
    }
    return price.toLocaleString('vi-VN') + 'đ'
  }

  const getDiscountBadge = (product: ProductResponse) => {
    if (!product.hasActivePromotion || !product.discountValue) return null

    if (product.promotionType === 'PERCENTAGE') {
      return `-${product.discountValue}%`
    } else if (product.promotionType === 'FIXED_AMOUNT') {
      return `-${formatPrice(product.discountAmount)}`
    }
    return null
  }

  const handleAddToCart = async (product: ProductResponse) => {
    if (addingMap[product.productId]) return
    setAddingMap((prev) => ({ ...prev, [product.productId]: true }))
    setError(null)
    setShowSuccessToast(false)

    try {
      await addToCartApi({
        productId: product.productId,
        quantity: 1,
        productName: product.name,
        price: product.salePrice ?? product.price ?? 0,
        salePrice: product.hasActivePromotion ? product.promotionPrice ?? null : null,
        imageUrl: product.imageUrls?.[0] || product.thumbnailUrl || product.thumbnail,   // 👈 thêm thumbnailUrl
      })
      await refreshCart()
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi thêm vào giỏ hàng')
      setTimeout(() => setError(null), 3000)
    } finally {
      setAddingMap((prev) => ({ ...prev, [product.productId]: false }))
    }
  }

  const handleCardClick = (product: ProductResponse) => {
    navigate(`/products/${product.productId}`)
  }

  if (isLoading) {
    return (
      <div className='grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className='flex flex-col rounded-2xl border border-border/60 bg-card p-4 shadow-sm animate-pulse'>
            <div className='aspect-square w-full rounded-xl bg-muted' />
            <div className='mt-4 h-4 w-2/3 bg-muted rounded' />
            <div className='mt-2 h-4 w-full bg-muted rounded' />
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
      {products.map((product) => {
        const discountBadge = getDiscountBadge(product)
        const hasPromotion = product.hasActivePromotion && product.promotionPrice !== undefined

        return (
          <article
            key={product.productId}
            onClick={() => handleCardClick(product)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCardClick(product)
              }
            }}
            role='button'
            tabIndex={0}
            className='group flex cursor-pointer flex-col rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20 overflow-hidden'
          >
            <div className='relative w-full overflow-hidden bg-muted pt-[100%]'>
              <img
                src={product.imageUrls?.[0] || product.thumbnailUrl || product.thumbnail || 'https://placehold.co/300'}
                alt={product.name}
                className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
              />
              {discountBadge && (
                <div className='absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg'>
                  {discountBadge}
                </div>
              )}
            </div>

            <div className='flex flex-1 flex-col p-4'>
              {/* Brand */}
              <span className='text-xs uppercase tracking-wider text-muted-foreground font-semibold h-[18px] truncate'>
                {product.brandName || 'N/A'}
              </span>

              {/* Name - 2 lines */}
              <h3 className='mt-1 line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary md:text-base min-h-[44px]'>
                {product.name}
              </h3>

              {/* ⭐ Price section - KHÔNG có % giảm giá nữa */}
              <div className='mt-auto pt-3 min-h-[60px]'>
                {hasPromotion ? (
                  <div>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='text-lg font-bold text-red-500 font-display'>
                        {formatPrice(product.promotionPrice)}
                      </span>
                      <span className='text-sm line-through text-muted-foreground'>
                        {formatPrice(product.salePrice)}
                      </span>
                      {/* ⭐ ĐÃ BỎ % giảm giá ở đây */}
                    </div>
                    {/* ⭐ ĐÃ BỎ "Tiết kiệm" và "Promotion name" */}
                  </div>
                ) : (
                  <span className='text-lg font-bold text-primary font-display'>
                    {formatPrice(product.salePrice ?? product.price ?? 0)}
                  </span>
                )}
              </div>

              {/* Button */}
              <button
                type='button'
                disabled={addingMap[product.productId]}
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddToCart(product)
                }}
                className='mt-3 flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {addingMap[product.productId] ? (
                  <MaterialIcon name='progress_activity' className='text-[18px] animate-spin' />
                ) : (
                  <MaterialIcon name='add_shopping_cart' className='text-[18px]' />
                )}
                {t('actions.addToCart')}
              </button>
            </div>
          </article>
        )
      })}

      {showSuccessToast && (
        <div className='fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-success px-4 py-3 text-success-foreground shadow-lg animate-in fade-in slide-in-from-bottom-4'>
          <MaterialIcon name='check_circle' className='text-[20px]' />
          <div className='text-left'>
            <p className='text-sm font-bold'>{t('cart.addedToCart', 'Đã thêm sản phẩm vào giỏ hàng!')}</p>
          </div>
        </div>
      )}

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