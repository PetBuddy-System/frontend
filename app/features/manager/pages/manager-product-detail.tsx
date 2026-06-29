// app/features/manager/pages/manager-product-detail.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { MaterialIcon } from '~/shared/ui'
import { fetchProductByIdApi, fetchCategoriesApi, updateProductApi } from '../services/product'
import type { ProductDetailData, CategoryData } from '~/shared/lib/product'
import { ManagerEditProductModal } from '../components/products/manager-edit-product-modal'
import { ManagerProductBatchSection } from '../components/products/manager-product-batch-section'
import { ManagerProductDeleteDialog } from '../components/products/manager-product-delete-dialog'

export function ManagerProductDetailPage() {
    const { productId } = useParams()
    const navigate = useNavigate()

    // ─── Product State ──────────────────────────────────────────
    const [product, setProduct] = useState<ProductDetailData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // ─── Categories (cho Edit Modal) ────────────────────────────
    const [categories, setCategories] = useState<CategoryData[]>([])

    // ─── Modal / Dialog states ──────────────────────────────────
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isDeletingProduct, setIsDeletingProduct] = useState(false)
    const [deleteError, setDeleteError] = useState<string | null>(null)

    // ─── Load Product ───────────────────────────────────────────
    useEffect(() => {
        if (!productId) return

        async function loadProduct(id: string) {
            setIsLoading(true)
            try {
                const response = await fetchProductByIdApi(id)
                if (response.success) {
                    setProduct(response.data)
                } else {
                    setError('Không thể tải thông tin sản phẩm')
                }
            } catch {
                setError('Không thể tải thông tin sản phẩm')
            } finally {
                setIsLoading(false)
            }
        }
        void loadProduct(productId)
    }, [productId])

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

    // ─── Soft-delete product ────────────────────────────────────
    const handleDeleteProduct = async () => {
        if (!productId) return
        setIsDeletingProduct(true)
        setDeleteError(null)
        try {
            const response = await updateProductApi(productId, {
                name: product?.name ?? '',
                price: product?.price ?? 0,
                brandName: product?.brandName ?? '',
                status: 'DELETED'
            })
            if (response.success) {
                navigate('/manager/products')
            } else {
                setDeleteError(response.message || 'Không thể xóa sản phẩm')
            }
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa sản phẩm')
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

    // ✅ Hàm lấy label status tiếng Việt
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'Đang hoạt động'
            case 'INACTIVE':
                return 'Ngừng kinh doanh'
            case 'DELETED':
                return 'Đã xóa'
            default:
                return status
        }
    }

    // ✅ Kiểm tra sản phẩm đã xóa chưa
    const isDeleted = product?.status === 'DELETED'

    return (
        <div className='flex h-screen overflow-hidden bg-background text-foreground'>
            <ManagerSidebar activeItem='products' />
            <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
                <ManagerTopNav
                    titleKey='Chi tiết sản phẩm'
                    subtitleKey={`Mã SP: ${productId || 'N/A'}`}
                />
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
                                        Quay lại danh sách
                                    </button>
                                    <div className='flex items-center gap-3 self-end sm:self-auto'>
                                        {/* ✅ Chỉ hiển thị nút Xóa nếu chưa bị xóa */}
                                        {!isDeleted && (
                                            <button
                                                onClick={() => { setDeleteError(null); setIsDeleteConfirmOpen(true) }}
                                                className='flex items-center gap-2 px-4 py-2 bg-card hover:bg-destructive/10 text-destructive border border-destructive/40 rounded-lg text-sm font-semibold transition-colors'
                                            >
                                                <MaterialIcon name='delete' className='text-lg' />
                                                Xóa sản phẩm
                                            </button>
                                        )}
                                        {/* ✅ Chỉ hiển thị nút Chỉnh sửa nếu chưa bị xóa */}
                                        {!isDeleted && (
                                            <button
                                                onClick={() => setIsEditModalOpen(true)}
                                                className='flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-sm font-semibold transition-colors shadow-sm'
                                            >
                                                <MaterialIcon name='edit' className='text-lg' />
                                                Chỉnh sửa
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Product Info Card */}
                                <div className='bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between'>
                                    <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8'>
                                        <div>
                                            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Mã sản phẩm</span>
                                            <span className='text-base font-bold text-foreground block'>{product.productCode || product.productId}</span>
                                        </div>
                                        <div>
                                            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Tên sản phẩm</span>
                                            <span className='text-base font-bold text-foreground block'>{product.name}</span>
                                        </div>
                                        <div>
                                            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Trạng thái</span>
                                            <div className='flex items-center gap-1.5 mt-0.5'>
                                                <span className={`w-2 h-2 rounded-full ${product.status === 'ACTIVE' ? 'bg-success' : product.status === 'DELETED' ? 'bg-destructive' : 'bg-muted-foreground'}`}></span>
                                                <span className={`text-sm font-semibold ${product.status === 'ACTIVE' ? 'text-success' : product.status === 'DELETED' ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                    {getStatusLabel(product.status)}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Danh mục</span>
                                            <span className='text-sm font-semibold text-muted-foreground block'>{product.categoryName || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Thương hiệu</span>
                                            <div className='mt-0.5'>
                                                <span className='bg-secondary/15 text-secondary-foreground text-xs font-semibold px-2 py-0.5 rounded'>
                                                    {product.brandName || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Giá bán</span>
                                            <span className='text-base font-bold text-primary block'>{product.price?.toLocaleString('en-US')} VNĐ</span>
                                        </div>
                                        <div>
                                            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Tổng kho</span>
                                            <div className='flex items-baseline gap-1 mt-0.5'>
                                                <span className='text-base font-bold text-foreground'>{product.totalStock}</span>
                                                <span className='text-xs text-muted-foreground'>gói</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Tổng lô hàng</span>
                                            <span className='text-base font-bold text-foreground block mt-0.5'>{product.batchCount}</span>
                                        </div>
                                    </div>

                                    {/* Date Card */}
                                    <div className='w-full md:w-64 shrink-0 bg-muted/30 border border-border/60 rounded-xl p-4 flex flex-col gap-4 self-start'>
                                        <div className='flex items-start gap-3'>
                                            <MaterialIcon name='calendar_month' className='text-muted-foreground text-xl mt-0.5' />
                                            <div>
                                                <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block'>Ngày tạo</span>
                                                <span className='text-sm font-semibold text-muted-foreground block'>{formatDate(product.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className='flex items-start gap-3 border-t border-border/50 pt-3'>
                                            <MaterialIcon name='history' className='text-muted-foreground text-xl mt-0.5' />
                                            <div>
                                                <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block'>Cập nhật cuối</span>
                                                <span className='text-sm font-semibold text-muted-foreground block'>{formatDate(product.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description Card */}
                                <div className='bg-card rounded-2xl border border-border p-6 shadow-sm'>
                                    <h3 className='text-lg font-bold text-foreground font-display mb-3'>Mô tả sản phẩm</h3>
                                    <p className='text-sm text-muted-foreground leading-relaxed whitespace-pre-line'>
                                        {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                                    </p>
                                </div>

                                {/* Product Images Gallery */}
                                <div className='bg-card rounded-2xl border border-border p-6 shadow-sm'>
                                    <h3 className='text-lg font-bold text-foreground font-display mb-4'>Hình ảnh sản phẩm</h3>
                                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                                        {[0, 1, 2, 3].map((index) => (
                                            <div key={index} className='relative aspect-square bg-muted/30 border border-border rounded-xl overflow-hidden flex items-center justify-center group'>
                                                {product.imageUrls && product.imageUrls[index] ? (
                                                    <>
                                                        <img
                                                            src={product.imageUrls[index]}
                                                            alt={`${product.name} - image ${index + 1}`}
                                                            className='object-cover w-full h-full transition-transform group-hover:scale-105'
                                                        />
                                                        {index === 0 && (
                                                            <span className='absolute bottom-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-sm'>
                                                                Hình chính
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                                                        <MaterialIcon name='image_not_supported' className='text-3xl' />
                                                        <span className='text-xs font-semibold'>Trống</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ✅ Batch Management Section - Luôn hiển thị, truyền isDeleted vào component */}
                                {productId && (
                                    <ManagerProductBatchSection
                                        productId={productId}
                                        isDeleted={isDeleted}
                                    />
                                )}
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
                            const res = await fetchProductByIdApi(productId)
                            if (res.success) setProduct(res.data)
                        } catch (err) {
                            console.error('Reload product after edit error:', err)
                        } finally {
                            setIsLoading(false)
                        }
                    }}
                />
            )}

            {/* Delete Confirm Dialog - Extracted Component */}
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