// app/features/staff/components/orders/staff-orders-table.tsx
import { MaterialIcon } from '~/shared/ui'
import type { OrderResponse, OrderStatus } from '~/shared/lib/order'

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

interface StaffOrdersTableProps {
    orders: OrderResponse[]
    isLoading: boolean
    searchQuery: string
    statusFilter: string
    onSearchChange: (query: string) => void
    onStatusFilterChange: (status: string) => void
    onViewDetail: (order: OrderResponse) => void
    onTransition: (orderId: number, nextStatus: OrderStatus) => void
    onOpenPicking: (order: OrderResponse) => void
    onTransitionToShipped: (orderId: number) => void
}

export function StaffOrdersTable({
    orders,
    isLoading,
    searchQuery,
    statusFilter,
    onSearchChange,
    onStatusFilterChange,
    onViewDetail,
    onTransition,
    onOpenPicking,
    onTransitionToShipped
}: StaffOrdersTableProps) {
    // Filter orders locally
    const filteredOrders = orders.filter((o) => {
        if (statusFilter !== 'ALL') {
            if (statusFilter === 'SHIPPING_DELIVERED') {
                if (o.status !== 'SHIPPING' && o.status !== 'DELIVERED') return false
            } else if (o.status !== statusFilter) {
                return false
            }
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            const codeMatch = o.orderCode?.toLowerCase().includes(query)
            const nameMatch = o.recipientName?.toLowerCase().includes(query)
            const phoneMatch = o.phoneNumber?.includes(query)
            return codeMatch || nameMatch || phoneMatch
        }
        return true
    })

    return (
        <div className='rounded-2xl border border-border bg-card shadow-sm'>
            <div className='flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between'>
                <h3 className='font-display text-lg font-bold text-foreground'>Chi tiết đơn hàng</h3>
                <div className='flex flex-wrap items-center gap-3'>
                    <div className='relative w-full sm:w-64'>
                        <MaterialIcon
                            name='search'
                            className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                        />
                        <input
                            type='text'
                            placeholder='Tìm kiếm mã, tên...'
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className='w-full rounded-xl border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring'
                        />
                    </div>
                    {(statusFilter !== 'ALL' || searchQuery) && (
                        <button
                            onClick={() => {
                                onStatusFilterChange('ALL')
                                onSearchChange('')
                            }}
                            className='flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted'
                        >
                            <MaterialIcon name='filter_list_off' className='text-[16px]' />
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='w-full text-left text-sm'>
                    <thead className='border-b border-border bg-muted/40 font-semibold text-muted-foreground'>
                        <tr>
                            <th className='px-6 py-4'>Mã đơn hàng</th>
                            <th className='px-6 py-4'>Khách hàng</th>
                            <th className='px-6 py-4'>Số điện thoại</th>
                            <th className='px-6 py-4'>Ngày đặt</th>
                            <th className='px-6 py-4'>Tổng tiền</th>
                            <th className='px-6 py-4'>Trạng thái</th>
                            <th className='px-6 py-4 text-right'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-border'>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className='py-12 text-center text-muted-foreground'>
                                    Đang tải danh sách đơn hàng...
                                </td>
                            </tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className='py-12 text-center text-muted-foreground'>
                                    Không có đơn hàng nào khớp với điều kiện lọc.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.orderId} className='group hover:bg-primary/5 transition-colors'>
                                    <td className='px-6 py-4 font-bold text-primary'>#{order.orderCode}</td>
                                    <td className='px-6 py-4'>
                                        <div className='flex items-center gap-3'>
                                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs uppercase'>
                                                {order.recipientName?.slice(0, 2) || 'KH'}
                                            </div>
                                            <p className='font-semibold text-foreground'>{order.recipientName || '—'}</p>
                                        </div>
                                    </td>
                                    <td className='px-6 py-4 text-muted-foreground'>{order.phoneNumber || '—'}</td>
                                    <td className='px-6 py-4 text-muted-foreground'>{formatDate(order.createdAt)}</td>
                                    <td className='px-6 py-4 font-bold text-foreground'>{formatPrice(order.finalAmount)}</td>
                                    <td className='px-6 py-4'>{renderStatusBadge(order.status)}</td>
                                    <td className='px-6 py-4 text-right'>
                                        <div className='flex items-center justify-end gap-2 flex-wrap'>
                                            <button
                                                onClick={() => onViewDetail(order)}
                                                className='rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground bg-card hover:bg-muted transition-colors active:scale-95 shadow-sm'
                                            >
                                                Xem
                                            </button>

                                            {order.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => onTransition(order.orderId, 'CONFIRMED')}
                                                        className='rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white transition-colors active:scale-95 shadow-sm'
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => onTransition(order.orderId, 'CANCELED')}
                                                        className='rounded-xl bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-bold text-white transition-colors active:scale-95 shadow-sm'
                                                    >
                                                        Hủy
                                                    </button>
                                                </>
                                            )}

                                            {order.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => onTransition(order.orderId, 'PICKING')}
                                                    className='rounded-xl bg-cyan-600 hover:bg-cyan-700 px-3 py-1.5 text-xs font-bold text-white transition-colors active:scale-95 shadow-sm'
                                                >
                                                    Lấy hàng
                                                </button>
                                            )}

                                            {order.status === 'PICKING' && (
                                                <button
                                                    onClick={() => onOpenPicking(order)}
                                                    className='rounded-xl bg-teal-600 hover:bg-teal-700 px-3 py-1.5 text-xs font-bold text-white transition-colors active:scale-95 shadow-sm'
                                                >
                                                    Lấy hàng
                                                </button>
                                            )}

                                            {order.status === 'SHIPPING' && (
                                                <button
                                                    onClick={() => onTransitionToShipped(order.orderId)}
                                                    className='rounded-xl bg-purple-600 hover:bg-purple-700 px-3 py-1.5 text-xs font-bold text-white transition-colors active:scale-95 shadow-sm'
                                                >
                                                    Đã giao
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
