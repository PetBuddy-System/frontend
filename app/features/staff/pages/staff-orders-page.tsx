// app/features/staff/pages/staff-orders-page.tsx
import { useEffect, useState } from 'react'

import { StaffSidebar } from '../components/layout/staff-sidebar'
import { StaffTopNav } from '../components/layout/staff-top-nav'
import { fetchAllOrdersApi, updateOrderStatusApi } from '../services/order'
import type { StaffOrderResponse, OrderStatus } from '~/shared/lib/order'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { StaffOrdersStats } from '../components/orders/staff-orders-stats'
import { StaffOrdersTable } from '../components/orders/staff-orders-table'
import { StaffOrderPickingDialog } from '../components/orders/staff-order-picking-dialog'

function formatPrice(value: number) {
    if (value == null || isNaN(Number(value))) return '—'
    return `${new Intl.NumberFormat('vi-VN').format(Number(value))}đ`
}

function formatDate(dateStr: string) {
    if (!dateStr) return '—'
    const normalized = dateStr.includes('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z'
    const d = new Date(normalized)
    if (isNaN(d.getTime())) return dateStr
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${d.getFullYear()} - ${d.getHours().toString().padStart(2, '0')}:${d
        .getMinutes()
        .toString()
        .padStart(2, '0')}`
}

function renderStatusBadge(status: string) {
    switch (status) {
        case 'PENDING':
            return (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase text-orange-700 dark:bg-orange-950/40 dark:text-orange-400'>
                    <span className='h-1.5 w-1.5 rounded-full bg-orange-700 dark:bg-orange-400' />
                    Đang xử lý
                </span>
            )
        case 'CONFIRMED':
            return (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'>
                    <span className='h-1.5 w-1.5 rounded-full bg-blue-700 dark:bg-blue-400' />
                    Đã xác nhận
                </span>
            )
        case 'PICKING':
            return (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400'>
                    <span className='h-1.5 w-1.5 rounded-full bg-cyan-700 dark:bg-cyan-400' />
                    Đang lấy hàng
                </span>
            )
        case 'SHIPPING':
            return (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'>
                    <span className='h-1.5 w-1.5 rounded-full bg-teal-700 dark:bg-teal-400' />
                    Đang giao hàng
                </span>
            )
        case 'DELIVERED':
            return (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'>
                    <span className='h-1.5 w-1.5 rounded-full bg-purple-700 dark:bg-purple-400' />
                    Đã giao (Chờ nhận)
                </span>
            )
        case 'COMPLETED':
            return (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase text-green-700 dark:bg-green-950/40 dark:text-green-400'>
                    <span className='h-1.5 w-1.5 rounded-full bg-green-700 dark:bg-green-400' />
                    Hoàn thành
                </span>
            )
        case 'CANCELED':
            return (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase text-red-700 dark:bg-red-950/40 dark:text-red-400'>
                    <span className='h-1.5 w-1.5 rounded-full bg-red-700 dark:bg-red-400' />
                    Đã hủy
                </span>
            )
        default:
            return (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase text-gray-700'>
                    <span className='h-1.5 w-1.5 rounded-full bg-gray-700' />
                    {status}
                </span>
            )
    }
}

export function StaffOrdersPage() {
    const [orders, setOrders] = useState<StaffOrderResponse[]>([])
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

    // Detail Modal state
    const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<StaffOrderResponse | null>(null)

    // Picking Modal state
    const [selectedOrderForPicking, setSelectedOrderForPicking] = useState<StaffOrderResponse | null>(null)

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

    function handleOpenPicking(order: StaffOrderResponse) {
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
                            onViewDetail={setSelectedOrderForDetail}
                            onTransition={handleTransition}
                            onOpenPicking={handleOpenPicking}
                            onTransitionToShipped={(orderId) => handleTransition(orderId, 'DELIVERED')}
                            onTransitionToCompleted={(orderId) => handleTransition(orderId, 'COMPLETED')}
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

            {/* Order Detail Modal */}
            {selectedOrderForDetail && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
                    onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrderForDetail(null) }}
                >
                    <div className='w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200'>
                        <div className='flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4'>
                            <div>
                                <h4 className='font-display text-lg font-bold text-foreground'>Chi tiết đơn hàng</h4>
                                <p className='text-xs text-muted-foreground mt-0.5'>#{selectedOrderForDetail.orderCode}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrderForDetail(null)}
                                className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                            >
                                <MaterialIcon name='close' />
                            </button>
                        </div>

                        <div className='p-6 space-y-4'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm text-muted-foreground'>Trạng thái</span>
                                {renderStatusBadge(selectedOrderForDetail.status)}
                            </div>

                            <div className='h-px bg-border' />

                            <div className='space-y-3'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-sm text-muted-foreground flex items-center gap-2'>
                                        <MaterialIcon name='tag' className='text-[16px]' />
                                        Mã đơn hàng
                                    </span>
                                    <span className='text-sm font-semibold text-foreground'>#{selectedOrderForDetail.orderCode}</span>
                                </div>

                                {selectedOrderForDetail.recipientName && (
                                    <div className='flex items-center justify-between'>
                                        <span className='text-sm text-muted-foreground flex items-center gap-2'>
                                            <MaterialIcon name='person' className='text-[16px]' />
                                            Tên khách hàng
                                        </span>
                                        <span className='text-sm font-semibold text-foreground'>{selectedOrderForDetail.recipientName}</span>
                                    </div>
                                )}

                                {selectedOrderForDetail.phoneNumber && (
                                    <div className='flex items-center justify-between'>
                                        <span className='text-sm text-muted-foreground flex items-center gap-2'>
                                            <MaterialIcon name='phone' className='text-[16px]' />
                                            Số điện thoại
                                        </span>
                                        <span className='text-sm font-semibold text-foreground'>{selectedOrderForDetail.phoneNumber}</span>
                                    </div>
                                )}

                                {selectedOrderForDetail.address && (
                                    <div className='flex items-start justify-between gap-4'>
                                        <span className='text-sm text-muted-foreground flex items-center gap-2 shrink-0'>
                                            <MaterialIcon name='location_on' className='text-[16px]' />
                                            Địa chỉ
                                        </span>
                                        <span className='text-sm font-semibold text-foreground text-right'>{selectedOrderForDetail.address}</span>
                                    </div>
                                )}

                                <div className='flex items-center justify-between'>
                                    <span className='text-sm text-muted-foreground flex items-center gap-2'>
                                        <MaterialIcon name='calendar_today' className='text-[16px]' />
                                        Ngày đặt hàng
                                    </span>
                                    <span className='text-sm font-semibold text-foreground'>
                                        {formatDate(selectedOrderForDetail.createdAt)}
                                    </span>
                                </div>

                                <div className='flex items-center justify-between'>
                                    <span className='text-sm text-muted-foreground flex items-center gap-2'>
                                        <MaterialIcon name='payments' className='text-[16px]' />
                                        Tổng thanh toán
                                    </span>
                                    <span className='text-base font-bold text-primary'>
                                        {formatPrice(selectedOrderForDetail.totalAmount)}
                                    </span>
                                </div>
                            </div>

                            <div className='h-px bg-border' />

                            <div className='rounded-xl bg-muted/50 px-4 py-3 text-xs text-muted-foreground'>
                                ID đơn hàng: <span className='font-mono font-semibold text-foreground'>{selectedOrderForDetail.orderId}</span>
                            </div>
                        </div>

                        <div className='flex items-center justify-end border-t border-border bg-muted/40 px-6 py-4'>
                            <button
                                type='button'
                                onClick={() => setSelectedOrderForDetail(null)}
                                className='rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted'
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
