import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { fetchProductsApi } from '~/features/products/services'
import type { ProductResponse } from '~/shared/lib/product'

export interface RelatedProductsProps {
  productId?: string
  categoryId?: number
  limit?: number
}

export function RelatedProducts({ productId, categoryId, limit = 4 }: RelatedProductsProps) {
  const { t } = useTranslation('products')
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRelatedProducts() {
      setIsLoading(true)
      setError(null)
      try {
        // Gọi API lấy sản phẩm theo categoryId
        const response = await fetchProductsApi({
          categoryId: categoryId,
          size: limit * 2, // Lấy nhiều hơn để có thể filter
          page: 0
        })

        if (response.success) {
          // Lọc bỏ sản phẩm hiện tại và giới hạn số lượng
          const filtered = response.data.content
            .filter((p: ProductResponse) => p.productId !== productId)
            .slice(0, limit)
          setProducts(filtered)
        } else {
          setError(response.message || 'Không thể tải sản phẩm liên quan')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi tải sản phẩm liên quan')
      } finally {
        setIsLoading(false)
      }
    }

    // Nếu có categoryId, load sản phẩm cùng danh mục
    if (categoryId) {
      void loadRelatedProducts()
    } else {
      // Fallback: load sản phẩm nổi bật nếu không có categoryId
      async function loadFeaturedProducts() {
        setIsLoading(true)
        try {
          const response = await fetchProductsApi({
            size: limit,
            page: 0,
            sortBy: 'createdAt_desc' // Hoặc 'sales_desc'
          })
          if (response.success) {
            const filtered = response.data.content
              .filter((p: ProductResponse) => p.productId !== productId)
              .slice(0, limit)
            setProducts(filtered)
          }
        } catch {
          // Silent fail
        } finally {
          setIsLoading(false)
        }
      }
      void loadFeaturedProducts()
    }
  }, [productId, categoryId, limit])

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ'
  }

  const getBadgeLabel = (product: ProductResponse) => {
    if (product.hasActivePromotion && product.discountValue) {
      return `-${product.discountValue}%`
    }
    return null
  }

  const getBadgeStyle = (product: ProductResponse) => {
    if (product.hasActivePromotion && product.discountValue) {
      return 'bg-destructive text-destructive-foreground'
    }
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <section className='mb-16'>
        <div className='mb-8 flex items-end justify-between'>
          <h2 className='text-2xl font-semibold text-foreground font-display'>{t('detail.related.title')}</h2>
        </div>
        <div className='grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4 animate-pulse'>
          {[...Array(limit)].map((_, i) => (
            <div key={i} className='rounded-xl border border-border/60 bg-card p-4 space-y-3'>
              <div className='aspect-square bg-muted rounded-lg' />
              <div className='h-4 bg-muted rounded w-3/4' />
              <div className='h-4 bg-muted rounded w-1/2' />
            </div>
          ))}
        </div>
      </section>
    )
  }

  // Error hoặc không có sản phẩm
  if (error || products.length === 0) {
    return null
  }

  return (
    <section className='mb-16'>
      <div className='mb-8 flex items-end justify-between'>
        <h2 className='text-2xl font-semibold text-foreground font-display'>{t('detail.related.title')}</h2>
        <Link
          className='flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:opacity-80'
          to='/products'
        >
          {t('detail.related.viewAll')}
          <MaterialIcon name='arrow_forward' className='text-[18px]' />
        </Link>
      </div>

      <div className='grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4'>
        {products.map((product) => {
          const badgeLabel = getBadgeLabel(product)
          const badgeStyle = getBadgeStyle(product)
          const displayPrice =
            product.hasActivePromotion && product.promotionPrice ? product.promotionPrice : product.salePrice
          const originalPrice = product.hasActivePromotion && product.promotionPrice ? product.salePrice : undefined

          return (
            <Link
              key={product.productId}
              to={`/products/${product.productId}`}
              className='group overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md'
            >
              <div className='relative aspect-square bg-muted p-6'>
                {badgeLabel && badgeStyle && (
                  <span
                    className={cn('absolute left-2 top-2 z-10 rounded-full px-2 py-1 text-xs font-bold', badgeStyle)}
                  >
                    {badgeLabel}
                  </span>
                )}
                {product.thumbnailUrl ? (
                  <img
                    src={product.thumbnailUrl}
                    alt={product.name}
                    className='h-full w-full object-contain transition-transform duration-300 group-hover:scale-105'
                    loading='lazy'
                  />
                ) : (
                  <span className='flex h-full w-full items-center justify-center rounded-xl bg-card text-muted-foreground transition-transform duration-300 group-hover:scale-105'>
                    <MaterialIcon name='inventory_2' className='text-[56px]' />
                  </span>
                )}
              </div>
              <div className='flex flex-col gap-2 p-4'>
                <h3 className='min-h-12 line-clamp-2 text-sm text-foreground'>{product.name}</h3>
                <div className='flex items-center gap-2'>
                  <span className='text-lg font-bold text-primary font-display'>{formatPrice(displayPrice)}</span>
                  {originalPrice && (
                    <span className='text-sm line-through text-muted-foreground'>{formatPrice(originalPrice)}</span>
                  )}
                </div>
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault()
                    // TODO: Thêm vào giỏ hàng
                  }}
                  className='mt-2 w-full rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground'
                >
                  {t('detail.related.buy')}
                </button>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
