import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { ProductDetailDescription } from '../components/detail/product-detail-description'
import { ProductDetailGallery } from '../components/detail/product-detail-gallery'
import { ProductDetailInfo } from '../components/detail/product-detail-info'
import { ProductsBottomNav } from '../components/listing/products-bottom-nav'
import { RelatedProducts } from '../components/detail/related-products'
import { MaterialIcon } from '~/shared/ui'
import { SiteFooter } from '~/shared/components'
import { SiteHeader } from '~/shared/components'
import { fetchProductByIdApi } from '../services/products'
import type { ProductDetailData } from '~/shared/lib/product'

export function ProductDetailPage() {
  const { t } = useTranslation('products')
  const { productId } = useParams()

  const [product, setProduct] = useState<ProductDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (!productId) return

    async function loadProductDetail() {
      setIsLoading(true)
      try {
        const response = await fetchProductByIdApi(productId!)
        if (active && response.success) {
          setProduct(response.data)
          setError(null)
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Lỗi tải chi tiết sản phẩm')
        }
        if (active) {
          setIsLoading(false)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadProductDetail()

    return () => {
      active = false
    }
  }, [productId])

  if (isLoading) {
    return (
      <div className='flex min-h-screen flex-col bg-background text-foreground'>
        <SiteHeader />
        <main className='mx-auto w-full max-w-6xl flex-1 px-4 py-16 md:px-6 flex items-center justify-center animate-pulse'>
          <div className='text-center space-y-4'>
            <div className='h-8 w-32 bg-muted rounded mx-auto' />
            <div className='h-4 w-48 bg-muted rounded' />
          </div>
        </main>
        <SiteFooter />
        <ProductsBottomNav />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className='flex min-h-screen flex-col bg-background text-foreground'>
        <SiteHeader />
        <main className='mx-auto w-full max-w-6xl flex-1 px-4 py-16 md:px-6 flex flex-col items-center justify-center text-center'>
          <MaterialIcon name='error' className='text-5xl text-destructive' />
          <p className='mt-4 text-lg font-semibold text-foreground font-display'>
            {error || 'Không tìm thấy sản phẩm này'}
          </p>
          <Link
            to='/products'
            className='mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-105 active:scale-[0.98]'
          >
            Quay lại cửa hàng
          </Link>
        </main>
        <SiteFooter />
        <ProductsBottomNav />
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <SiteHeader />
      <main className='mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6'>
        <nav aria-label={t('detail.breadcrumb.label')} className='mb-8 text-sm font-semibold text-muted-foreground'>
          <ol className='flex flex-wrap items-center gap-1 md:gap-3'>
            <li className='flex items-center gap-1 md:gap-2'>
              <Link className='transition-colors hover:text-primary' to='/'>
                {t('detail.breadcrumb.home')}
              </Link>
              <MaterialIcon name='chevron_right' className='text-[18px]' />
            </li>
            <li className='flex items-center gap-1 md:gap-2'>
              <Link className='transition-colors hover:text-primary' to='/products'>
                {t('detail.breadcrumb.store')}
              </Link>
              <MaterialIcon name='chevron_right' className='text-[18px]' />
            </li>
            <li aria-current='page' className='text-foreground font-semibold'>
              {product.name}
            </li>
          </ol>
        </nav>

        <div className='mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16'>
          <ProductDetailGallery imageUrls={product.imageUrls} productName={product.name} />
          <ProductDetailInfo
            productId={product.productId}
            name={product.name}
            price={product.price}
            brandName={product.brandName}
            totalStock={product.totalStock}
          />
        </div>

        <ProductDetailDescription
          description={product.description}
          brandName={product.brandName}
          categoryName={product.categoryName}
        />
        <RelatedProducts />
      </main>
      <SiteFooter />
      <ProductsBottomNav />
    </div>
  )
}
