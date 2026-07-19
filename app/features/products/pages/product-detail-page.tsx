import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { ProductDetailDescription } from '../components/detail/product-detail-description'
import { ProductDetailGallery } from '../components/detail/product-detail-gallery'
import { ProductDetailInfo } from '../components/detail/product-detail-info'
import { ProductsBottomNav } from '../components/listing/products-bottom-nav'
import { RelatedProducts } from '../components/detail/related-products'
import { ProductReviews } from '../components/detail/product-reviews'
import { MaterialIcon } from '~/shared/ui'
import { SiteFooter } from '~/shared/components'
import { SiteHeader } from '~/shared/components'
import { fetchProductByIdApi } from '../services'
import { fetchProductImagesApi, fetchProductVideoApi } from '../services/products/product-api'
import type { ProductDetailData } from '~/shared/lib/product'

export function ProductDetailPage() {
  const { t } = useTranslation('products')
  const { productId } = useParams()

  const [product, setProduct] = useState<ProductDetailData | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (!productId) return

    async function loadProductDetail() {
      setIsLoading(true)
      try {
        const [productResponse, imagesResponse, videoResponse] = await Promise.all([
          fetchProductByIdApi(productId!),
          fetchProductImagesApi(productId!),
          fetchProductVideoApi(productId!)
        ])

        if (active) {
          if (productResponse.success) {
            setProduct(productResponse.data)
            console.log('📦 Product data from API:', {
              ingredients: productResponse.data.ingredients,
              usageInstructions: productResponse.data.usageInstructions,
              hasIngredients: Boolean(productResponse.data.ingredients),
              hasInstructions: Boolean(productResponse.data.usageInstructions)
            })
          }

          if (imagesResponse.success && imagesResponse.data) {
            const urls = imagesResponse.data.map((img: any) => img.fileUrl)
            setImageUrls(urls)
          }

          if (videoResponse.success && videoResponse.data) {
            setVideoUrl(videoResponse.data.fileUrl)
          }

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

  // Lấy ảnh thumbnail (ưu tiên từ API images, fallback từ product)
  const thumbnailUrl = imageUrls.length > 0 ? imageUrls[0] : (product.thumbnailUrl || '')

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

        {/* Phần 1: Gallery + Info - 2 cột */}
        <div className='mb-8 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16'>
          <ProductDetailGallery
            imageUrls={imageUrls.length > 0 ? imageUrls : []}
            productName={product.name}
          />
          <ProductDetailInfo
            productId={product.productId}
            name={product.name}
            salePrice={product.salePrice}
            brandName={product.brandName}
            totalStock={product.totalStock}
            unit={product.unit}
            discountAmount={product.discountAmount}
            discountValue={product.discountValue}
            hasActivePromotion={product.hasActivePromotion}
            promotionName={product.promotionName}
            promotionPrice={product.promotionPrice}
            promotionType={product.promotionType}
            imageUrl={thumbnailUrl}
            price={product.price}
            promotionDescription={product.promotionDescription}
            promotionEndDate={product.promotionEndDate}
          />
        </div>

        {/* Phần 2: Video - Full width, nằm giữa Gallery và Description */}
        {videoUrl && (
          <div className='mb-8'>
            <h3 className='mb-4 text-lg font-semibold text-foreground flex items-center gap-2'>
              <MaterialIcon name='play_circle' className='text-2xl text-primary' />
              Video sản phẩm
            </h3>
            <div className='relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm'>
              <video
                src={videoUrl}
                controls
                className='w-full max-h-[500px] object-contain'
              />
            </div>
          </div>
        )}

        {/* Phần 3: Mô tả sản phẩm */}
        <ProductDetailDescription
          description={product.description}
          brandName={product.brandName}
          categoryName={product.categoryName}
          ingredients={product.ingredients}
          usageInstructions={product.usageInstructions}
        />

        {/* Phần 4: Đánh giá sản phẩm */}
        <div className='mb-10'>
          <ProductReviews productId={product.productId} />
        </div>

        <RelatedProducts
          productId={product.productId}
          categoryId={product.categoryId}
          limit={4}
        />
      </main>
      <SiteFooter />
      <ProductsBottomNav />
    </div>
  )
}