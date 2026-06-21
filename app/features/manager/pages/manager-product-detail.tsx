// app/features/manager/pages/manager-product-detail.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ManagerSidebar } from '../components/layout/manager-sidebar'
import { ManagerTopNav } from '../components/layout/manager-top-nav'
import { MaterialIcon } from '~/shared/ui'
import { fetchProductByIdApi, type ProductDetailData } from '~/shared/lib/product'
import { fetchProductBatchesApi, createBatchesApi, type ProductBatchItem, type BatchSortBy, type CreateBatchPayload } from '~/shared/lib/batch'

export function ManagerProductDetailPage() {
    console.log('🔵 [1] Component rendered')
    const { productId } = useParams()  // 👈 Đổi từ id -> productId
    console.log('🔵 [2] Product ID from URL:', productId)
    const navigate = useNavigate()

    // ─── Product State ──────────────────────────────────────────
    const [product, setProduct] = useState<ProductDetailData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // ─── Batch State ────────────────────────────────────────────
    const [batches, setBatches] = useState<ProductBatchItem[]>([])
    const [isLoadingBatches, setIsLoadingBatches] = useState(false)
    const [batchSearch, setBatchSearch] = useState('')
    const [batchStatus, setBatchStatus] = useState<'ACTIVE' | 'INACTIVE' | 'DELETED' | 'ALL'>('ALL')
    const [batchPage, setBatchPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [sortBy, setSortBy] = useState<BatchSortBy>('date_desc')

    // ─── Submit status states ──────────────────────────────────
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    // ─── New Batch Form State ──────────────────────────────────
    const [newBatches, setNewBatches] = useState<{ quantity: number; expiryDate: string }[]>([
        { quantity: 0, expiryDate: '' }
    ])

    // ─── Load Product ───────────────────────────────────────────
    useEffect(() => {
        console.log('🔵 [3] useEffect triggered, productId:', productId)

        if (!productId) {
            console.log('🔴 [4] No productId, returning')
            return
        }

        async function loadProduct() {
            console.log('🔵 [5] Starting loadProduct...')
            setIsLoading(true)
            try {
                console.log('🔵 [6] Calling API with productId:', productId)
                const response = await fetchProductByIdApi(productId!)
                console.log('🔵 [7] API Response:', response)

                if (response.success) {
                    console.log('🔵 [8] Setting product:', response.data)
                    setProduct(response.data)
                } else {
                    console.log('🔴 [9] API not success:', response)
                    setError('Không thể tải thông tin sản phẩm')
                }
            } catch (err) {
                console.log('🔴 [10] API Error:', err)
                setError('Không thể tải thông tin sản phẩm')
            } finally {
                console.log('🔵 [11] Finally, isLoading = false')
                setIsLoading(false)
            }
        }

        void loadProduct()
    }, [productId])

    // ─── Load Batches ───────────────────────────────────────────
    useEffect(() => {
        console.log('🔵 [12] Batch useEffect triggered, productId:', productId)

        if (!productId) {
            console.log('🔴 [13] No productId for batches, returning')
            return
        }

        async function loadBatches() {
            console.log('🔵 [14] Starting loadBatches...')
            setIsLoadingBatches(true)
            try {
                console.log('🔵 [15] Calling batch API with params:', {
                    productId,
                    keyword: batchSearch || undefined,
                    status: batchStatus !== 'ALL' ? batchStatus : undefined,
                    page: batchPage,
                    size: 10,
                    sortBy
                })
                const response = await fetchProductBatchesApi(productId!, {
                    keyword: batchSearch || undefined,
                    status: batchStatus !== 'ALL' ? batchStatus : undefined,
                    page: batchPage,
                    size: 10,
                    sortBy
                })
                console.log('🔵 [16] Batch API Response:', response)

                if (response.success) {
                    console.log('🔵 [17] Setting batches:', response.data.content)
                    setBatches(response.data.content)
                    setTotalPages(response.data.totalPages)
                    setTotalElements(response.data.totalElements)
                } else {
                    console.log('🔴 [18] Batch API not success:', response)
                }
            } catch (err) {
                console.log('🔴 [19] Batch API Error:', err)
            } finally {
                console.log('🔵 [20] Finally, isLoadingBatches = false')
                setIsLoadingBatches(false)
            }
        }

        void loadBatches()
    }, [productId, batchSearch, batchStatus, batchPage, sortBy, refreshKey])

    // ─── Calculate days remaining ──────────────────────────────
    const getDaysRemaining = (expiryDate: string) => {
        const today = new Date()
        const expiry = new Date(expiryDate)
        const diffTime = expiry.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    // ─── Add new batch row ──────────────────────────────────────
    const addBatchRow = () => {
        setNewBatches([...newBatches, { quantity: 0, expiryDate: '' }])
    }

    // ─── Remove batch row ──────────────────────────────────────
    const removeBatchRow = (index: number) => {
        setNewBatches(newBatches.filter((_, i) => i !== index))
    }

    // ─── Update batch row ──────────────────────────────────────
    const updateBatchRow = (index: number, field: 'quantity' | 'expiryDate', value: string | number) => {
        const updated = [...newBatches]
        updated[index] = { ...updated[index], [field]: value }
        setNewBatches(updated)
    }

    // ─── Submit new batches ─────────────────────────────────────
    const handleSubmitBatches = async () => {
        setSubmitError(null)
        setShowSuccess(false)

        const validBatches = newBatches.filter(
            (batch) => batch.quantity > 0 && batch.expiryDate.trim() !== ''
        )

        if (validBatches.length === 0) {
            setSubmitError('Vui lòng nhập ít nhất 1 lô hàng')
            return
        }

        if (!productId) {
            setSubmitError('Không tìm thấy mã sản phẩm')
            return
        }

        setIsSubmitting(true)
        try {
            const payload: CreateBatchPayload[] = validBatches.map((batch) => ({
                stockQuantity: batch.quantity,
                expiryDate: batch.expiryDate
            }))

            const response = await createBatchesApi(productId, payload)
            if (response.success) {
                setNewBatches([{ quantity: 0, expiryDate: '' }])
                setRefreshKey((prev) => prev + 1)
                setShowSuccess(true)
                setTimeout(() => setShowSuccess(false), 3000)
            } else {
                setSubmitError(response.message || 'Không thể nhập lô hàng')
            }
        } catch (err) {
            console.error('Submit batches error:', err)
            const errMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi nhập lô hàng'
            setSubmitError(errMsg)
        } finally {
            setIsSubmitting(false)
        }
    }

    // ─── Format date ────────────────────────────────────────────
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A'
        try {
            const d = new Date(dateStr)
            if (isNaN(d.getTime())) return 'N/A'
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        } catch {
            return 'N/A'
        }
    }

    const expiringSoonCount = batches.filter(batch => {
        const days = getDaysRemaining(batch.expiryDate)
        return days > 0 && days < 90 && batch.status === 'ACTIVE'
    }).length

    console.log('🔵 [21] Rendering UI, isLoading:', isLoading, 'product:', !!product)

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
                                        <button className='flex items-center gap-2 px-4 py-2 bg-card hover:bg-muted text-foreground border border-border rounded-lg text-sm font-semibold transition-colors'>
                                            <MaterialIcon name='delete' className='text-lg' />
                                            Xóa sản phẩm
                                        </button>
                                        <button className='flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-sm font-semibold transition-colors shadow-sm'>
                                            <MaterialIcon name='edit' className='text-lg' />
                                            Chỉnh sửa
                                        </button>
                                    </div>
                                </div>

                                {/* Product Info Card */}
                                <div className='bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between'>
                                    {/* Left Column: Properties Grid */}
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
                                                <span className={`w-2 h-2 rounded-full ${product.status === 'ACTIVE' ? 'bg-success' : 'bg-muted-foreground'}`}></span>
                                                <span className={`text-sm font-semibold ${product.status === 'ACTIVE' ? 'text-success' : 'text-muted-foreground'}`}>
                                                    {product.status}
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
                                        <div>
                                            <span className='text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1'>Hết hạn &lt; 3 tháng</span>
                                            <span className={`text-base font-bold block mt-0.5 ${expiringSoonCount > 0 ? 'text-destructive' : 'text-foreground'}`}>
                                                {expiringSoonCount}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Column: Date Card */}
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
                                        {/* Slot 1: Main Image */}
                                        <div className='relative aspect-square bg-muted/30 border border-border rounded-xl overflow-hidden flex items-center justify-center group'>
                                            {product.imageUrls && product.imageUrls[0] ? (
                                                <>
                                                    <img
                                                        src={product.imageUrls[0]}
                                                        alt={`${product.name} - main`}
                                                        className='object-cover w-full h-full transition-transform group-hover:scale-105'
                                                    />
                                                    <span className='absolute bottom-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-sm'>
                                                        Hình chính
                                                    </span>
                                                </>
                                            ) : (
                                                <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                                                    <MaterialIcon name='image_not_supported' className='text-3xl' />
                                                    <span className='text-xs font-semibold'>Trống</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Slot 2 */}
                                        <div className='relative aspect-square bg-muted/30 border border-border rounded-xl overflow-hidden flex items-center justify-center group'>
                                            {product.imageUrls && product.imageUrls[1] ? (
                                                <img
                                                    src={product.imageUrls[1]}
                                                    alt={`${product.name} - image 2`}
                                                    className='object-cover w-full h-full transition-transform group-hover:scale-105'
                                                />
                                            ) : (
                                                <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                                                    <MaterialIcon name='image_not_supported' className='text-3xl' />
                                                    <span className='text-xs font-semibold'>Trống</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Slot 3 */}
                                        <div className='relative aspect-square bg-muted/30 border border-border rounded-xl overflow-hidden flex items-center justify-center group'>
                                            {product.imageUrls && product.imageUrls[2] ? (
                                                <img
                                                    src={product.imageUrls[2]}
                                                    alt={`${product.name} - image 3`}
                                                    className='object-cover w-full h-full transition-transform group-hover:scale-105'
                                                />
                                            ) : (
                                                <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                                                    <MaterialIcon name='image_not_supported' className='text-3xl' />
                                                    <span className='text-xs font-semibold'>Trống</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Slot 4 */}
                                        <div className='relative aspect-square bg-muted/30 border border-border rounded-xl overflow-hidden flex items-center justify-center group'>
                                            {product.imageUrls && product.imageUrls[3] ? (
                                                <img
                                                    src={product.imageUrls[3]}
                                                    alt={`${product.name} - image 4`}
                                                    className='object-cover w-full h-full transition-transform group-hover:scale-105'
                                                />
                                            ) : (
                                                <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                                                    <MaterialIcon name='image_not_supported' className='text-3xl' />
                                                    <span className='text-xs font-semibold'>Trống</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Batch Management Section */}
                                <div className='bg-card rounded-2xl border border-border overflow-hidden shadow-sm'>
                                    {/* Card Header */}
                                    <div className='border-b border-border bg-card px-6 py-4 flex items-center gap-2.5'>
                                        <MaterialIcon name='inventory_2' className='text-primary text-xl' />
                                        <span className='font-bold text-foreground font-display text-sm tracking-wide uppercase'>Lô hàng sản phẩm</span>
                                    </div>

                                    <div className='p-6 flex flex-col gap-8'>
                                        {/* Sub-section 1: Nhập nhiều lô hàng */}
                                        <div className='flex flex-col gap-4'>
                                            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                                                <h4 className='font-bold text-base text-foreground'>Nhập nhiều lô hàng</h4>
                                                <div className='flex items-center gap-3'>
                                                    <button
                                                        onClick={addBatchRow}
                                                        disabled={isSubmitting}
                                                        className='px-4 py-2 bg-card hover:bg-muted text-primary border border-border rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                                    >
                                                        <MaterialIcon name='add' className='text-lg' />
                                                        Thêm dòng
                                                    </button>
                                                    <button
                                                        onClick={handleSubmitBatches}
                                                        disabled={isSubmitting}
                                                        className='px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
                                                    >
                                                        {isSubmitting ? (
                                                            <MaterialIcon name='hourglass_empty' className='animate-spin text-lg' />
                                                        ) : (
                                                            <MaterialIcon name='check_circle' className='text-lg' />
                                                        )}
                                                        Xác nhận nhập lô
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Intake Table */}
                                            <div className='border border-border rounded-xl overflow-hidden bg-card'>
                                                <table className='w-full text-sm border-collapse'>
                                                    <thead>
                                                        <tr className='bg-muted/40 border-b border-border'>
                                                            <th className='w-16 px-4 py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider'>STT</th>
                                                            <th className='px-4 py-2.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider'>Số lượng</th>
                                                            <th className='px-4 py-2.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider'>Ngày hết hạn</th>
                                                            <th className='w-20 px-4 py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider'>Thao tác</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className='divide-y divide-border'>
                                                        {newBatches.map((batch, index) => (
                                                            <tr key={index} className='hover:bg-muted/10'>
                                                                <td className='px-4 py-3 text-center font-medium text-muted-foreground'>{index + 1}</td>
                                                                <td className='px-4 py-3'>
                                                                    <input
                                                                        type='number'
                                                                        value={batch.quantity || ''}
                                                                        onChange={(e) => updateBatchRow(index, 'quantity', Number(e.target.value))}
                                                                        className='w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
                                                                        placeholder='0'
                                                                        disabled={isSubmitting}
                                                                    />
                                                                </td>
                                                                <td className='px-4 py-3'>
                                                                    <input
                                                                        type='date'
                                                                        value={batch.expiryDate}
                                                                        onChange={(e) => updateBatchRow(index, 'expiryDate', e.target.value)}
                                                                        className='w-full bg-background border border-input rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
                                                                        disabled={isSubmitting}
                                                                    />
                                                                </td>
                                                                <td className='px-4 py-3 text-center'>
                                                                    <button
                                                                        onClick={() => removeBatchRow(index)}
                                                                        disabled={newBatches.length === 1 || isSubmitting}
                                                                        className='p-1.5 text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors'
                                                                    >
                                                                        <MaterialIcon name='delete_outline' className='text-lg' />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Error & Success Messages */}
                                            {submitError && (
                                                <div className='mt-2 flex items-center gap-2 text-destructive text-sm font-semibold bg-destructive/10 p-3 rounded-lg'>
                                                    <MaterialIcon name='error_outline' className='text-lg shrink-0' />
                                                    <span>{submitError}</span>
                                                </div>
                                            )}
                                            {showSuccess && (
                                                <div className='mt-2 flex items-center gap-2 text-success text-sm font-semibold bg-success/10 p-3 rounded-lg'>
                                                    <MaterialIcon name='check_circle_outline' className='text-lg shrink-0' />
                                                    <span>Nhập lô hàng thành công!</span>
                                                </div>
                                            )}
                                        </div>

                                        <hr className='border-border' />

                                        {/* Sub-section 2: Danh sách lô hàng */}
                                        <div className='flex flex-col gap-4'>
                                            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                                                <h4 className='font-bold text-base text-foreground'>Danh sách lô hàng ({totalElements})</h4>
                                            </div>

                                            {/* Toolbar */}
                                            <div className='flex flex-wrap items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border/50'>
                                                {/* Search Input */}
                                                <div className='relative flex-1 min-w-[240px]'>
                                                    <MaterialIcon name='search' className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg' />
                                                    <input
                                                        type='text'
                                                        placeholder='Tìm kiếm lô hàng...'
                                                        value={batchSearch}
                                                        onChange={(e) => setBatchSearch(e.target.value)}
                                                        className='w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
                                                    />
                                                </div>

                                                {/* Status Dropdown */}
                                                <div className='relative min-w-[180px]'>
                                                    <select
                                                        value={batchStatus}
                                                        onChange={(e) => setBatchStatus(e.target.value as typeof batchStatus)}
                                                        className='w-full appearance-none rounded-lg border border-input bg-background px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
                                                    >
                                                        <option value='ALL'>Trạng thái: Tất cả</option>
                                                        <option value='ACTIVE'>Đang hoạt động</option>
                                                        <option value='INACTIVE'>Ngừng hoạt động</option>
                                                        <option value='DELETED'>Đã xóa</option>
                                                    </select>
                                                    <MaterialIcon name='expand_more' className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-lg' />
                                                </div>

                                                {/* Sorting Dropdown */}
                                                <div className='relative min-w-[180px]'>
                                                    <select
                                                        value={sortBy}
                                                        onChange={(e) => setSortBy(e.target.value as BatchSortBy)}
                                                        className='w-full appearance-none rounded-lg border border-input bg-background px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all'
                                                    >
                                                        <option value='date_desc'>Sắp xếp: Mới nhất</option>
                                                        <option value='date_asc'>Sắp xếp: Cũ nhất</option>
                                                        <option value='stock_desc'>Tồn kho cao nhất</option>
                                                        <option value='stock_asc'>Tồn kho thấp nhất</option>
                                                        <option value='expiry_asc'>Sắp hết hạn</option>
                                                        <option value='expiry_desc'>Hết hạn xa nhất</option>
                                                    </select>
                                                    <MaterialIcon name='expand_more' className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-lg' />
                                                </div>

                                                {/* Filter Button */}
                                                <button className='px-4 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg text-sm font-semibold transition-colors shadow-sm'>
                                                    Lọc
                                                </button>

                                                {/* Reset Button */}
                                                <button
                                                    onClick={() => {
                                                        setBatchSearch('')
                                                        setBatchStatus('ALL')
                                                        setSortBy('date_desc')
                                                    }}
                                                    className='p-1.5 bg-card hover:bg-muted border border-border text-foreground rounded-lg transition-colors flex items-center justify-center'
                                                    title='Làm mới'
                                                >
                                                    <MaterialIcon name='refresh' className='text-lg' />
                                                </button>
                                            </div>

                                            {/* Batch Table */}
                                            {isLoadingBatches ? (
                                                <div className='flex items-center justify-center py-12'>
                                                    <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-primary'></div>
                                                </div>
                                            ) : batches.length === 0 ? (
                                                <div className='text-center py-12 border border-border border-dashed rounded-xl bg-muted/10'>
                                                    <MaterialIcon name='inbox' className='text-4xl text-muted-foreground/60 mb-2' />
                                                    <p className='text-muted-foreground text-sm font-medium'>Không tìm thấy lô hàng nào</p>
                                                </div>
                                            ) : (
                                                <div className='border border-border rounded-xl overflow-hidden bg-card'>
                                                    <div className='overflow-x-auto'>
                                                        <table className='w-full text-sm border-collapse text-left'>
                                                            <thead>
                                                                <tr className='bg-muted/40 border-b border-border'>
                                                                    <th className='w-16 px-4 py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider'>STT</th>
                                                                    <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>Mã lô hàng</th>
                                                                    <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>Tồn kho</th>
                                                                    <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>Ngày hết hạn</th>
                                                                    <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>Số ngày còn lại</th>
                                                                    <th className='px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase tracking-wider'>Trạng thái</th>
                                                                    <th className='w-32 px-4 py-2.5 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider'>Thao tác</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className='divide-y divide-border'>
                                                                {batches.map((batch, index) => {
                                                                    const daysRemaining = getDaysRemaining(batch.expiryDate)
                                                                    const isExpiringSoon = daysRemaining <= 45 && daysRemaining > 0
                                                                    const isExpired = daysRemaining <= 0

                                                                    return (
                                                                        <tr key={batch.batchId} className='hover:bg-muted/10 transition-colors'>
                                                                            <td className='px-4 py-3.5 text-center text-muted-foreground font-medium'>
                                                                                {index + 1 + batchPage * 10}
                                                                            </td>
                                                                            <td className='px-4 py-3.5 font-bold text-primary font-mono text-sm'>
                                                                                {batch.batchCode}
                                                                            </td>
                                                                            <td className='px-4 py-3.5 font-semibold text-foreground'>
                                                                                {batch.stockQuantity}
                                                                            </td>
                                                                            <td className='px-4 py-3.5 text-muted-foreground font-medium'>
                                                                                {formatDate(batch.expiryDate)}
                                                                            </td>
                                                                            <td className='px-4 py-3.5'>
                                                                                {isExpired ? (
                                                                                    <span className='text-destructive font-bold text-sm'>Đã hết hạn</span>
                                                                                ) : isExpiringSoon ? (
                                                                                    <span className='text-destructive font-bold text-sm inline-flex items-center gap-1'>
                                                                                        <MaterialIcon name='warning' className='text-base' />
                                                                                        ▲ {daysRemaining} ngày
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className='text-foreground font-medium text-sm'>
                                                                                        {daysRemaining} ngày
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                            <td className='px-4 py-3.5'>
                                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                                                    batch.status === 'ACTIVE' 
                                                                                        ? 'bg-success/15 text-success' 
                                                                                        : 'bg-muted-foreground/15 text-muted-foreground'
                                                                                }`}>
                                                                                    {batch.status}
                                                                                </span>
                                                                            </td>
                                                                            <td className='px-4 py-3.5 text-center'>
                                                                                <div className='flex items-center justify-center gap-1.5'>
                                                                                    <button className='p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors' title='Chi tiết'>
                                                                                        <MaterialIcon name='visibility' className='text-lg' />
                                                                                    </button>
                                                                                    <button className='p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors' title='Sửa'>
                                                                                        <MaterialIcon name='edit' className='text-lg' />
                                                                                    </button>
                                                                                    <button className='p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors' title='Xóa'>
                                                                                        <MaterialIcon name='delete' className='text-lg' />
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Pagination Footer */}
                                                    {totalPages > 0 && (
                                                        <div className='border-t border-border px-6 py-4 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm'>
                                                            <div className='flex flex-wrap items-center gap-4 text-muted-foreground'>
                                                                <span>Trang {batchPage + 1} của {totalPages}</span>
                                                                <div className='flex items-center gap-2'>
                                                                    <span>Dòng mỗi trang:</span>
                                                                    <div className='relative'>
                                                                        <select
                                                                            className='appearance-none bg-background border border-border rounded-lg pl-3 pr-8 py-1 focus:outline-none focus:ring-1 focus:ring-ring font-medium'
                                                                            value={10}
                                                                            disabled
                                                                        >
                                                                            <option value={10}>10</option>
                                                                        </select>
                                                                        <MaterialIcon name='expand_more' className='absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-base' />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className='flex items-center gap-1'>
                                                                <button
                                                                    onClick={() => setBatchPage(Math.max(0, batchPage - 1))}
                                                                    disabled={batchPage === 0}
                                                                    className='p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:hover:bg-card transition-colors flex items-center justify-center'
                                                                >
                                                                    <MaterialIcon name='chevron_left' className='text-lg' />
                                                                </button>
                                                                <button
                                                                    className='w-8 h-8 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center justify-center'
                                                                >
                                                                    {batchPage + 1}
                                                                </button>
                                                                <button
                                                                    onClick={() => setBatchPage(Math.min(totalPages - 1, batchPage + 1))}
                                                                    disabled={batchPage >= totalPages - 1}
                                                                    className='p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:hover:bg-card transition-colors flex items-center justify-center'
                                                                >
                                                                    <MaterialIcon name='chevron_right' className='text-lg' />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}