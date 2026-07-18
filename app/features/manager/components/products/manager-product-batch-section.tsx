// app/features/manager/components/products/manager-product-batch-section.tsx

import { useState } from 'react'
import { MaterialIcon } from '~/shared/ui'
import { ManagerProductBatchIntake } from './manager-product-batch-intake'
import { ManagerProductBatchList } from './manager-product-batch-list'

interface ManagerProductBatchSectionProps {
    productId: string
    isDeleted?: boolean
}

export function ManagerProductBatchSection({
    productId,
    isDeleted = false
}: ManagerProductBatchSectionProps) {
    const [refreshKey, setRefreshKey] = useState(0)
    const [expiringSoonCount, setExpiringSoonCount] = useState(0)

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

    const getDaysRemaining = (expiryDate: string) => {
        const today = new Date()
        const expiry = new Date(expiryDate)
        const diffTime = expiry.getTime() - today.getTime()
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const handleBatchChange = () => {
        setRefreshKey(prev => prev + 1)
    }

    return (
        <div className='bg-card rounded-2xl border border-border overflow-hidden shadow-sm'>
            {/* Card Header */}
            <div className='border-b border-border bg-card px-6 py-4 flex items-center gap-2.5'>
                <MaterialIcon name='inventory_2' className='text-primary text-xl' />
                <span className='font-bold text-foreground font-display text-sm tracking-wide uppercase'>
                    Lô hàng sản phẩm
                </span>
                {expiringSoonCount > 0 && (
                    <span className='ml-auto text-xs font-semibold text-warning bg-warning/10 px-2.5 py-1 rounded-full'>
                        {expiringSoonCount} lô sắp hết hạn
                    </span>
                )}
            </div>

            <div className='p-6 flex flex-col gap-8'>
                {/* Form nhập lô hàng - Ẩn khi đã xóa */}
                {!isDeleted && (
                    <>
                        <ManagerProductBatchIntake
                            productId={productId}
                            onSuccess={handleBatchChange}
                        />
                        <hr className='border-border' />
                    </>
                )}

                {/* Danh sách lô hàng */}
                <ManagerProductBatchList
                    productId={productId}
                    refreshKey={refreshKey}
                    onBatchChange={handleBatchChange}
                    formatDate={formatDate}
                    getDaysRemaining={getDaysRemaining}
                    onExpiringSoonCountChange={setExpiringSoonCount}
                />
            </div>
        </div>
    )
}