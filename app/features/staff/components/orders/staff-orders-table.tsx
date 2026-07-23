/* eslint-disable @typescript-eslint/no-unused-vars */
import { useTranslation } from 'react-i18next'
import { MaterialIcon } from '~/shared/ui'
import type { OrderResponse, OrderStatus } from '~/shared/lib/order'
import { useAuth } from '~/providers/auth-provider'
import { confirmRefundApi } from '../../services/order'
import { formatDateOnly, formatTimeOnly } from '~/shared/lib/date'

const STATUS_BADGE_STYLES: Record<string, string> = {
    PENDING: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
    CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    PICKING: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400',
    PICKED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
    SHIPPING: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400',
    DELIVERED: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
    AWAITING_REDELIVERY: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    DELIVERY_FAILED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 animate-pulse',
    COORDINATOR_REVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 animate-pulse',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    CANCEL_REQUESTED: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse',
    RETURNED_TO_WAREHOUSE: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
}

const DOT_STYLES: Record<string, string> = {
    PENDING: 'bg-orange-700 dark:bg-orange-400',
    CONFIRMED: 'bg-blue-700 dark:bg-blue-400',
    PICKING: 'bg-cyan-700 dark:bg-cyan-400',
    PICKED: 'bg-indigo-700 dark:bg-indigo-400',
    SHIPPING: 'bg-teal-700 dark:bg-teal-400',
    DELIVERED: 'bg-purple-700 dark:bg-purple-400',
    AWAITING_REDELIVERY: 'bg-amber-800 dark:bg-amber-300',
    DELIVERY_FAILED: 'bg-rose-800 dark:bg-rose-300',
    COORDINATOR_REVIEW: 'bg-purple-800 dark:bg-purple-300',
    COMPLETED: 'bg-green-700 dark:bg-green-400',
    CANCELLED: 'bg-red-700 dark:bg-red-400',
    CANCEL_REQUESTED: 'bg-amber-700 dark:bg-amber-400',
    RETURNED_TO_WAREHOUSE: 'bg-slate-700 dark:bg-slate-300',
}

const PAYMENT_BADGE_STYLES: Record<string, string> = {
    PAID: 'bg-green-50 text-green-700 dark:bg-green-950/35 dark:text-green-400 border-green-200/30',
    FAILED: 'bg-red-50 text-red-700 dark:bg-red-950/35 dark:text-red-400 border-red-200/30',
    CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200/30',
    PROCESSING: 'bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-400 border-blue-200/30 animate-pulse',
    REFUNDED: 'bg-green-50 text-green-700 dark:bg-green-950/35 dark:text-green-400 border-green-200/30',
    UNPAID: 'bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-400 border-amber-200/30',
}

interface StaffOrdersTableProps {
    orders: OrderResponse[]
    isLoading: boolean
    searchQuery: string
    statusFilter: string
    dateFrom: string
    dateTo: string
    onSearchChange: (query: string) => void
    onStatusFilterChange: (status: string) => void
    onDateFromChange: (value: string) => void
    onDateToChange: (value: string) => void
    onViewDetail: (order: OrderResponse) => void
    onTransition: (orderId: number, nextStatus: OrderStatus) => void
    onOpenPicking: (order: OrderResponse) => void
    onTransitionToShipped: (orderId: number) => void
    onRefresh: () => void
    onDeliveryFailed: (order: OrderResponse) => void
    onConfirmReturnedWarehouse: (order: OrderResponse) => void
    onOpenCoordinatorReview?: (order: OrderResponse) => void
    onCancelOrder: (order: OrderResponse) => void
}

export function StaffOrdersTable({
    orders,
    isLoading,
    searchQuery,
    statusFilter,
    dateFrom,
    dateTo,
    onSearchChange,
    onStatusFilterChange,
    onDateFromChange,
    onDateToChange,
    onViewDetail,
    onTransition,
    onOpenPicking,
    onRefresh,
    onConfirmReturnedWarehouse,
    onOpenCoordinatorReview,
    onCancelOrder,
}: StaffOrdersTableProps) {
    const { t, i18n } = useTranslation('staff')
    const { user } = useAuth()
    const isShipper = user?.role === 'STAFF' && user?.staffTask === 'SHIPPER'
    const isCoordinator = user?.role === 'ADMIN' || (user?.role === 'STAFF' && user?.staffTask === 'COORDINATOR')

    function formatPrice(value: number) {
        if (value == null || isNaN(Number(value))) return '—'
        const locale = i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US'
        const formatted = new Intl.NumberFormat(locale).format(Number(value))
        return i18n.language?.startsWith('vi') ? `${formatted}đ` : `$${formatted}`
    }

    function renderStatusBadge(status: string) {
        const dotStyle = DOT_STYLES[status] ?? 'bg-gray-700'
        const badgeStyle = STATUS_BADGE_STYLES[status] ?? 'bg-gray-100 text-gray-700'
        const label = t(`staffOrdersTable.statuses.${status}`, { defaultValue: status })
        return (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${badgeStyle}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${dotStyle}`} />
                {label}
            </span>
        )
    }

    function renderPaymentStatusBadge(status?: string) {
        const key = status || 'UNPAID'
        const style = PAYMENT_BADGE_STYLES[key] ?? PAYMENT_BADGE_STYLES.UNPAID
        const label = t(`staffOrdersTable.paymentStatuses.${key}`, { defaultValue: key })
        return (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase w-fit ${style}`}>
                {label}
            </span>
        )
    }

    function paymentMethodLabel(method?: string) {
        const key = method === 'CARD' || method === 'MOMO' || method === 'VNPAY' ? method : 'COD'
        return t(`staffOrdersTable.paymentMethods.${key}`)
    }

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
                <h3 className='font-display text-lg font-bold text-foreground'>{t('staffOrdersTable.heading')}</h3>
                <div className='flex flex-wrap items-center gap-3'>
                    <div className='relative w-full sm:w-64'>
                        <MaterialIcon
                            name='search'
                            className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                        />
                        <input
                            type='text'
                            placeholder={t('staffOrdersTable.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className='w-full rounded-xl border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring'
                        />
                    </div>

                    <div className='flex items-center gap-2'>
                        <input
                            type='date'
                            value={dateFrom}
                            onChange={(e) => onDateFromChange(e.target.value)}
                            className='rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring'
                        />
                        <span className='text-sm text-muted-foreground'>—</span>
                        <input
                            type='date'
                            value={dateTo}
                            onChange={(e) => onDateToChange(e.target.value)}
                            className='rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-ring'
                        />
                    </div>

                    {(statusFilter !== 'ALL' || searchQuery || dateFrom || dateTo) && (
                        <button
                            onClick={() => {
                                onStatusFilterChange('ALL')
                                onSearchChange('')
                                onDateFromChange('')
                                onDateToChange('')
                            }}
                            className='flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted'
                        >
                            <MaterialIcon name='filter_list_off' className='text-[16px]' />
                            {t('staffOrdersTable.clearFilters')}
                        </button>
                    )}
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='w-full text-left text-sm'>
                    <thead className='border-b border-border bg-muted/40 font-semibold text-muted-foreground'>
                        <tr>
                            <th className='px-6 py-4'>{t('staffOrdersTable.columns.orderCode')}</th>
                            <th className='px-6 py-4'>{t('staffOrdersTable.columns.customer')}</th>
                            <th className='px-6 py-4'>{t('staffOrdersTable.columns.orderDate')}</th>
                            <th className='px-6 py-4'>{t('staffOrdersTable.columns.totalAmount')}</th>
                            <th className='px-6 py-4'>{t('staffOrdersTable.columns.payment')}</th>
                            <th className='px-6 py-4'>{t('staffOrdersTable.columns.status')}</th>
                            <th className='px-6 py-4 text-right'>{t('staffOrdersTable.columns.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-border'>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className='py-12 text-center text-muted-foreground'>
                                    {t('staffOrdersTable.loading')}
                                </td>
                            </tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className='py-12 text-center text-muted-foreground'>
                                    {t('staffOrdersTable.empty')}
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.orderId} className='group hover:bg-primary/5 transition-colors'>
                                    <td className='px-6 py-4 font-bold text-primary'>#{order.orderCode}</td>
                                    <td className='px-6 py-4'>
                                        <div className='flex items-center gap-3'>
                                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs uppercase'>
                                                {order.recipientName?.slice(0, 2) || t('staffOrdersTable.customerFallback')}
                                            </div>
                                            <div>
                                                <p className='font-semibold text-foreground'>{order.recipientName || '—'}</p>
                                                <p className='text-xs text-muted-foreground'>{order.phoneNumber || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className='px-6 py-4 text-muted-foreground'>
                                        {(() => {
                                            const date = formatDateOnly(order.createdAt)
                                            const time = formatTimeOnly(order.createdAt)
                                            return (
                                                <div className='flex flex-col'>
                                                    <span className='font-medium text-foreground'>{date}</span>
                                                    <span className='text-xs text-muted-foreground'>{time}</span>
                                                </div>
                                            )
                                        })()}
                                    </td>
                                    <td className='px-6 py-4 font-bold text-foreground'>{formatPrice(order.finalAmount)}</td>
                                    <td className='px-6 py-4'>
                                        <div className='flex flex-col gap-1'>
                                            <span className='inline-flex items-center gap-1 text-xs font-semibold text-foreground'>
                                                <MaterialIcon
                                                    name={
                                                        order.payment?.paymentMethod === 'CARD'
                                                            ? 'credit_card'
                                                            : order.payment?.paymentMethod === 'MOMO'
                                                                ? 'qr_code_2'
                                                                : order.payment?.paymentMethod === 'VNPAY'
                                                                    ? 'account_balance'
                                                                    : 'payments'
                                                    }
                                                    className='text-[16px] text-muted-foreground'
                                                />
                                                {paymentMethodLabel(order.payment?.paymentMethod)}
                                            </span>
                                            {renderPaymentStatusBadge(order.payment?.status)}
                                        </div>
                                    </td>
                                    <td className='px-6 py-4'>{renderStatusBadge(order.status)}</td>
                                    <td className='px-6 py-4 text-right'>
                                        <div className='flex items-center justify-end gap-2 flex-wrap'>
                                            <button
                                                onClick={() => onViewDetail(order)}
                                                className='rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground bg-card hover:bg-muted transition-colors active:scale-95 shadow-sm'
                                            >
                                                {t('staffOrdersTable.actions.view')}
                                            </button>

                                            {order.status === 'CANCEL_REQUESTED' && isCoordinator && (
                                                <button
                                                    onClick={async () => {
                                                        if (!window.confirm(t('staffOrdersTable.confirm.refundPrompt', { code: order.orderCode }))) return
                                                        try {
                                                            const res = await confirmRefundApi(order.orderId)
                                                            if (res.success) {
                                                                onRefresh()
                                                            } else {
                                                                alert(res.message || t('staffOrdersTable.errors.refundFailed'))
                                                            }
                                                        } catch (err: unknown) {
                                                            alert(err instanceof Error ? err.message : t('staffOrdersTable.errors.generic'))
                                                        }
                                                    }}
                                                    className='rounded-xl bg-amber-500 hover:bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition-colors active:scale-95 shadow-sm'
                                                >
                                                    {t('staffOrdersTable.actions.confirmRefund')}
                                                </button>
                                            )}

                                            {order.status === 'PENDING' && isCoordinator && (
                                                <>
                                                    {((
                                                        (order.payment?.paymentMethod === 'CARD' || order.payment?.paymentMethod === 'MOMO' || order.payment?.paymentMethod === 'VNPAY')
                                                        && order.payment?.status === 'PAID'
                                                    ) || (
                                                        order.payment?.paymentMethod !== 'CARD'
                                                        && order.payment?.paymentMethod !== 'MOMO'
                                                        && order.payment?.paymentMethod !== 'VNPAY'
                                                    )) && (
                                                        <button
                                                            onClick={() => onTransition(order.orderId, 'CONFIRMED')}
                                                            className='rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white transition-colors active:scale-95 shadow-sm'
                                                        >
                                                            {t('staffOrdersTable.actions.approve')}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => onCancelOrder(order)}
                                                        className='rounded-xl bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-bold text-white transition-colors active:scale-95 shadow-sm'
                                                    >
                                                        {t('staffOrdersTable.actions.cancel')}
                                                    </button>
                                                </>
                                            )}

                                            {order.status === 'CONFIRMED' && isCoordinator && (
                                                <button
                                                    onClick={() => onTransition(order.orderId, 'PICKING')}
                                                    className='rounded-xl bg-cyan-600 hover:bg-cyan-700 px-3 py-1.5 text-xs font-bold text-white transition-colors active:scale-95 shadow-sm'
                                                >
                                                    {t('staffOrdersTable.actions.startPicking')}
                                                </button>
                                            )}

                                            {order.status === 'PICKING' && isCoordinator && (
                                                <button
                                                    onClick={() => onOpenPicking(order)}
                                                    className='rounded-xl bg-teal-600 hover:bg-teal-700 px-3 py-1.5 text-xs font-bold text-white transition-colors active:scale-95 shadow-sm'
                                                >
                                                    {t('staffOrdersTable.actions.pickItems')}
                                                </button>
                                            )}
                                            {order.status === 'COORDINATOR_REVIEW' && isCoordinator && onOpenCoordinatorReview && (
                                                <button
                                                    onClick={() => onOpenCoordinatorReview(order)}
                                                    className='rounded-xl bg-purple-600 hover:bg-purple-700 px-3 py-1.5 text-xs font-bold text-white transition-colors active:scale-95 shadow-sm flex items-center gap-1'
                                                >
                                                    <MaterialIcon name='support_agent' className='text-[16px]' />
                                                    <span>{t('staffOrdersTable.actions.coordinatorReview', { defaultValue: 'Xử lý Coordinator' })}</span>
                                                </button>
                                            )}

                                            {order.status === 'DELIVERY_FAILED' && isCoordinator && (
                                                <button
                                                    onClick={() => onConfirmReturnedWarehouse(order)}
                                                    className='rounded-xl bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-white transition-colors active:scale-95 shadow-sm'
                                                >
                                                    {t('staffOrdersTable.actions.confirmReturnedWarehouse')}
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