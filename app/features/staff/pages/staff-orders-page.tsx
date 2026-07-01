// app/features/staff/pages/staff-orders-page.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import { fetchAllOrdersApi, updateOrderStatusApi } from '../services/order'
import type { OrderResponse, OrderStatus } from '~/shared/lib/order'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { StaffOrdersStats } from '../components/orders/staff-orders-stats'
import { StaffOrdersTable } from '../components/orders/staff-orders-table'
import { StaffOrderPickingDialog } from '../components/orders/staff-order-picking-dialog'

export function StaffOrdersPage() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState<OrderResponse[]>([])
    const [stats, setStats] = useState({
        pending: 0,
        confirmed: 0,
        picking: 0,
        shipping: 0,
        completed: 0,
        canceled: 0
    })

    const [totalElements, setTotalElements] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('ALL')

    // Picking Modal state
    const [selectedOrderForPicking, setSelectedOrderForPicking] = useState<OrderResponse | null>(null)

    // Load orders & recalculate counters
    async function loadData() {
        setIsLoading(true)
        try {
            const res = await fetchAllOrdersApi({
                page: currentPage,
                size: 6,
                sort: 'createdAt,desc'
            })

            if (res.success && res.data) {
                setOrders(res.data.content)
                setTotalElements(res.data.totalElements)
                setTotalPages(res.data.totalPages)
            }

            const allRes = await fetchAllOrdersApi({ page: 0, size: 1000 })
            if (allRes.success && allRes.data) {
                const all = allRes.data.content
                setStats({
                    pending: all.filter((o) => o.status === 'PENDING').length,
                    confirmed: all.filter((o) => o.status === 'CONFIRMED').length,
                    picking: all.filter((o) => o.status === 'PICKING').length,
                    shipping: all.filter((o) => o.status === 'SHIPPING' || o.status === 'DELIVERED').length,
                    completed: all.filter((o) => o.status === 'COMPLETED').length,
                    canceled: all.filter((o) => o.status === 'CANCELED').length
                })
            }
        } catch (err) {
            console.error('Failed to load orders or statistics', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setTimeout(() => {
            void loadData()
        }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage])

    // Handle status transitions
    async function handleTransition(orderId: number, nextStatus: OrderStatus) {
        try {
            const res = await updateOrderStatusApi(orderId, nextStatus)
            if (res.success) {
                void loadData()
            } else {
                alert(res.message || 'Cập nhật trạng thái thất bại')
            }
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật trạng thái')
        }
    }

    function handleOpenPicking(order: OrderResponse) {
        setSelectedOrderForPicking(order)
    }

    return (
        <div className='flex h-screen overflow-hidden bg-background text-foreground'>
            <StaffSidebar activeItem='orders' />

            <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
                <StaffTopNav titleKey='Mục đơn hàng' subtitleKey='Theo dõi và xử lý các đơn hàng trong ngày' />

                <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-20'>
                    <div className='mx-auto flex max-w-7xl flex-col gap-6'>
                        {/* Header section */}
                        <div className='flex justify-between items-end'>
                            <div>
                                <h2 className='font-display text-2xl font-bold text-foreground mb-1'>Danh sách đơn hàng</h2>
                                <p className='text-sm text-muted-foreground'>Theo dõi và xử lý các đơn hàng của hệ thống.</p>
                            </div>
                        </div>

                        {/* Stats Grid - Extracted Component */}
                        <StaffOrdersStats
                            stats={stats}
                            statusFilter={statusFilter}
                            onStatusFilterChange={setStatusFilter}
                        />

                        {/* Orders Table - Extracted Component */}
                        <StaffOrdersTable
                            orders={orders}
                            isLoading={isLoading}
                            searchQuery={searchQuery}
                            statusFilter={statusFilter}
                            onSearchChange={setSearchQuery}
                            onStatusFilterChange={setStatusFilter}
                            onViewDetail={(order) => navigate(`/staff/orders/${order.orderId}`)}
                            onTransition={handleTransition}
                            onOpenPicking={handleOpenPicking}
                            onTransitionToShipped={(orderId) => handleTransition(orderId, 'DELIVERED')}
                        />

                        {/* Pagination */}
                        <div className='flex items-center justify-between border-t border-border bg-muted/20 px-5 py-4 text-xs font-semibold text-muted-foreground'>
                            <span>
                                Hiển thị {orders.length > 0 ? currentPage * 6 + 1 : 0}-
                                {Math.min((currentPage + 1) * 6, totalElements)} của {totalElements} đơn hàng
                            </span>
                            <div className='flex items-center gap-1.5'>
                                <button
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0 || isLoading}
                                    className='rounded-lg border border-border p-1.5 hover:bg-muted active:scale-95 disabled:opacity-40 disabled:pointer-events-none'
                                >
                                    <MaterialIcon name='chevron_left' className='text-[18px]' />
                                </button>
                                {Array.from({ length: totalPages }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentPage(idx)}
                                        className={cn(
                                            'h-7 w-7 rounded-lg text-xs transition-colors',
                                            currentPage === idx
                                                ? 'bg-primary font-bold text-primary-foreground'
                                                : 'hover:bg-muted'
                                        )}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                    disabled={currentPage >= totalPages - 1 || isLoading}
                                    className='rounded-lg border border-border p-1.5 hover:bg-muted active:scale-95 disabled:opacity-40 disabled:pointer-events-none'
                                >
                                    <MaterialIcon name='chevron_right' className='text-[18px]' />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Picking Dialog - Extracted Component */}
            <StaffOrderPickingDialog
                order={selectedOrderForPicking}
                onClose={() => setSelectedOrderForPicking(null)}
                onSuccess={() => void loadData()}
            />
        </div>
    )
}
