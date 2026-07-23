import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { AdminSidebar } from '~/features/admin/components/layout/admin-sidebar'
import { AdminTopNav } from '~/features/admin/components/layout/admin-top-nav'
import { StaffSidebar } from '~/features/staff/components/layout/staff-sidebar'
import { StaffTopNav } from '~/features/staff/components/layout/staff-top-nav'
import { fetchAllOrdersApi, updateOrderStatusApi } from '~/features/staff/services/order'
import type { OrderResponse, OrderStatus } from '~/shared/lib/order'
import { MaterialIcon } from '~/shared/ui'
import { cn } from '~/shared/lib/cn'
import { StaffOrdersStats } from '~/features/staff/components/orders/staff-orders-stats'
import { StaffOrdersTable } from '~/features/staff/components/orders/staff-orders-table'
import { StaffOrderPickingDialog } from '~/features/staff/components/orders/staff-order-picking-dialog'
import { DeliveryProofDialog } from '~/features/staff/components/orders/delivery-proof-dialog'
import { DeliveryRouteDialog } from '~/features/staff/components/orders/delivery-route-dialog'
import { DeliveryFailedDialog } from '~/features/staff/components/orders/delivery-failed-dialog'
import { ConfirmReturnedWarehouseDialog } from '~/features/staff/components/orders/confirm-returned-warehouse-dialog'
import { CoordinatorReviewDialog } from '~/features/staff/components/orders/coordinator-review-dialog'
import { useAuth } from '~/providers/auth-provider'

const PAGE_SIZE = 5
const HISTORY_STATUSES = ['DELIVERED', 'COMPLETED', 'DELIVERY_FAILED', 'AWAITING_REDELIVERY', 'CANCELLED', 'RETURNED_TO_WAREHOUSE', 'COORDINATOR_REVIEW']

export function OrdersManagementPage() {
    const { t } = useTranslation('staff')
    const navigate = useNavigate()
    const { user } = useAuth()
    const isAdmin = user?.role === 'ADMIN'
    const isShipper = user?.role === 'STAFF' && user?.staffTask === 'SHIPPER'

    const [isRouteOpen, setIsRouteOpen] = useState(false)
    const [searchParams] = useSearchParams()
    const isHistoryView = searchParams.get('view') === 'history'

    const [allOrders, setAllOrders] = useState<OrderResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [selectedOrderForPicking, setSelectedOrderForPicking] = useState<OrderResponse | null>(null)
    const [selectedOrderForProof, setSelectedOrderForProof] = useState<OrderResponse | null>(null)
    const [selectedOrderForFail, setSelectedOrderForFail] = useState<OrderResponse | null>(null)
    const [selectedOrderForWarehouse, setSelectedOrderForWarehouse] = useState<OrderResponse | null>(null)
    const [selectedOrderForCoordinator, setSelectedOrderForCoordinator] = useState<OrderResponse | null>(null)
    const [dateFrom, setDateFrom] = useState<string>('')
    const [dateTo, setDateTo] = useState<string>('')

    function handleDateFromChange(value: string) {
        setDateFrom(value)
        setCurrentPage(0)
    }

    function handleDateToChange(value: string) {
        setDateTo(value)
        setCurrentPage(0)
    }

    function handleStatusFilterChange(status: string) {
        setStatusFilter(status)
        setCurrentPage(0)
    }

    function handleSearchChange(query: string) {
        setSearchQuery(query)
        setCurrentPage(0)
    }

    async function loadData() {
        setIsLoading(true)
        try {
            const res = await fetchAllOrdersApi({ page: 0, size: 1000, sort: 'createdAt,desc' })
            if (res.success && res.data) {
                const content = isHistoryView
                    ? res.data.content.filter((o) => HISTORY_STATUSES.includes(o.status))
                    : res.data.content
                setAllOrders(content)
            }
        } catch (err) {
            console.error('Failed to load orders', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { setTimeout(() => { void loadData() }, 0) }, [])

    const stats = useMemo(() => ({
        pending: allOrders.filter((o) => o.status === 'PENDING').length,
        confirmed: allOrders.filter((o) => o.status === 'CONFIRMED').length,
        picking: allOrders.filter((o) => o.status === 'PICKING').length,
        shipping: allOrders.filter((o) => o.status === 'SHIPPING' || o.status === 'DELIVERED').length,
        completed: allOrders.filter((o) => o.status === 'COMPLETED').length,
        cancelled: allOrders.filter((o) => o.status === 'CANCELLED').length,
        refundPending: allOrders.filter((o) => o.status === 'CANCEL_REQUESTED').length,
        deliveryFailed: allOrders.filter((o) => o.status === 'DELIVERY_FAILED' || o.status === 'AWAITING_REDELIVERY').length,
    }), [allOrders])

    const filteredOrders = useMemo(() => {
        let result = allOrders

        if (statusFilter !== 'ALL') {
            if (statusFilter === 'SHIPPING_DELIVERED') {
                result = result.filter((o) => o.status === 'SHIPPING' || o.status === 'DELIVERED')
            } else {
                result = result.filter((o) => o.status === statusFilter)
            }
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            result = result.filter((o) =>
                o.orderCode?.toLowerCase().includes(query)
                || o.recipientName?.toLowerCase().includes(query)
                || o.phoneNumber?.includes(query)
            )
        }

        if (dateFrom) {
            const from = new Date(dateFrom).setHours(0, 0, 0, 0)
            result = result.filter((o) => new Date(o.createdAt).getTime() >= from)
        }

        if (dateTo) {
            const to = new Date(dateTo).setHours(23, 59, 59, 999)
            result = result.filter((o) => new Date(o.createdAt).getTime() <= to)
        }

        return result
    }, [allOrders, statusFilter, searchQuery, dateFrom, dateTo])

    const totalElements = filteredOrders.length
    const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE))

    useEffect(() => {
        if (currentPage > 0 && currentPage >= totalPages) setCurrentPage(0)
    }, [totalPages, currentPage])

    const pagedOrders = useMemo(() => {
        const start = currentPage * PAGE_SIZE
        return filteredOrders.slice(start, start + PAGE_SIZE)
    }, [filteredOrders, currentPage])

    async function handleTransition(orderId: number, nextStatus: OrderStatus) {
        try {
            const res = await updateOrderStatusApi(orderId, nextStatus)
            if (res.success) {
                void loadData()
            } else {
                alert(res.message || t('staffOrdersPage.errors.updateStatusFailed'))
            }
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : t('staffOrdersPage.errors.updateStatusError'))
        }
    }

    const orderDetailBasePath = isAdmin ? '/admin' : '/staff'

    return (
        <div className='flex h-screen overflow-hidden bg-background text-foreground'>
            {isAdmin ? <AdminSidebar activeItem='orders' /> : <StaffSidebar activeItem='orders' />}

            <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
               {isAdmin ? (
                    <AdminTopNav
                        ns='staff'
                        titleKey={isHistoryView ? 'deliveryHistory.topNav.title' : 'staffOrdersPage.topNav.title'}
                        subtitleKey={isHistoryView ? 'deliveryHistory.topNav.subtitle' : 'staffOrdersPage.topNav.subtitle'}
                    />
                ) : (
                    <StaffTopNav
                        titleKey={isHistoryView ? 'deliveryHistory.topNav.title' : 'staffOrdersPage.topNav.title'}
                        subtitleKey={isHistoryView ? 'deliveryHistory.topNav.subtitle' : 'staffOrdersPage.topNav.subtitle'}
                    />
                )}

                <main className='flex-1 overflow-y-auto p-4 md:p-6 pb-20'>
                    <div className='mx-auto flex max-w-7xl flex-col gap-6'>
                        {!isHistoryView && (
                            <StaffOrdersStats
                                stats={stats}
                                statusFilter={statusFilter}
                                onStatusFilterChange={handleStatusFilterChange}
                            />
                        )}

                        <StaffOrdersTable
                            orders={pagedOrders}
                            isLoading={isLoading}
                            searchQuery={searchQuery}
                            statusFilter={statusFilter}
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            onSearchChange={handleSearchChange}
                            onStatusFilterChange={handleStatusFilterChange}
                            onViewDetail={(order) => navigate(`${orderDetailBasePath}/orders/${order.orderId}`)}
                            onDateFromChange={handleDateFromChange}
                            onDateToChange={handleDateToChange}
                            onTransition={handleTransition}
                            onOpenPicking={(order) => setSelectedOrderForPicking(order)}
                            onTransitionToShipped={(orderId) => {
                                const o = allOrders.find((x) => x.orderId === orderId)
                                if (o) setSelectedOrderForProof(o)
                            }}
                            onRefresh={() => void loadData()}
                            onDeliveryFailed={(order) => setSelectedOrderForFail(order)}
                            onConfirmReturnedWarehouse={(order) => setSelectedOrderForWarehouse(order)}
                            onOpenCoordinatorReview={(order) => setSelectedOrderForCoordinator(order)}
                            onCancelOrder={(order) => navigate(`${orderDetailBasePath}/orders/${order.orderId}/cancel`)}
                        />

                        <div className='flex items-center justify-between border-t border-border bg-muted/20 px-5 py-4 text-xs font-semibold text-muted-foreground'>
                            <span>
                                {t('staffOrdersPage.pagination.showing', {
                                    from: totalElements > 0 ? currentPage * PAGE_SIZE + 1 : 0,
                                    to: Math.min((currentPage + 1) * PAGE_SIZE, totalElements),
                                    total: totalElements,
                                })}
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

            <StaffOrderPickingDialog
                order={selectedOrderForPicking}
                onClose={() => setSelectedOrderForPicking(null)}
                onSuccess={() => void loadData()}
            />

            <DeliveryProofDialog
                orderId={selectedOrderForProof?.orderId ?? 0}
                orderCode={selectedOrderForProof?.orderCode ?? ''}
                isOpen={!!selectedOrderForProof}
                onClose={() => setSelectedOrderForProof(null)}
                onSuccess={() => {
                    void loadData()
                    setIsRouteOpen(true)
                }}
            />

            {isShipper && (
                <DeliveryRouteDialog
                    staffId={user?.userId ?? ''}
                    isOpen={isRouteOpen}
                    onClose={() => setIsRouteOpen(false)}
                />
            )}

            <DeliveryFailedDialog
                order={selectedOrderForFail}
                isOpen={!!selectedOrderForFail}
                onClose={() => setSelectedOrderForFail(null)}
                onSuccess={() => void loadData()}
            />

            <ConfirmReturnedWarehouseDialog
                order={selectedOrderForWarehouse}
                isOpen={!!selectedOrderForWarehouse}
                onClose={() => setSelectedOrderForWarehouse(null)}
                onSuccess={() => void loadData()}
            />

            <CoordinatorReviewDialog
                order={selectedOrderForCoordinator}
                isOpen={!!selectedOrderForCoordinator}
                onClose={() => setSelectedOrderForCoordinator(null)}
                onSuccess={() => void loadData()}
            />
        </div>
    )
}

