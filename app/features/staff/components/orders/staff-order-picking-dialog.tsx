// app/features/staff/components/orders/staff-order-picking-dialog.tsx
import { useState, useEffect } from 'react'
import { MaterialIcon } from '~/shared/ui'
import { fetchPickingListApi, updateOrderStatusApi } from '../../services/order'
import type { OrderResponse, PickingItemResponse } from '~/shared/lib/order'

interface StaffOrderPickingDialogProps {
    order: OrderResponse | null
    onClose: () => void
    onSuccess: () => void
}

export function StaffOrderPickingDialog({ order, onClose, onSuccess }: StaffOrderPickingDialogProps) {
    const [pickingItems, setPickingItems] = useState<PickingItemResponse[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!order) return
        const orderId = order.orderId

        async function loadPickingList() {
            setIsLoading(true)
            try {
                const res = await fetchPickingListApi(orderId)
                if (res.success && res.data) {
                    setPickingItems(res.data)
                }
            } catch (err) {
                console.error('Failed to load picking list', err)
            } finally {
                setIsLoading(false)
            }
        }
        void loadPickingList()
    }, [order])

    async function handleConfirmPicking() {
        if (!order) return
        setIsSubmitting(true)
        try {
            const res = await updateOrderStatusApi(order.orderId, 'SHIPPING')
            if (res.success) {
                onSuccess()
                onClose()
            }
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Lỗi khi xác nhận lấy hàng')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!order) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]'>
            {/* Modal — max-w-4xl to match the reference design */}
            <div className='bg-card w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border'>

                {/* ── Header ── */}
                <div className='px-6 py-4 border-b border-border flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        {/* Teal icon badge */}
                        <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/40'>
                            <svg
                                className='h-6 w-6 text-teal-500'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth='2'
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className='text-xl font-bold text-foreground'>Danh sách lấy hàng</h2>
                            <p className='text-sm text-muted-foreground font-medium'>Đơn #{order.orderCode}</p>
                        </div>
                    </div>
                    <button
                        type='button'
                        onClick={onClose}
                        className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
                    >
                        <MaterialIcon name='close' className='text-[24px]' />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className='p-6 md:p-10 overflow-y-auto max-h-[60vh]' style={{ scrollbarWidth: 'thin' }}>
                    {isLoading ? (
                        <div className='flex flex-col items-center justify-center gap-3 py-16'>
                            <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                            <p className='text-sm text-muted-foreground animate-pulse'>Đang tải danh sách...</p>
                        </div>
                    ) : pickingItems.length === 0 ? (
                        <div className='text-center py-16 text-muted-foreground'>
                            <MaterialIcon name='inbox' className='text-5xl mb-3 text-muted-foreground/40' />
                            <p className='font-semibold'>Không có sản phẩm nào cần lấy</p>
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {pickingItems.map((item, index) => (
                                <div
                                    key={`${item.productId}-${index}`}
                                    className='border border-border rounded-2xl p-4 flex items-center bg-card hover:border-teal-300 dark:hover:border-teal-700 transition-colors group'
                                >
                                    <div className='flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-6'>
                                        <span className='text-primary font-bold text-lg'>{index + 1}</span>
                                    </div>

                                    <div className='flex-shrink-0 w-20 h-20 bg-muted/30 rounded-xl overflow-hidden mr-6 flex items-center justify-center p-2 border border-border'>
                                        <img
                                            src={item.imageUrl || 'https://placehold.co/120'}
                                            alt={item.name}
                                            className='max-w-full max-h-full object-contain'
                                            style={{ mixBlendMode: 'multiply' }}
                                            onError={(e) => {
                                                const target = e.currentTarget
                                                target.onerror = null
                                                target.src = 'https://placehold.co/120'
                                            }}
                                        />
                                    </div>

                                    {/* Product details */}
                                    <div className='flex-grow min-w-0'>
                                        <h3 className='text-lg font-bold text-foreground leading-tight line-clamp-2'>
                                            {item.name}
                                        </h3>
                                        <p className='text-sm text-muted-foreground mt-1'>
                                            HSD:{' '}
                                            {item.expiryDate
                                                ? new Date(item.expiryDate).toLocaleDateString('vi-VN')
                                                : 'N/A'}
                                        </p>
                                    </div>

                                    {/* Quantity — large prominent number */}
                                    <div className='text-right flex flex-col items-end flex-shrink-0 ml-6'>
                                        <span className='text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1'>
                                            cần lấy
                                        </span>
                                        <span className='text-3xl font-bold text-primary'>
                                            {item.quantityToPick}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className='px-6 py-6 border-t border-border flex justify-end gap-4 bg-muted/20'>
                    <button
                        type='button'
                        onClick={onClose}
                        className='px-8 py-2.5 border border-border rounded-xl text-foreground font-semibold hover:bg-muted transition-all focus:outline-none focus:ring-2 focus:ring-ring'
                    >
                        Đóng
                    </button>
                    <button
                        type='button'
                        onClick={() => void handleConfirmPicking()}
                        disabled={isSubmitting || pickingItems.length === 0}
                        className='flex items-center gap-2 px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-teal-500/20 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:pointer-events-none'
                    >
                        {isSubmitting ? (
                            <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                        ) : (
                            <svg
                                className='h-5 w-5'
                                fill='currentColor'
                                viewBox='0 0 20 20'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <path
                                    clipRule='evenodd'
                                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                    fillRule='evenodd'
                                />
                            </svg>
                        )}
                        <span>Xác nhận lấy hàng</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
