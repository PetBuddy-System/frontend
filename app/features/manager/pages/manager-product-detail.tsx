// app/features/manager/pages/manager-product-detail.tsx

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { MaterialIcon } from '~/shared/ui'
import {
  fetchProductManagementByIdApi,
  fetchProductImagesApi,
  fetchProductVideoApi,
  fetchCategoriesApi,
  updateProductApi
} from '../services/product'
import type { ProductDetailData, CategoryData } from '~/shared/lib/product'
import { ManagerEditProductModal } from '../components/products/manager-edit-product-modal'
import { ManagerProductBatchSection } from '../components/products/manager-product-batch-section'
import { ManagerProductDeleteDialog } from '../components/products/manager-product-delete-dialog'
import { ManagerProductInfoCard } from '../components/products/manager-product-info-card'

type MediaTab = 'images' | 'video'

export function ManagerProductDetailPage() {
  const { t } = useTranslation('manager')
  const { productId } = useParams()
  const navigate = useNavigate()

  // ─── Product State ──────────────────────────────────────────
  const [product, setProduct] = useState<ProductDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ─── Images State ──────────────────────────────────────────
  const [productImages, setProductImages] = useState<Array<{ mediaFileId: number; fileUrl: string }>>([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [imagesError, setImagesError] = useState<string | null>(null)

  // ─── Video State ───────────────────────────────────────────
  const [productVideo, setProductVideo] = useState<{ fileUrl: string; mediaFileId: number } | null>(null)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)

  // ─── Tab State ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<MediaTab>('images')

  // ─── Thumbnail State ───────────────────────────────────────
  const [isUpdatingThumbnail, setIsUpdatingThumbnail] = useState(false)
  const [thumbnailUpdateError, setThumbnailUpdateError] = useState<string | null>(null)

  // ─── Categories (cho Edit Modal) ────────────────────────────
  const [categories, setCategories] = useState<CategoryData[]>([])

  // ─── Modal / Dialog states ──────────────────────────────────
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // ─── API 1: Load Product Detail ──────────────────────────────
  useEffect(() => {
    if (!productId) return

    async function loadProduct(id: string) {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetchProductManagementByIdApi(id)
        if (response.success) {
          setProduct(response.data)
          console.log('📦 Product data loaded:', response.data)
        } else {
          setError(t('productManagement.detail.errors.loadFailed'))
        }
      } catch {
        setError(t('productManagement.detail.errors.loadFailed'))
      } finally {
        setIsLoading(false)
      }
    }
    void loadProduct(productId)
  }, [productId, t])

  // ─── API 2: Load Product Images ──────────────────────────────
  useEffect(() => {
    if (!productId) return

    async function loadProductImages(id: string) {
      setIsLoadingImages(true)
      setImagesError(null)
      try {
        const response = await fetchProductImagesApi(id)
        if (response.success) {
          const images = response.data
            .filter((item) => item.fileType === 'IMAGE')
            .map((item) => ({
              mediaFileId: item.mediaFileId,
              fileUrl: item.fileUrl
            }))
          setProductImages(images)
        } else {
          setImagesError(t('productManagement.detail.errors.imagesLoadFailed'))
        }
      } catch {
        setImagesError(t('productManagement.detail.errors.imagesLoadFailed'))
      } finally {
        setIsLoadingImages(false)
      }
    }
    void loadProductImages(productId)
  }, [productId, t])

  // ─── API 3: Load Product Video ──────────────────────────────
  useEffect(() => {
    if (!productId) return

    async function loadProductVideo(id: string) {
      setIsLoadingVideo(true)
      setVideoError(null)
      try {
        const response = await fetchProductVideoApi(id)
        if (response.success) {
          setProductVideo({
            fileUrl: response.data.fileUrl,
            mediaFileId: response.data.mediaFileId
          })
        } else {
          setVideoError(t('productManagement.detail.errors.videoLoadFailed'))
        }
      } catch {
        setVideoError(t('productManagement.detail.errors.videoLoadFailed'))
      } finally {
        setIsLoadingVideo(false)
      }
    }
    void loadProductVideo(productId)
  }, [productId, t])

  // ─── Load Categories (một lần, cho Edit Modal) ──────────────
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetchCategoriesApi()
        if (res.success) setCategories(res.data)
      } catch (err) {
        console.error('Load categories error:', err)
      }
    }
    void loadCategories()
  }, [])

  // ─── Update Thumbnail ────────────────────────────────────────
  const handleSetThumbnail = async (mediaFileId: number) => {
    if (!productId || !product) return

    setIsUpdatingThumbnail(true)
    setThumbnailUpdateError(null)

    try {
      const response = await updateProductApi(productId, {
        name: product.name,
        salePrice: product.salePrice ?? product.price,
        brandName: product.brandName,
        status: product.status as 'ACTIVE' | 'INACTIVE' | 'DELETED',
        categoryId: product.categoryId,
        description: product.description,
        ingredients: product.ingredients,
        usageInstructions: product.usageInstructions,
        unit: product.unit,
        thumbnailMediaId: mediaFileId
      })
      if (response.success) {
        setProduct((prev) =>
          prev
            ? {
                ...prev,
                thumbnailMediaId: mediaFileId,
                thumbnailUrl: productImages.find((img) => img.mediaFileId === mediaFileId)?.fileUrl
              }
            : null
        )
      } else {
        setThumbnailUpdateError(response.message || t('productManagement.detail.errors.thumbnailUpdateFailed'))
      }
    } catch (err) {
      setThumbnailUpdateError(
        err instanceof Error ? err.message : t('productManagement.detail.errors.thumbnailUpdateFailed')
      )
    } finally {
      setIsUpdatingThumbnail(false)
    }
  }

  // ─── Soft-delete product ────────────────────────────────────
  const handleDeleteProduct = async (reason?: string, note?: string) => {
    if (!productId) return
    setIsDeletingProduct(true)
    setDeleteError(null)
    try {
      const response = await updateProductApi(productId, {
        name: product?.name ?? '',
        salePrice: product?.salePrice ?? 0,
        brandName: product?.brandName ?? '',
        status: 'DELETED',
        reason: reason,
        note: note
      })
      if (response.success) {
        navigate('/manager/products')
      } else {
        setDeleteError(response.message || t('productManagement.detail.errors.deleteFailed'))
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t('productManagement.detail.errors.deleteFailed'))
    } finally {
      setIsDeletingProduct(false)
    }
  }

  // ─── Format date ────────────────────────────────────────────
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return 'N/A'
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    } catch {
      return 'N/A'
    }
  }

  const isDeleted = product?.status === 'DELETED'
  const hasImages = productImages.length > 0
  const hasVideo = !!productVideo
  const currentThumbnailId = product?.thumbnailMediaId

  return (
    <div className='flex h-screen overflow-hidden bg-background text-foreground'>
      <ManagerSidebar activeItem='products' />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <ManagerTopNav titleKey={t('productManagement.detail.title')} />
        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto flex max-w-7xl flex-col gap-6'>
            {/* ─── LOADING ──────────────────────────────────── */}
            {isLoading && (
              <div className='flex items-center justify-center py-12'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
              </div>
            )}

            {/* ─── ERROR ────────────────────────────────────── */}
            {error && !isLoading && (
              <div className='flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm font-semibold text-destructive'>
                <MaterialIcon name='error' className='shrink-0 text-xl' />
                <span>{error}</span>
              </div>
            )}

            {/* ─── PRODUCT DETAIL ───────────────────────────── */}
            {product && !isLoading && !error && (
              <>
                {/* Navigation & Actions Row */}
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                  <button
                    onClick={() => navigate('/manager/products')}
                    className='flex items-center gap-2 text-primary font-medium hover:underline self-start text-sm'
                  >
                    <MaterialIcon name='arrow_back' className='text-base' />
                    {t('productManagement.detail.backToList')}
                  </button>
                  <div className='flex items-center gap-3 self-end sm:self-auto'>
                    {!isDeleted && (
                      <>
                        <button
                          onClick={() => {
                            setDeleteError(null)
                            setIsDeleteConfirmOpen(true)
                          }}
                          className='flex items-center gap-2 px-4 py-2 bg-card hover:bg-destructive/10 text-destructive border border-destructive/40 rounded-lg text-sm font-semibold transition-colors'
                        >
                          <MaterialIcon name='delete' className='text-lg' />
                          {t('productManagement.detail.deleteProduct')}
                        </button>
                        <button
                          onClick={() => setIsEditModalOpen(true)}
                          className='flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-sm font-semibold transition-colors shadow-sm'
                        >
                          <MaterialIcon name='edit' className='text-lg' />
                          {t('productManagement.detail.editProduct')}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Product Info Card */}
                <ManagerProductInfoCard product={product} formatDate={formatDate} />

                {/* ─── Media Section with Tabs ─────────────────── */}
                <div className='bg-card rounded-2xl border border-border p-6 shadow-sm'>
                  {/* Tabs */}
                  <div className='flex items-center gap-1 border-b border-border mb-4'>
                    <button
                      onClick={() => setActiveTab('images')}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
                        activeTab === 'images'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <MaterialIcon name='photo_library' className='text-base' />
                      {t('productManagement.detail.images')}
                      {isLoadingImages && (
                        <span className='ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent'></span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('video')}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
                        activeTab === 'video'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <MaterialIcon name='videocam' className='text-base' />
                      {t('productManagement.detail.video')}
                      {isLoadingVideo && (
                        <span className='ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent'></span>
                      )}
                    </button>
                  </div>

                  {/* Thumbnail update error */}
                  {thumbnailUpdateError && (
                    <div className='mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>
                      <MaterialIcon name='error' className='text-base' />
                      <span>{thumbnailUpdateError}</span>
                    </div>
                  )}

                  {/* Tab Content: Images */}
                  {activeTab === 'images' && (
                    <div>
                      {isLoadingImages ? (
                        <div className='flex items-center justify-center py-12'>
                          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                        </div>
                      ) : imagesError ? (
                        <div className='flex items-center gap-2 text-muted-foreground py-8 justify-center'>
                          <MaterialIcon name='image_not_supported' className='text-2xl' />
                          <span className='text-sm'>{imagesError}</span>
                        </div>
                      ) : hasImages ? (
                        <>
                          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                            {productImages.map((image) => {
                              const isThumbnail = image.mediaFileId === currentThumbnailId
                              return (
                                <div
                                  key={image.mediaFileId}
                                  className={`relative aspect-square bg-muted/30 border-2 rounded-xl overflow-hidden flex flex-col ${
                                    isThumbnail ? 'border-primary shadow-lg shadow-primary/20' : 'border-border'
                                  }`}
                                >
                                  <img
                                    src={image.fileUrl}
                                    alt={`${product.name} - image`}
                                    className='object-cover w-full h-full'
                                    loading='lazy'
                                  />

                                  {/* Thumbnail badge */}
                                  {isThumbnail && (
                                    <div className='absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-1'>
                                      <MaterialIcon name='star' className='text-xs' />
                                      <span>{t('productManagement.detail.thumbnail')}</span>
                                    </div>
                                  )}

                                  {/* Set as thumbnail button */}
                                  {!isDeleted && !isThumbnail && (
                                    <button
                                      onClick={() => handleSetThumbnail(image.mediaFileId)}
                                      disabled={isUpdatingThumbnail}
                                      className='absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center'
                                    >
                                      {isUpdatingThumbnail ? (
                                        <div className='animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent'></div>
                                      ) : (
                                        <span className='text-white text-xs font-semibold bg-primary/90 px-3 py-1.5 rounded-lg flex items-center gap-1'>
                                          <MaterialIcon name='star_border' className='text-sm' />
                                          {t('productManagement.detail.setThumbnail')}
                                        </span>
                                      )}
                                    </button>
                                  )}

                                  {/* Đang cập nhật overlay */}
                                  {isUpdatingThumbnail && isThumbnail && (
                                    <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                                      <div className='animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent'></div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                          {!isDeleted && (
                            <p className='text-xs text-muted-foreground mt-4 flex items-center gap-1'>
                              <MaterialIcon name='info' className='text-sm' />
                              <span>{t('productManagement.detail.thumbnailHint')}</span>
                            </p>
                          )}
                        </>
                      ) : (
                        <div className='flex items-center gap-2 text-muted-foreground py-8 justify-center'>
                          <MaterialIcon name='image_not_supported' className='text-2xl' />
                          <span className='text-sm'>{t('productManagement.detail.noImages')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab Content: Video */}
                  {activeTab === 'video' && (
                    <div>
                      {isLoadingVideo ? (
                        <div className='flex items-center justify-center py-12'>
                          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                        </div>
                      ) : videoError ? (
                        <div className='flex items-center gap-2 text-muted-foreground py-8 justify-center'>
                          <MaterialIcon name='videocam_off' className='text-2xl' />
                          <span className='text-sm'>{videoError}</span>
                        </div>
                      ) : hasVideo ? (
                        <div className='relative aspect-video w-full max-w-2xl mx-auto bg-black rounded-xl overflow-hidden'>
                          <video
                            src={productVideo.fileUrl}
                            controls
                            className='w-full h-full object-contain'
                            poster={
                              productImages.find((img) => img.mediaFileId === currentThumbnailId)?.fileUrl ||
                              productImages[0]?.fileUrl
                            }
                          >
                            {t('productManagement.detail.videoNotSupported')}
                          </video>
                        </div>
                      ) : (
                        <div className='flex items-center gap-2 text-muted-foreground py-8 justify-center'>
                          <MaterialIcon name='videocam_off' className='text-2xl' />
                          <span className='text-sm'>{t('productManagement.detail.noVideo')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ─── Product Details Section: Description, Ingredients, Usage Instructions ─── */}
                <div className='bg-card rounded-2xl border border-border p-6 shadow-sm'>
                  {/* Mô tả */}
                  <div>
                    <h3 className='text-lg font-bold text-foreground font-display mb-3 flex items-center gap-2'>
                      <MaterialIcon name='description' className='text-primary text-xl' />
                      {t('productManagement.detail.description')}
                    </h3>
                    <p className='text-sm text-muted-foreground leading-relaxed whitespace-pre-line'>
                      {product.description || t('productManagement.detail.noDescription')}
                    </p>
                  </div>

                  {/* Thành phần - chỉ hiển thị nếu có dữ liệu */}
                  {product.ingredients && (
                    <div className='border-t border-border pt-4 mt-4'>
                      <h3 className='text-lg font-bold text-foreground font-display mb-3 flex items-center gap-2'>
                        <MaterialIcon name='science' className='text-primary text-xl' />
                        {t('productManagement.detail.ingredients')}
                      </h3>
                      <p className='text-sm text-muted-foreground leading-relaxed whitespace-pre-line'>
                        {product.ingredients}
                      </p>
                    </div>
                  )}

                  {/* Hướng dẫn sử dụng - chỉ hiển thị nếu có dữ liệu */}
                  {product.usageInstructions && (
                    <div className='border-t border-border pt-4 mt-4'>
                      <h3 className='text-lg font-bold text-foreground font-display mb-3 flex items-center gap-2'>
                        <MaterialIcon name='info' className='text-primary text-xl' />
                        {t('productManagement.detail.usageInstructions')}
                      </h3>
                      <p className='text-sm text-muted-foreground leading-relaxed whitespace-pre-line'>
                        {product.usageInstructions}
                      </p>
                    </div>
                  )}
                </div>

                {/* Batch Management Section */}
                {productId && <ManagerProductBatchSection productId={productId} isDeleted={isDeleted} />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && productId && (
        <ManagerEditProductModal
          productId={productId}
          categories={categories}
          onClose={() => setIsEditModalOpen(false)}
          onSaveSuccess={async () => {
            setIsEditModalOpen(false)
            if (!productId) return
            setIsLoading(true)
            try {
              const res = await fetchProductManagementByIdApi(productId)
              if (res.success) setProduct(res.data)
            } catch (err) {
              console.error('Reload product after edit error:', err)
            } finally {
              setIsLoading(false)
            }
          }}
        />
      )}

      {/* Delete Confirm Dialog */}
      <ManagerProductDeleteDialog
        productName={product?.name ?? ''}
        isOpen={isDeleteConfirmOpen}
        isDeleting={isDeletingProduct}
        error={deleteError}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteProduct}
      />
    </div>
  )
}
