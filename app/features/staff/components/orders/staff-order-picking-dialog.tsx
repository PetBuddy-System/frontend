// app/features/staff/components/orders/staff-order-picking-dialog.tsx
import { useState, useEffect } from 'react'
import { MaterialIcon } from '~/shared/ui'
import { fetchPickingListApi, updateOrderStatusApi } from '../../services/order'
import type { StaffOrderResponse, PickingItemResponse } from '~/shared/lib/order'

interface StaffOrderPickingDialogProps {
    order: StaffOrderResponse | null
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
    }, [order?.orderId])

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
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'>
            <div className='bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-border shadow-xl flex flex-col'>
                {/* Header */}
                <div className='flex items-center justify-between border-b border-border px-6 py-4'>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400'>
                            <MaterialIcon name='inventory_2' className='text-[22px]' />
                        </div>
                        <div>
                            <h3 className='font-bold text-foreground'>Danh sách lấy hàng</h3>
                            <p className='text-xs text-muted-foreground'>Đơn #{order.orderCode}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors'
                    >
                        <MaterialIcon name='close' className='text-[20px]' />
                    </button>
                </div>

                {/* Body */}
                <div className='flex-1 overflow-y-auto p-6'>
                    {isLoading ? (
                        <div className='flex items-center justify-center py-8'>
                            <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                        </div>
                    ) : pickingItems.length === 0 ? (
                        <div className='text-center py-8 text-muted-foreground'>
                            <MaterialIcon name='inbox' className='text-4xl mb-2' />
                            <p>Không có sản phẩm nào cần lấy</p>
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {pickingItems.map((item, index) => (
                                <div
                                    key={`${item.productId}-${index}`}
                                    className='flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4'
                                >
                                    <div className='flex items-center gap-3'>
                                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm'>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className='font-semibold text-foreground'>{item.name}</p>
                                            <p className='text-xs text-muted-foreground'>
                                                HSD: {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-lg font-bold text-primary'>{item.quantityToPick}</p>
                                        <p className='text-xs text-muted-foreground'>cần lấy</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className='flex items-center justify-end gap-3 border-t border-border px-6 py-4'>
                    <button
                        onClick={onClose}
                        className='px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors'
                    >
                        Đóng
                    </button>
                    <button
                        onClick={handleConfirmPicking}
                        disabled={isSubmitting || pickingItems.length === 0}
                        className='flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors disabled:opacity-50'
                    >
                        {isSubmitting ? (
                            <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                        ) : (
                            <MaterialIcon name='check' className='text-lg' />
                        )}
                        Xác nhận lấy hàng
                    </button>
                </div>
            </div>
        </div>
    )
}
