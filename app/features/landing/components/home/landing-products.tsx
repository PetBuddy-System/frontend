import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { fetchProductsApi } from '~/features/products/services/products'
import { addToCartApi } from '~/features/products/services/cart'
import { MaterialIcon } from '~/shared/ui'
import type { ProductResponse } from '~/shared/lib/product'

const PRODUCT_LIMIT = 4

export function LandingProducts() {
  const { t } = useTranslation('landing')

  const [products, setProducts] = useState<ProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addingMap, setAddingMap] = useState<Record<string, boolean>>({})
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function loadProducts() {
      try {
        const response = await fetchProductsApi({
          sortBy: 'date_desc',
          size: PRODUCT_LIMIT
        })
        if (active && response.success) {
          setProducts(response.data.content)
        }
      } catch (err) {
        console.error('Failed to load featured products', err)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }
    void loadProducts()
    return () => {
      active = false
    }
  }, [])

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ'
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
        price: product.price,
        imageUrl: product.imageUrls?.[0] || product.thumbnail
      })
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi thêm vào giỏ hàng')
      setTimeout(() => setError(null), 3000)
    } finally {
      setAddingMap((prev) => ({ ...prev, [product.productId]: false }))
    }
  }

  return (
    <section id='products' className='bg-muted py-16 md:py-20'>
      <div className='mx-auto w-full max-w-6xl px-4 md:px-6'>
        <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
          <h2 className='text-2xl font-bold text-foreground md:text-3xl font-display'>{t('products.title')}</h2>
        </div>

        {isLoading ? (
          <div className='mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6'>
            {Array.from({ length: PRODUCT_LIMIT }).map((_, idx) => (
              <div
                key={idx}
                className='flex h-full flex-col rounded-2xl border border-border/60 bg-card p-4 shadow-sm animate-pulse'
              >
                <div className='mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-background p-2'>
                  <div className='h-full w-full bg-muted' />
                </div>
                <div className='h-4 w-2/3 rounded bg-muted' />
                <div className='mt-3 h-6 w-1/3 rounded bg-muted' />
                <div className='mt-4 h-10 w-full rounded-lg bg-muted' />
              </div>
            ))}
          </div>
        ) : (
          <div className='mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6'>
            {products.map((product) => (
              <article
                key={product.productId}
                className='group flex h-full flex-col rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-lg'
              >
                <Link
                  to={`/products/${product.productId}`}
                  className='relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-background p-2'
                >
                  <img
                    src={product.imageUrls?.[0] || product.thumbnail || 'https://placehold.co/300'}
                    alt={product.name}
                    className='h-full w-full object-contain transition-transform duration-500 group-hover:scale-105'
                  />
                </Link>
                <Link to={`/products/${product.productId}`} className='block'>
                  <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    {product.brandName}
                  </span>
                  <h3 className='mt-1 line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary'>
                    {product.name}
                  </h3>
                </Link>
                <div className='mt-auto pt-3'>
                  <div className='text-base font-bold text-primary font-display'>
                    {formatPrice(product.price)}
                  </div>
                  <button
                    type='button'
                    disabled={addingMap[product.productId]}
                    onClick={() => handleAddToCart(product)}
                    className='mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50'
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
            ))}
          </div>
        )}

        <div className='mt-8 text-center'>
          <Link
            to='/products'
            className='inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:underline'
          >
            {t('products.viewAll')}
            <MaterialIcon name='arrow_forward' className='text-[18px]' />
          </Link>
        </div>
      </div>

      {/* Success toast */}
      {showSuccessToast && (
        <div className='fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-success px-4 py-3 text-success-foreground shadow-lg animate-in fade-in slide-in-from-bottom-4'>
          <MaterialIcon name='check_circle' className='text-[20px]' />
          <p className='text-sm font-bold'>{t('toast.addedToCart')}</p>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div className='fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-destructive px-4 py-3 text-destructive-foreground shadow-lg animate-in fade-in slide-in-from-bottom-4'>
          <MaterialIcon name='error' className='text-[20px]' />
          <p className='text-sm font-bold'>{error}</p>
        </div>
      )}
    </section>
  )
}
